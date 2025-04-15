// src/components/admin/UpiVerificationPanel.jsx
"use client";
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'react-toastify';
import { Search, Check, X } from 'lucide-react';
import { PAYMENT_CONFIG } from '@/config/paymentConfig';

export default function UpiVerificationPanel({ adminId }) {
  const [referenceId, setReferenceId] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the existing updatePaymentStatus mutation
  const updatePaymentStatus = useMutation(api.bookings.updatePaymentStatus);
  
  // Fetch all bookings to search through
  const bookings = useQuery(api.bookings.getAllBookings, { adminId }) || [];
  
  // Fetch all bikes to get bike details
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  
  const handleSearch = async () => {
    if (!referenceId.trim()) {
      toast.error("Please enter a reference ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Search through bookings for matching reference ID
      const booking = bookings.find(b => b.paymentReferenceId === referenceId);
      
      if (booking) {
        // Get bike details
        const bike = bikes.find(b => b._id === booking.bikeId);
        
        setBookingData({
          ...booking,
          bikeName: bike ? bike.name : 'Unknown Bike',
          bikeRegistration: bike ? bike.registrationNumber : ''
        });
        
        toast.success("Booking found!");
      } else {
        setBookingData(null);
        toast.error("No booking found with this reference ID");
      }
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Error searching for reference ID");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyPayment = async (success) => {
    if (!bookingData) return;
    
    try {
      await updatePaymentStatus({
        bookingId: bookingData._id,
        success,
        transactionId: referenceId,
        depositAmount: PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT
      });
      
      toast.success(success 
        ? "Payment verified successfully" 
        : "Payment marked as failed"
      );
      
      // Reset form
      setReferenceId('');
      setBookingData(null);
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Error updating payment status");
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">UPI Payment Verification</h2>
      
      {/* Search Box */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Reference ID</label>
        <div className="relative">
          <input
            type="text"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
            placeholder="Enter reference ID (e.g. ZB123456)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !referenceId.trim()}
            className="absolute inset-y-0 right-0 px-3 py-1 bg-primary text-white rounded-r-md"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      
      {/* Results */}
      <div className="border rounded-md p-4 mb-6 bg-gray-50">
        {bookingData ? (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{bookingData.userName}</p>
                <p className="text-sm text-gray-500">{bookingData.userPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-medium">{bookingData.bikeName}</p>
                {bookingData.bikeRegistration && (
                  <p className="text-sm text-gray-500">Reg: {bookingData.bikeRegistration}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Booking Date</p>
                <p className="font-medium">
                  {new Date(bookingData.startTime).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">₹{PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center">
            Enter a reference ID above to verify payment
          </div>
        )}
      </div>
      
      {/* Instructions for Admin */}
      <div className="bg-yellow-50 p-4 rounded-md mb-6">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">How to verify payments</h3>
        <ol className="list-decimal ml-4 text-sm text-yellow-700 space-y-1">
          <li>Ask customer for their payment reference ID</li>
          <li>Verify the payment in your UPI app or bank account</li>
          <li>Match the reference ID and amount (₹{PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT})</li>
          <li>Mark the payment as verified if everything matches</li>
        </ol>
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          disabled={!bookingData || isLoading}
          onClick={() => handleVerifyPayment(true)}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Check className="h-4 w-4 mr-2" />
          Verify Payment
        </button>
        
        <button
          disabled={!bookingData || isLoading}
          onClick={() => handleVerifyPayment(false)}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <X className="h-4 w-4 mr-2" />
          Mark as Failed
        </button>
      </div>
    </div>
  );
}