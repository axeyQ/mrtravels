// In src/components/payments/PaymentConfirmation.jsx - Update to save reference ID
"use client";
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect } from 'react';

export default function PaymentConfirmation({ bookingId, referenceId }) {
  const router = useRouter();
  const updateBookingReference = useMutation(api.bookings.updatePaymentReference);
  
  // Save the reference ID to the booking
  useEffect(() => {
    if (bookingId && referenceId) {
      updateBookingReference({ 
        bookingId, 
        referenceId 
      }).catch(err => console.error('Error updating reference:', err));
    }
  }, [bookingId, referenceId, updateBookingReference]);
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto text-center">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Initiated</h2>
      <p className="text-gray-600 mb-6">
        Thank you for initiating the payment. Your booking will be confirmed once we verify your payment.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="text-sm text-blue-800 mb-1">Your Reference ID</div>
        <div className="text-lg font-bold">{referenceId}</div>
        <div className="mt-2 text-xs text-blue-700">
          Please save this reference ID for future communications
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => router.push('/bookings')}
          className="w-full bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary-600 transition-colors flex items-center justify-center"
        >
          View My Bookings
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}