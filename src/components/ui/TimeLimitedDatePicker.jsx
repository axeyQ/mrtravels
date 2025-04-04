// src/components/ui/TimeLimitedDatePicker.jsx
"use client";
import { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Clock, Calendar } from 'lucide-react';

export default function TimeLimitedDatePicker({
  selectedDate,
  onChange,
  label,
  className = "",
  error = null
}) {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [showTimes, setShowTimes] = useState(false);
  
  // Generate time options when component mounts
  useEffect(() => {
    generateTimeOptions();
  }, []);
  
  // Generate available times within the next 30 minutes
  const generateTimeOptions = () => {
    const times = [];
    const now = new Date();
    
    // The time limit is 30 minutes from now
    const timeLimit = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Start from current time, rounded to the next 5 minutes
    let time = new Date(now);
    time.setMinutes(Math.ceil(time.getMinutes() / 5) * 5);
    time.setSeconds(0);
    time.setMilliseconds(0);
    
    // Generate times in 5-minute intervals up to the time limit
    while (time <= timeLimit) {
      times.push(new Date(time));
      time = new Date(time.getTime() + 5 * 60 * 1000);
    }
    
    setAvailableTimes(times);
  };
  
  // Format time as HH:MM AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date as Month Day, Year
  const formatDate = (date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Handle time selection
  const handleTimeSelect = (time) => {
    onChange(time);
    setShowTimes(false);
  };
  
  return (
    <div className="w-full mb-2">
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Label>
      
      {/* Current selection display - clickable to show time options */}
      <div 
        onClick={() => setShowTimes(!showTimes)}
        className="border rounded-md shadow-sm p-3 bg-white flex justify-between items-center cursor-pointer"
      >
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            {selectedDate ? (
              <span>
                {formatTime(selectedDate)} - {formatDate(selectedDate)}
              </span>
            ) : (
              "Select time"
            )}
          </span>
        </div>
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>
      
      {/* Time picker dropdown */}
      {showTimes && (
        <div className="border rounded-md shadow-sm mt-1 bg-white max-h-60 overflow-y-auto">
          <div className="p-2 border-b bg-gray-50">
            <p className="text-xs text-gray-500">
              Note: You can only book for start times within the next 30 minutes
            </p>
          </div>
          
          {availableTimes.length > 0 ? (
            <div className="p-1">
              {availableTimes.map((time, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md my-1 ${
                    selectedDate && time.getTime() === selectedDate.getTime()
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="font-medium">{formatTime(time)}</span>
                  <span className="text-xs block text-opacity-75 mt-1">
                    {formatDate(time)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No available times in the next 30 minutes
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