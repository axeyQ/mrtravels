// src/config/paymentConfig.js
export const PAYMENT_CONFIG = {
    METHOD: 'UPI_MANUAL', // Will change to 'GATEWAY' later
    UPI: {
      ID: '8982611817-2@ybl', // Replace with your actual UPI ID
      MERCHANT_NAME: 'MR Travels and Rental',
    DEPOSIT_AMOUNT: 42,
    PLATFORM_FEE: 2, // Add this line
    DEPOSIT_TO_OWNER: 40, // Standard deposit amount in rupees
    },
    STATUSES: {
      PENDING: 'pending',
      DEPOSIT_PAID: 'deposit_paid',
      FULLY_PAID: 'fully_paid',
      PAYMENT_FAILED: 'payment_failed',
    },
    REFERENCE_PREFIX: 'ZB', // Prefix for reference IDs
  };
  
  // Generate a unique reference ID for bookings
  export const generateReferenceId = (bookingId) => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const reference = `${PAYMENT_CONFIG.REFERENCE_PREFIX}${timestamp}${bookingId.substring(0, 5)}`;
    return reference.toUpperCase();
  };
  
  // Get UPI Payment URL (for QR code generation)
  export const getUpiPaymentUrl = (referenceId, amount = PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT) => {
    const upiUrl = `upi://pay?pa=${PAYMENT_CONFIG.UPI.ID}&pn=${encodeURIComponent(PAYMENT_CONFIG.UPI.MERCHANT_NAME)}&am=${amount}&tr=${referenceId}&cu=INR`;
    return upiUrl;
  };