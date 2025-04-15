// src/components/dashboard/BookingCard.jsx
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { formatDistanceToNow, format } from 'date-fns';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, AlertCircle, ChevronDown, CreditCard, Receipt } from 'lucide-react';
import ReceiptModal from '../ui/ReceiptModal';

// Payment status badge component
const PaymentStatusBadge = ({ status }) => {
  let bgColor, textColor, icon, text;
  
  switch (status) {
    case 'deposit_paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      text = 'Deposit Paid';
      icon = <CreditCard className="h-3 w-3 mr-1" />;
      break;
    case 'fully_paid':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      text = 'Fully Paid';
      icon = <CreditCard className="h-3 w-3 mr-1" />;
      break;
    case 'pending':
    default:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      text = 'Payment Pending';
      icon = <AlertCircle className="h-3 w-3 mr-1" />;
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {text}
    </span>
  );
};

export default function BookingCard({ booking, bikeDetails }) {
  const [expanded, setExpanded] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const router = useRouter();
  
  const cancelBooking = useMutation(api.bookings.cancelBooking);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const isActive = booking.status === 'confirmed';
  const isPending = booking.status === 'pending';
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';
  
  const timeRemaining = startDate > new Date() 
    ? formatDistanceToNow(startDate, { addSuffix: true })
    : '';
  
  const canBeCancelled = isPending || (isActive && new Date() < startDate);
  
  const handleCancelBooking = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setIsCancelling(true);
      try {
        await cancelBooking({ bookingId: booking._id });
        toast.success("Booking cancelled successfully");
      } catch (error) {
        toast.error("Failed to cancel booking");
        console.error("Error cancelling booking:", error);
      } finally {
        setIsCancelling(false);
      }
    }
  };
  
  const handleViewDetails = () => {
    router.push(`/bookings/${booking._id}`);
  };
  
  const handleViewReceipt = () => {
    setShowReceiptModal(true);
  };
  
  const getStatusColor = () => {
    if (isCancelled) return 'bg-red-500';
    if (isCompleted) return 'bg-blue-500';
    if (isActive) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const calculateBalanceDue = (booking) => {
    const platformFee = 2; // Should come from config
    const depositToOwner = (booking.depositAmount || 0) - platformFee;
    return booking.totalPrice - depositToOwner;
  };
  
  return (
    <>
      <motion.div 
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Status indicator */}
        <div className={`h-1.5 w-full ${getStatusColor()}`}></div>
        
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">{bikeDetails?.name || 'Unknown Vehicle'}</span>
                {bikeDetails?.registrationNumber && (
                  <span className="ml-2 text-xs text-gray-500">#{bikeDetails.registrationNumber}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {format(startDate, 'dd MMM yyyy')}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-2 py-1 rounded-full text-xs font-medium 
                ${isCancelled ? 'bg-red-100 text-red-800' : 
                  isCompleted ? 'bg-blue-100 text-blue-800' : 
                  isActive ? 'bg-green-100 text-green-800' : 
                  'bg-yellow-100 text-yellow-800'}`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500 mt-1">#{booking._id.substring(0, 8)}</span>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex items-center mb-3">
            <div className="relative h-14 w-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 mr-3">
              {bikeDetails?.imageUrl ? (
                <Image 
                  src={bikeDetails.imageUrl} 
                  alt={bikeDetails.name || 'Bike'} 
                  fill 
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Clock className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                <span className="text-xs text-gray-600">
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                <span className="text-xs text-gray-600">
                  {format(startDate, 'dd MMM')} 
                  {startDate.toDateString() !== endDate.toDateString() && 
                    ` - ${format(endDate, 'dd MMM')}`}
                </span>
              </div>
              
              {booking.paymentStatus && (
                <div className="mt-2">
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-sm font-semibold text-primary">₹{booking.totalPrice}</div>
              {(booking.depositAmount && booking.depositAmount > 0) && (
                <div className="text-xs text-gray-500 mt-0.5">
                  Deposit: ₹{booking.depositAmount}
                </div>
              )}
            </div>
          </div>
          
          {/* Time Remaining for Upcoming Bookings */}
          {timeRemaining && !isCancelled && (
            <div className="bg-blue-50 px-3 py-2 rounded-md mb-3 flex items-center">
              <Clock className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-xs text-blue-700">Booking starts {timeRemaining}</span>
            </div>
          )}
          
          {/* Payment Reference ID if available */}
          {booking.paymentReferenceId && (
            <div className="px-3 py-2 bg-gray-50 rounded-md text-xs text-gray-600 mb-3">
              <strong>Payment Reference:</strong> {booking.paymentReferenceId}
            </div>
          )}
          
          {/* Expandable Section */}
          <div className="mt-2">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600 hover:bg-gray-100"
            >
              <span>{expanded ? 'Hide Details' : 'View Details'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            
            {expanded && (
              <div className="mt-3 space-y-3 px-3 py-3 bg-gray-50 rounded-md">
                {/* Detailed information */}
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Start Time:</span>
                    <span className="font-medium">{format(startDate, 'dd MMM yyyy, h:mm a')}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">End Time:</span>
                    <span className="font-medium">{format(endDate, 'dd MMM yyyy, h:mm a')}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Total Price:</span>
                    <span className="font-medium">₹{booking.totalPrice}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Deposit Paid:</span>
                    <span className="font-medium">₹{booking.depositAmount || 0}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Balance Due:</span>
                    <span className="font-medium">₹{calculateBalanceDue(booking)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleViewDetails}
              className="flex-1 py-2 px-3 bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary text-sm font-medium rounded-md"
            >
              View Details
            </button>
            
            {/* Show Cancel button for eligible bookings */}
            {canBeCancelled ? (
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 py-2 px-3 bg-red-500 bg-opacity-10 hover:bg-opacity-20 text-red-500 text-sm font-medium rounded-md disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            ) : (
              /* Show Receipt button for bookings with payments */
              (booking.paymentStatus && booking.paymentStatus !== 'pending') && (
                <button
                  onClick={handleViewReceipt}
                  className="flex-1 py-2 px-3 bg-green-500 bg-opacity-10 hover:bg-opacity-20 text-green-600 text-sm font-medium rounded-md flex items-center justify-center"
                >
                  <Receipt className="h-4 w-4 mr-1" />
                  View Receipt
                </button>
              )
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Receipt Modal */}
      <ReceiptModal 
        booking={booking}
        bikeInfo={bikeDetails}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </>
  );
}