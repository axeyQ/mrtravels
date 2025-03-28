"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function BikeFilterBar({ onFilterChange, onTimeRangeChange }) {
  const [type, setType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  // Time range selection
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setHours(new Date().getHours() + 2)));
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Apply filters
    onFilterChange({
      type: type || undefined,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] || undefined,
      isAvailable: showAvailableOnly || undefined,
    });
    
    // If time selection is shown, also update the time range
    if (showTimeSelection && onTimeRangeChange) {
      onTimeRangeChange({
        startTime: startDate.getTime(),
        endTime: endDate.getTime()
      });
    }
  };
  
  const handleReset = () => {
    setType("");
    setPriceRange([0, 100]);
    setShowAvailableOnly(false);
    setStartDate(new Date());
    setEndDate(new Date(new Date().setHours(new Date().getHours() + 2)));
    setShowTimeSelection(false);
    
    onFilterChange({});
    
    if (onTimeRangeChange) {
      onTimeRangeChange(null);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg shadow-md mb-6"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
          
          <div className="flex items-center">
            <input
              id="showTimeSelection"
              type="checkbox"
              checked={showTimeSelection}
              onChange={(e) => setShowTimeSelection(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="showTimeSelection" className="ml-2 block text-sm text-gray-900">
              Filter by specific time
            </label>
          </div>
        </div>
        
        {showTimeSelection && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                minDate={new Date()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                minDate={startDate}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className="flex-1 md:flex-none md:w-32 bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 md:flex-none md:w-32 bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </div>
      </form>
    </motion.div>
  );
}