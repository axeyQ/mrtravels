// src/components/ui/BikeGrid.jsx
"use client";
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/\_generated/api';
import BikeCard from './BikeCard';
import { motion } from 'framer-motion';
import { ChevronDown, Filter, SortDesc } from 'lucide-react';

export default function BikeGrid({ bikes, isLoading, selectedTimeRange }) {
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now() + 2 * 60 * 60 * 1000); // Default 2 hours
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('priceAsc');
  const [filterType, setFilterType] = useState('');

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
  const processedBikes = bikes
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

  // Apply type filter if selected
  const filteredBikes = filterType 
    ? processedBikes.filter(bike => bike.type === filterType) 
    : processedBikes;

  // Sort bikes based on selection
  const sortedBikes = [...filteredBikes].sort((a, b) => {
    switch (sortOption) {
      case 'priceAsc':
        return a.pricePerHour - b.pricePerHour;
      case 'priceDesc':
        return b.pricePerHour - a.pricePerHour;
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Get unique bike types for filter options
  const bikeTypes = [...new Set(processedBikes.map(bike => bike.type))];

  if (isLoading) {
    return <BikesGridSkeleton />;
  }

  if (sortedBikes.length === 0) {
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

      {/* Mobile filter and sort UI */}
      <div className="lg:hidden">
        <div className="flex justify-between mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white"
          >
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A to Z</option>
            <option value="nameDesc">Name: Z to A</option>
          </select>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="mb-4 p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Type:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('')}
                className={`px-3 py-1 text-xs rounded-full ${
                  filterType === '' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                All Types
              </button>
              {bikeTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    filterType === type 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bike Grid - adjusted for better mobile layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {sortedBikes.map((bike) => (
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden bg-white shadow">
          <div className="h-36 sm:h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
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