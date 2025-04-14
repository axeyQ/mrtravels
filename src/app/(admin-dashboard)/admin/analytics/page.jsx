"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Calendar, DollarSign, Users, TrendingUp, Activity,
  BarChart2, PieChart as PieChartIcon, Clock, RefreshCw, Download
} from 'lucide-react';

// Custom colors for charts
const COLORS = ['#1E88E5', '#43A047', '#FB8C00', '#E53935', '#5E35B1', '#00ACC1', '#F4511E', '#8E24AA'];
const DATA_COLORS = {
  primary: '#3B82F6',       // blue-500
  secondary: '#10B981',     // emerald-500  
  tertiary: '#8B5CF6',      // violet-500
  quaternary: '#F97316',    // orange-500
  negative: '#EF4444',      // red-500
  positive: '#22C55E',      // green-500
  neutral: '#6B7280',       // gray-500
  highlight: '#FBBF24',     // amber-400
};

export default function AdminAnalytics() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    new Date()
  ]);
  const [startDate, endDate] = dateRange;
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Create stable query parameters to avoid dependency changes on every render
  const adminId = useMemo(() => isUserLoaded && user ? user.id : null, [isUserLoaded, user]);
  
  // Fetch data for analytics - fixed to use stable parameters
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  const bookings = useQuery(
    api.bookings.getAllBookings,
    adminId ? { adminId } : "skip"
  ) || [];
  const users = useQuery(
    api.users.listUsers,
    adminId ? { adminId } : "skip"
  ) || [];
  
  const isLoading = !isUserLoaded || bikes === undefined || bookings === undefined || users === undefined;

  // Filter bookings based on date range - fixed conditional hook issue
  const filteredBookings = useMemo(() => {
    // Always return an array, empty if needed
    if (!bookings.length) return [];
    
    const startTimestamp = startDate ? startDate.getTime() : 0;
    const endTimestamp = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Date.now();
    
    return bookings.filter(booking => 
      booking.startTime >= startTimestamp && booking.startTime <= endTimestamp
    );
  }, [bookings, startDate, endDate]); // Dependencies properly defined

  // Calculate summary statistics - moved inside useMemo to avoid recalculation
  const stats = useMemo(() => {
    // Default empty state
    if (isLoading) {
      return {
        totalBikes: 0,
        availableBikes: 0,
        bikesUtilizationRate: 0,
        totalBookings: 0,
        pendingBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalUsers: 0,
        verifiedUsers: 0,
        adminUsers: 0,
        totalRevenue: "0.00",
        avgBookingDuration: "0",
        avgBookingValue: "0"
      };
    }
    
    return {
      // Bike stats
      totalBikes: bikes.length,
      availableBikes: bikes.filter(bike => bike.isAvailable).length,
      bikesUtilizationRate: bikes.length ? ((bikes.length - bikes.filter(bike => bike.isAvailable).length) / bikes.length * 100).toFixed(0) : 0,
      
      // Booking stats
      totalBookings: filteredBookings.length,
      pendingBookings: filteredBookings.filter(b => b.status === "pending").length,
      activeBookings: filteredBookings.filter(b => b.status === "confirmed").length,
      completedBookings: filteredBookings.filter(b => b.status === "completed").length,
      cancelledBookings: filteredBookings.filter(b => b.status === "cancelled").length,
      
      // User stats
      totalUsers: users.length,
      verifiedUsers: users.filter(u => u.profileComplete).length,
      adminUsers: users.filter(u => u.role === "admin").length,
      
      // Financial stats
      totalRevenue: filteredBookings
        .filter(b => b.status === "completed")
        .reduce((sum, booking) => sum + booking.totalPrice, 0)
        .toFixed(2),
      
      // Average booking duration (in hours)
      avgBookingDuration: filteredBookings.length ? 
        (filteredBookings.reduce((sum, booking) => 
          sum + (booking.endTime - booking.startTime) / (1000 * 60 * 60), 0) / filteredBookings.length).toFixed(1) 
        : 0,
      
      // Average booking value
      avgBookingValue: filteredBookings.length ? 
        (filteredBookings.reduce((sum, booking) => sum + booking.totalPrice, 0) / filteredBookings.length).toFixed(0) 
        : 0,
    };
  }, [bikes, filteredBookings, users, isLoading]);

  // ----- CHART DATA PREPARATIONS -----

  // 1. Revenue by day
  const revenueByDay = useMemo(() => {
    // Return empty array when there's no data to avoid errors
    if (!filteredBookings.length) return [];
    
    const dailyRevenue = {};
    
    // Initialize all days in the range
    let currentDate = new Date(startDate);
    const endDateTime = endDate ? endDate.getTime() : Date.now();
    
    while (currentDate.getTime() <= endDateTime) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyRevenue[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add revenue data
    filteredBookings.forEach(booking => {
      if (booking.status === "completed") {
        const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
        if (dailyRevenue[bookingDate] !== undefined) {
          dailyRevenue[bookingDate] += booking.totalPrice;
        }
      }
    });
    
    // Convert to array format for Recharts
    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue
    }));
  }, [filteredBookings, startDate, endDate]);
  
  // 2. Bookings by status
  const bookingsByStatus = useMemo(() => [
    { name: 'Pending', value: stats.pendingBookings, color: DATA_COLORS.highlight },
    { name: 'Active', value: stats.activeBookings, color: DATA_COLORS.primary },
    { name: 'Completed', value: stats.completedBookings, color: DATA_COLORS.positive },
    { name: 'Cancelled', value: stats.cancelledBookings, color: DATA_COLORS.negative },
  ], [stats.pendingBookings, stats.activeBookings, stats.completedBookings, stats.cancelledBookings]);

  // 3. Bike utilization
  const bikeUtilization = useMemo(() => [
    { name: 'In Use', value: stats.totalBikes - stats.availableBikes, color: DATA_COLORS.primary },
    { name: 'Available', value: stats.availableBikes, color: DATA_COLORS.secondary },
  ], [stats.totalBikes, stats.availableBikes]);

  // 4. Bike types distribution
  const bikesByType = useMemo(() => {
    // Return empty array when there's no data
    if (!bikes.length) return [];
    
    const typeCount = {};
    bikes.forEach(bike => {
      typeCount[bike.type] = (typeCount[bike.type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([type, count], index) => ({
      name: type,
      value: count,
      color: COLORS[index % COLORS.length]
    }));
  }, [bikes]);

  // 5. Most booked bikes
  const topBookedBikes = useMemo(() => {
    // Handle empty data case
    if (!filteredBookings.length || !bikes.length) return [];
    
    const bikeBookings = {};
    
    // Count bookings per bike
    filteredBookings.forEach(booking => {
      bikeBookings[booking.bikeId] = (bikeBookings[booking.bikeId] || 0) + 1;
    });
    
    // Convert to array and sort by booking count
    const result = Object.entries(bikeBookings)
      .map(([bikeId, count]) => {
        const bike = bikes.find(b => b._id === bikeId);
        return { 
          id: bikeId,
          name: bike ? bike.name : 'Unknown Bike',
          type: bike ? bike.type : 'Unknown',
          count 
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Get top 5
    
    return result;
  }, [filteredBookings, bikes]);

  // 6. User growth data (cumulative users over time)
  const userGrowth = useMemo(() => {
    // Handle empty data case
    if (!users.length) return [];
    
    // Sort users by join date
    const sortedUsers = [...users].sort((a, b) => a.createdAt - b.createdAt);
    
    const usersByMonth = {};
    let cumulativeUsers = 0;
    
    // Group by month
    sortedUsers.forEach(user => {
      const date = new Date(user.createdAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!usersByMonth[monthYear]) {
        usersByMonth[monthYear] = { month: monthYear, total: 0 };
      }
      
      usersByMonth[monthYear].total++;
    });
    
    // Convert to array and add cumulative count
    const monthlyData = Object.values(usersByMonth);
    for (let i = 0; i < monthlyData.length; i++) {
      cumulativeUsers += monthlyData[i].total;
      monthlyData[i].cumulative = cumulativeUsers;
      // Format the month for display
      const [year, month] = monthlyData[i].month.split('-');
      monthlyData[i].name = `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
    }
    
    return monthlyData;
  }, [users]);

  // 7. Booking duration distribution
  const bookingDurationData = useMemo(() => {
    // Handle empty data case
    if (!filteredBookings.length) return [];
    
    // Duration categories in hours
    const categories = {
      '0-3': { name: '0-3 hrs', count: 0 },
      '3-6': { name: '3-6 hrs', count: 0 },
      '6-12': { name: '6-12 hrs', count: 0 },
      '12-24': { name: '12-24 hrs', count: 0 },
      '24-48': { name: '1-2 days', count: 0 },
      '48+': { name: '2+ days', count: 0 }
    };
    
    filteredBookings.forEach(booking => {
      const durationHours = (booking.endTime - booking.startTime) / (1000 * 60 * 60);
      
      if (durationHours <= 3) categories['0-3'].count++;
      else if (durationHours <= 6) categories['3-6'].count++;
      else if (durationHours <= 12) categories['6-12'].count++;
      else if (durationHours <= 24) categories['12-24'].count++;
      else if (durationHours <= 48) categories['24-48'].count++;
      else categories['48+'].count++;
    });
    
    return Object.values(categories);
  }, [filteredBookings]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        
        {/* Date Range Picker */}
        <div className="bg-white p-2 rounded-lg shadow flex items-center self-stretch">
          <Calendar className="text-gray-500 mr-2 h-5 w-5" />
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            className="text-sm border-none focus:ring-0"
            dateFormat="MMM d, yyyy"
          />
          <button 
            onClick={() => setDateRange([
              new Date(new Date().setDate(new Date().getDate() - 30)),
              new Date()
            ])} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            title="Reset to last 30 days"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                Total Revenue
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-1">₹{stats.totalRevenue}</p>
              <div className="mt-1 text-xs flex items-center">
                <span className="text-gray-500">Avg. ₹{stats.avgBookingValue}/booking</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg bg-green-100 text-green-800`}>
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        {/* Bookings Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                Total Bookings
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalBookings}</p>
              <div className="mt-1 text-xs flex items-center">
                <span className="text-blue-600">{stats.activeBookings} Active</span>
                <span className="mx-1">•</span>
                <span className="text-green-600">{stats.completedBookings} Completed</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg bg-blue-100 text-blue-800`}>
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        {/* Users Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <Users className="h-4 w-4 mr-1 text-purple-500" />
                Total Users
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalUsers}</p>
              <div className="mt-1 text-xs flex items-center">
                <span className="text-purple-600">{stats.verifiedUsers} Verified</span>
                <span className="mx-1">•</span>
                <span className="text-gray-500">{stats.totalUsers ? Math.round(stats.verifiedUsers/stats.totalUsers*100) : 0}% Verified</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg bg-purple-100 text-purple-800`}>
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        {/* Bikes Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-orange-500" />
                Bike Utilization
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats.bikesUtilizationRate}%</p>
              <div className="mt-1 text-xs flex items-center">
                <span className="text-orange-600">{stats.totalBikes - stats.availableBikes} In Use</span>
                <span className="mx-1">•</span>
                <span className="text-gray-500">{stats.availableBikes} Available</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg bg-orange-100 text-orange-800`}>
              <BarChart2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Revenue Trend</h3>
            <button className="text-gray-500 hover:text-gray-700" title="Download CSV">
              <Download className="h-4 w-4" />
            </button>
          </div>
          {revenueByDay.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueByDay}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DATA_COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={DATA_COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      // Only show some of the labels if there are many days
                      return revenueByDay.length > 15 && revenueByDay.indexOf(value) % 3 !== 0 ? '' : value;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={DATA_COLORS.primary} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No revenue data available for the selected period</p>
            </div>
          )}
        </div>
        
        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Booking Status</h3>
          </div>
          {bookingsByStatus.some(item => item.value > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsByStatus.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {bookingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No booking data available for the selected period</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Charts Section - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Booked Vehicles */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Top Booked Vehicles</h3>
          </div>
          {topBookedBikes.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topBookedBikes}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} bookings`,
                      `${props.payload.type}`
                    ]} 
                  />
                  <Bar dataKey="count" fill={DATA_COLORS.primary} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No booking data available for the selected period</p>
            </div>
          )}
        </div>
        
        {/* Booking Duration Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Booking Duration</h3>
          </div>
          {bookingDurationData.length > 0 && bookingDurationData.some(item => item.count > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingDurationData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
                  <Bar dataKey="count" fill={DATA_COLORS.tertiary} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No duration data available for the selected period</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Charts Section - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Vehicle Types</h3>
          </div>
          {bikesByType.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bikesByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {bikesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} vehicles`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No vehicle type data available</p>
            </div>
          )}
        </div>
        
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">User Growth</h3>
          </div>
          {userGrowth.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userGrowth}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      return userGrowth.length > 6 && userGrowth.findIndex(item => item.name === value) % 2 !== 0 ? '' : value;
                    }}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} users`, 'Total Users']} />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke={DATA_COLORS.quaternary} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No user growth data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}