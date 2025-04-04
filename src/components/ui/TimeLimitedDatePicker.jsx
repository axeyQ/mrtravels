// Updated src/components/ui/TimeLimitedDatePicker.jsx
"use client";
import { useState, useEffect } from 'react';
import { Label } from '../ui/label';

// This is a custom component for time selection within the next 30 minutes
export default function TimeLimitedDatePicker({
  selectedDate,
  onChange,
  label,
  className = "",
  error = null
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);

  // Update current time and available times every minute
  useEffect(() => {
    // Initialize available times
    updateAvailableTimes();

    const interval = setInterval(() => {
      const newCurrentTime = new Date();
      setCurrentTime(newCurrentTime);
      updateAvailableTimes(newCurrentTime);
    }, 60000); // update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Update the list of available times (current time to 30 minutes from now in 5-minute intervals)
  const updateAvailableTimes = (nowTime = new Date()) => {
    const times = [];
    const timeLimit = new Date(nowTime.getTime() + 30 * 60 * 1000);
    
    // Round up to the nearest 5 minutes for start time
    let time = new Date(nowTime);
    time.setMinutes(Math.ceil(time.getMinutes() / 5) * 5);
    time.setSeconds(0);
    time.setMilliseconds(0);
    
    // Generate available times in 5-minute intervals
    while (time <= timeLimit) {
      times.push(new Date(time));
      time = new Date(time.getTime() + 5 * 60 * 1000); // Add 5 minutes
    }
    
    setAvailableTimes(times);
  };

  // Format time as HH:MM AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle time selection
  const handleTimeSelect = (time) => {
    onChange(time);
  };

  return (
    <div className="w-full">
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Label>
      
      <div className="border rounded-md shadow-sm p-2 bg-white">
        <p className="text-sm text-gray-600 mb-2">Today&apos;s Date: {currentTime.toLocaleDateString()}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {availableTimes.map((time, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleTimeSelect(time)}
              className={`text-sm py-2 px-2 rounded-md ${
                selectedDate && time.getTime() === selectedDate.getTime()
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {formatTime(time)}
            </button>
          ))}
        </div>
        
        {availableTimes.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No available times within the next 30 minutes
          </p>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        You can only book for start times within the next 30 minutes
      </p>
    </div>
  );
}