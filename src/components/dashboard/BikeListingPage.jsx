"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import BikeGrid from '@/components/ui/BikeGrid';
import BikeFilterBar from '@/components/ui/BikeFilterBar';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function BikeListingPage() {
  const [filters, setFilters] = useState({});
  
  // Fetch bikes based on filters
  const bikes = useQuery(api.bikes.getFilteredBikes, filters) || [];
  const isLoading = bikes === undefined;
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Book a Bike</h1>
        <p className="mt-2 text-gray-600">Browse our collection and find your perfect ride</p>
      </motion.div>
      
      <BikeFilterBar onFilterChange={handleFilterChange} />
      
      <BikeGrid bikes={bikes} isLoading={isLoading} />
    </div>
  );
}