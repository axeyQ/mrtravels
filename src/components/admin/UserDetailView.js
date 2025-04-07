// src/components/admin/UserDetailView.jsx
"use client";
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BiX, BiDownload } from 'react-icons/bi';
import Image from 'next/image';

export default function UserDetailView({ user, onClose, onToggleAdmin }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Get the userId from the user object
  const userId = user?.userId;
  
  // Only query if we have a userId
  const userData = useQuery(
    api.users.getUser,
    userId ? { userId } : "skip"  // Skip the query if no userId
  );
  
  // Get user bookings
  const userBookings = useQuery(
    api.bookings.getUserBookings,
    userId ? { userId } : "skip"  // Skip the query if no userId
  ) || [];
  
  // If user data isn't ready yet, show a loading state
  if (!user || (userId && !userData)) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Loading User Profile...</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <BiX className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Use the combined data from the initial user object and any additional data from the query
  const userInfo = { ...user, ...userData };
  const isAdmin = userInfo.role === "admin";
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">User Profile: {userInfo.firstName} {userInfo.lastName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <BiX className="h-6 w-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile & Documents
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'profile' && (
            <div className="p-6">
              {/* User Profile Section */}
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                    {userInfo.profilePictureUrl ? (
                      <Image
                        src={userInfo.profilePictureUrl}
                        alt={`${userInfo.firstName} ${userInfo.lastName}`}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : userInfo.imageUrl ? (
                      <Image
                        src={userInfo.imageUrl}
                        alt={`${userInfo.firstName} ${userInfo.lastName}`}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">{userInfo.firstName} {userInfo.lastName}</h3>
                  <p className="text-gray-500">{userInfo.phoneNumber}</p>
                  <div className="mt-2 flex space-x-2">
                    {isAdmin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        admin
                      </span>
                    )}
                    {userInfo.profileComplete && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Profile Complete
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="md:w-2/3 md:pl-6">
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-gray-900">{userInfo.firstName} {userInfo.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-900">{userInfo.phoneNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-gray-900">{userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="text-gray-900 truncate">{userInfo.userId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="text-gray-900">{userInfo.licenseNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification Status</p>
                      <p className={`${userInfo.profileComplete ? "text-green-600" : "text-red-600"} font-medium`}>
                        {userInfo.profileComplete ? "Verified" : "Not Verified"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => onToggleAdmin(userInfo)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isAdmin
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {isAdmin ? "Remove Admin Access" : "Grant Admin Access"}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* ID Documents Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Identity Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Driver's License */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="font-medium">Driver&apos;s License</h4>
                      {userInfo.licenseImageUrl && (
                        <a 
                          href={userInfo.licenseImageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark"
                        >
                          <BiDownload className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-500 mb-2">License #: {userInfo.licenseNumber || "Not provided"}</p>
                      <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                        {userInfo.licenseImageUrl ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={userInfo.licenseImageUrl}
                              alt="Driver&apos;s License"
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No document uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Aadhar Card Front */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="font-medium">Aadhar Card (Front)</h4>
                      {userInfo.aadharImageUrl && (
                        <a 
                          href={userInfo.aadharImageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark"
                        >
                          <BiDownload className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                        {userInfo.aadharImageUrl ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={userInfo.aadharImageUrl}
                              alt="Aadhar Card Front"
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No document uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Aadhar Card Back */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="font-medium">Aadhar Card (Back)</h4>
                      {userInfo.aadharBackImageUrl && (
                        <a 
                          href={userInfo.aadharBackImageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark"
                        >
                          <BiDownload className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                        {userInfo.aadharBackImageUrl ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={userInfo.aadharBackImageUrl}
                              alt="Aadhar Card Back"
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No document uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'bookings' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Bookings</h3>
              {userBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userBookings.map(booking => (
                        <tr key={booking._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking._id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.startTime).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.bikeId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{booking.totalPrice}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded text-center">
                  <p className="text-gray-500">No bookings found for this user.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}