// src/app/(admin-dashboard)/admin/page.js
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import StoreStatusToggle from '@/components/admin/StoreStatusToggle';
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const { user, isLoaded: isUserLoaded } = useUser();
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
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle screen resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  const stats = {
    totalBikes: bikes.length,
    availableBikes: bikes.filter(b => b.isAvailable).length,
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === "admin").length,
    pendingBookings: bookings.filter(b => b.status === "pending").length,
    activeBookings: bookings.filter(b => b.status === "confirmed").length,
    completedBookings: bookings.filter(b => b.status === "completed").length,
    cancelledBookings: bookings.filter(b => b.status === "cancelled").length,
  };

  // Calculate total revenue
  const totalRevenue = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, booking) => sum + booking.totalPrice, 0)
    .toFixed(2);

  // Calculate upcoming revenue
  const upcomingRevenue = bookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, booking) => sum + booking.totalPrice, 0)
    .toFixed(2);

  // Sort bikes by popularity (number of bookings)
  const popularBikes = bikes
    .slice(0, 5)
    .sort((a, b) => {
      const aBookings = bookings.filter(booking => booking.bikeId === a._id).length;
      const bBookings = bookings.filter(booking => booking.bikeId === b._id).length;
      return bBookings - aBookings;
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Store Status Toggle */}
      <div className="mb-6">
        <StoreStatusToggle />
      </div>
      
      {/* Stats Grid - Responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Bikes Stats */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-2">Bikes</h2>
          <div className="flex justify-between">
            <div>
              <p className="text-2xl md:text-3xl font-bold">{stats.totalBikes}</p>
              <p className="text-sm text-gray-500">Total bikes</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-green-600">{stats.availableBikes}</p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/bikes" className="text-primary text-sm hover:underline">
              Manage bikes →
            </Link>
          </div>
        </div>
        
        {/* Users Stats */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <div className="flex justify-between">
            <div>
              <p className="text-2xl md:text-3xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Total users</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.adminUsers}</p>
              <p className="text-sm text-gray-500">Admins</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/users" className="text-primary text-sm hover:underline">
              Manage users →
            </Link>
          </div>
        </div>
        
        {/* Bookings Stats */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-2">Bookings</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-lg md:text-xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-blue-600">{stats.activeBookings}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-green-600">{stats.completedBookings}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-red-600">{stats.cancelledBookings}</p>
              <p className="text-xs text-gray-500">Cancelled</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/bookings" className="text-primary text-sm hover:underline">
              Manage bookings →
            </Link>
          </div>
        </div>
        
        {/* Revenue Stats */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-2">Revenue</h2>
          <div>
            <p className="text-2xl md:text-3xl font-bold">₹{totalRevenue}</p>
            <p className="text-sm text-gray-500">Total revenue</p>
          </div>
          <div className="mt-2">
            <p className="text-lg md:text-xl font-bold text-green-600">₹{upcomingRevenue}</p>
            <p className="text-sm text-gray-500">Upcoming revenue</p>
          </div>
        </div>
      </div>

      {/* Recent Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {bookings.slice(0, 5).map(booking => (
              <div key={booking._id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{booking.userName}</p>
                    <p className="text-sm text-gray-500">{new Date(booking.startTime).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        booking.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                        booking.status === "completed" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {bookings.length === 0 && (
              <p className="text-gray-500 text-center py-4">No bookings found</p>
            )}
          </div>
          <div className="mt-4">
            <Link href="/admin/bookings" className="text-primary text-sm hover:underline">
              View all bookings →
            </Link>
          </div>
        </div>
        
        {/* Popular Bikes */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Popular Bikes</h2>
          <div className="space-y-3">
            {popularBikes.map(bike => (
              <div key={bike._id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 relative mr-3">
                      <Image
                        src={bike.imageUrl || "/placeholder-bike.jpg"}
                        alt={bike.name}
                        fill
                        className="rounded-full object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{bike.registrationNumber || bike.name}</p>
                      <p className="text-sm text-gray-500">{bike.type}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">₹{bike.pricePerHour}/hr</p>
                    <p className="text-sm text-gray-500">
                      {bookings.filter(booking => booking.bikeId === bike._id).length} bookings
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {bikes.length === 0 && (
              <p className="text-gray-500 text-center py-4">No bikes found</p>
            )}
          </div>
          <div className="mt-4">
            <Link href="/admin/bikes" className="text-primary text-sm hover:underline">
              View all bikes →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}