// src/app/api/initiate-payment/route.js
import { NextResponse } from 'next/server';
import { 
  phonepeConfig, 
  generateTransactionId, 
  encodePayload, 
  generateXVerifyHeader 
} from '@/lib/phonepe';

// Simple in-memory rate limiting
const requestTracker = {
  requests: {},
  isRateLimited: function(ip) {
    const now = Date.now();
    this.requests[ip] = this.requests[ip] || [];
    // Clean up old requests (older than 1 minute)
    this.requests[ip] = this.requests[ip].filter(time => now - time < 60000);
    // Check if too many requests (more than 5 in the last minute)
    if (this.requests[ip].length >= 5) {
      return true;
    }
    // Add this request
    this.requests[ip].push(now);
    return false;
  }
};

export async function POST(request) {
  try {
    // Basic rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (requestTracker.isRateLimited(ip)) {
      console.log(`Rate limited request from ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bookingId, userId, userPhone, userName, totalPrice } = body;

    // Always set deposit amount to Rs. 42
    const depositAmount = 42;

    // Validate required parameters
    if (!bookingId || !userId) {
      return NextResponse.json({
        success: false,
        message: "Missing required parameters"
      }, { status: 400 });
    }

    // Generate a unique transaction ID
    const merchantTransactionId = generateTransactionId(bookingId);

    // Format customer details from available data
    const customerName = userName?.trim() || 'Unknown';
    const customerPhone = userPhone?.replace(/\D/g, '').slice(-10) || '8982611817'; // Example number
    const customerEmail = `user_${userId}@bikeflix.com`; // Fallback email

    // ===============================================================
    // USING SIMULATION FOR DEVELOPMENT/TESTING WITHOUT REAL API CALLS
    // ===============================================================
    
    if (process.env.NODE_ENV === 'development' && process.env.USE_PAYMENT_SIMULATION === 'true') {
      console.log("DEVELOPMENT MODE: Using payment simulation instead of real PhonePe API");
      
      // Create a simulated successful response
      const simulatedTransactionId = merchantTransactionId;
      const simulatedSessionId = "session_" + Date.now();
      
      // Simulate successful payment URL
      const simulatedPaymentUrl = `/payment-simulation?transaction_id=${simulatedTransactionId}&session_id=${simulatedSessionId}&booking_id=${bookingId}`;
      
      return NextResponse.json({
        success: true,
        paymentUrl: simulatedPaymentUrl,
        transactionId: simulatedTransactionId,
        simulation: true
      });
    }
    
    // ===========================
    // REAL PHONEPE API CALL CODE
    // ===========================
    
    // Prepare payload for PhonePe API
    const payload = {
      merchantId: phonepeConfig.merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: depositAmount * 100, // Amount in paise
      redirectUrl: `${phonepeConfig.redirectUrl}?transaction_id=${merchantTransactionId}&booking_id=${bookingId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${phonepeConfig.callbackUrl}?booking_id=${bookingId}`,
      mobileNumber: customerPhone,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // Encode payload to Base64
    const base64Payload = encodePayload(payload);

    // Generate X-VERIFY header
    const xVerifyHeader = generateXVerifyHeader(base64Payload);

    console.log("Sending payload to PhonePe:", {
      merchantId: payload.merchantId,
      merchantTransactionId: payload.merchantTransactionId,
      amount: payload.amount / 100, // Convert back to rupees for logging
      redirectUrl: payload.redirectUrl,
      callbackUrl: payload.callbackUrl
    });

    // Make API call to PhonePe
    const response = await fetch(phonepeConfig.endpoints.paymentApi, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': xVerifyHeader
      },
      body: JSON.stringify({
        request: base64Payload
      })
    });

    // Get response status and body
    const data = await response.json();
    console.log(`PhonePe API response:`, data);

    if (data.success) {
      // Payment initiation successful
      console.log(`Payment initiated - Transaction ID: ${merchantTransactionId}`);
      
      // Return payment URL and transaction details
      return NextResponse.json({
        success: true,
        paymentUrl: data.data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId,
        phonepeTransactionId: data.data.transactionId
      });
    } else {
      // Payment initiation failed
      console.error('PhonePe payment initiation failed:', data);
      return NextResponse.json({
        success: false,
        message: data.message || 'Payment initiation failed',
        details: data
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error initiating PhonePe payment:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error during payment initiation',
      error: error.message
    }, { status: 500 });
  }
}