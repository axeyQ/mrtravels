// src/components/dashboard/BookingActions.jsx
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/\_generated/api';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ArrowRight, ArrowLeft, Clock, Calendar, X } from 'lucide-react';

/**
 * Booking Actions Component
 * Provides UI for early returns and booking extensions
 */
export default function BookingActions({ booking, onActionComplete }) {
  const { user } = useUser();
  
  // States for modals
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showEarlyReturnModal, setShowEarlyReturnModal] = useState(false);
  
  // Date states
  const [extendEndDate, setExtendEndDate] = useState(new Date(booking.endTime + 60 * 60 * 1000)); // Default to 1 hour later
  const [earlyReturnDate, setEarlyReturnDate] = useState(new Date());
  
  // Loading states
  const [isExtending, setIsExtending] = useState(false);
  const [isReturningEarly, setIsReturningEarly] = useState(false);
  
  // Convex mutations
  const extendBooking = useMutation(api.bookings.extendBooking);
  const processEarlyReturn = useMutation(api.bookings.processEarlyReturn);
  
  // Only show actions for confirmed bookings
  if (booking.status !== "confirmed") {
    return null;
  }
  
  // Calculate time information for display
  const currentTime = new Date();
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const bookingInProgress = currentTime >= startTime && currentTime < endTime;
  const bookingNotStarted = currentTime < startTime;
  
  // Handle extending a booking
  const handleExtendBooking = async () => {
    if (!user) return;
    
    // Validation
    if (extendEndDate <= new Date(booking.endTime)) {
      toast.error("New end time must be after the current end time");
      return;
    }
    
    setIsExtending(true);
    try {
      const result = await extendBooking({
        bookingId: booking._id,
        newEndTime: extendEndDate.getTime(),
        userId: user.id
      });
      
      toast.success(`Booking extended successfully! Additional cost: ₹${result.additionalCost}`);
      setShowExtendModal(false);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      toast.error(error.message || "Failed to extend booking");
    } finally {
      setIsExtending(false);
    }
  };
  
  // Handle early return
  const handleEarlyReturn = async () => {
    if (!user) return;
    
    // Validation
    if (new Date(booking.startTime) >= earlyReturnDate) {
      toast.error("Return time must be after the booking start time");
      return;
    }
    
    if (earlyReturnDate >= new Date(booking.endTime)) {
      toast.error("For early returns, the actual end time must be before the original end time");
      return;
    }
    
    setIsReturningEarly(true);
    try {
      const result = await processEarlyReturn({
        bookingId: booking._id,
        actualEndTime: earlyReturnDate.getTime(),
        userId: user.id
      });
      
      // Show appropriate message based on refund amount
      if (result.refundAmount > 0) {
        toast.success(`Early return processed! Refund amount: ₹${result.refundAmount}`);
      } else {
        toast.success("Early return processed successfully!");
      }
      
      setShowEarlyReturnModal(false);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      toast.error(error.message || "Failed to process early return");
    } finally {
      setIsReturningEarly(false);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {/* Extension Button - always show for confirmed bookings */}
      <button
        onClick={() => setShowExtendModal(true)}
        className="inline-flex items-center px-3 py-1.5 border border-blue-500 shadow-sm text-xs font-medium rounded text-blue-600 bg-white hover:bg-blue-50"
      >
        <ArrowRight className="mr-1.5 h-3 w-3" />
        Extend Booking
      </button>
      
      {/* Early Return Button - only show if booking has started */}
      {bookingInProgress && (
        <button
          onClick={() => setShowEarlyReturnModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-green-500 shadow-sm text-xs font-medium rounded text-green-600 bg-white hover:bg-green-50"
        >
          <ArrowLeft className="mr-1.5 h-3 w-3" />
          Return Early
        </button>
      )}
      
      {/* Extension Modal - Mobile optimized */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Extend Booking</h3>
                <button 
                  onClick={() => setShowExtendModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-4 bg-blue-50 p-3 rounded-md text-sm">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-blue-700">
                  Current end time: {new Date(booking.endTime).toLocaleString()}
                </span>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New End Time
                </label>
                <div className="relative">
                  <DatePicker
                    selected={extendEndDate}
                    onChange={setExtendEndDate}
                    showTimeSelect
                    timeIntervals={30}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    minDate={new Date(booking.endTime)}
                    minTime={new Date(booking.endTime)}
                    maxTime={new Date(booking.endTime).setHours(23, 59)}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Show the calculated additional hours and cost */}
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-blue-700 mb-2">Extension Details</h4>
                <div className="text-sm">
                  <p className="flex justify-between mb-1">
                    <span>Original Duration:</span>
                    <span>{Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60))} hours</span>
                  </p>
                  <p className="flex justify-between mb-1">
                    <span>Additional Time:</span>
                    <span>{Math.ceil((extendEndDate.getTime() - booking.endTime) / (1000 * 60 * 60))} hours</span>
                  </p>
                  <p className="flex justify-between font-medium border-t border-blue-200 pt-2 mt-2">
                    <span>Additional Cost:</span>
                    <span>₹{Math.ceil((extendEndDate.getTime() - booking.endTime) / (1000 * 60 * 60)) * (booking.totalPrice / Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60)))}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-md mb-4 text-xs">
                <p className="text-yellow-700">
                  <span className="font-medium">Note:</span> Extension is subject to bike availability. If another customer has booked this bike after your current booking ends, your extension request may be rejected.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowExtendModal(false)}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendBooking}
                disabled={isExtending}
                className="px-4 py-2 bg-blue-600 text-sm text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isExtending ? "Processing..." : "Confirm Extension"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Early Return Modal - Mobile optimized */}
      {showEarlyReturnModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Return Early</h3>
                <button 
                  onClick={() => setShowEarlyReturnModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-4 bg-blue-50 p-3 rounded-md text-sm">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-blue-700">
                  Original return time: {new Date(booking.endTime).toLocaleString()}
                </span>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Return Time
                </label>
                <div className="relative">
                  <DatePicker
                    selected={earlyReturnDate}
                    onChange={setEarlyReturnDate}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    minDate={new Date(booking.startTime)}
                    maxDate={new Date(Math.min(Date.now(), booking.endTime - 1000 * 60))} // Either now or just before end time, whichever is earlier
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Show price calculation */}
              <div className="bg-green-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-green-700 mb-2">Return Details</h4>
                <div className="text-sm">
                  <p className="flex justify-between mb-1">
                    <span>Original Duration:</span>
                    <span>{Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60))} hours</span>
                  </p>
                  <p className="flex justify-between mb-1">
                    <span>Actual Duration:</span>
                    <span>{Math.max(1, Math.ceil((earlyReturnDate.getTime() - booking.startTime) / (1000 * 60 * 60)))} hours</span>
                  </p>
                  
                  {/* Calculate potential refund amount */}
                  {(() => {
                    const originalHours = Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60));
                    const actualHours = Math.max(1, Math.ceil((earlyReturnDate.getTime() - booking.startTime) / (1000 * 60 * 60)));
                    const hourlyRate = booking.totalPrice / originalHours;
                    const adjustedPrice = actualHours * hourlyRate;
                    const refundAmount = Math.max(0, booking.totalPrice - adjustedPrice);
                    
                    return (
                      <p className="flex justify-between font-medium border-t border-green-200 pt-2 mt-2">
                        <span>Potential Refund:</span>
                        <span>₹{refundAmount.toFixed(2)}</span>
                      </p>
                    );
                  })()}
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-md mb-4 text-xs">
                <p className="text-yellow-700">
                  <span className="font-medium">Note:</span> Early returns may be eligible for partial refunds based on the actual usage time. Minimum charges may apply.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowEarlyReturnModal(false)}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEarlyReturn}
                disabled={isReturningEarly}
                className="px-4 py-2 bg-green-600 text-sm text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isReturningEarly ? "Processing..." : "Confirm Early Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}