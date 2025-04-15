// src/app/api/payment-simulation/route.js
import { NextResponse } from 'next/server';
import { PAYMENT_CONFIG, generateReferenceId } from '@/config/paymentConfig';

export async function GET(request) {  
  // Get query parameters  
  const url = new URL(request.url);  
  const bookingId = url.searchParams.get('booking_id');  
  const orderId = url.searchParams.get('order_id');  
  const sessionId = url.searchParams.get('session_id');  
  const action = url.searchParams.get('action') || 'view';  
   
  // Check if UPI payment method is enabled
  if (PAYMENT_CONFIG.METHOD === 'UPI_MANUAL') {
    // Use the new UPI payment flow
    const referenceId = url.searchParams.get('reference_id') || generateReferenceId(bookingId);
    
    return new Response(
      `<meta http-equiv="refresh" content="0;url=/payment-upi?booking_id=${bookingId}&reference_id=${referenceId}">`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  // If this is a success action, update the booking status  
  if (action === 'success' && bookingId) {  
    try {  
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/update-booking-payment`, {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
        },  
        body: JSON.stringify({  
          bookingId,  
          success: true,  
          transactionId: sessionId || orderId || `SIM_${Date.now()}`,  
          amount: 42  
        })  
      });  
       
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-result?status=success&bookingId=${bookingId}`);  
    } catch (error) {  
      console.error('Error updating booking status:', error);  
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-result?status=error&message=Failed to update booking&bookingId=${bookingId}`);  
    }  
  }  
   
  // If this is a failure action, mark the payment as failed  
  if (action === 'failure' && bookingId) {  
    try {  
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/update-booking-payment`, {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
        },  
        body: JSON.stringify({  
          bookingId,  
          success: false,  
          transactionId: sessionId || orderId || `SIM_FAIL_${Date.now()}`,  
          amount: 42  
        })  
      });  
       
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-result?status=failed&message=Payment was declined&bookingId=${bookingId}`);  
    } catch (error) {  
      console.error('Error updating booking status:', error);  
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-result?status=error&message=Failed to update booking&bookingId=${bookingId}`);  
    }  
  }  
   
  // Default view - show payment simulation page with test card options  
  const htmlContent = `  
    <!DOCTYPE html>  
    <html lang="en">  
    <head>  
      <meta charset="UTF-8">  
      <meta name="viewport" content="width=device-width, initial-scale=1.0">  
      <title>Payment Simulation</title>  
      <style>  
        body {  
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;  
          line-height: 1.5;  
          color: #333;  
          max-width: 600px;  
          margin: 0 auto;  
          padding: 2rem;  
        }  
        .container {  
          border: 1px solid #ddd;  
          border-radius: 8px;  
          padding: 2rem;  
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);  
        }  
        h1 {  
          color: #2563eb;  
          margin-top: 0;  
        }  
        .order-details {  
          background: #f3f4f6;  
          padding: 1rem;  
          border-radius: 6px;  
          margin-bottom: 1.5rem;  
        }  
        .btn {  
          display: inline-block;  
          padding: 0.75rem 1.5rem;  
          border-radius: 6px;  
          text-decoration: none;  
          font-weight: 500;  
          cursor: pointer;  
          margin-right: 1rem;  
          margin-bottom: 1rem;  
        }  
        .btn-success {  
          background-color: #10b981;  
          color: white;  
        }  
        .btn-failure {  
          background-color: #ef4444;  
          color: white;  
        }  
        .btn-cancel {  
          background-color: #6b7280;  
          color: white;  
        }  
        .card {  
          border: 1px solid #e5e7eb;  
          border-radius: 6px;  
          padding: 1rem;  
          margin-bottom: 1rem;  
        }  
        .card-header {  
          font-weight: 600;  
          margin-bottom: 0.5rem;  
        }  
        .card-body {  
          font-size: 0.875rem;  
        }  
      </style>  
    </head>  
    <body>  
      <div class="container">  
        <h1>Payment Simulation</h1>  
        <p>This is a simulated payment page for development purposes.</p>  
         
        <div class="order-details">  
          <h2>Order Details</h2>  
          <p><strong>Order ID:</strong> ${orderId || 'N/A'}</p>  
          <p><strong>Amount:</strong> ₹42.00</p>  
          <p><strong>Booking ID:</strong> ${bookingId || 'N/A'}</p>  
        </div>  
         
        <div class="card">  
          <div class="card-header">Test Card</div>  
          <div class="card-body">  
            <p><strong>Card Number:</strong> 4111 1111 1111 1111</p>  
            <p><strong>Expiry:</strong> Any future date</p>  
            <p><strong>CVV:</strong> Any 3 digits</p>  
            <p><strong>Name:</strong> Any name</p>  
          </div>  
        </div>  
         
        <div>  
          <h3>Choose Payment Result:</h3>  
          <a href="?order_id=${orderId}&session_id=${sessionId}&booking_id=${bookingId}&action=success" class="btn btn-success">Payment Success</a>  
          <a href="?order_id=${orderId}&session_id=${sessionId}&booking_id=${bookingId}&action=failure" class="btn btn-failure">Payment Failure</a>  
          <a href="/bikes" class="btn btn-cancel">Cancel Payment</a>  
        </div>  
      </div>  
    </body>  
    </html>  
  `;  
   
  return new Response(htmlContent, {  
    headers: {  
      'Content-Type': 'text/html',  
    },  
  });  
}