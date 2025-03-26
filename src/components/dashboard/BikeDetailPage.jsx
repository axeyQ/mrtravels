"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function BikeDetailPage({ bikeId }) {
  const router = useRouter();
  const { user } = useUser();
  const bike = useQuery(api.bikes.getBikeById, { bikeId });
  const isLoading = bike === undefined;
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setHours(new Date().getHours() + 2)));
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  
  const createBooking = useMutation(api.bookings.createBooking);
  
  const handleBooking  = async () => {
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
      // Check if bike is available in the selected time slot
      const isAvailable = await useQuery(api.bookings.checkBikeAvailability, {
        bikeId,
        startTime: startDate.getTime(),
        endTime: endDate.getTime()
      });
      
      if (!isAvailable) {
        toast.error("This vehicle is already booked for the selected time slot");
        setIsBookingLoading(false);
        return;
      }
      
      // Create booking
      await createBooking({
        bikeId,
        userId: user.id,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
      });
      
      toast.success("Booking created successfully!");
      router.push('/bookings');
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
      console.error(error);
    } finally {
      setIsBookingLoading(false);
    }
  };
  
  if (isLoading) {
    return <BikeDetailSkeleton />;
  }
  
  // Calculate estimated price
  const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  const estimatedPrice = hours * bike.pricePerHour;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg overflow-hidden"
        >
          <img
            src={bike.imageUrl || '/placeholder-bike.jpg'}
            alt={bike.name}
            className="w-full h-80 object-cover"
          />
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
            {bike.isAvailable ? (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700">
                Available
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700">
                Not Available
              </span>
            )}
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600">{bike.description}</p>
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900">Features</h2>
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
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900">Booking</h2>
            {bike.isAvailable ? (
              <div className="mt-2">
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
                    />
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
                </div>
                
                <button
                  onClick={handleBooking}
                  disabled={isBookingLoading || !bike.isAvailable}
                  className="w-full bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isBookingLoading ? "Processing..." : "Book Now"}
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