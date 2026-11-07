import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getPlanDetails } from '@/lib/payment/pricing';
import { UpiGatewayProvider } from '@/lib/payment/upi-gateway';
import { PaymentRepository } from '@/lib/payment/repository';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, gatewayOrderId, paymentId, utr, email: clientEmail } = body;

    const lookupId = gatewayOrderId || orderId;
    if (!lookupId && !utr) {
      return NextResponse.json(
        { error: 'Missing orderId or UTR for verification.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 1. Retrieve authenticated user or email
    const authState = await getAuthenticatedUser();
    let userId = authState.userId;
    let userEmail = authState.user?.email || clientEmail || request.headers.get('x-user-email');
    if (userEmail) userEmail = userEmail.toLowerCase().trim();

    // 2. Fetch Order from Repository
    let order = lookupId ? await PaymentRepository.getPaymentOrder(lookupId) : null;

    // Fallback: If not found by orderId but user email exists, get latest pending order
    if (!order && userEmail) {
      try {
        const { data: recentOrders } = await supabaseAdmin
          .from('payment_orders')
          .select('*')
          .ilike('user_email', userEmail)
          .order('created_at', { ascending: false })
          .limit(1);
        if (recentOrders && recentOrders.length > 0) {
          order = recentOrders[0];
        }
      } catch (e) {}
    }

    const planId = order?.plan_id || body.planId || 'guru-flash-1.3';
    const plan = getPlanDetails(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Could not resolve valid subscription plan for this order.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const orderUserId = order?.user_id || userId;
    const orderUserEmail = (order?.user_email || userEmail || '').toLowerCase().trim();

    // 3. Check if order is already paid/active
    if (order && order.status === 'paid') {
      const entitlements = await PaymentRepository.getUserActiveEntitlements(orderUserId, orderUserEmail);
      return NextResponse.json(
        {
          success: true,
          status: 'paid',
          message: 'Payment verified and subscription is already active.',
          plan: plan.name,
          allowedModels: plan.allowedModels,
          entitlements
        },
        { headers: corsHeaders() }
      );
    }

    // 4. Query Gateway API for payment confirmation
    const provider = new UpiGatewayProvider();
    const gatewayStatus = lookupId ? await provider.getOrder(order?.gateway_order_id || lookupId) : { status: 'pending' };

    let isPaymentVerified = gatewayStatus.status === 'paid';
    let verifiedPaymentId = gatewayStatus.paymentId || paymentId || utr || `pay_${Date.now()}`;

    // 4b. UTR verification / submission logic
    if (!isPaymentVerified && utr) {
      const cleanUtr = String(utr).trim();
      // Valid UTR is typically 12 alphanumeric characters
      if (/^[0-9a-zA-Z]{10,22}$/.test(cleanUtr)) {
        // Record payment transaction attempt with UTR
        await PaymentRepository.recordPaymentTransaction({
          orderId: lookupId || order?.id,
          gatewayPaymentId: cleanUtr,
          paymentStatus: 'pending_reconciliation',
          paymentMethod: 'UPI_UTR',
          amount: plan.priceInr,
          currency: 'INR'
        });

        // Record in contact_messages for admin audit
        try {
          await supabaseAdmin.from('contact_messages').insert({
            user_id: orderUserId || null,
            email: orderUserEmail,
            name: orderUserEmail.split('@')[0],
            subject: 'AI_PAYMENT_UTR_SUBMISSION',
            status: 'Pending',
            message: JSON.stringify({
              orderId: lookupId,
              utr: cleanUtr,
              planId: plan.planId,
              amount: plan.priceInr,
              submittedAt: new Date().toISOString()
            }),
            plan_details: `${plan.name} (UTR: ${cleanUtr})`
          });
        } catch (e) {}

        // Check auto_unlock setting in payment config
        try {
          const { data: configRow } = await supabaseAdmin
            .from('user_ai_limits')
            .select('plan_name')
            .eq('email', 'admin_payment_config@webguruji.online')
            .maybeSingle();

          if (configRow?.plan_name) {
            const config = JSON.parse(configRow.plan_name);
            if (config.auto_unlock === true) {
              isPaymentVerified = true;
              verifiedPaymentId = cleanUtr;
            }
          }
        } catch (e) {}
      }
    }

    // 5. If Payment Verified, Unlock Entitlements Atomically
    if (isPaymentVerified) {
      // Update order status
      if (lookupId) {
        await PaymentRepository.updatePaymentOrderStatus(order?.gateway_order_id || lookupId, 'paid');
      }

      // Record transaction
      await PaymentRepository.recordPaymentTransaction({
        orderId: lookupId || order?.id,
        gatewayPaymentId: verifiedPaymentId,
        paymentStatus: 'captured',
        paymentMethod: 'UPI',
        amount: plan.priceInr,
        currency: 'INR',
        verifiedAt: new Date().toISOString()
      });

      // Grant user entitlement
      const entitlement = await PaymentRepository.grantUserEntitlement({
        userId: orderUserId,
        userEmail: orderUserEmail,
        planId: plan.planId,
        allowedModels: plan.allowedModels,
        durationDays: plan.durationDays,
        sourcePaymentId: verifiedPaymentId
      });

      return NextResponse.json(
        {
          success: true,
          status: 'paid',
          message: `Payment successfully verified! ${plan.name} is now active on your account.`,
          plan: plan.name,
          allowedModels: plan.allowedModels,
          expiresAt: entitlement.expires_at,
          entitlement
        },
        { headers: corsHeaders() }
      );
    }

    // 6. Payment Still Pending or Unconfirmed
    return NextResponse.json(
      {
        success: false,
        status: gatewayStatus.status || 'pending',
        message: 'Payment is pending gateway confirmation. If you completed payment via UPI, please enter your 12-digit UTR reference number or click Retry Status Check.',
        requiresUtr: true,
        orderId: lookupId,
        plan: plan.name
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('API /api/payment/verify Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification processing error.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email, x-visitor-id',
    'Access-Control-Max-Age': '86400'
  };
}
