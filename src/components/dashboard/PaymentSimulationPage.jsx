// Create a new file: src/components/dashboard/PaymentSimulationPage.jsx

"use client";
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';

export default function PaymentSimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  
  // Get booking details - with proper hook usage
  const booking = useQuery(api.bookings.getBikeBookingById, 
    bookingId ? { bookingId } : "skip"
  );
  
  // Get bike details - with proper hook usage  
  const bikeId = booking?.bikeId;
  const bike = useQuery(api.bikes.getBikeById, 
    bikeId ? { bikeId } : "skip"
  );
  
  // Mutation for updating payment status
  const updatePaymentStatus = useMutation(api.bookings.updatePaymentStatus);
  
  const isLoading = !booking || !bike;
  
  // Handle payment success
  const handlePaymentSuccess = async () => {
    if (!bookingId) return;
    
    setIsProcessing(true);
    setProcessingStatus('Processing payment...');
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random transaction ID
      const transactionId = `SIMT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Update booking payment status
      await updatePaymentStatus({
        bookingId,
        success: true,
        transactionId
      });
      
      setProcessingStatus('Payment successful! Redirecting...');
      toast.success('Payment successful!');
      
      // Redirect to success page
      setTimeout(() => {
        router.push('/payment-result?status=success');
      }, 2000);
      
    } catch (error) {
      console.error('Payment update error:', error);
      toast.error(`Payment processing failed: ${error.message || 'Unknown error'}`);
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };
  
  // Handle payment failure
  const handlePaymentFailure = async () => {
    if (!bookingId) return;
    
    setIsProcessing(true);
    setProcessingStatus('Processing payment...');
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update booking payment status
      await updatePaymentStatus({
        bookingId,
        success: false
      });
      
      setProcessingStatus('Payment failed! Redirecting...');
      toast.error('Payment failed!');
      
      // Redirect to failure page
      setTimeout(() => {
        router.push('/payment-result?status=failed');
      }, 2000);
      
    } catch (error) {
      console.error('Payment update error:', error);
      toast.error(`Payment processing failed: ${error.message || 'Unknown error'}`);
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isProcessing ? (
            <div className="text-center py-10">
              <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">{processingStatus}</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Pay Deposit</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please pay the booking deposit of ₹42
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Booking Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Vehicle:</span>
                    <span className="text-sm font-medium text-gray-900">{bike.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Start Time:</span>
                    <span className="text-sm font-medium text-gray-900">{new Date(booking.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">End Time:</span>
                    <span className="text-sm font-medium text-gray-900">{new Date(booking.endTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Payment Breakdown
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Estimated Total:</span>
                    <span className="text-sm font-medium text-blue-900">₹{booking.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Deposit Amount:</span>
                    <span className="text-sm font-medium text-blue-900">₹42.00</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                    <span className="text-sm text-blue-700">Remaining (Pay Later):</span>
                    <span className="text-sm font-medium text-blue-900">₹{(booking.totalPrice - 40).toFixed(2)}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-blue-600">
                  * ₹40 from deposit goes to bike owner, ₹2 is platform fee
                </p>
              </div>
              
              {/* PhonePe Logo */}
              <div className="flex justify-center mb-6">
                <div className="bg-purple-100 p-3 rounded-md flex items-center">
                  <span className="text-purple-800 font-bold mr-2">PhonePe</span>
                  <span className="text-xs text-purple-600">(Simulation)</span>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <button
                  onClick={handlePaymentSuccess}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Pay ₹42 with PhonePe
                </button>
                <div className="text-center text-sm text-gray-500">
                  <p>Simulation Options:</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePaymentSuccess}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Simulate Success
                  </button>
                  <button
                    onClick={handlePaymentFailure}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Simulate Failure
                  </button>
                </div>
                <Link
                  href={`/bikes/${bike._id}`}
                  className="w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel and Return
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}