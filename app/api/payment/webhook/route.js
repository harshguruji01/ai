import { NextResponse } from 'next/server';
import { UpiGatewayProvider } from '@/lib/payment/upi-gateway';
import { PaymentRepository } from '@/lib/payment/repository';
import { getPlanDetails } from '@/lib/payment/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    const provider = new UpiGatewayProvider();
    const verification = await provider.verifyWebhook(rawBody, headers);

    if (!verification.isValid) {
      console.warn('Webhook rejected due to invalid signature or structure:', verification.reason);
      return NextResponse.json(
        { error: 'Unauthorized webhook signature' },
        { status: 401 }
      );
    }

    const { gatewayOrderId, paymentId, status, eventType } = verification;
    const eventId = headers['x-event-id'] || `${gatewayOrderId}_${paymentId}_${status}`;

    // 1. Idempotency Check
    const alreadyProcessed = await PaymentRepository.isWebhookEventProcessed(eventId);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // 2. Process Paid Event
    if (status === 'paid' && gatewayOrderId) {
      const order = await PaymentRepository.getPaymentOrder(gatewayOrderId);
      if (order) {
        // Update order status
        await PaymentRepository.updatePaymentOrderStatus(gatewayOrderId, 'paid');

        // Record transaction
        await PaymentRepository.recordPaymentTransaction({
          orderId: order.id,
          gatewayPaymentId: paymentId || gatewayOrderId,
          paymentStatus: 'captured',
          paymentMethod: 'UPI_WEBHOOK',
          amount: order.amount,
          currency: order.currency || 'INR',
          verifiedAt: new Date().toISOString()
        });

        // Grant entitlement
        const plan = getPlanDetails(order.plan_id);
        if (plan) {
          await PaymentRepository.grantUserEntitlement({
            userId: order.user_id,
            userEmail: order.user_email,
            planId: plan.planId,
            allowedModels: plan.allowedModels,
            durationDays: plan.durationDays,
            sourcePaymentId: paymentId || gatewayOrderId
          });
        }
      }
    }

    // 3. Record Webhook Event Record for Replay Protection
    await PaymentRepository.recordWebhookEvent({
      gatewayEventId: eventId,
      eventType: eventType || 'payment.update',
      signatureVerified: true,
      processingStatus: 'processed'
    });

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error('API /api/payment/webhook Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
