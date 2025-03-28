"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function AdminAnalytics() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [timeRange, setTimeRange] = useState("month"); // "week", "month", "year"
  
  // Fetch data for analytics
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  const bookings = useQuery(
    api.bookings.getAllBookings,
    isUserLoaded && user ? { adminId: user.id } : null
  ) || [];
  const users = useQuery(
    api.users.listUsers,
    isUserLoaded && user ? { adminId: user.id } : null
  ) || [];
  
  const isLoading = bikes === undefined || bookings === undefined || users === undefined;
  
  if (isLoading) {
    return <div>Loading analytics data...</div>;
  }
  
  // Helper function to filter bookings by time range
  const filterBookingsByTimeRange = (bookings) => {
    const now = new Date();
    const startDate = new Date();
    
    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    return bookings.filter(booking => new Date(booking.startTime) >= startDate);
  };
  
  // Filter bookings by selected time range
  const filteredBookings = filterBookingsByTimeRange(bookings);
  
  // Calculate total revenue
  const totalRevenue = filteredBookings
    .filter(booking => booking.status === "completed" || booking.status === "confirmed")
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  // Calculate bookings per bike
  const bookingsPerBike = bikes.map(bike => {
    const bikeBookings = filteredBookings.filter(booking => booking.bikeId === bike._id);
    return {
      bikeId: bike._id,
      bikeName: bike.registrationNumber,
      bikeType: bike.type,
      bookingsCount: bikeBookings.length,
      revenue: bikeBookings
        .filter(booking => booking.status === "completed" || booking.status === "confirmed")
        .reduce((sum, booking) => sum + booking.totalPrice, 0),
    };
  }).sort((a, b) => b.bookingsCount - a.bookingsCount);
  
  // Calculate bookings by status
  const bookingsByStatus = {
    pending: filteredBookings.filter(b => b.status === "pending").length,
    confirmed: filteredBookings.filter(b => b.status === "confirmed").length,
    completed: filteredBookings.filter(b => b.status === "completed").length,
    cancelled: filteredBookings.filter(b => b.status === "cancelled").length,
  };
  
  // Calculate new users in time range
  const newUsers = users.filter(user => new Date(user.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm text-gray-500 uppercase">Total Bookings</h2>
          <p className="text-3xl font-bold mt-2">{filteredBookings.length}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
              {timeRange === "week" ? "7 Days" : timeRange === "month" ? "30 Days" : "12 Months"}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm text-gray-500 uppercase">Revenue</h2>
          <p className="text-3xl font-bold mt-2">₹{totalRevenue.toFixed(2)}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
              {timeRange === "week" ? "7 Days" : timeRange === "month" ? "30 Days" : "12 Months"}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm text-gray-500 uppercase">Completion Rate</h2>
          <p className="text-3xl font-bold mt-2">
            {filteredBookings.length === 0 
              ? "0" 
              : Math.round((bookingsByStatus.completed / filteredBookings.length) * 100)}%
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              Completed / Total
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm text-gray-500 uppercase">New Users</h2>
          <p className="text-3xl font-bold mt-2">{newUsers}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
              Last 30 Days
            </span>
          </div>
        </div>
      </div>
      
      {/* Top Bikes */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Top Performing Bikes</h2>
        </div>
        <div className="p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bike
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookingsPerBike.slice(0, 5).map((bike) => (
                <tr key={bike.bikeId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bike.bikeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{bike.bikeType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bike.bookingsCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{bike.revenue.toFixed(2)}</div>
                  </td>
                </tr>
              ))}
              {bookingsPerBike.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No booking data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Booking Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Booking Status Breakdown</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-700 text-sm font-medium uppercase">Pending</div>
              <div className="text-2xl font-bold text-yellow-800 mt-2">{bookingsByStatus.pending}</div>
              <div className="text-yellow-600 text-sm mt-1">
                {filteredBookings.length === 0 
                  ? "0" 
                  : Math.round((bookingsByStatus.pending / filteredBookings.length) * 100)}%
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-700 text-sm font-medium uppercase">Confirmed</div>
              <div className="text-2xl font-bold text-blue-800 mt-2">{bookingsByStatus.confirmed}</div>
              <div className="text-blue-600 text-sm mt-1">
                {filteredBookings.length === 0 
                  ? "0" 
                  : Math.round((bookingsByStatus.confirmed / filteredBookings.length) * 100)}%
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-700 text-sm font-medium uppercase">Completed</div>
              <div className="text-2xl font-bold text-green-800 mt-2">{bookingsByStatus.completed}</div>
              <div className="text-green-600 text-sm mt-1">
                {filteredBookings.length === 0 
                  ? "0" 
                  : Math.round((bookingsByStatus.completed / filteredBookings.length) * 100)}%
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-700 text-sm font-medium uppercase">Cancelled</div>
              <div className="text-2xl font-bold text-red-800 mt-2">{bookingsByStatus.cancelled}</div>
              <div className="text-red-600 text-sm mt-1">
                {filteredBookings.length === 0 
                  ? "0" 
                  : Math.round((bookingsByStatus.cancelled / filteredBookings.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}