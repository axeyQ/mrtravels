// src/components/dashboard/BookingPage.jsx  
"use client";  
import { useState, useEffect } from 'react';  
import { useQuery, useMutation } from 'convex/react';  
import { api } from '../../../convex/_generated/api';  
import { useUser } from '@clerk/nextjs';  
import { useRouter, useSearchParams } from 'next/navigation';  
import { motion } from 'framer-motion';  
import { toast } from 'react-toastify';  
import Link from 'next/link';  
import Image from 'next/image';
import BookingActions from './BookingActions';  
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';  
import { Calendar, Clock, ChevronDown, ChevronUp, Check, X, MoreHorizontal, Bike } from 'lucide-react';

export default function BookingsPage() {  
  const router = useRouter();  
  const { user, isLoaded } = useUser();  
  const searchParams = useSearchParams();  
  const status = searchParams.get('status');  
   
  // State for refreshing booking data  
  const [refreshTrigger, setRefreshTrigger] = useState(0);  
  const [expandedBooking, setExpandedBooking] = useState(null);  
   
  // Fetch bookings with refresh capability  
  const bookings = useQuery(  
    api.bookings.getUserBookings,  
    isLoaded && user ? { userId: user.id } : null,  
    { refreshTrigger }  
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
      // Refresh bookings after cancellation  
      setRefreshTrigger(prev => prev + 1);  
    } catch (error) {  
      toast.error("Failed to cancel booking");  
      console.error(error);  
    }  
  };  
   
  // Refresh bookings data after actions  
  const handleActionComplete = () => {  
    setRefreshTrigger(prev => prev + 1);  
  };

  // Toggle expanded booking card  
  const toggleBookingExpand = (bookingId) => {  
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);  
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

  // Format date for mobile display  
  const formatDate = (timestamp) => {  
    const date = new Date(timestamp);  
    return {  
      date: date.toLocaleDateString(),  
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })  
    };  
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
    <div className="container mx-auto px-4 py-6">  
      <motion.div  
        initial={{ opacity: 0, y: -20 }}  
        animate={{ opacity: 1, y: 0 }}  
        className="mb-6"  
      >  
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bookings</h1>  
        <p className="mt-2 text-gray-600">Manage your bike reservations</p>  
      </motion.div>

      {/* Mobile-optimized tabs */}  
      <Tabs defaultValue="active" className="w-full">  
        <TabsList className="grid w-full grid-cols-2 mb-4">  
          <TabsTrigger value="active" className="text-sm">  
            Active Bookings {activeBookings.length > 0 && `(${activeBookings.length})`}  
          </TabsTrigger>  
          <TabsTrigger value="past" className="text-sm">  
            Past Bookings {pastBookings.length > 0 && `(${pastBookings.length})`}  
          </TabsTrigger>  
        </TabsList>  
         
        <TabsContent value="active">  
          {activeBookings.length === 0 ? (  
            <div className="text-center py-8 bg-gray-50 rounded-lg">  
              <div className="inline-flex rounded-full bg-gray-100 p-3 mb-3">  
                <Calendar className="h-6 w-6 text-gray-500" />  
              </div>  
              <p className="text-gray-600 font-medium">You don&apos;t have any active bookings</p>  
              <Link  
                href="/bikes"  
                className="mt-4 inline-block text-sm text-primary font-medium">  
                Browse bikes to book  
              </Link>  
            </div>  
          ) : (  
            <div className="space-y-4">  
              {activeBookings.map((booking) => {  
                const bike = bikesMap[booking.bikeId];  
                if (!bike) return null;  
                const paymentStatus = getPaymentStatusInfo(booking);  
                 
                // Check if booking is in progress or upcoming  
                const currentTime = new Date();  
                const startTime = new Date(booking.startTime);  
                const endTime = new Date(booking.endTime);  
                const bookingInProgress = currentTime >= startTime && currentTime < endTime;  
                const bookingUpcoming = currentTime < startTime;  
                 
                // Format dates for display  
                const start = formatDate(booking.startTime);  
                const end = formatDate(booking.endTime);  
                 
                return (  
                  <motion.div  
                    key={booking._id}  
                    initial={{ opacity: 0, y: 10 }}  
                    animate={{ opacity: 1, y: 0 }}  
                    className="bg-white rounded-lg shadow-md overflow-hidden"  
                  >  
                    <div className="p-4">  
                      {/* Bike & Booking Status Header */}  
                      <div className="flex justify-between items-start mb-2">  
                        <div className="flex items-center">  
                          <div className="h-12 w-12 bg-gray-200 rounded-md overflow-hidden mr-3 relative">  
                            <Image
                              src={bike.imageUrl || '/placeholder-bike.jpg'}  
                              alt={bike.name}  
                              fill
                              className="object-cover"  
                            />  
                          </div>  
                          <div>  
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{bike.name}</h3>  
                            <p className="text-xs text-gray-500">{bike.type}</p>  
                          </div>  
                        </div>  
                        <div className="flex flex-col items-end">  
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${  
                            booking.status === "confirmed" ? "bg-blue-50 text-blue-700" :  
                            booking.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-700"  
                          }`}>  
                            {booking.status}  
                          </span>  
                          {bookingInProgress && (  
                            <span className="mt-1 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">  
                              In Progress  
                            </span>  
                          )}  
                          {bookingUpcoming && (  
                            <span className="mt-1 inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">  
                              Upcoming  
                            </span>  
                          )}  
                        </div>  
                      </div>  
                       
                      {/* Booking time and price summary */}  
                      <div className="flex justify-between items-center text-xs mt-3">  
                        <div className="flex items-center text-gray-500">  
                          <Clock className="h-3 w-3 mr-1" />  
                          <span>  
                            {start.date}, {start.time} - {end.time}  
                          </span>  
                        </div>  
                        <div className="font-semibold">  
                          ₹{booking.adjustedPrice || booking.totalPrice}  
                        </div>  
                      </div>  
                       
                      {/* Payment status */}  
                      <div className="flex justify-between mt-2">  
                        <span className={`text-xs ${paymentStatus.className} px-2 py-1 rounded-md`}>  
                          {paymentStatus.label}  
                        </span>  
                        <button  
                          onClick={() => toggleBookingExpand(booking._id)}  
                          className="text-xs text-primary flex items-center"  
                        >  
                          {expandedBooking === booking._id ? (  
                            <>Less details <ChevronUp className="h-3 w-3 ml-1" /></>  
                          ) : (  
                            <>More details <ChevronDown className="h-3 w-3 ml-1" /></>  
                          )}  
                        </button>  
                      </div>  
                       
                      {/* Expanded details */}  
                      {expandedBooking === booking._id && (  
                        <div className="mt-4 pt-3 border-t text-xs">  
                          {/* Booking details */}  
                          <div className="bg-gray-50 p-3 rounded-md mb-3">  
                            <h4 className="font-medium text-gray-700 mb-2">Booking Details</h4>  
                            <div className="space-y-1">  
                              <div className="flex justify-between">  
                                <span className="text-gray-500">Start:</span>  
                                <span>{new Date(booking.startTime).toLocaleString()}</span>  
                              </div>  
                              <div className="flex justify-between">  
                                <span className="text-gray-500">End:</span>  
                                <span>{new Date(booking.endTime).toLocaleString()}</span>  
                              </div>  
                              {booking.actualEndTime && (  
                                <div className="flex justify-between text-green-600">  
                                  <span>Returned Early:</span>  
                                  <span>{new Date(booking.actualEndTime).toLocaleString()}</span>  
                                </div>  
                              )}  
                              {booking.extended && (  
                                <div className="flex justify-between text-blue-600">  
                                  <span>Extended:</span>  
                                  <span>+{booking.extensionHours} hours</span>  
                                </div>  
                              )}  
                            </div>  
                          </div>  
                           
                          {/* Payment details */}  
                          <div className="bg-gray-50 p-3 rounded-md mb-3">  
                            <h4 className="font-medium text-gray-700 mb-2">Payment Details</h4>  
                            <div className="space-y-1">  
                              <div className="flex justify-between">  
                                <span className="text-gray-500">Total:</span>  
                                <span>₹{booking.adjustedPrice || booking.totalPrice}</span>  
                              </div>  
                              {booking.depositAmount ? (  
                                <div className="flex justify-between text-green-600">  
                                  <span>Deposit Paid:</span>  
                                  <span>₹{booking.depositAmount}</span>  
                                </div>  
                              ) : (  
                                <div className="flex justify-between text-yellow-600">  
                                  <span>Deposit Required:</span>  
                                  <span>₹42</span>  
                                </div>  
                              )}  
                              {booking.remainingAmount > 0 && (  
                                <div className="flex justify-between">  
                                  <span className="text-gray-500">Due on Return:</span>  
                                  <span>₹{booking.remainingAmount}</span>  
                                </div>  
                              )}  
                              {booking.refundAmount > 0 && (  
                                <div className="flex justify-between text-green-600 font-medium">  
                                  <span>Refund Amount:</span>  
                                  <span>₹{booking.refundAmount}</span>  
                                </div>  
                              )}  
                            </div>  
                          </div>  
                           
                          {/* Action buttons */}  
                          <div className="flex flex-wrap gap-2 mt-3">  
                            <Link  
                              href={`/bikes/${booking.bikeId}`}  
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"  
                            >  
                              <Bike className="h-3 w-3 mr-1" />  
                              View Bike  
                            </Link>  
                             
                            {/* Cancel booking button - show if pending */}  
                            {booking.status === 'pending' && (  
                              <button  
                                onClick={() => handleCancelBooking(booking._id)}  
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"  
                              >  
                                <X className="h-3 w-3 mr-1" />  
                                Cancel Booking  
                              </button>  
                            )}  
                             
                            {/* Pay deposit button - show if payment required */}  
                            {paymentStatus.showPayButton && (  
                              <Link  
                                href={`/payment-simulation?booking_id=${booking._id}`}  
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"  
                              >  
                                Pay ₹42 Deposit  
                              </Link>  
                            )}  
                          </div>  
                           
                          {/* BookingActions component for showing extension/early return options */}  
                          {booking.status === 'confirmed' && (  
                            <div className="mt-3">  
                              <BookingActions  
                                booking={booking}  
                                onActionComplete={handleActionComplete}  
                              />  
                            </div>  
                          )}  
                        </div>  
                      )}  
                    </div>  
                  </motion.div>  
                );  
              })}  
            </div>  
          )}  
        </TabsContent>  
         
        <TabsContent value="past">  
          {pastBookings.length === 0 ? (  
            <div className="text-center py-8 bg-gray-50 rounded-lg">  
              <div className="inline-flex rounded-full bg-gray-100 p-3 mb-3">  
                <Calendar className="h-6 w-6 text-gray-500" />  
              </div>  
              <p className="text-gray-600 font-medium">No past bookings found</p>  
            </div>  
          ) : (  
            <div className="space-y-3">  
              {pastBookings.map((booking) => {  
                const bike = bikesMap[booking.bikeId];  
                if (!bike) return null;  
                 
                // Format dates for display  
                const start = formatDate(booking.startTime);  
                 
                return (  
                  <motion.div  
                    key={booking._id}  
                    initial={{ opacity: 0, y: 10 }}  
                    animate={{ opacity: 1, y: 0 }}  
                    className="bg-white rounded-lg shadow border border-gray-200 p-3"  
                  >  
                    <div className="flex justify-between items-start">  
                      <div className="flex items-center">  
                        <div className="h-10 w-10 bg-gray-200 rounded-md overflow-hidden mr-2 relative">  
                          <Image  
                            src={bike.imageUrl || '/placeholder-bike.jpg'}  
                            alt={bike.name}  
                            fill
                            className="object-cover"  
                          />  
                        </div>  
                        <div>  
                          <h3 className="text-sm font-medium text-gray-900">{bike.name}</h3>  
                          <p className="text-xs text-gray-500">{start.date}</p>  
                        </div>  
                      </div>  
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${  
                        booking.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"  
                      }`}>  
                        {booking.status}  
                      </span>  
                    </div>  
                     
                    {/* Special status badges */}  
                    <div className="mt-2 flex flex-wrap gap-1">  
                      {booking.earlyReturn && (  
                        <span className="inline-flex items-center text-xs rounded-md bg-green-50 px-2 py-1 font-medium text-green-700">  
                          Returned Early  
                        </span>  
                      )}  
                      {booking.extended && (  
                        <span className="inline-flex items-center text-xs rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">  
                          Extended  
                        </span>  
                      )}  
                      {booking.paymentStatus === 'fully_paid' && (  
                        <span className="inline-flex items-center text-xs rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">  
                          Fully Paid  
                        </span>  
                      )}  
                    </div>  
                     
                    {/* Basic info and view details button */}  
                    <div className="mt-2 flex items-center justify-between">  
                      <p className="text-xs font-medium">₹{booking.adjustedPrice || booking.totalPrice}</p>  
                      <button  
                        onClick={() => toggleBookingExpand(booking._id)}  
                        className="text-xs text-primary flex items-center"  
                      >  
                        {expandedBooking === booking._id ? (  
                          <>Hide details <ChevronUp className="h-3 w-3 ml-1" /></>  
                        ) : (  
                          <>View details <ChevronDown className="h-3 w-3 ml-1" /></>  
                        )}  
                      </button>  
                    </div>  
                     
                    {/* Expanded details */}  
                    {expandedBooking === booking._id && (  
                      <div className="mt-3 pt-2 border-t text-xs">  
                        <div className="space-y-1">  
                          <div className="flex justify-between">  
                            <span className="text-gray-500">Period:</span>  
                            <span>  
                              {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}  
                            </span>  
                          </div>  
                          {booking.actualEndTime && (  
                            <div className="flex justify-between text-green-600">  
                              <span>Returned:</span>  
                              <span>{new Date(booking.actualEndTime).toLocaleString()}</span>  
                            </div>  
                          )}  
                          {booking.refundAmount > 0 && (  
                            <div className="flex justify-between text-green-600">  
                              <span>Refunded:</span>  
                              <span>₹{booking.refundAmount}</span>  
                            </div>  
                          )}  
                        </div>  
                         
                        <Link  
                          href={`/bikes/${booking.bikeId}`}  
                          className="mt-3 inline-flex items-center text-primary text-xs"  
                        >  
                          <Bike className="h-3 w-3 mr-1" />  
                          View Bike  
                        </Link>  
                      </div>  
                    )}  
                  </motion.div>  
                );  
              })}  
            </div>  
          )}  
        </TabsContent>  
      </Tabs>  
    </div>  
  );  
}

// Skeleton loading state component  
function BookingsSkeleton() {  
  return (  
    <div className="container mx-auto px-4 py-6">  
      <div className="mb-6">  
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3 mb-2"></div>  
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>  
      </div>  
       
      <div className="grid grid-cols-2 gap-4 mb-6">  
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>  
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>  
      </div>  
       
      {[...Array(3)].map((_, i) => (  
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden mb-4 p-4">  
          <div className="flex justify-between items-center mb-4">  
            <div className="flex items-center">  
              <div className="h-12 w-12 bg-gray-200 rounded-md animate-pulse"></div>  
              <div className="ml-3">  
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>  
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>  
              </div>  
            </div>  
            <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>  
          </div>  
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>  
          <div className="flex justify-between">  
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>  
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>  
          </div>  
        </div>  
      ))}  
    </div>  
  );  
}