// src/components/ui/EndTimePicker.jsx
"use client";
import { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { calculateDuration } from '@/lib/PricingCalculator';
import { Clock, Calendar } from 'lucide-react';

export default function EndTimePicker({
  selectedDate,
  onChange,
  startTime,
  label,
  className = "",
  error = null
}) {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [showTimes, setShowTimes] = useState(false);
  
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
    setShowTimes(false);
  };
  
  // Format date as Month Day, Year
  const formatDate = (date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="w-full mb-2">
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Label>
      
      {/* Current selection display */}
      <div 
        onClick={() => startTime && setShowTimes(!showTimes)}
        className={`border rounded-md shadow-sm p-3 bg-white flex justify-between items-center ${startTime ? 'cursor-pointer' : 'opacity-75'}`}
      >
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            {selectedDate ? (
              <span>
                {formatTime(selectedDate)}
                <span className="text-xs text-gray-500 ml-1">
                  ({formatDuration(selectedDate)})
                </span>
              </span>
            ) : (
              startTime ? "Select end time" : "Please select start time first"
            )}
          </span>
        </div>
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>
      
      {/* Time picker dropdown */}
      {showTimes && startTime && (
        <div className="border rounded-md shadow-sm mt-1 bg-white max-h-60 overflow-y-auto">
          <div className="p-2 border-b bg-gray-50">
            <p className="text-xs text-gray-500">
              Booking end time can be no later than 10:00 PM
            </p>
          </div>
          
          {availableTimes.length > 0 ? (
            <div className="grid grid-cols-1 p-1">
              {availableTimes.map((time, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`text-left py-2 px-3 my-1 rounded-md ${
                    selectedDate && time.getTime() === selectedDate.getTime()
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{formatTime(time)}</span>
                    <span className={`text-xs ${selectedDate && time.getTime() === selectedDate.getTime() ? 'text-white' : 'text-gray-500'}`}>
                      {formatDuration(time)}
                    </span>
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {formatDate(time)}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No available end times (store closes at 10:00 PM)
            </p>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}