import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getPlanDetails } from '@/lib/payment/pricing';
import { UpiGatewayProvider } from '@/lib/payment/upi-gateway';
import { PaymentRepository } from '@/lib/payment/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { planId, email: directEmail, name: directName } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Missing planId in request' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 1. Validate against trusted server-side pricing configuration
    const plan = getPlanDetails(planId);
    if (!plan) {
      return NextResponse.json(
        { error: `Invalid plan specified: ${planId}` },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 2. Resolve authenticated user or verified email
    const authState = await getAuthenticatedUser();
    let userId = authState.userId;
    let userEmail = authState.user?.email || directEmail || request.headers.get('x-user-email');
    let customerName = authState.user?.user_metadata?.full_name || directName || 'HarshGuruJi Member';

    if (!userEmail) {
      return NextResponse.json(
        {
          error: 'Email is required to associate and activate your premium subscription.',
          requiresEmail: true
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    userEmail = userEmail.toLowerCase().trim();

    // 3. Generate unique order ID
    const uniqueOrderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 4. Request order generation from gateway
    const provider = new UpiGatewayProvider();
    const gatewayOrder = await provider.createOrder({
      orderId: uniqueOrderId,
      amount: plan.priceInr,
      currency: 'INR',
      customerName,
      customerEmail: userEmail,
      note: `HarshGuruJi AI - ${plan.name}`
    });

    // 5. Persist order in backend database repository
    await PaymentRepository.createPaymentOrder({
      userId,
      userEmail,
      gatewayOrderId: gatewayOrder.gatewayOrderId || uniqueOrderId,
      planId: plan.planId,
      amount: plan.priceInr,
      currency: 'INR'
    });

    // 6. Return trusted order details to client
    return NextResponse.json(
      {
        success: true,
        orderId: uniqueOrderId,
        gatewayOrderId: gatewayOrder.gatewayOrderId || uniqueOrderId,
        plan: {
          id: plan.planId,
          name: plan.name,
          priceInr: plan.priceInr,
          priceUsd: plan.priceUsd,
          currency: 'INR',
          dailyMessages: plan.dailyMessages,
          contextLimit: plan.contextLimit,
          allowedModels: plan.allowedModels
        },
        upiIntent: gatewayOrder.upiIntent || '',
        qrData: gatewayOrder.qrData || '',
        status: 'pending'
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('API /api/payment/create-order Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment order.' },
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
