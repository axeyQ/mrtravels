// src/app/(dashboard)/bookings/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import BookingCard from '@/components/dashboard/BookingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, ArchiveIcon, Calendar, Info, Search } from 'lucide-react';
import Link from 'next/link';

export default function UserBookings() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get all bookings for the current user
  const userBookings = useQuery(
    api.bookings.getUserBookings,
    isUserLoaded && user ? { userId: user.id } : "skip"
  ) || [];
  
  // Get all bike IDs from bookings to fetch their details
  const bikeIds = userBookings.map(booking => booking.bikeId);
  
  // Fetch bike details for all bikes in the bookings
  const bikes = useQuery(api.bikes.getBikesByIds, { bikeIds }) || [];
  
  // Create a map of bike IDs to bike details for easy lookup
  const bikeMap = {};
  bikes.forEach(bike => {
    bikeMap[bike._id] = bike;
  });
  
  // Filtered bookings based on active tab and search query
  const filteredBookings = userBookings.filter(booking => {
    const matchesTab = (
      (activeTab === "active" && (booking.status === "confirmed" || booking.status === "pending")) ||
      (activeTab === "completed" && booking.status === "completed") ||
      (activeTab === "cancelled" && booking.status === "cancelled") ||
      activeTab === "all"
    );
    
    const matchesSearch = searchQuery === "" ||
      (bikeMap[booking.bikeId]?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bikeMap[booking.bikeId]?.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });
  
  // Sort bookings by start time (most recent first)
  const sortedBookings = [...filteredBookings].sort((a, b) => b.startTime - a.startTime);
  
  // Tabbed interface variants
  const tabVariants = {
    active: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    inactive: { opacity: 0, y: 20, transition: { duration: 0.3 } }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
      
      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="active" className="py-3">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>Active</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="completed" className="py-3">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Completed</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="py-3">
            <div className="flex items-center">
              <ArchiveIcon className="mr-2 h-4 w-4" />
              <span>Cancelled</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="all" className="py-3">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>All</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <motion.div
            variants={tabVariants}
            initial="inactive"
            animate="active"
            className="space-y-4"
          >
            {sortedBookings.length > 0 ? (
              sortedBookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  bikeDetails={bikeMap[booking.bikeId]}
                />
              ))
            ) : (
              <NoBookingsMessage
                title="No active bookings"
                message="You don't have any active bookings at the moment."
                actionText="Book a bike now"
                actionLink="/bikes"
              />
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="completed">
          <motion.div
            variants={tabVariants}
            initial="inactive"
            animate="active"
            className="space-y-4"
          >
            {sortedBookings.length > 0 ? (
              sortedBookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  bikeDetails={bikeMap[booking.bikeId]}
                />
              ))
            ) : (
              <NoBookingsMessage
                title="No completed bookings"
                message="You don't have any completed bookings yet."
                actionText="View all bookings"
                actionLink="#"
                actionOnClick={() => setActiveTab("all")}
              />
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="cancelled">
          <motion.div
            variants={tabVariants}
            initial="inactive"
            animate="active"
            className="space-y-4"
          >
            {sortedBookings.length > 0 ? (
              sortedBookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  bikeDetails={bikeMap[booking.bikeId]}
                />
              ))
            ) : (
              <NoBookingsMessage
                title="No cancelled bookings"
                message="You don't have any cancelled bookings."
                actionText="View all bookings"
                actionLink="#"
                actionOnClick={() => setActiveTab("all")}
              />
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="all">
          <motion.div
            variants={tabVariants}
            initial="inactive"
            animate="active"
            className="space-y-4"
          >
            {sortedBookings.length > 0 ? (
              sortedBookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  bikeDetails={bikeMap[booking.bikeId]}
                />
              ))
            ) : (
              <NoBookingsMessage
                title="No bookings found"
                message="You haven't made any bookings yet."
                actionText="Book a bike now"
                actionLink="/bikes"
              />
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NoBookingsMessage({ title, message, actionText, actionLink, actionOnClick }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
        <Info className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="mt-3 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      {actionText && (
        actionOnClick ? (
          <button
            onClick={actionOnClick}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600"
          >
            {actionText}
          </button>
        ) : (
          <Link
            href={actionLink}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600"
          >
            {actionText}
          </Link>
        )
      )}
    </div>
  );
}