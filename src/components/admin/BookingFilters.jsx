"use client";
import { useState } from "react";
import { X, Filter, Search, Calendar, ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function BookingFilters({ 
  filters, 
  setFilters, 
  bikes = [], 
  clearFilters,
  applyFilters 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  
  const handleChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleApply = () => {
    applyFilters(localFilters);
    setIsExpanded(false);
  };
  
  const handleClear = () => {
    setLocalFilters({
      status: "",
      dateFrom: null,
      dateTo: null,
      customerName: "",
      bikeId: "",
    });
    clearFilters();
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Header - always visible */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer border-b" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-800">Filter Bookings</h3>
          
          {/* Show applied filter count */}
          {Object.values(filters).filter(val => val !== "" && val !== null).length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
              {Object.values(filters).filter(val => val !== "" && val !== null).length}
            </span>
          )}
        </div>
        
        <ChevronDown 
          className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {/* Expanded filter section */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </Label>
              <select
                id="status"
                value={localFilters.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Date Range Filters */}
            <div>
              <Label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </Label>
              <DatePicker
                id="dateFrom"
                selected={localFilters.dateFrom}
                onChange={(date) => handleChange("dateFrom", date)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholderText="Start date"
                isClearable
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </Label>
              <DatePicker
                id="dateTo"
                selected={localFilters.dateTo}
                onChange={(date) => handleChange("dateTo", date)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholderText="End date"
                isClearable
                minDate={localFilters.dateFrom}
              />
            </div>
            
            {/* Customer name filter */}
            <div>
              <Label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </Label>
              <div className="relative">
                <Input
                  id="customerName"
                  type="text"
                  value={localFilters.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Search by name"
                  className="pl-8"
                />
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            {/* Bike filter - only if bikes array is provided */}
            {bikes.length > 0 && (
              <div>
                <Label htmlFor="bikeId" className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle
                </Label>
                <select
                  id="bikeId"
                  value={localFilters.bikeId}
                  onChange={(e) => handleChange("bikeId", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="">All Vehicles</option>
                  {bikes.map((bike) => (
                    <option key={bike._id} value={bike._id}>
                      {bike.name} ({bike.registrationNumber || bike.type})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Filter actions */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
            
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Apply Filters
            </button>
          </div>
          
          {/* Applied filters */}
          {Object.values(filters).some(val => val !== "" && val !== null) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Applied Filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {filters.status}
                    <X 
                      className="h-3 w-3 ml-1.5 cursor-pointer" 
                      onClick={() => {
                        const newFilters = {...filters, status: ""};
                        applyFilters(newFilters);
                        setLocalFilters(newFilters);
                      }}
                    />
                  </span>
                )}
                
                {filters.dateFrom && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    From: {filters.dateFrom.toLocaleDateString()}
                    <X 
                      className="h-3 w-3 ml-1.5 cursor-pointer" 
                      onClick={() => {
                        const newFilters = {...filters, dateFrom: null};
                        applyFilters(newFilters);
                        setLocalFilters(newFilters);
                      }}
                    />
                  </span>
                )}
                
                {filters.dateTo && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    To: {filters.dateTo.toLocaleDateString()}
                    <X 
                      className="h-3 w-3 ml-1.5 cursor-pointer" 
                      onClick={() => {
                        const newFilters = {...filters, dateTo: null};
                        applyFilters(newFilters);
                        setLocalFilters(newFilters);
                      }}
                    />
                  </span>
                )}
                
                {filters.customerName && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Customer: {filters.customerName}
                    <X 
                      className="h-3 w-3 ml-1.5 cursor-pointer" 
                      onClick={() => {
                        const newFilters = {...filters, customerName: ""};
                        applyFilters(newFilters);
                        setLocalFilters(newFilters);
                      }}
                    />
                  </span>
                )}
                
                {filters.bikeId && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Vehicle: {bikes.find(b => b._id === filters.bikeId)?.name || "Unknown"}
                    <X 
                      className="h-3 w-3 ml-1.5 cursor-pointer" 
                      onClick={() => {
                        const newFilters = {...filters, bikeId: ""};
                        applyFilters(newFilters);
                        setLocalFilters(newFilters);
                      }}
                    />
                  </span>
                )}
                
                {Object.values(filters).some(val => val !== "" && val !== null) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    Clear All
                    <X className="h-3 w-3 ml-1.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}