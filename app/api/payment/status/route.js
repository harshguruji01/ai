import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { PaymentRepository } from '@/lib/payment/repository';
import { UpiGatewayProvider } from '@/lib/payment/upi-gateway';
import { getPlanDetails } from '@/lib/payment/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const emailParam = searchParams.get('email');

    // 1. Resolve User
    const authState = await getAuthenticatedUser();
    let userId = authState.userId;
    let userEmail = authState.user?.email || emailParam || request.headers.get('x-user-email');
    if (userEmail) userEmail = userEmail.toLowerCase().trim();

    // 2. If orderId is provided, inspect that specific order
    let orderData = null;
    if (orderId) {
      orderData = await PaymentRepository.getPaymentOrder(orderId);

      // If pending, check with gateway to see if state recently flipped
      if (orderData && orderData.status === 'pending') {
        try {
          const provider = new UpiGatewayProvider();
          const gwStatus = await provider.getOrder(orderData.gateway_order_id || orderId);
          if (gwStatus.status === 'paid') {
            await PaymentRepository.updatePaymentOrderStatus(orderData.gateway_order_id || orderId, 'paid');
            const plan = getPlanDetails(orderData.plan_id);
            if (plan) {
              await PaymentRepository.grantUserEntitlement({
                userId: orderData.user_id || userId,
                userEmail: orderData.user_email || userEmail,
                planId: plan.planId,
                allowedModels: plan.allowedModels,
                durationDays: plan.durationDays,
                sourcePaymentId: gwStatus.paymentId || orderId
              });
            }
            orderData.status = 'paid';
          }
        } catch (e) {
          console.warn('Gateway status poll notice:', e.message);
        }
      }
    }

    // 3. Retrieve user active entitlements
    const entitlements = await PaymentRepository.getUserActiveEntitlements(userId, userEmail);

    // Collect all unlocked models
    const unlockedModels = new Set(['guru-flash-1.1']);
    if (userId || userEmail) {
      unlockedModels.add('guru-flash-1.2'); // free for logged-in members
    }
    for (const ent of entitlements) {
      if (Array.isArray(ent.allowed_models)) {
        ent.allowed_models.forEach(m => unlockedModels.add(m));
      }
    }

    return NextResponse.json(
      {
        success: true,
        order: orderData,
        entitlements,
        unlockedModels: Array.from(unlockedModels),
        hasPremium: entitlements.length > 0,
        userEmail: userEmail || null
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('API /api/payment/status Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve payment status.' },
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
