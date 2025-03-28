// Update your src/components/dashboard/BookingPage.jsx

"use client";
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function BookingsPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  
  const bookings = useQuery(api.bookings.getUserBookings,
    isLoaded && user ? { userId: user.id } : null
  ) || [];
  
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  const isLoading = bookings === undefined || bikes === undefined;
  
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);
  
  // Show status notification
  useEffect(() => {
    if (status === 'success') {
      toast.success('Your booking was confirmed! The deposit payment was successful.');
    } else if (status === 'failed') {
      toast.error('Payment failed. Please try booking again.');
    }
  }, [status]);
  
  const handleCancelBooking = async (bookingId) => {
    try {
      await updateBookingStatus({
        bookingId,
        status: "cancelled",
        userId: user.id
      });
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    }
  };
  
  // Get payment status label and style
  const getPaymentStatusInfo = (booking) => {
    if (!booking.paymentStatus) {
      return {
        label: "Payment Required",
        className: "bg-yellow-50 text-yellow-800",
        showPayButton: true
      };
    }
    
    switch (booking.paymentStatus) {
      case 'pending':
        return {
          label: "Payment Required",
          className: "bg-yellow-50 text-yellow-800",
          showPayButton: true
        };
      case 'deposit_paid':
        return {
          label: "Deposit Paid",
          className: "bg-green-50 text-green-800",
          showPayButton: false
        };
      case 'fully_paid':
        return {
          label: "Fully Paid",
          className: "bg-blue-50 text-blue-800",
          showPayButton: false
        };
      case 'payment_failed':
        return {
          label: "Payment Failed",
          className: "bg-red-50 text-red-800",
          showPayButton: true
        };
      default:
        return {
          label: "Unknown Status",
          className: "bg-gray-50 text-gray-800",
          showPayButton: false
        };
    }
  };
  
  if (!isLoaded) {
    return <BookingsSkeleton />;
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your bookings</h1>
        <Link
          href="/sign-in"
          className="inline-block bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-600"
        >
          Sign In
        </Link>
      </div>
    );
  }
  
  if (isLoading) {
    return <BookingsSkeleton />;
  }
  
  // Create a map of bike data for quick lookup
  const bikesMap = bikes.reduce((acc, bike) => {
    acc[bike._id] = bike;
    return acc;
  }, {});
  
  // Group bookings by status
  const activeBookings = bookings.filter(booking =>
    booking.status !== "cancelled" && booking.status !== "completed"
  );
  
  const pastBookings = bookings.filter(booking =>
    booking.status === "cancelled" || booking.status === "completed"
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-gray-600">Manage your bike reservations</p>
      </motion.div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Bookings</h2>
        {activeBookings.length === 0 ? (
          <p className="text-gray-600">You don&apos;t have any active bookings.</p>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((booking) => {
              const bike = bikesMap[booking.bikeId];
              if (!bike) return null;
              
              const paymentStatus = getPaymentStatusInfo(booking);
              
              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                      <div className="sm:flex sm:items-center">
                        <div className="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-md overflow-hidden">
                          <img
                            src={bike.imageUrl || '/placeholder-bike.jpg'}
                            alt={bike.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{bike.name}</h3>
                          <p className="text-sm text-gray-500">{bike.type}</p>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex flex-col items-end">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 mb-2">
                          {booking.status}
                        </span>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${paymentStatus.className}`}>
                          {paymentStatus.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Booking Period</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Payment Details</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          Total: ₹{booking.totalPrice}
                        </p>
                        {booking.depositAmount ? (
                          <p className="text-sm text-green-600">
                            Deposit Paid: ₹{booking.depositAmount}
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-600">
                            Deposit Required: ₹42
                          </p>
                        )}
                        {booking.remainingAmount > 0 && (
                          <p className="text-sm text-gray-600">
                            Due on Return: ₹{booking.remainingAmount}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2 justify-end">
                      <Link
                        href={`/bikes/${booking.bikeId}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        View Bike
                      </Link>
                      
                      {/* Cancel booking button - show if not yet confirmed */}
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel Booking
                        </button>
                      )}
                      
                      {/* Pay deposit button - show if payment required */}
                      {paymentStatus.showPayButton && (
                        <Link
                          href={`/payment-simulation?bookingId=${booking._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Pay ₹42 Deposit
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Past Bookings section remains the same */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Bookings</h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => {
              const bike = bikesMap[booking.bikeId];
              if (!bike) return null;
              
              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="p-4 sm:p-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                      <div className="sm:flex sm:items-center">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                          <img
                            src={bike.imageUrl || '/placeholder-bike.jpg'}
                            alt={bike.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4">
                          <h3 className="text-md font-medium text-gray-900">{bike.name}</h3>
                          <p className="text-sm text-gray-500">{bike.type}</p>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium 
                          ${booking.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {booking.status}
                        </span>
                        {booking.paymentStatus === 'fully_paid' && (
                          <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            Fully Paid
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      {new Date(booking.startTime).toLocaleDateString()} - ₹{booking.totalPrice}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton loading state component
function BookingsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/4"></div>
      </div>
      <div className="mb-8">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/6 mb-4"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-20 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="ml-4">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}