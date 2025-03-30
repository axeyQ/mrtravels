"use client";
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// This is a custom component for the DatePicker that only allows selecting times within next 30 minutes
export default function TimeLimitedDatePicker({ 
  selectedDate, 
  onChange,
  label,
  className = "",
  error = null
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timeLimit = new Date(currentTime.getTime() + 30 * 60 * 1000);
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Custom time filtering function
  const filterTime = (time) => {
    const currentTimeMs = currentTime.getTime();
    const timeMs = time.getTime();
    const timeLimitMs = timeLimit.getTime();
    
    // Check if the time is within the next 30 minutes window
    return timeMs >= currentTimeMs && timeMs <= timeLimitMs;
  };
  
  // Generate time intervals - we'll create 5-minute intervals for smoother selection
  const getTimeIntervals = () => {
    const intervals = [];
    const start = new Date(currentTime);
    const end = new Date(timeLimit);
    
    // Round current time to the nearest 5 minutes
    start.setMinutes(Math.ceil(start.getMinutes() / 5) * 5);
    start.setSeconds(0);
    start.setMilliseconds(0);
    
    // Create 5-minute intervals
    let current = new Date(start);
    while (current <= end) {
      intervals.push(new Date(current));
      current = new Date(current.getTime() + 5 * 60 * 1000); // add 5 minutes
    }
    
    return intervals;
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        showTimeSelect
        timeIntervals={5}
        filterTime={filterTime}
        includeTimes={getTimeIntervals()}
        dateFormat="MMMM d, yyyy h:mm aa"
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm ${className}`}
        minDate={currentTime}
        maxDate={timeLimit}
        placeholderText="Select a time within 30 minutes"
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        You can only book for start times within the next 30 minutes
      </p>
    </div>
  );
}