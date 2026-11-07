/**
 * HarshGuruJi Self-Hosted Render UPI Gateway Provider Implementation
 */
import { PaymentProvider } from './provider.js';
import crypto from 'crypto';

export class UpiGatewayProvider extends PaymentProvider {
  constructor(config = {}) {
    super();
    this.apiUrl = (config.apiUrl || process.env.UPI_GATEWAY_API_URL || 'https://upi-gateway-oy63.onrender.com/api/v1').replace(/\/+$/, '');
    this.apiKey = config.apiKey || process.env.UPI_GATEWAY_API_KEY || 'key_GnDKpMuQWj9lYcqrWhzG0ifD';
    this.apiSecret = config.apiSecret || process.env.UPI_GATEWAY_API_SECRET || 'sec_D1MMJuvhwfceK43MkCtj3iYmoGbgzcwzlWqEWVVu';
    this.webhookSecret = config.webhookSecret || process.env.UPI_GATEWAY_WEBHOOK_SECRET || this.apiSecret;
  }

  async createOrder({ orderId, amount, customerName, customerEmail, note }) {
    const endpoint = `${this.apiUrl}/orders`;
    const payload = {
      amount: Number(amount).toFixed(2),
      client_order_id: orderId,
      customer_name: customerName || 'HarshGuruJi Member',
      customer_email: customerEmail,
      note: note || `HarshGuruJi AI Subscription (${orderId})`
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
          'X-Api-Secret': this.apiSecret,
          'User-Agent': 'HarshGuruJi-AI-Payment/2.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          return {
            gatewayOrderId: json.data.order_id || orderId,
            upiIntent: json.data.upi_intent || '',
            qrData: json.data.upi_intent || '',
            status: json.data.status || 'pending',
            raw: json.data
          };
        }
      }
    } catch (err) {
      console.warn('Render UPI Gateway direct call notice:', err.message);
    }

    // Fallback direct UPI Intent generation if gateway container is spinning up on Render free tier
    const merchantVpa = process.env.UPI_MERCHANT_VPA || '';
    const fallbackIntent = merchantVpa 
      ? `upi://pay?pa=${encodeURIComponent(merchantVpa)}&pn=HarshGuruJi&am=${Number(amount).toFixed(2)}&cu=INR&tr=${encodeURIComponent(orderId)}&tn=${encodeURIComponent(note || 'GuruAI')}`
      : `upi://pay?pn=HarshGuruJi&am=${Number(amount).toFixed(2)}&cu=INR&tr=${encodeURIComponent(orderId)}&tn=${encodeURIComponent(note || 'GuruAI')}`;

    return {
      gatewayOrderId: orderId,
      upiIntent: fallbackIntent,
      qrData: fallbackIntent,
      status: 'pending',
      raw: { fallback: true }
    };
  }

  async getOrder(gatewayOrderId) {
    if (!gatewayOrderId) return { status: 'failed' };
    const endpoint = `${this.apiUrl}/orders/${encodeURIComponent(gatewayOrderId)}`;

    try {
      const res = await fetch(endpoint, {
        headers: {
          'X-Api-Key': this.apiKey,
          'X-Api-Secret': this.apiSecret,
          'User-Agent': 'HarshGuruJi-AI-Payment/2.0'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;
        if (data) {
          const rawStatus = (data.status || '').toLowerCase();
          let normalizedStatus = 'pending';
          if (rawStatus === 'paid' || rawStatus === 'success' || rawStatus === 'captured') {
            normalizedStatus = 'paid';
          } else if (rawStatus === 'failed' || rawStatus === 'cancelled') {
            normalizedStatus = 'failed';
          } else if (rawStatus === 'expired') {
            normalizedStatus = 'expired';
          }

          return {
            status: normalizedStatus,
            amount: parseFloat(data.amount) || 0,
            paymentId: data.payment_id || data.id || gatewayOrderId,
            utr: data.utr || data.bank_ref || '',
            raw: data
          };
        }
      }
    } catch (err) {
      console.warn('Render UPI Gateway order query notice:', err.message);
    }

    return { status: 'pending', raw: null };
  }

  async verifyWebhook(rawBody, headers = {}) {
    const signature = headers['x-gateway-signature'] || headers['x-signature'] || headers['x-hub-signature'];
    
    // If webhook secret configured, check HMAC SHA-256
    if (this.webhookSecret && signature) {
      try {
        const expected = crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
          return { isValid: false, reason: 'Invalid signature mismatch' };
        }
      } catch (e) {
        return { isValid: false, reason: 'Signature verification error' };
      }
    }

    try {
      const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
      const data = payload?.data || payload;
      const status = (data.status || payload.event || '').toLowerCase();
      const isPaid = status === 'paid' || status === 'order.paid' || status === 'payment.captured';

      return {
        isValid: true,
        eventType: payload.event || 'order.updated',
        gatewayOrderId: data.order_id || data.client_order_id,
        paymentId: data.payment_id || data.utr,
        status: isPaid ? 'paid' : status,
        amount: parseFloat(data.amount) || 0,
        raw: data
      };
    } catch (e) {
      return { isValid: false, reason: 'Malformed payload' };
    }
  }
}
