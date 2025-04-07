// src/components/ui/PaymentButton.jsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

/**
 * Payment button component for initiating PhonePe payments
 */
export default function PaymentButton({ 
  bookingId, 
  userId, 
  userName, 
  userPhone,
  disabled = false,
  className = ''
}) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePayment = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Validate required parameters
      if (!bookingId || !userId) {
        toast.error('Missing required booking information');
        return;
      }
      
      // Make API call to initiate payment
      const response = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          userId,
          userName,
          userPhone,
          totalPrice: 42 // Fixed deposit amount
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate payment');
      }
      
      if (data.success && data.paymentUrl) {
        // Store transaction ID in sessionStorage for reference
        if (data.transactionId) {
          sessionStorage.setItem('pendingTransactionId', data.transactionId);
          sessionStorage.setItem('pendingBookingId', bookingId);
        }
        
        // Redirect to payment URL
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Invalid response from payment server');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={`${className} flex justify-center items-center rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
    >
      {isProcessing ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>Pay ₹42 Deposit</>
      )}
    </button>
  );
}