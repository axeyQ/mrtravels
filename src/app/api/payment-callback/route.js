// Create this file at: app/api/payment-callback/route.js

import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import PaytmChecksum from 'paytmchecksum';

export async function POST(request) {
  try {
    // Parse form data from Paytm
    const formData = await request.formData();
    const params = {};
    
    // Convert formData to object
    for (const [key, value] of formData.entries()) {
      params[key] = value;
    }
    
    // Extract order ID and result
    const { ORDERID, STATUS, TXNAMOUNT, RESPMSG } = params;
    
    // Extract booking ID from order ID (format: BIKEFLIX_bookingId_timestamp)
    const bookingIdMatch = ORDERID.match(/BIKEFLIX_([^_]+)_/);
    const bookingId = bookingIdMatch ? bookingIdMatch[1] : null;
    
    console.log(`Payment callback received for order ${ORDERID}, status: ${STATUS}`);
    
    if (!bookingId) {
      console.error(`Cannot extract bookingId from order ID: ${ORDERID}`);
      return redirect(`/payment-result?status=error&message=Invalid order ID&bookingId=unknown`);
    }
    
    // Check payment status
    const isSuccessful = STATUS === 'TXN_SUCCESS';
    
    // Generate post data for verification
    const verifyParams = {};
    verifyParams.body = {
      mid: process.env.PAYTM_MERCHANT_ID,
      orderId: ORDERID
    };
    
    // Generate checksum for verification
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(verifyParams.body),
      process.env.PAYTM_MERCHANT_KEY
    );
    verifyParams.head = {
      signature: checksum
    };
    
    // Verify transaction status
    const verifyUrl = `${process.env.PAYTM_HOST}/v3/order/status`;
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyParams)
    });
    
    const verifyData = await verifyResponse.json();
    
    // Confirm transaction status from server response
    const verifyStatus = verifyData?.body?.resultInfo?.resultStatus;
    const finalSuccess = verifyStatus === 'TXN_SUCCESS';
    
    console.log(`Payment verification for ${ORDERID}: Status=${verifyStatus}, Amount=${TXNAMOUNT}`);
    
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
          transactionId: ORDERID,
          amount: parseFloat(TXNAMOUNT) || 42
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
      return redirect(`/payment-result?status=failed&message=${encodeURIComponent(RESPMSG || 'Payment failed')}&bookingId=${bookingId}`);
    }
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return redirect(`/payment-result?status=error&message=${encodeURIComponent('Payment verification failed')}`);
  }
}

// Also handle GET requests for when Paytm redirects back to our site
export async function GET(request) {
  const url = new URL(request.url);
  const bookingId = url.searchParams.get('bookingId');
  
  // Redirect to result page for browser redirects
  return redirect(`/payment-result?status=pending&bookingId=${bookingId || 'unknown'}`);
}