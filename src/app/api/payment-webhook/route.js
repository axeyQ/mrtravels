// src/app/api/payment-webhook/route.js
import { NextResponse } from 'next/server';
import { cashfreeConfig, verifyWebhookSignature } from '@/lib/cashfree';

export async function POST(request) {
  try {
    // Get the raw request body and headers
    const body = await request.json();
    const signature = request.headers.get('x-webhook-signature');
    
    // Verify Cashfree webhook signature
    if (!signature) {
      console.error('Missing x-webhook-signature in webhook');
      return NextResponse.json({ status: 'ERROR', message: 'Missing signature' }, { status: 400 });
    }
    
    // Verify the webhook signature
    const isValid = verifyWebhookSignature(body, signature, cashfreeConfig.secretKey);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ status: 'ERROR', message: 'Invalid signature' }, { status: 400 });
    }
    
    // Extract order details
    const { orderId, orderAmount, orderStatus, referenceId } = body.data || {};
    
    // Validate that required fields are present
    if (!orderId) {
      console.error('Missing required fields in webhook payload');
      return NextResponse.json({ status: 'ERROR', message: 'Invalid payload' }, { status: 400 });
    }
    
    // Parse the order ID to extract bookingId
    // Format is BIKEFLIX_bookingId_timestamp
    const bookingIdMatch = orderId.match(/BIKEFLIX_([^_]+)_/);
    const bookingId = bookingIdMatch ? bookingIdMatch[1] : null;
    
    if (!bookingId) {
      console.error(`Cannot extract bookingId from order ID: ${orderId}`);
      return NextResponse.json({ status: 'ERROR', message: 'Invalid order ID format' }, { status: 400 });
    }
    
    console.log(`Webhook received for booking ${bookingId}, order ${orderId}, state: ${orderStatus}`);
    
    // Check if payment was successful
    const isSuccessful = orderStatus === 'PAID';
    
    // Update booking status in your database
    try {
      // Call your API to update booking status
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-booking-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          success: isSuccessful,
          transactionId: referenceId || orderId,
          amount: parseFloat(orderAmount) || 42
        })
      });
      
      if (!updateResponse.ok) {
        console.error("Failed to update booking payment status via webhook:", await updateResponse.text());
      } else {
        console.log(`Successfully updated booking ${bookingId} payment status to ${isSuccessful ? 'completed' : 'failed'}`);
      }
    } catch (error) {
      console.error(`Error updating booking ${bookingId} payment status:`, error);
    }
    
    // Return success to Cashfree
    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Error processing Cashfree webhook:', error);
    return NextResponse.json({ status: 'ERROR', message: 'Internal server error' }, { status: 500 });
  }
}