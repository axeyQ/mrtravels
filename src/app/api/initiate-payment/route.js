// src/app/api/initiate-payment/route.js
import { NextResponse } from 'next/server';
import { cashfreeConfig, generateOrderId } from '@/lib/cashfree';

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

    // Generate a unique order ID
    const orderId = generateOrderId(bookingId);

    // Format customer details from available data
    const customerName = userName?.trim() || 'Unknown';
    const customerPhone = userPhone?.replace(/\D/g, '').slice(-10) || '8982611817'; // Example number
    const customerEmail = `user_${userId}@bikeflix.com`; // Fallback email

    // Log credentials for debugging
    console.log("Using Cashfree credentials:", {
      appId: cashfreeConfig.appId,
      // Don't log the full secret key for security reasons
      secretKey: cashfreeConfig.secretKey ? "***" + cashfreeConfig.secretKey.substring(cashfreeConfig.secretKey.length - 4) : "not set",
      environment: process.env.NODE_ENV
    });
    
    // ===============================================================
    // USING SIMULATION FOR DEVELOPMENT/TESTING WITHOUT REAL API CALLS
    // ===============================================================
    
    if (process.env.NODE_ENV === 'development') {
      console.log("DEVELOPMENT MODE: Using payment simulation instead of real Cashfree API");
      
      // Create a simulated successful response
      const simulatedOrderId = orderId;
      const simulatedSessionId = "session_" + Date.now();
      
      // Simulate successful payment URL
      const simulatedPaymentUrl = `/payment-simulation?order_id=${simulatedOrderId}&session_id=${simulatedSessionId}&booking_id=${bookingId}`;
      
      return NextResponse.json({
        success: true,
        paymentUrl: simulatedPaymentUrl,
        orderId: simulatedOrderId,
        cfOrderId: simulatedSessionId,
        simulation: true
      });
    }
    
    // ===========================
    // REAL CASHFREE API CALL CODE
    // ===========================
    
    // Prepare order data for Cashfree API
    const orderData = {
      order_id: orderId,
      order_amount: depositAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${cashfreeConfig.returnUrl}?order_id=${orderId}&booking_id=${bookingId}`,
        notify_url: cashfreeConfig.notifyUrl
      }
    };

    console.log("Sending order data to Cashfree:", orderData);

    // Create order in Cashfree
    const response = await fetch(cashfreeConfig.endpoints.createOrder, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': '2022-09-01',
        'x-client-id': cashfreeConfig.appId,
        'x-client-secret': cashfreeConfig.secretKey
      },
      body: JSON.stringify(orderData)
    });

    // Get response status and body
    const status = response.status;
    const data = await response.json();
    console.log(`Cashfree API response (${status}):`, data);

    if (data.cf_order_id || data.payment_session_id) {
      // Order created successfully
      console.log(`Payment initiated - Order ID: ${orderId}, CF Order ID: ${data.cf_order_id || data.payment_session_id}`);
      
      // Create payment URL
      const paymentUrl = `${cashfreeConfig.endpoints.paymentUrl}?order_id=${orderId}&order_token=${data.payment_session_id || data.order_token}`;
      
      // Return payment URL and order details
      return NextResponse.json({
        success: true,
        paymentUrl: data.payment_link || paymentUrl,
        orderId: orderId,
        cfOrderId: data.cf_order_id || data.payment_session_id
      });
    } else {
      // Order creation failed
      console.error('Cashfree payment initiation failed:', data);
      return NextResponse.json({
        success: false,
        message: data.message || 'Payment initiation failed',
        details: data
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error initiating Cashfree payment:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error during payment initiation',
      error: error.message
    }, { status: 500 });
  }
}