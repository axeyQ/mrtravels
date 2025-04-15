// src/components/ui/ReceiptModal.jsx
"use client";
import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { generateReceiptData } from '@/lib/receiptGenerator';

export default function ReceiptModal({ booking, bikeInfo, isOpen, onClose }) {
  const [receiptData, setReceiptData] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen && booking) {
      // Generate receipt data
      const data = generateReceiptData(booking, {
        bikeName: bikeInfo?.name || 'Unknown Vehicle',
        bikeRegNumber: bikeInfo?.registrationNumber || '-',
        amountPaid: booking.depositAmount || 0,
        paymentMethod: 'UPI',
        transactionId: booking.transactionId || booking.paymentReferenceId
      });
      
      setReceiptData(data);
      generateReceiptHtml(data);
    }
  }, [isOpen, booking, bikeInfo]);
  
  const generateReceiptHtml = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiptData: data }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setReceiptUrl(url);
      } else {
        console.error('Failed to generate receipt');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const shareReceipt = async () => {
    if (navigator.share && receiptUrl) {
      try {
        await navigator.share({
          title: 'ZipBikes Rental Receipt',
          text: `Receipt for booking #${booking._id}`,
          url: receiptUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `ZipBikes Receipt #${receiptData?.receiptId} - Amount Paid: ₹${receiptData?.payment.paidAmount}`;
      alert('Copy this link to share: ' + window.location.href);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Payment Receipt</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : receiptUrl ? (
            <iframe src={receiptUrl} className="w-full h-full min-h-[500px]" title="Receipt"></iframe>
          ) : (
            <div className="p-8 text-center text-red-500">
              Failed to generate receipt. Please try again.
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-4">
          <button 
            onClick={shareReceipt}
            className="px-4 py-2 flex items-center text-primary border border-primary rounded-md hover:bg-primary-50"
            disabled={isLoading || !receiptUrl}
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
          <button 
            onClick={() => window.open(receiptUrl, '_blank')}
            className="px-4 py-2 flex items-center bg-primary text-white rounded-md hover:bg-primary-600"
            disabled={isLoading || !receiptUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}