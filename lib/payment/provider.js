/**
 * Payment Provider Abstraction Interface
 * Enables changing payment gateways without modifying the entitlement system.
 */

export class PaymentProvider {
  /**
   * Create a payment order at the gateway
   * @param {object} params
   * @param {string} params.orderId - Internal unique order ID
   * @param {number} params.amount - Amount in INR
   * @param {string} params.currency - 'INR'
   * @param {string} params.customerName
   * @param {string} params.customerEmail
   * @param {string} params.note
   * @returns {Promise<{ gatewayOrderId: string, upiIntent?: string, qrData?: string, raw: any }>}
   */
  async createOrder(params) {
    throw new Error('createOrder() not implemented in payment provider');
  }

  /**
   * Fetch current order details from gateway
   * @param {string} gatewayOrderId
   * @returns {Promise<{ status: 'paid'|'pending'|'failed'|'expired', amount: number, paymentId?: string, utr?: string, raw: any }>}
   */
  async getOrder(gatewayOrderId) {
    throw new Error('getOrder() not implemented in payment provider');
  }

  /**
   * Verify webhook signature and parse event
   * @param {string|Buffer} rawBody
   * @param {object} headers
   * @returns {Promise<{ isValid: boolean, eventType?: string, gatewayOrderId?: string, paymentId?: string, status?: string, amount?: number }>}
   */
  async verifyWebhook(rawBody, headers) {
    throw new Error('verifyWebhook() not implemented in payment provider');
  }
}
