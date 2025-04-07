// src/lib/phonepe.js
/**
 * PhonePe payment gateway configuration and utility functions
 */
import crypto from 'crypto';

// Environment settings
const isProduction = process.env.NODE_ENV === 'production';

// Configuration object
export const phonepeConfig = {
  // API endpoints
  endpoints: {
    paymentApi: isProduction
      ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
      : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay',
    statusApi: (merchantId, merchantTransactionId) => isProduction
      ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`
      : `https://api-preprod.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    refundApi: isProduction
      ? 'https://api.phonepe.com/apis/hermes/pg/v1/refund'
      : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/refund'
  },
  
  // Credentials
  merchantId: process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT',
  saltKey: process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
  saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
  
  // Return URLs
  callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment-callback`,
  redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-result`,
  
  // Transaction prefix for easy identification
  transactionPrefix: 'BIKEFLIX_',
};

/**
 * Generate transaction ID with prefix and uniqueness
 * @param {string} bookingId - The ID of the booking
 * @returns {string} - Formatted transaction ID
 */
export const generateTransactionId = (bookingId) => {
  const timestamp = Date.now();
  return `${phonepeConfig.transactionPrefix}${bookingId}_${timestamp}`;
};

/**
 * Calculate SHA256 hash for the payload
 * @param {string} payload - The request payload
 * @param {string} saltKey - The salt key
 * @returns {string} - The calculated hash
 */
export const calculateHash = (payload, saltKey) => {
  const data = payload + '/pg/v1/pay' + saltKey;
  return crypto.createHash('sha256').update(data).digest('hex') + '###' + phonepeConfig.saltIndex;
};

/**
 * Generate PhonePe X-VERIFY header
 * @param {string} payload - The request payload as a string
 * @returns {string} - The X-VERIFY header value
 */
export const generateXVerifyHeader = (payload) => {
  return calculateHash(payload, phonepeConfig.saltKey);
};

/**
 * Verify PhonePe webhook signature
 * @param {string} payload - The request payload as a string
 * @param {string} xVerify - The X-VERIFY header from the request
 * @returns {boolean} - Whether the signature is valid
 */
export const verifyWebhookSignature = (payload, xVerify) => {
  try {
    // Extract the salt index from the X-VERIFY header
    const parts = xVerify.split('###');
    const receivedHash = parts[0];
    
    // Calculate the expected hash
    const data = payload + phonepeConfig.saltKey;
    const expectedHash = crypto.createHash('sha256').update(data).digest('hex');
    
    return expectedHash === receivedHash;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Encode payload to Base64
 * @param {Object} payload - The payload object
 * @returns {string} - Base64 encoded payload
 */
export const encodePayload = (payload) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

/**
 * Get payment status text based on PhonePe status code
 * @param {string} code - PhonePe status code
 * @returns {string} - Human readable status
 */
export const getPaymentStatusText = (code) => {
  const statusMap = {
    'PAYMENT_SUCCESS': 'Payment successful',
    'PAYMENT_PENDING': 'Payment pending',
    'PAYMENT_DECLINED': 'Payment declined',
    'PAYMENT_ERROR': 'Payment error',
    'TIMED_OUT': 'Payment timed out',
    'PAYMENT_CANCELLED': 'Payment cancelled',
    'PAYMENT_INITIATED': 'Payment initiated'
  };
  
  return statusMap[code] || 'Unknown status';
};