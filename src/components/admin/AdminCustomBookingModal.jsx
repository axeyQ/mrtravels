"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

export default function AdminCustomBookingModal({ onClose, adminId }) {
  // States for the booking form
  const [selectedBike, setSelectedBike] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Default to 1 day
  const [customPrice, setCustomPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Get available bikes
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  
  // Get all users for admin selection
  const allUsers = useQuery(api.bookings.getAllUserBasicInfo, { adminId }) || [];
  
  // Filtered users based on search
  const filteredUsers = userSearchTerm.trim() === "" 
    ? allUsers 
    : allUsers.filter(user => 
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.phone.includes(userSearchTerm)
      );
      
  // Create custom booking mutation
  const createCustomBooking = useMutation(api.bookings.createCustomBooking);
  
  // Calculate suggested price based on bike hourly rate and duration
  useEffect(() => {
    if (selectedBike && startDate && endDate) {
      const durationHours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const suggestedPrice = durationHours * selectedBike.pricePerHour;
      setCustomPrice(suggestedPrice.toString());
    }
  }, [selectedBike, startDate, endDate]);
  
  // Handle quick duration selection
  const handleQuickDuration = (days) => {
    const newEndDate = new Date(startDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    setEndDate(newEndDate);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBike || !selectedUser) {
      toast.error("Please select both a bike and a user");
      return;
    }
    
    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }
    
    const totalPrice = parseFloat(customPrice);
    if (isNaN(totalPrice) || totalPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createCustomBooking({
        adminId,
        bikeId: selectedBike._id,
        userId: selectedUser.userId,
        userName: selectedUser.name,
        userPhone: selectedUser.phone || "Not provided",
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        totalPrice,
        notes,
        paymentStatus,
      });
      
      toast.success("Custom booking created successfully");
      onClose();
    } catch (error) {
      console.error("Error creating custom booking:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-lg font-medium text-gray-900">Create Custom Booking</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Select Bike Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Bike *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {bikes.length === 0 ? (
                    <p className="text-gray-500 col-span-full">No bikes available</p>
                  ) : (
                    bikes.map((bike) => (
                      <div
                        key={bike._id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedBike?._id === bike._id
                            ? "border-primary bg-primary bg-opacity-5"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => setSelectedBike(bike)}
                      >
                        <div className="flex items-center">
                          <div className="relative h-10 w-10 flex-shrink-0">
                            <Image
                              src={bike.imageUrl || "/placeholder-bike.jpg"}
                              alt={bike.name}
                              fill
                              className="object-cover rounded-md"
                              sizes="40px"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">{bike.name}</p>
                            <p className="text-xs text-gray-500">{bike.registrationNumber || bike.type}</p>
                          </div>
                          <div className="text-xs font-semibold text-primary">
                            ₹{bike.pricePerHour}/hr
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Select User Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search user by name or phone"
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  
                  {selectedUser && (
                    <div className="mt-2 flex items-center bg-gray-50 p-2 rounded-md">
                      <div className="relative h-8 w-8 flex-shrink-0">
                        {selectedUser.profilePictureUrl ? (
                          <Image
                            src={selectedUser.profilePictureUrl}
                            alt={selectedUser.name}
                            fill
                            className="object-cover rounded-full"
                            sizes="32px"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              {selectedUser.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                        <p className="text-xs text-gray-500">{selectedUser.phone || "No phone"}</p>
                      </div>
                      <button
                        type="button"
                        className="ml-auto text-gray-400 hover:text-gray-500"
                        onClick={() => setSelectedUser(null)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {showUserDropdown && filteredUsers.length > 0 && !selectedUser && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.userId}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserSearchTerm("");
                            setShowUserDropdown(false);
                          }}
                        >
                          <div className="relative h-8 w-8 flex-shrink-0">
                            {user.profilePictureUrl ? (
                              <Image
                                src={user.profilePictureUrl}
                                alt={user.name}
                                fill
                                className="object-cover rounded-full"
                                sizes="32px"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">{user.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.phone || "No phone"}</p>
                          </div>
                          {!user.profileComplete && (
                            <span className="ml-auto text-xs text-red-500 px-2 py-1 bg-red-50 rounded-full">
                              Incomplete Profile
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {showUserDropdown && filteredUsers.length === 0 && userSearchTerm && (
                  <p className="mt-1 text-sm text-gray-500">No users found matching &quot;{userSearchTerm}&auot;</p>
                )}
              </div>
              
              {/* Booking Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Period *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      showTimeSelect
                      timeIntervals={30}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <DatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      showTimeSelect
                      timeIntervals={30}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      minDate={startDate}
                    />
                  </div>
                </div>
                
                {/* Quick duration buttons */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDuration(1)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200"
                  >
                    1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDuration(2)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200"
                  >
                    2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDuration(3)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200"
                  >
                    3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDuration(7)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200"
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDuration(30)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200"
                  >
                    1 Month
                  </button>
                </div>
                
                {selectedBike && startDate && endDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    Duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))} hours
                    ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days)
                  </div>
                )}
              </div>
              
              {/* Custom Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Enter custom price"
                  required
                />
                {selectedBike && (
                  <p className="mt-1 text-xs text-gray-500">
                    Standard rate: ₹{selectedBike.pricePerHour}/hour
                  </p>
                )}
              </div>
              
              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="pending">Pending Payment</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                  <option value="waived">Payment Waived</option>
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Add any special notes or instructions for this booking"
                />
              </div>
            </div>
            
            {/* Submit and Cancel Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Booking..." : "Create Custom Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}