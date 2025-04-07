// src/app/api/payment-callback/route.js
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { phonepeConfig, verifyWebhookSignature } from '@/lib/phonepe';

export async function POST(request) {
  try {
    // Get the request body
    const requestBody = await request.text();
    const xVerifyHeader = request.headers.get('X-VERIFY');
    
    // Verify signature if X-VERIFY header is present
    if (xVerifyHeader) {
      const isValid = verifyWebhookSignature(requestBody, xVerifyHeader);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
      }
    }
    
    // Parse the data
    const data = JSON.parse(requestBody);
    console.log('Payment callback data:', data);
    
    // Extract booking ID from custom parameters or merchant transaction ID
    let bookingId = request.nextUrl.searchParams.get('booking_id');
    if (!bookingId && data.data?.merchantTransactionId) {
      // Extract from transaction ID format: BIKEFLIX_bookingId_timestamp
      const parts = data.data.merchantTransactionId.split('_');
      if (parts.length >= 2) {
        bookingId = parts[1];
      }
    }
    
    if (!bookingId) {
      console.error('Cannot determine booking ID from callback data');
      return NextResponse.json({ success: false, message: 'Missing booking ID' }, { status: 400 });
    }
    
    // Check payment status
    const isSuccessful = data.code === 'PAYMENT_SUCCESS';
    const transactionId = data.data?.transactionId || data.data?.merchantTransactionId || 'unknown';
    
    console.log(`Payment callback for booking ${bookingId}: Status=${data.code}, TransactionID=${transactionId}`);
    
    // Update booking payment status in database
    try {
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-booking-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          success: isSuccessful,
          transactionId: transactionId,
          amount: data.data?.amount ? data.data.amount / 100 : 42 // Convert paise to rupees
        })
      });
      
      if (!updateResponse.ok) {
        console.error("Failed to update booking status:", await updateResponse.text());
      }
    } catch (updateError) {
      console.error("Error updating booking:", updateError);
    }
    
    // Return success response to PhonePe (for webhook)
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json({ success: false, message: 'Error processing callback' }, { status: 500 });
  }
}

// Handle GET requests for redirect from PhonePe payment page
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transaction_id');
    const bookingId = url.searchParams.get('booking_id');
    
    if (!transactionId || !bookingId) {
      console.error('Missing transaction_id or booking_id in redirect params');
      return redirect('/payment-result?status=error&message=Missing parameters');
    }
    
    // Query PhonePe for transaction status
    const statusUrl = phonepeConfig.endpoints.statusApi(
      phonepeConfig.merchantId,
      transactionId
    );
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': generateXVerifyHeader(phonepeConfig.merchantId + '/' + transactionId)
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch transaction status:', response.statusText);
      return redirect(`/payment-result?status=pending&bookingId=${bookingId}`);
    }
    
    const statusData = await response.json();
    const isSuccessful = statusData.code === 'PAYMENT_SUCCESS';
    
    // Update booking status based on payment result
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-booking-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          success: isSuccessful,
          transactionId: statusData.data?.transactionId || transactionId,
          amount: statusData.data?.amount ? statusData.data.amount / 100 : 42
        })
      });
    } catch (error) {
      console.error("Error updating booking payment status:", error);
    }
    
    // Redirect to result page
    if (isSuccessful) {
      return redirect(`/payment-result?status=success&bookingId=${bookingId}`);
    } else {
      const message = encodeURIComponent(statusData.message || 'Payment failed or is pending');
      return redirect(`/payment-result?status=failed&message=${message}&bookingId=${bookingId}`);
    }
    
  } catch (error) {
    console.error('Error handling payment redirect:', error);
    const bookingId = request.nextUrl.searchParams.get('booking_id') || 'unknown';
    return redirect(`/payment-result?status=error&bookingId=${bookingId}`);
  }
}