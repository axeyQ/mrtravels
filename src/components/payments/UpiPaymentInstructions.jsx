// src/components/payments/UpiPaymentInstructions.jsx
"use client";
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle } from 'lucide-react';
import { PAYMENT_CONFIG, getUpiPaymentUrl, generateReferenceId } from '@/config/paymentConfig';
import { toast } from 'react-toastify';

export default function UpiPaymentInstructions({ bookingId, referenceId, onComplete }) {
  const [copied, setCopied] = useState(false);
  


  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.UPI.ID);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleContinue = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Payment Instructions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Please pay the deposit of ₹{PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT} using UPI
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-3 border-2 border-primary rounded-lg">
          <QRCodeSVG 
            value={getUpiPaymentUrl(referenceId)} 
            size={180} 
            level={"H"} 
            includeMargin={true}
          />
        </div>
      </div>

      {/* Reference ID */}
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="text-sm font-medium text-blue-800 mb-2">Your Reference ID</div>
        <div className="text-lg font-bold text-center p-2 bg-white rounded border border-blue-200">
          {referenceId}
        </div>
        <div className="mt-2 text-xs text-blue-700">
          <strong>Important:</strong> Include this reference ID in the UPI payment notes
        </div>
      </div>

      {/* UPI ID */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">UPI ID</label>
          <button
            onClick={handleCopyUpiId}
            className="text-primary hover:text-primary-600 text-sm flex items-center"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="flex items-center p-2 bg-gray-50 rounded-md border border-gray-200">
          <span className="flex-1 font-medium">{PAYMENT_CONFIG.UPI.ID}</span>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-4 text-center">
          After making the payment, click continue to confirm your booking
        </p>
        <button
          onClick={handleContinue}
          className="w-full bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary-600 transition-colors"
        >
          I&apos;ve Made the Payment
        </button>
      </div>
    </div>
  );
}