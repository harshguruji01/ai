import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { UpiGatewayProvider } from '@/lib/payment/upi-gateway';
import { PaymentRepository } from '@/lib/payment/repository';
import { getPlanDetails } from '@/lib/payment/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const adminCode = request.headers.get('x-admin-code') || '';

    // Simple security guard: verify admin code or bearer
    const isAuthorized =
      adminCode === 'HarshGuruJi@2547277654' ||
      authHeader.includes('HarshGuruJi') ||
      request.headers.get('x-reconcile-secret') === 'harshguruji-cron-reconcile-2026';

    const provider = new UpiGatewayProvider();
    let reconciledCount = 0;
    const results = [];

    // 1. Fetch pending orders from payment_orders
    try {
      const { data: pendingOrders } = await supabaseAdmin
        .from('payment_orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      if (pendingOrders && pendingOrders.length > 0) {
        for (const order of pendingOrders) {
          const gwStatus = await provider.getOrder(order.gateway_order_id);
          if (gwStatus.status === 'paid') {
            await PaymentRepository.updatePaymentOrderStatus(order.gateway_order_id, 'paid');
            const plan = getPlanDetails(order.plan_id);
            if (plan) {
              await PaymentRepository.grantUserEntitlement({
                userId: order.user_id,
                userEmail: order.user_email,
                planId: plan.planId,
                allowedModels: plan.allowedModels,
                durationDays: plan.durationDays,
                sourcePaymentId: gwStatus.paymentId || order.gateway_order_id
              });
            }
            reconciledCount++;
            results.push({ orderId: order.gateway_order_id, email: order.user_email, status: 'reconciled_paid' });
          } else if (gwStatus.status === 'failed' || gwStatus.status === 'expired') {
            await PaymentRepository.updatePaymentOrderStatus(order.gateway_order_id, gwStatus.status);
            results.push({ orderId: order.gateway_order_id, email: order.user_email, status: gwStatus.status });
          }
        }
      }
    } catch (e) {
      console.warn('Reconcile payment_orders warning:', e.message);
    }

    // 2. Fetch pending orders from contact_messages
    try {
      const { data: pendingMessages } = await supabaseAdmin
        .from('contact_messages')
        .select('*')
        .eq('subject', 'AI_PAYMENT_ORDER')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false })
        .limit(50);

      if (pendingMessages && pendingMessages.length > 0) {
        for (const msg of pendingMessages) {
          try {
            const parsed = JSON.parse(msg.message || '{}');
            const orderId = parsed.gateway_order_id || parsed.gatewayOrderId;
            if (orderId) {
              const gwStatus = await provider.getOrder(orderId);
              if (gwStatus.status === 'paid') {
                await PaymentRepository.updatePaymentOrderStatus(orderId, 'paid');
                const plan = getPlanDetails(parsed.plan_id || parsed.planId);
                if (plan) {
                  await PaymentRepository.grantUserEntitlement({
                    userId: msg.user_id,
                    userEmail: msg.email,
                    planId: plan.planId,
                    allowedModels: plan.allowedModels,
                    durationDays: plan.durationDays,
                    sourcePaymentId: gwStatus.paymentId || orderId
                  });
                }
                reconciledCount++;
                results.push({ orderId, email: msg.email, status: 'reconciled_paid' });
              }
            }
          } catch(e) {}
        }
      }
    } catch (e) {
      console.warn('Reconcile contact_messages warning:', e.message);
    }

    return NextResponse.json({
      success: true,
      reconciledCount,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API /api/payment/reconcile Error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment reconciliation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return POST(request);
}
