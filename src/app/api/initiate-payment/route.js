// Create this file at: app/api/initiate-payment/route.js

import { NextResponse } from 'next/server';
import PaytmChecksum from 'paytmchecksum';

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
    
    // Configure Paytm parameters
    const paytmParams = {
      body: {
        requestType: "Payment",
        mid: process.env.PAYTM_MERCHANT_ID,
        websiteName: process.env.PAYTM_WEBSITE,
        orderId: `BIKEFLIX_${bookingId}_${Date.now()}`,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-callback?bookingId=${bookingId}`,
        txnAmount: {
          value: depositAmount.toString(),
          currency: "INR",
        },
        userInfo: {
          custId: userId,
          mobile: userPhone?.replace(/\D/g, '').slice(-10) || '',
          firstName: userName?.split(' ')[0] || 'Customer'
        }
      }
    };
    
    // Generate checksum
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      process.env.PAYTM_MERCHANT_KEY
    );
    
    // Add checksum to parameters
    paytmParams.head = {
      signature: checksum
    };
    
    // Log transaction initiation
    console.log(`Initiating Paytm payment for booking ${bookingId} - Amount: Rs.${depositAmount}`);
    
    // Make API call to Paytm to initiate transaction
    const txnUrl = `${process.env.PAYTM_HOST}/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MERCHANT_ID}&orderId=${paytmParams.body.orderId}`;
    
    const response = await fetch(txnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paytmParams)
    });
    
    const data = await response.json();
    console.log("Paytm API response:", data);
    
    if (data.body && data.body.resultInfo && data.body.resultInfo.resultStatus === "S") {
      // Transaction initiated successfully
      // Store transaction reference
      console.log(`Payment initiated - Transaction ID: ${paytmParams.body.orderId}`);
      
      // Construct the payment URL for redirect
      const paymentUrl = `${process.env.PAYTM_HOST}/theia/api/v1/showPaymentPage?mid=${process.env.PAYTM_MERCHANT_ID}&orderId=${paytmParams.body.orderId}&txnToken=${data.body.txnToken}`;
      
      // Return success with payment URL
      return NextResponse.json({ 
        success: true, 
        paymentUrl,
        txnToken: data.body.txnToken,
        orderId: paytmParams.body.orderId
      });
    } else {
      // Transaction initiation failed
      console.error('Paytm payment initiation failed:', data);
      return NextResponse.json({ 
        success: false, 
        message: data.body?.resultInfo?.resultMsg || 'Payment initiation failed' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error initiating Paytm payment:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error during payment initiation'
    }, { status: 500 });
  }
}