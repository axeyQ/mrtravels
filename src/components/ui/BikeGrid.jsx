// Modified src/components/ui/BikeGrid.jsx
"use client";
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import BikeCard from './BikeCard';
import { motion } from 'framer-motion';

export default function BikeGrid({ bikes, isLoading, selectedTimeRange }) {
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now() + 2 * 60 * 60 * 1000); // Default 2 hours

  // Update time range when selection changes
  useEffect(() => {
    if (selectedTimeRange) {
      setStartTime(selectedTimeRange.startTime);
      setEndTime(selectedTimeRange.endTime);
    }
  }, [selectedTimeRange]);

  // Get currently booked bikes for the selected time period
  const bookedBikeIds = useQuery(
    api.bookings.getCurrentlyBookedBikes,
    { startTime, endTime }
  ) || [];

  // Create a set of booked bike IDs for faster lookup
  const bookedBikesSet = new Set(bookedBikeIds);

  // Process bikes to include availability information and filter out unavailable ones
  const availableBikes = bikes
    .map(bike => {
      // A bike is only available if:
      // 1. It's marked as available by admin (bike.isAvailable = true)
      // 2. It's not booked for the selected time period (not in bookedBikesSet)
      const isReallyAvailable = bike.isAvailable && !bookedBikesSet.has(bike._id);
      return {
        ...bike,
        isBooked: bookedBikesSet.has(bike._id),
        isReallyAvailable
      };
    })
    // Filter out unavailable bikes
    .filter(bike => bike.isReallyAvailable);

  if (isLoading) {
    return <BikesGridSkeleton />;
  }

  if (availableBikes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10"
      >
        <h3 className="text-lg font-medium text-gray-900">No bikes available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your filters or check back later.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedTimeRange && (
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
          <p>
            Showing availability for: {new Date(startTime).toLocaleString()} to{' '}
            {new Date(endTime).toLocaleString()}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {availableBikes.map((bike) => (
          <BikeCard
            key={bike._id}
            bike={bike}
            isBooked={bike.isBooked}
            isReallyAvailable={bike.isReallyAvailable}
            selectedTimeRange={selectedTimeRange}
          />
        ))}
      </div>
    </div>
  );
}

function BikesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden bg-white shadow">
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}