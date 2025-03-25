"use client";

import { useState } from 'react';
import BikeCard from './BikeCard';
import { motion } from 'framer-motion';

export default function BikeGrid({ bikes, isLoading }) {
  if (isLoading) {
    return <BikesGridSkeleton />;
  }
  
  if (bikes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10"
      >
        <h3 className="text-lg font-medium text-gray-900">No bikes available</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
      </motion.div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {bikes.map((bike) => (
        <BikeCard key={bike._id} bike={bike} />
      ))}
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