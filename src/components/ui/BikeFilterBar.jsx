"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BikeFilterBar({ onFilterChange }) {
  const [type, setType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      type: type || undefined,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] || undefined,
      isAvailable: showAvailableOnly || undefined,
    });
  };
  
  const handleReset = () => {
    setType("");
    setPriceRange([0, 100]);
    setShowAvailableOnly(false);
    onFilterChange({});
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg shadow-md mb-6"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="Bike">Bike</option>
              <option value="Moped">Moped</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
              Price Range (₹/hr): ₹{priceRange[0]} - ₹{priceRange[1]}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                id="minPrice"
                min="0"
                max="100"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                id="maxPrice"
                min="0"
                max="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="available"
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
              Show Available Only
            </label>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="flex-1 bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}