// src/lib/cashfree.js
/**
 * Cashfree payment gateway configuration and utility functions
 */

// Production vs Test environment settings
const isProduction = process.env.NODE_ENV === 'production';

// Configuration object
export const cashfreeConfig = {
  // API endpoints
  endpoints: {
    createOrder: isProduction 
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders',
    getOrder: (orderId) => isProduction
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`,
    // Payment gateway checkout URL
    paymentUrl: isProduction
      ? 'https://www.cashfree.com/checkout/post/submit'
      : 'https://sandbox.cashfree.com/pg/orders'
  },
  // Credentials (these will be loaded from environment variables)
  appId: process.env.CASHFREE_APP_ID || 'TEST2232226c476e6a9d23f4b286c7f8368',
  secretKey: process.env.CASHFREE_SECRET_KEY || 'TEST55074332b01c639d5a18ff815e2211038fdaa990',
  // Return URLs
  returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment-callback`,
  notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment-webhook`,
  // Order prefix for easy identification
  orderPrefix: 'BIKEFLIX_',
};

/**
 * Generate order ID with prefix and uniqueness
 * @param {string} bookingId - The ID of the booking
 * @returns {string} - Formatted order ID
 */
export const generateOrderId = (bookingId) => {
  const timestamp = Date.now();
  return `${cashfreeConfig.orderPrefix}${bookingId}_${timestamp}`;
};

/**
 * Generate Cashfree signature for payment verification
 * @param {Object} data - The data to sign
 * @param {string} secretKey - Cashfree secret key
 * @returns {string} - Calculated signature
 */
export const generateSignature = (data, secretKey) => {
  const crypto = require('crypto');
  const signatureData = Object.keys(data)
    .filter(key => data[key] !== null && data[key] !== '')
    .sort()
    .map(key => `${key}${data[key]}`)
    .join('');
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(signatureData)
    .digest('hex');
};

/**
 * Verify Cashfree webhook signature
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Received signature
 * @param {string} secretKey - Cashfree secret key
 * @returns {boolean} - Whether signature is valid
 */
export const verifyWebhookSignature = (payload, signature, secretKey) => {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};