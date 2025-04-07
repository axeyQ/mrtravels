// src/app/api/payment-webhook/route.js
import { NextResponse } from 'next/server';
import { phonepeConfig, verifyWebhookSignature } from '@/lib/phonepe';

export async function POST(request) {
  try {
    // Get the raw request body and headers
    const rawBody = await request.text();
    const xVerifyHeader = request.headers.get('X-VERIFY');
    
    // Verify signature if present
    if (xVerifyHeader) {
      const isValid = verifyWebhookSignature(rawBody, xVerifyHeader);
      if (!isValid) {
        console.error('Invalid X-VERIFY signature in webhook');
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
      }
    } else {
      console.warn('Missing X-VERIFY header in webhook');
    }
    
    // Parse the request body
    const body = JSON.parse(rawBody);
    
    console.log('Webhook received from PhonePe:', {
      code: body.code,
      transactionId: body.data?.transactionId,
      merchantTransactionId: body.data?.merchantTransactionId
    });
    
    // Extract booking ID from merchantTransactionId
    // Format is BIKEFLIX_bookingId_timestamp
    let bookingId = null;
    if (body.data?.merchantTransactionId) {
      const parts = body.data.merchantTransactionId.split('_');
      if (parts.length >= 2) {
        bookingId = parts[1];
      }
    }
    
    if (!bookingId) {
      console.error('Cannot extract bookingId from merchantTransactionId');
      return NextResponse.json({ success: false, message: 'Invalid transaction ID format' }, { status: 400 });
    }
    
    // Check if payment was successful
    const isSuccessful = body.code === 'PAYMENT_SUCCESS';
    
    console.log(`Webhook payment status for booking ${bookingId}: ${body.code}`);
    
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
          transactionId: body.data?.transactionId || body.data?.merchantTransactionId || 'webhook',
          amount: body.data?.amount ? body.data.amount / 100 : 42 // Convert from paise to rupees
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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing PhonePe webhook:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}