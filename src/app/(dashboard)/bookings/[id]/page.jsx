// src/app/(dashboard)/bookings/[id]/page.jsx
"use client";
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, CreditCard, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import ReceiptModal from '@/components/ui/ReceiptModal';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Fetch booking details - always call this hook
  const booking = useQuery(api.bookings.getBookingById, { 
    bookingId: id,
    userId: isUserLoaded ? user?.id : undefined 
  });
  
  // IMPORTANT: Always call useQuery, but with a skipQuery flag when not needed
  // This ensures hooks are called in the same order every time
  const bike = useQuery(
    api.bikes.getBikeById, 
    booking && booking.bikeId ? { bikeId: booking.bikeId } : "skip"
  );
  
  // Loading state
  if (!isUserLoaded || booking === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Booking not found
  if (booking === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 mb-4">The booking you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <Link 
            href="/bookings" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }
  
  // Format booking dates
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  
  // Calculate booking duration in hours
  const durationHours = Math.round((endDate - startDate) / (1000 * 60 * 60) * 10) / 10;
  
  // Determine booking status badge color
  const getStatusBadgeClass = () => {
    switch (booking.status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Determine payment status badge color
  const getPaymentStatusBadgeClass = () => {
    if (!booking.paymentStatus) return 'bg-yellow-100 text-yellow-800';
    
    switch (booking.paymentStatus) {
      case 'fully_paid': return 'bg-green-100 text-green-800';
      case 'deposit_paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Format payment status for display
  const getPaymentStatusText = () => {
    if (!booking.paymentStatus) return 'Payment Pending';
    
    switch (booking.paymentStatus) {
      case 'fully_paid': return 'Fully Paid';
      case 'deposit_paid': return 'Deposit Paid';
      default: return 'Payment Pending';
    }
  };
  const calculateBalanceDue = (booking) => {
    const platformFee = 2; // From config
    const depositToOwner = (booking.depositAmount || 0) - platformFee;
    return booking.totalPrice - depositToOwner;
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/bookings" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Link>
          <h1 className="text-2xl font-bold mt-2">Booking Details</h1>
          <p className="text-gray-600">Booking ID: {booking._id}</p>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Status Bar */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass()}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadgeClass()}`}>
                {getPaymentStatusText()}
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              {booking.createdAt ? format(new Date(booking.createdAt), 'PP') : 'Unknown date'}
            </div>
          </div>
          
          {/* Bike Info */}
          {bike && (
            <div className="p-6 flex flex-col md:flex-row border-b">
              <div className="relative h-40 md:h-auto md:w-48 flex-shrink-0 mb-4 md:mb-0 rounded-md overflow-hidden bg-gray-100">
                {bike.imageUrl ? (
                  <Image 
                    src={bike.imageUrl} 
                    alt={bike.name} 
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 200px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="md:ml-6 flex-1">
                <h2 className="text-xl font-bold">{bike.name}</h2>
                <div className="flex flex-wrap items-center mt-2">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium mr-2 mb-2">
                    {bike.type}
                  </span>
                  {bike.registrationNumber && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium mb-2">
                      Reg: {bike.registrationNumber}
                    </span>
                  )}
                </div>
                
                {bike.description && (
                  <div className="mt-2 text-gray-600">
                    <p className="text-sm">{bike.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Booking Info */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Booking Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time & Date */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm font-medium">Booking Period</div>
                    <div className="text-gray-600 text-xs">
                      {format(startDate, 'PPP')}
                      {startDate.toDateString() !== endDate.toDateString() && 
                        ` - ${format(endDate, 'PPP')}`
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm font-medium">Time</div>
                    <div className="text-gray-600 text-xs">
                      {format(startDate, 'p')} - {format(endDate, 'p')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm font-medium">Duration</div>
                    <div className="text-gray-600 text-xs">
                      {durationHours} hours
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm font-medium">Total Price</div>
                    <div className="text-gray-600 text-xs">₹{booking.totalPrice}</div>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm font-medium">Deposit Paid</div>
                    <div className="text-gray-600 text-xs">₹{booking.depositAmount || 0}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm font-medium">Balance Due</div>
                    <div className="text-gray-600 text-xs">
                    ₹{calculateBalanceDue(booking)}
                    </div>
                  </div>
                </div>
                
                {booking.paymentReferenceId && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Payment Reference:</span> {booking.paymentReferenceId}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              {(booking.paymentStatus === 'deposit_paid' || booking.paymentStatus === 'fully_paid') && (
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  View Receipt
                </button>
              )}
              
              <Link
                href="/bookings"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          booking={booking}
          bikeInfo={bike}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}