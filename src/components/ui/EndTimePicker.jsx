// src/components/ui/EndTimePicker.jsx
"use client";
import { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { calculateDuration } from '@/lib/PricingCalculator';

export default function EndTimePicker({
  selectedDate,
  onChange,
  startTime,
  label,
  className = "",
  error = null
}) {
  const [availableTimes, setAvailableTimes] = useState([]);
  
  // Update available times when start time changes
  useEffect(() => {
    if (!startTime) return;
    updateAvailableTimes(startTime);
  }, [startTime]);
  
  // Generate available end times from startTime up to 10:00 PM
  const updateAvailableTimes = (startTime) => {
    const times = [];
    
    // Create a date object for today at 10:00 PM (maximum end time)
    const maxEndTime = new Date(startTime);
    maxEndTime.setHours(22, 0, 0, 0);
    
    // If start time is already past 10:00 PM, no available end times
    if (startTime >= maxEndTime) {
      setAvailableTimes([]);
      return;
    }
    
    // Start 30 minutes after the start time (minimum rental duration)
    let time = new Date(startTime.getTime() + 30 * 60 * 1000);
    
    // For more precise time selections, use 15-minute intervals
    time.setMinutes(Math.ceil(time.getMinutes() / 15) * 15); // Round to next 15-minute interval
    time.setSeconds(0);
    time.setMilliseconds(0);
    
    // Generate times in 15-minute intervals until 10:00 PM
    while (time <= maxEndTime) {
      times.push(new Date(time));
      time = new Date(time.getTime() + 15 * 60 * 1000); // Add 15 minutes
    }
    
    setAvailableTimes(times);
  };
  
  // Format time as HH:MM AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format duration using our precise calculator
  const formatDuration = (endTime) => {
    if (!startTime || !endTime) return '';
    
    const duration = calculateDuration(startTime, endTime);
    
    if (duration.hours === 0) {
      return `${duration.minutes} min`;
    } else if (duration.minutes === 0) {
      return `${duration.hours} hr`;
    } else {
      return `${duration.hours}h ${duration.minutes}m`;
    }
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
        {startTime ? (
          <>
            {availableTimes.length > 0 ? (
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
                    <span className="text-xs block mt-1 opacity-75">
                      {formatDuration(time)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No available end times (store closes at 10:00 PM)
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Please select a start time first
          </p>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        Booking end time can be no later than 10:00 PM
      </p>
    </div>
  );
}