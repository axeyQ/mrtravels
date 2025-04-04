// src/app/(admin-dashboard)/admin/analytics/page.jsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { 
  BiCar, 
  BiCalendarCheck, 
  BiUserCheck, 
  BiMoney,
  BiChevronDown,
  BiChevronUp
} from "react-icons/bi";

// A simple responsive stat card component
function StatCard({ title, value, description, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// A collapsible section component for mobile
function CollapsibleSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden md:shadow-none md:bg-transparent md:mb-0">
      <div 
        className="p-4 flex justify-between items-center border-b border-gray-200 md:hidden cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <div>
          {isOpen ? <BiChevronUp /> : <BiChevronDown />}
        </div>
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'} md:block p-4 md:p-0`}>
        {children}
      </div>
    </div>
  );
}

// Simple responsive chart component
function SimpleBarChart({ data, title }) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  
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
  
  const isLoading = !isUserLoaded || bikes === undefined || bookings === undefined || users === undefined;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between">
                <div className="w-1/2">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalBikes = bikes.length;
  const availableBikes = bikes.filter(bike => bike.isAvailable).length;
  const totalUsers = users.length;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(booking => booking.status === "completed").length;
  const pendingBookings = bookings.filter(booking => booking.status === "pending").length;
  const activeBookings = bookings.filter(booking => booking.status === "confirmed").length;
  
  // Calculate total revenue
  const totalRevenue = bookings
    .filter(booking => booking.status === "completed")
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  // Create data for bike type distribution chart
  const bikeTypes = bikes.reduce((acc, bike) => {
    const type = bike.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  const bikeTypeData = Object.entries(bikeTypes).map(([label, value]) => ({ label, value }));
  
  // Create data for booking status distribution chart
  const bookingStatusData = [
    { label: "Pending", value: pendingBookings },
    { label: "Active", value: activeBookings },
    { label: "Completed", value: completedBookings },
    { label: "Cancelled", value: bookings.filter(booking => booking.status === "cancelled").length }
  ];
  
  // Create data for monthly revenue chart (simplified)
  // In a real app, you'd calculate this from your bookings data
  const monthlyRevenueData = [
    { label: "Jan", value: 2500 },
    { label: "Feb", value: 3200 },
    { label: "Mar", value: 4100 },
    { label: "Apr", value: 3800 },
    { label: "May", value: 5000 },
    { label: "Jun", value: 4200 }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 md:block hidden">Analytics Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Bikes"
          value={totalBikes}
          description={`${availableBikes} Available`}
          icon={<BiCar className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Bookings"
          value={totalBookings}
          description={`${activeBookings} Active`}
          icon={<BiCalendarCheck className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard 
          title="Total Users"
          value={totalUsers}
          description={`${users.filter(u => u.profileComplete).length} Verified`}
          icon={<BiUserCheck className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard 
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          description={`From ${completedBookings} completed bookings`}
          icon={<BiMoney className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>
      
      {/* Charts Section */}
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
        {/* Bike Distribution */}
        <CollapsibleSection title="Bike Distribution">
          <SimpleBarChart 
            data={bikeTypeData} 
            title="Bikes by Type"
          />
        </CollapsibleSection>
        
        {/* Booking Status */}
        <CollapsibleSection title="Booking Status">
          <SimpleBarChart 
            data={bookingStatusData} 
            title="Bookings by Status"
          />
        </CollapsibleSection>
      </div>
      
      {/* Monthly Revenue */}
      <div className="mt-4 md:mt-6">
        <CollapsibleSection title="Revenue Trends">
          <SimpleBarChart 
            data={monthlyRevenueData} 
            title="Monthly Revenue (₹)"
          />
        </CollapsibleSection>
      </div>
    </div>
  );
}