"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-toastify";
import { BiCheck, BiX, BiCalendar } from "react-icons/bi";
import Link from "next/link";

export default function AdminBookings() {
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Fetch all bookings
  const bookings = useQuery(
    api.bookings.getAllBookings,
    isUserLoaded && user ? { adminId: user.id } : null
  ) || [];
  
  // Fetch all bikes to get their names
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  
  const isLoading = !isUserLoaded || bookings === undefined || bikes === undefined;
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);
  
  // Create a map of bike IDs to bike names
  const bikeMap = bikes.reduce((map, bike) => {
    map[bike._id] = bike;
    return map;
  }, {});
  
  // Handle updating booking status
  const handleUpdateStatus = async () => {
    if (!isUserLoaded || !user || !selectedBooking || !statusToUpdate) return;
    
    try {
      await updateBookingStatus({
        bookingId: selectedBooking._id,
        status: statusToUpdate,
        userId: user.id,
      });
      toast.success(`Booking ${statusToUpdate} successfully`);
      setSelectedBooking(null);
      setStatusToUpdate("");
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(error.message || "Failed to update booking status");
    }
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    let colorClass = "";
    switch (status) {
      case "pending":
        colorClass = "bg-yellow-100 text-yellow-800";
        break;
      case "confirmed":
        colorClass = "bg-green-100 text-green-800";
        break;
      case "cancelled":
        colorClass = "bg-red-100 text-red-800";
        break;
      case "completed":
        colorClass = "bg-blue-100 text-blue-800";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
        {status}
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-8 w-1/4 rounded mb-6"></div>
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <div className="grid grid-cols-6 gap-4">
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
            </div>
          </div>
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b last:border-0 border-gray-200 py-4 grid grid-cols-6 gap-4">
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Sort bookings by start time (newest first)
  const sortedBookings = [...bookings].sort((a, b) => b.startTime - a.startTime);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>
      
      <div className="bg-white rounded-lg shadow">
        {sortedBookings.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bike
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBookings.map((booking) => {
                  const bike = bikeMap[booking.bikeId];
                  return (
                    <tr key={booking._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                        <div className="text-sm text-gray-500">{booking.userPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {bike && (
                            <>
                              <div className="h-8 w-8 flex-shrink-0">
                                <img className="h-8 w-8 rounded-full object-cover" src={bike.imageUrl || "/placeholder-bike.jpg"} alt="" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{bike.name}</div>
                                <div className="text-sm text-gray-500">{bike.type}</div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${booking.totalPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {booking.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setStatusToUpdate("confirmed");
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Confirm booking"
                            >
                              <BiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setStatusToUpdate("cancelled");
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel booking"
                            >
                              <BiX className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                        {booking.status === "confirmed" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setStatusToUpdate("completed");
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Mark as completed"
                            >
                              <BiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setStatusToUpdate("cancelled");
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel booking"
                            >
                              <BiX className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Status Update Confirmation Modal */}
      {selectedBooking && statusToUpdate && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Status Update
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to mark this booking as {statusToUpdate}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setStatusToUpdate("");
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className={`px-4 py-2 text-white rounded-md ${
                  statusToUpdate === "confirmed" ? "bg-green-600 hover:bg-green-700" :
                  statusToUpdate === "cancelled" ? "bg-red-600 hover:bg-red-700" :
                  "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}