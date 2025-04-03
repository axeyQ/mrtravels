"use client";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { BiX, BiDownload, BiFile, BiUser, BiCalendar, BiLock, BiPhone } from "react-icons/bi";

export default function UserDetailView({ userId, adminId, onClose }) {
  const [selectedTab, setSelectedTab] = useState("profile");
  const [enlargedImage, setEnlargedImage] = useState(null);
  
  // Get user details
  const userData = useQuery(api.users.getUser, { userId });
  
  // Get user bookings
  const userBookings = useQuery(api.bookings.getUserBookings, { userId });
  
  // Get user activities
  const userActivities = useQuery(
    api.userActivities.getUserActivities, 
    { adminId, userId, limit: 100 }
  );
  
  const isLoading = !userData || userActivities === undefined || userBookings === undefined;
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Format relative time
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "N/A";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // Handle image click to enlarge
  const handleImageClick = (imageUrl, title) => {
    if (!imageUrl) return;
    setEnlargedImage({ url: imageUrl, title });
  };
  
  // Close enlarged image on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setEnlargedImage(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);
  
  // Create a friendly format for activity details
  const formatActivityDetails = (action, details) => {
    try {
      // If details is a JSON string, parse it
      const parsedDetails = details ? JSON.parse(details) : {};
      
      switch (action) {
        case "login":
          return "User logged in";
        case "profile_update":
          return `Updated profile: ${Object.keys(parsedDetails).join(", ")}`;
        case "booking_created":
          return `Created booking for ${parsedDetails.bikeName || "a bike"}`;
        case "booking_cancelled":
          return `Cancelled booking #${parsedDetails.bookingId || ""}`;
        case "payment_made":
          return `Made payment of ₹${parsedDetails.amount || "0"}`;
        default:
          return action.replace(/_/g, " ");
      }
    } catch (e) {
      // If JSON parsing fails, just return the action
      return action.replace(/_/g, " ");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      {/* Enlarged image view */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 text-white">
              <h3 className="text-xl font-medium">{enlargedImage.title}</h3>
              <button
                onClick={() => setEnlargedImage(null)}
                className="text-white hover:text-gray-300"
              >
                <BiX className="h-6 w-6" />
              </button>
            </div>
            <div className="bg-white p-1 rounded">
              <img
                src={enlargedImage.url}
                alt={enlargedImage.title}
                className="mx-auto max-h-[75vh] object-contain"
              />
            </div>
            <p className="text-center text-white text-sm mt-4">
              Press ESC or click outside the image to close
            </p>
            <a 
              href={enlargedImage.url} 
              download 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center px-4 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <BiDownload className="mr-2" /> Download Image
            </a>
          </div>
        </div>
      )}

      {/* Main modal content */}
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-50 border-b px-6 py-4">
          <h2 className="text-xl font-bold">
            User Profile: {userData.firstName} {userData.lastName}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <BiX className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              selectedTab === "profile"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedTab("profile")}
          >
            Profile & Documents
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              selectedTab === "bookings"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedTab("bookings")}
          >
            Bookings
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              selectedTab === "activity"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedTab("activity")}
          >
            Activity Log
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Tab */}
          {selectedTab === "profile" && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-3">
                  <div 
                    className="w-40 h-40 rounded-full overflow-hidden cursor-pointer border-4 border-gray-200"
                    onClick={() => handleImageClick(userData.profilePictureUrl || userData.imageUrl, "Profile Picture")}
                  >
                    {userData.profilePictureUrl || userData.imageUrl ? (
                      <img
                        src={userData.profilePictureUrl || userData.imageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <BiUser className="w-20 h-20" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-lg">
                      {userData.firstName} {userData.lastName}
                    </h3>
                    <p className="text-gray-500">{userData.phoneNumber || "No phone number"}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userData.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {userData.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userData.profileComplete ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {userData.profileComplete ? "Profile Complete" : "Incomplete Profile"}
                    </span>
                  </div>
                </div>

                {/* User Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Account Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <BiUser className="mr-1 text-gray-400" /> Full Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{userData.firstName} {userData.lastName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <BiPhone className="mr-1 text-gray-400" /> Phone Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{userData.phoneNumber || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <BiCalendar className="mr-1 text-gray-400" /> Member Since
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(userData.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <BiLock className="mr-1 text-gray-400" /> User ID
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 truncate" title={userData.userId}>{userData.userId}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <BiFile className="mr-1 text-gray-400" /> License Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{userData.licenseNumber || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <BiFile className="mr-1 text-gray-400" /> Verification Status
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {userData.profileComplete ? 
                            <span className="text-green-600 font-medium">Verified</span> : 
                            <span className="text-red-600 font-medium">Not Verified</span>
                          }
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Identity Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* License */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">Driver&apos;s License</h4>
                      {userData.licenseImageUrl && (
                        <a 
                          href={userData.licenseImageUrl} 
                          download 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-600 text-sm"
                        >
                          <BiDownload className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    <div className="p-4">
                      {userData.licenseNumber && (
                        <p className="text-sm text-gray-500 mb-2">
                          License #: <span className="font-medium text-gray-700">{userData.licenseNumber}</span>
                        </p>
                      )}
                      {userData.licenseImageUrl ? (
                        <div
                          className="h-40 w-full mt-2 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer"
                          onClick={() => handleImageClick(userData.licenseImageUrl, "Driver's License")}
                        >
                          <img
                            src={userData.licenseImageUrl}
                            alt="Driver's License"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded mt-2">
                          <p className="text-gray-400">No license uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Aadhar Card (Front) */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">Aadhar Card (Front)</h4>
                      {userData.aadharImageUrl && (
                        <a 
                          href={userData.aadharImageUrl} 
                          download 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-600 text-sm"
                        >
                          <BiDownload className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    <div className="p-4">
                      {userData.aadharImageUrl ? (
                        <div
                          className="h-40 w-full mt-2 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer"
                          onClick={() => handleImageClick(userData.aadharImageUrl, "Aadhar Card (Front)")}
                        >
                          <img
                            src={userData.aadharImageUrl}
                            alt="Aadhar Card (Front)"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded mt-2">
                          <p className="text-gray-400">No Aadhar front uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Aadhar Card (Back) */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">Aadhar Card (Back)</h4>
                      {userData.aadharBackImageUrl && (
                        <a 
                          href={userData.aadharBackImageUrl} 
                          download 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-600 text-sm"
                        >
                          <BiDownload className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    <div className="p-4">
                      {userData.aadharBackImageUrl ? (
                        <div
                          className="h-40 w-full mt-2 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer"
                          onClick={() => handleImageClick(userData.aadharBackImageUrl, "Aadhar Card (Back)")}
                        >
                          <img
                            src={userData.aadharBackImageUrl}
                            alt="Aadhar Card (Back)"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded mt-2">
                          <p className="text-gray-400">No Aadhar back uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {selectedTab === "bookings" && (
            <div>
              <h3 className="text-lg font-medium mb-4">Booking History</h3>
              {userBookings && userBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.startTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.bikeId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60))} hours
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{booking.totalPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === "completed" ? "bg-green-100 text-green-800" :
                              booking.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                              booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.paymentStatus === "fully_paid" ? "bg-green-100 text-green-800" :
                              booking.paymentStatus === "deposit_paid" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {booking.paymentStatus || "No payment"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 text-center rounded-lg">
                  <p className="text-gray-500">No bookings found for this user.</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Log Tab */}
          {selectedTab === "activity" && (
            <div>
              <h3 className="text-lg font-medium mb-4">User Activity Log</h3>
              {userActivities && userActivities.length > 0 ? (
                <div className="space-y-4">
                  {userActivities.map((activity) => (
                    <div key={activity._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{formatActivityDetails(activity.action, activity.details)}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(activity.timestamp)} ({formatTimeAgo(activity.timestamp)})
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activity.action.includes("login") ? "bg-green-100 text-green-800" :
                          activity.action.includes("update") ? "bg-blue-100 text-blue-800" :
                          activity.action.includes("booking") ? "bg-purple-100 text-purple-800" :
                          activity.action.includes("payment") ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {activity.action.replace(/_/g, " ")}
                        </span>
                      </div>
                      {activity.ipAddress && (
                        <div className="mt-2 text-xs text-gray-500">
                          <p>IP: {activity.ipAddress}</p>
                          {activity.userAgent && <p className="truncate">{activity.userAgent}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 text-center rounded-lg">
                  <p className="text-gray-500">No activity logs found for this user.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}