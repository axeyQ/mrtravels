"use client";
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Image from 'next/image';

export default function BikeDetailPage({ bikeId }) {
  const router = useRouter();
  const { user } = useUser();
  const bike = useQuery(api.bikes.getBikeById, { bikeId });
  const isLoading = bike === undefined;
  
  // Get current time and calculate time limit (30 minutes from now)
  const currentTime = new Date();
  const timeLimit = new Date(currentTime.getTime() + 30 * 60 * 1000);
  
  const [startDate, setStartDate] = useState(currentTime);
  const [endDate, setEndDate] = useState(new Date(currentTime.getTime() + 2 * 60 * 60 * 1000));
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  
  // Get availability information for the selected time period
  const availabilityInfo = useQuery(
    api.bookings.checkBikeAvailability,
    {
      bikeId,
      startTime: startDate?.getTime() || Date.now(),
      endTime: endDate?.getTime() || Date.now() + 2 * 60 * 60 * 1000
    }
  );
  
  // Check availability when date changes
  useEffect(() => {
    setIsCheckingAvailability(true);
    // Availability will be automatically refetched when startDate or endDate changes
    setTimeout(() => setIsCheckingAvailability(false), 500); // brief delay for UX
  }, [startDate, endDate]);
  
  const createBooking = useMutation(api.bookings.createBooking);
  
  // Validate if selected start time is within 30 minutes from now
  const isStartTimeValid = () => {
    return startDate >= currentTime && startDate <= timeLimit;
  };
  
  const handleBooking = async () => {
    if (!user) {
      toast.error("Please sign in to book a bike");
      router.push('/sign-in');
      return;
    }
    
    if (!bike.isAvailable) {
      toast.error("This vehicle is not available for booking");
      return;
    }
    
    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }
    
    setIsBookingLoading(true);
    
    try {
      // Check if the bike is available for the selected time period
      if (availabilityInfo && !availabilityInfo.isAvailable) {
        toast.error(availabilityInfo.reason || "This vehicle is already booked for the selected time period");
        setIsBookingLoading(false);
        return;
      }
      
      // Calculate hours and price
      const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const totalPrice = hours * bike.pricePerHour;
      
      // IMPORTANT: These should ONLY be the fields that are defined in your schema
      // Do NOT include createdAt or any other fields not in your schema
      const bookingData = {
        bikeId,
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        userPhone: user.primaryPhoneNumber?.phoneNumber || "Not provided",
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        totalPrice,
        status: "pending"
      };
      
      // Call the createBooking mutation
      await createBooking(bookingData);
      
      toast.success("Booking created successfully!");
      router.push('/bookings');
      
    } catch (error) {
      toast.error(`Booking failed: ${error.message || "Unknown error"}`);
      console.error("Booking error:", error);
      setIsBookingLoading(false);
    }
  };
  
  if (isLoading) {
    return <BikeDetailSkeleton />;
  }
  
  // Calculate estimated price
  const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  const estimatedPrice = hours * bike.pricePerHour;
  
  // Determine if the bike is available based on admin settings and bookings
  const isReallyAvailable = bike.isAvailable && (availabilityInfo?.isAvailable !== false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg overflow-hidden relative h-80"
        >
          <Image
            src={bike.imageUrl || '/placeholder-bike.jpg'}
            alt={bike.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Availability tag */}
          {!bike.isAvailable && (
            <div className="absolute top-4 left-0 bg-red-600 text-white px-4 py-1 rounded-r-full font-medium">
              Currently Unavailable
            </div>
          )}
          {/* Booking status tag */}
          {bike.isAvailable && !isReallyAvailable && (
            <div className="absolute top-4 left-0 bg-orange-600 text-white px-4 py-1 rounded-r-full font-medium">
              Booked for Selected Time
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">{bike.name}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
              {bike.type}
            </span>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium 
              ${isReallyAvailable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {isReallyAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600">{bike.description || "No description available"}</p>
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900">Features</h2>
            {bike.features && bike.features.length > 0 ? (
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {bike.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-500">No features available</p>
            )}
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900">Booking</h2>
            {bike.isAvailable ? (
              <div className="mt-2">
                {/* New booking information box */}
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <h3 className="font-medium text-blue-800">Booking Information</h3>
                  <p className="text-blue-700 mt-1">
                    Pay only ₹42 deposit now. Remaining balance will be paid after return.
                  </p>
                  <p className="text-blue-700 mt-1">
                    <strong>Note:</strong> You can only book for start times within the next 30 minutes.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                      minDate={new Date()}
                      maxDate={timeLimit}
                      placeholderText="Select a time within 30 minutes"
                    />
                    {!isStartTimeValid() && (
                      <p className="mt-1 text-xs text-red-600">
                        Start time must be within the next 30 minutes
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                      minDate={startDate}
                    />
                  </div>
                </div>
                
                {/* Availability indicator */}
                {isCheckingAvailability ? (
  <div className="bg-blue-50 p-3 rounded-md mb-4 animate-pulse">
    <p className="text-blue-800">Checking availability...</p>
  </div>
) : !isReallyAvailable ? (
  <div className="bg-red-50 p-3 rounded-md mb-4">
    <p className="text-red-800 font-medium">
      {!bike.isAvailable 
        ? "This bike is not available for booking."
        : availabilityInfo?.reason || "This bike is already booked for the selected time period"}
    </p>
  </div>
) : (
  <div className="bg-green-50 p-3 rounded-md mb-4">
    <p className="text-green-800 font-medium">
      This bike is available for booking during the selected time period!
    </p>
  </div>
)}
                
                {/* Updated price breakdown with deposit highlight */}
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per hour:</span>
                    <span className="font-medium">₹{bike.pricePerHour}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{hours} hours</span>
                  </div>
                  <div className="flex justify-between mt-1 text-lg font-semibold">
                    <span>Estimated total:</span>
                    <span className="text-primary">₹{estimatedPrice}</span>
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-800 font-medium">Deposit to pay now:</span>
                    <span className="text-green-600 font-bold">₹42</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">To pay after return:</span>
                    <span className="font-medium">₹{Math.max(0, estimatedPrice - 40)}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    * ₹40 from deposit goes to bike owner, ₹2 is platform fee
                  </div>
                </div>
                
                <button
                  onClick={handleBooking}
                  disabled={isBookingLoading || !isReallyAvailable || !isStartTimeValid()}
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${isReallyAvailable && isStartTimeValid()
                      ? 'bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                      : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  {isBookingLoading 
                    ? "Processing..." 
                    : isReallyAvailable && isStartTimeValid()
                      ? "Book & Pay ₹42 Deposit" 
                      : "Unavailable"}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-red-600">This vehicle is currently not available for booking.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function BikeDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-lg overflow-hidden bg-gray-200 animate-pulse h-80"></div>
        <div>
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
          <div className="flex space-x-2 mb-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
            <div className="grid grid-cols-2 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-24 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}