// src/lib/receiptGenerator.js
import { formatDate } from '@/lib/dateUtils';
import { PAYMENT_CONFIG } from '@/config/paymentConfig';

export function generateReceiptData(booking, paymentInfo) {
  const receiptId = `ZB-RCT-${Date.now().toString().slice(-8)}`;
  const dateIssued = new Date();
  
  // Calculate balance with platform fee adjustment
  const platformFee = PAYMENT_CONFIG.UPI.PLATFORM_FEE || 2; // Use config or default to 2
  const depositToOwner = (booking.depositAmount || 0) - platformFee;
  const remainingAmount = booking.totalPrice - depositToOwner;
  
  return {
    receiptId,
    dateIssued,
    formattedDate: formatDate(dateIssued, "dd MMM yyyy, HH:mm"),
    bookingId: booking._id,
    referenceId: booking.paymentReferenceId,
    customerName: booking.userName,
    customerPhone: booking.userPhone,
    vehicleDetails: {
      name: paymentInfo.bikeName,
      registrationNumber: paymentInfo.bikeRegNumber,
    },
    rentalPeriod: {
      from: new Date(booking.startTime),
      to: new Date(booking.endTime),
      formattedFrom: formatDate(new Date(booking.startTime), "dd MMM yyyy, HH:mm"),
      formattedTo: formatDate(new Date(booking.endTime), "dd MMM yyyy, HH:mm"),
    },
    payment: {
      depositAmount: booking.depositAmount || 0,
      platformFee: platformFee,
      depositToOwner: depositToOwner,
      totalAmount: booking.totalPrice,
      paidAmount: paymentInfo.amountPaid || booking.depositAmount || 0,
      remainingAmount: remainingAmount,
      paymentMethod: paymentInfo.paymentMethod || "UPI",
      transactionId: paymentInfo.transactionId,
    }
  };
}

// Update the receipt HTML to include platform fee information
export function generateReceiptHTML(receiptData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .receipt {
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-group {
          margin-bottom: 15px;
        }
        .info-label {
          font-weight: bold;
          margin-bottom: 5px;
          color: #555;
        }
        .amount-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .amount-table th, .amount-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .amount-table th {
          background-color: #f9fafb;
        }
        .total-row {
          font-weight: bold;
          background-color: #f0f9ff;
        }
        .subtotal-row {
          border-bottom: 1px dashed #eee;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .note {
          font-size: 11px;
          color: #666;
          font-style: italic;
          margin-top: 5px;
        }
        @media print {
          body {
            padding: 0;
            font-size: 12px;
          }
          .receipt {
            border: none;
          }
          .do-not-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="logo">ZipBikes</div>
          <div>Payment Receipt</div>
        </div>
        
        <div class="info-grid">
          <div class="info-group">
            <div class="info-label">Receipt #:</div>
            <div>${receiptData.receiptId}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Date:</div>
            <div>${receiptData.formattedDate}</div>
          </div>
        </div>
        
        <div class="info-group">
          <div class="info-label">Customer:</div>
          <div>${receiptData.customerName}</div>
          <div>${receiptData.customerPhone}</div>
        </div>
        
        <div class="info-group">
          <div class="info-label">Vehicle Details:</div>
          <div>${receiptData.vehicleDetails.name}</div>
          <div>Reg No: ${receiptData.vehicleDetails.registrationNumber || "N/A"}</div>
        </div>
        
        <div class="info-group">
          <div class="info-label">Rental Period:</div>
          <div>From: ${receiptData.rentalPeriod.formattedFrom}</div>
          <div>To: ${receiptData.rentalPeriod.formattedTo}</div>
        </div>
        
        <table class="amount-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr class="subtotal-row">
              <td>Deposit Collected</td>
              <td>₹${receiptData.payment.depositAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td><em>Platform Fee</em></td>
              <td>₹${receiptData.payment.platformFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td><em>Deposit to Owner</em></td>
              <td>₹${receiptData.payment.depositToOwner.toFixed(2)}</td>
            </tr>
            <tr class="subtotal-row">
              <td>Rental Charges (Total)</td>
              <td>₹${receiptData.payment.totalAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Balance Due at Return</td>
              <td>₹${receiptData.payment.remainingAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="info-group">
          <div class="info-label">Payment Method:</div>
          <div>${receiptData.payment.paymentMethod}</div>
          ${receiptData.payment.transactionId ? `<div>Transaction ID: ${receiptData.payment.transactionId}</div>` : ''}
          <div class="note">* ₹40 from deposit goes to bike owner, ₹2 is platform fee</div>
        </div>
        
        <div class="info-group">
          <div class="info-label">Booking Reference:</div>
          <div>${receiptData.bookingId}</div>
          ${receiptData.referenceId ? `<div>Payment Reference: ${receiptData.referenceId}</div>` : ''}
        </div>
        
        <div class="footer">
          <p>Thank you for choosing ZipBikes!</p>
          <p>For any queries, please contact us at support@zipbikes.in or call 1800-123-4567</p>
        </div>
      </div>
      
      <div class="do-not-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()">Print Receipt</button>
        <button onclick="window.close()">Close</button>
      </div>
    </body>
    </html>
  `;
}