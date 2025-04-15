// src/app/(dashboard)/payment-upi/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import UpiPaymentInstructions from '@/components/payments/UpiPaymentInstructions';
import PaymentConfirmation from '@/components/payments/PaymentConfirmation';
import { generateReferenceId } from '@/config/paymentConfig';

export default function UpiPaymentPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const updateBookingReference = useMutation(api.bookings.updatePaymentReference);
  
  const [paymentStep, setPaymentStep] = useState('instructions');
  const [paymentReference, setPaymentReference] = useState('');
  
  // Generate reference ID when page loads
  useEffect(() => {
    if (bookingId && !paymentReference) {
      const refId = generateReferenceId(bookingId);
      setPaymentReference(refId);
      
      // Save the reference ID to the booking immediately
      updateBookingReference({ 
        bookingId, 
        referenceId: refId 
      }).catch(err => console.error('Error updating reference:', err));
    }
  }, [bookingId, paymentReference, updateBookingReference]);
  
  const handlePaymentComplete = () => {
    setPaymentStep('confirmation');
  };
  
  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Invalid Request</h2>
          <p className="text-red-600">Missing booking information. Please try again.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12 px-4">
      {paymentStep === 'instructions' ? (
        <UpiPaymentInstructions 
          bookingId={bookingId}
          referenceId={paymentReference}
          onComplete={handlePaymentComplete} 
        />
      ) : (
        <PaymentConfirmation 
          bookingId={bookingId}
          referenceId={paymentReference} 
        />
      )}
    </div>
  );
}