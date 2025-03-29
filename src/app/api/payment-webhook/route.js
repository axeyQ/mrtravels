// Create this file at: app/api/payment-webhook/route.js

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    // Get the raw request body
    const body = await request.json();
    
    // Verify PhonePe webhook signature
    const signature = request.headers.get('X-VERIFY');
    if (!signature) {
      console.error('Missing X-VERIFY signature in webhook');
      return NextResponse.json({ status: 'ERROR', message: 'Missing signature' }, { status: 400 });
    }
    
    // PhonePe API configuration
    const SALT_KEY = process.env.PHONEPE_SALT_KEY;
    const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
    
    // Extract transaction details
    const { merchantId, merchantTransactionId, amount, paymentState } = body;
    
    // Validate that required fields are present
    if (!merchantTransactionId) {
      console.error('Missing required fields in webhook payload');
      return NextResponse.json({ status: 'ERROR', message: 'Invalid payload' }, { status: 400 });
    }
    
    // Parse the transaction ID to extract bookingId
    // Format is BIKEFLIX_bookingId_timestamp
    const bookingIdMatch = merchantTransactionId.match(/BIKEFLIX_([^_]+)_/);
    const bookingId = bookingIdMatch ? bookingIdMatch[1] : null;
    
    if (!bookingId) {
      console.error(`Cannot extract bookingId from transaction: ${merchantTransactionId}`);
      return NextResponse.json({ status: 'ERROR', message: 'Invalid transaction ID format' }, { status: 400 });
    }
    
    console.log(`Webhook received for booking ${bookingId}, transaction ${merchantTransactionId}, state: ${paymentState}`);
    
    // Check if payment was successful
    const isSuccessful = paymentState === 'COMPLETED';
    
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
          transactionId: merchantTransactionId,
          amount: amount / 100 // Convert from paise to rupees
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
    
    // Return success to PhonePe
    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Error processing PhonePe webhook:', error);
    return NextResponse.json({ status: 'ERROR', message: 'Internal server error' }, { status: 500 });
  }
}