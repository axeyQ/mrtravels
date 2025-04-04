// src/app/api/payment-callback/route.js
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { cashfreeConfig, generateSignature } from '@/lib/cashfree';

export async function POST(request) {
  try {
    // Parse form data from Cashfree
    const formData = await request.formData();
    const params = {};
    
    // Convert formData to object
    for (const [key, value] of formData.entries()) {
      params[key] = value;
    }
    
    // Extract order ID and result
    const { orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg } = params;
    
    // Extract booking ID from order ID (format: BIKEFLIX_bookingId_timestamp)
    const bookingIdMatch = orderId.match(/BIKEFLIX_([^_]+)_/);
    const bookingId = bookingIdMatch ? bookingIdMatch[1] : null;
    
    console.log(`Payment callback received for order ${orderId}, status: ${txStatus}`);
    
    if (!bookingId) {
      console.error(`Cannot extract bookingId from order ID: ${orderId}`);
      return redirect(`/payment-result?status=error&message=Invalid order ID&bookingId=unknown`);
    }
    
    // Check payment status
    const isSuccessful = txStatus === 'SUCCESS';
    
    // Verify transaction status from Cashfree server to ensure callback is legitimate
    const verifyResponse = await fetch(cashfreeConfig.endpoints.getOrder(orderId), {
      method: 'GET',
      headers: {
        'x-client-id': cashfreeConfig.appId,
        'x-client-secret': cashfreeConfig.secretKey,
        'x-api-version': '2022-01-01'
      }
    });
    
    const verifyData = await verifyResponse.json();
    
    // Confirm transaction status from server response
    const verifyStatus = verifyData?.order_status;
    const finalSuccess = verifyStatus === 'PAID';
    
    console.log(`Payment verification for ${orderId}: Status=${verifyStatus}, Amount=${orderAmount}`);
    
    // Update booking payment status in database
    try {
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-booking-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          success: finalSuccess,
          transactionId: referenceId || orderId,
          amount: parseFloat(orderAmount) || 42
        })
      });
      
      if (!updateResponse.ok) {
        console.error("Failed to update booking status:", await updateResponse.text());
      }
    } catch (updateError) {
      console.error("Error updating booking:", updateError);
    }
    
    // Redirect to appropriate result page
    if (finalSuccess) {
      return redirect(`/payment-result?status=success&bookingId=${bookingId}`);
    } else {
      return redirect(`/payment-result?status=failed&message=${encodeURIComponent(txMsg || 'Payment failed')}&bookingId=${bookingId}`);
    }
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return redirect(`/payment-result?status=error&message=${encodeURIComponent('Payment verification failed')}`);
  }
}

// Also handle GET requests for when Cashfree redirects back to our site
export async function GET(request) {
  const url = new URL(request.url);
  const bookingId = url.searchParams.get('booking_id');
  const orderId = url.searchParams.get('order_id');
  
  // Verify the payment status via Cashfree API
  try {
    const verifyResponse = await fetch(cashfreeConfig.endpoints.getOrder(orderId), {
      method: 'GET',
      headers: {
        'x-client-id': cashfreeConfig.appId,
        'x-client-secret': cashfreeConfig.secretKey,
        'x-api-version': '2022-01-01'
      }
    });
    
    if (!verifyResponse.ok) {
      console.error('Failed to verify order:', await verifyResponse.text());
      return redirect(`/payment-result?status=pending&bookingId=${bookingId || 'unknown'}`);
    }
    
    const verifyData = await verifyResponse.json();
    const isSuccessful = verifyData.order_status === 'PAID';
    
    // Update booking payment status in database
    if (bookingId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-booking-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            success: isSuccessful,
            transactionId: verifyData.cf_order_id || orderId,
            amount: parseFloat(verifyData.order_amount) || 42
          })
        });
      } catch (updateError) {
        console.error("Error updating booking:", updateError);
      }
    }
    
    // Redirect to appropriate result page
    if (isSuccessful) {
      return redirect(`/payment-result?status=success&bookingId=${bookingId}`);
    } else {
      return redirect(`/payment-result?status=failed&message=${encodeURIComponent('Payment failed or pending')}&bookingId=${bookingId}`);
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return redirect(`/payment-result?status=pending&bookingId=${bookingId || 'unknown'}`);
  }
}