"use client";
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Link from 'next/link';

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function PaymentSimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showSimulation, setShowSimulation] = useState(false); // For development testing
  const [buttonCooldown, setButtonCooldown] = useState(false);

  // Get booking details
  const booking = useQuery(api.bookings.getBikeBookingById,
    bookingId ? { bookingId } : "skip"
  );
  
  // Get bike details
  const bikeId = booking?.bikeId;
  const bike = useQuery(api.bikes.getBikeById,
    bikeId ? { bikeId } : "skip"
  );
  
  const isLoading = !booking || !bike;

  // Check if we're in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setShowSimulation(true);
    }
  }, []);

  // Handle Cashfree payment
  const handleCashfreePayment = async () => {
    if (!user || !booking || buttonCooldown || isProcessing) return;
    
    // Prevent multiple clicks
    setButtonCooldown(true);
    setIsProcessing(true);
    setProcessingStatus('Initiating payment...');
    
    try {
      // Add a small delay to prevent rapid API calls
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call API to initiate Cashfree payment
      const response = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          userId: user.id,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          userPhone: user.primaryPhoneNumber?.phoneNumber || '',
          totalPrice: booking.totalPrice
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        setProcessingStatus('Redirecting to Cashfree...');
        console.log('Redirecting to Cashfree payment page:', data.paymentUrl);
        // Redirect to Cashfree payment page
        window.location.href = data.paymentUrl;
      } else {
        if (data.error === 'Too many requests. Please wait a moment and try again.') {
          toast.error('Too many payment attempts. Please wait a moment before trying again.');
        } else {
          toast.error(data.message || 'Failed to initiate payment');
        }
        setIsProcessing(false);
        // Reset cooldown after error
        setTimeout(() => setButtonCooldown(false), 3000);
      }
    } catch (error) {
      toast.error('Error initiating payment. Please try again in a moment.');
      console.error('Payment initiation error:', error);
      setIsProcessing(false);
      // Reset cooldown after error
      setTimeout(() => setButtonCooldown(false), 3000);
    }
  };

  // Simulation functions - only for development testing
  const handleSimulateSuccess = async () => {
    if (!bookingId || buttonCooldown || isProcessing) return;
    setButtonCooldown(true);
    setIsProcessing(true);
    setProcessingStatus('Simulating successful payment...');
    
    try {
      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call your API to simulate a successful payment
      const response = await fetch('/api/update-booking-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          success: true,
          transactionId: `SIM_${Date.now()}`
        }),
      });
      
      if (response.ok) {
        setProcessingStatus('Payment successful! Redirecting...');
        toast.success('Payment simulation successful!');
        // Redirect to success page
        setTimeout(() => {
          router.push('/payment-result?status=success&bookingId=' + bookingId);
        }, 2000);
      } else {
        const data = await response.json();
        if (data.error === 'Too many requests. Please wait a moment and try again.') {
          toast.error('Too many payment attempts. Please wait a moment before trying again.');
          setIsProcessing(false);
          setTimeout(() => setButtonCooldown(false), 5000);
        } else {
          throw new Error(data.error || 'Failed to simulate payment');
        }
      }
    } catch (error) {
      console.error('Payment simulation error:', error);
      toast.error('Simulation failed: ' + error.message);
      setIsProcessing(false);
      setTimeout(() => setButtonCooldown(false), 5000);
    }
  };

  const handleSimulateFailure = async () => {
    if (!bookingId || buttonCooldown || isProcessing) return;
    setButtonCooldown(true);
    setIsProcessing(true);
    setProcessingStatus('Simulating failed payment...');
    
    try {
      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call your API to simulate a failed payment
      const response = await fetch('/api/update-booking-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          success: false,
          transactionId: `SIM_FAIL_${Date.now()}`
        }),
      });
      
      if (response.ok) {
        setProcessingStatus('Payment failed! Redirecting...');
        toast.error('Payment simulation failed!');
        // Redirect to failure page
        setTimeout(() => {
          router.push('/payment-result?status=failed&bookingId=' + bookingId);
        }, 2000);
      } else {
        const data = await response.json();
        if (data.error === 'Too many requests. Please wait a moment and try again.') {
          toast.error('Too many payment attempts. Please wait a moment before trying again.');
          setIsProcessing(false);
          setTimeout(() => setButtonCooldown(false), 5000);
        } else {
          throw new Error(data.error || 'Failed to simulate payment');
        }
      }
    } catch (error) {
      console.error('Payment simulation error:', error);
      toast.error('Simulation failed: ' + error.message);
      setIsProcessing(false);
      setTimeout(() => setButtonCooldown(false), 5000);
    }
  };

  const handleCancel = () => {
    // Navigate back to bike details page
    if (bike && bike._id) {
      router.push(`/bikes/${bike._id}`);
    } else {
      router.push('/bikes');
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
              {/* Cashfree Logo */}
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-3 rounded-md flex items-center">
                  <span className="text-blue-800 font-bold mr-2">Cashfree</span>
                  {process.env.NODE_ENV === 'development' && (
                    <span className="text-xs text-blue-600">(Test Environment)</span>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {/* Cashfree Payment Button */}
                <button
                  onClick={handleCashfreePayment}
                  disabled={buttonCooldown || isProcessing}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${
                      buttonCooldown || isProcessing ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`
                  }
                >
                  {buttonCooldown && !isProcessing ? 'Please wait...' : 'Pay ₹42 with Cashfree'}
                </button>
                
                {/* Development Simulation Buttons - only shown in development */}
                {showSimulation && (
                  <>
                    <div className="text-center text-sm text-gray-500 mt-4">
                      <p>Development Testing Options:</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSimulateSuccess}
                        disabled={buttonCooldown || isProcessing}
                        className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                          ${
                            buttonCooldown || isProcessing ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                          }`}
                      >
                        {buttonCooldown && !isProcessing ? 'Please wait...' : 'Simulate Success'}
                      </button>
                      <button
                        onClick={handleSimulateFailure}
                        disabled={buttonCooldown || isProcessing}
                        className={`flex-1 py-2 px-4 border ${
                          buttonCooldown || isProcessing
                          ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } rounded-md shadow-sm text-sm font-medium`}
                      >
                        {buttonCooldown && !isProcessing ? 'Please wait...' : 'Simulate Failure'}
                      </button>
                    </div>
                  </>
                )}
                
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  Cancel and Return
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}