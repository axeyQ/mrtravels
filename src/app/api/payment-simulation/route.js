// src/app/api/payment-simulation/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Get query parameters
  const url = new URL(request.url);
  const bookingId = url.searchParams.get('booking_id');
  const transactionId = url.searchParams.get('transaction_id');
  const sessionId = url.searchParams.get('session_id');
  const action = url.searchParams.get('action') || 'view';
  
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
          transactionId: sessionId || transactionId || `SIM_${Date.now()}`,
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
          transactionId: sessionId || transactionId || `SIM_FAIL_${Date.now()}`,
          amount: 42
        })
      });
      
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-result?status=failed&message=Payment was declined&bookingId=${bookingId}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-result?status=error&message=Failed to update booking&bookingId=${bookingId}`);
    }
  }
  
  // Default view - show payment simulation page with PhonePe-styled UI
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Simulation - PhonePe</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f8f8f8;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          background-color: white;
        }
        .header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .phonepe-logo {
          background-color: #5f259f;
          color: white;
          padding: 10px 15px;
          border-radius: 12px;
          display: inline-block;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        h1 {
          color: #5f259f;
          margin-top: 0;
        }
        .order-details {
          background: #f9f5ff;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          border: 1px solid #e4d3ff;
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
          border: none;
        }
        .btn-success {
          background-color: #5f259f;
          color: white;
        }
        .btn-failure {
          background-color: #e74c3c;
          color: white;
        }
        .btn-cancel {
          background-color: #95a5a6;
          color: white;
        }
        .payment-methods {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 1.5rem;
        }
        .payment-method {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px;
          flex: 1 0 100px;
          text-align: center;
          cursor: pointer;
        }
        .payment-method.selected {
          border-color: #5f259f;
          background-color: #f9f5ff;
        }
        .payment-method-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="phonepe-logo">PhonePe</div>
          <h1>Payment Simulation</h1>
          <p>This is a simulated payment page for development purposes.</p>
        </div>
        
        <div class="order-details">
          <h2>Order Details</h2>
          <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>
          <p><strong>Amount:</strong> ₹42.00</p>
          <p><strong>Booking ID:</strong> ${bookingId || 'N/A'}</p>
          <p><strong>Merchant:</strong> BikeFlix Rentals</p>
        </div>
        
        <div>
          <h3>Select Payment Method:</h3>
          <div class="payment-methods">
            <div class="payment-method selected">
              <div class="payment-method-icon">💳</div>
              <div>UPI</div>
            </div>
            <div class="payment-method">
              <div class="payment-method-icon">💵</div>
              <div>Wallet</div>
            </div>
            <div class="payment-method">
              <div class="payment-method-icon">🏦</div>
              <div>Debit Card</div>
            </div>
          </div>
          
          <h3>Choose Payment Result:</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <a href="?transaction_id=${transactionId}&session_id=${sessionId}&booking_id=${bookingId}&action=success" class="btn btn-success">Payment Success</a>
            <a href="?transaction_id=${transactionId}&session_id=${sessionId}&booking_id=${bookingId}&action=failure" class="btn btn-failure">Payment Failure</a>
            <a href="/bikes" class="btn btn-cancel">Cancel Payment</a>
          </div>
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