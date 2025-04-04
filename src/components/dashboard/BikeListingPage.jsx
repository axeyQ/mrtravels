// src/components/dashboard/BikeListingPage.jsx  
"use client";  
import { useState } from 'react';  
import { useQuery } from 'convex/react';  
import { api } from '../../../convex/_generated/api';  
import BikeGrid from '@/components/ui/BikeGrid';  
import { motion } from 'framer-motion';

export default function BikeListingPage() {  
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  // Fetch all available bikes - no filters
  const bikes = useQuery(api.bikes.getFilteredBikes, {  
    isAvailable: true  
  }) || [];  
   
  const isLoading = bikes === undefined;

  return (  
    <div className="container mx-auto px-4 py-8">  
      <motion.div  
        initial={{ opacity: 0, y: -20 }}  
        animate={{ opacity: 1, y: 0 }}  
        className="mb-8"  
      >  
        <h1 className="text-3xl font-bold text-gray-900">Book a Bike</h1>  
        <p className="mt-2 text-gray-600">  
          Browse our collection and find your perfect ride  
        </p>  
      </motion.div>

      <BikeGrid  
        bikes={bikes}  
        isLoading={isLoading}  
        selectedTimeRange={selectedTimeRange}  
      />  
    </div>  
  );  
}