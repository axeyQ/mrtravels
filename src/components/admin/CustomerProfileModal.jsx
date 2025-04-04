// src/components/admin/CustomerProfileModal.jsx
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Phone, Calendar, CreditCard, Check, Shield } from 'lucide-react';
import Image from 'next/image';

export default function CustomerProfileModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('personal');

  if (!isOpen || !user) return null;

  // Function to determine verification status color
  const getVerificationColor = (isVerified) => {
    return isVerified ? 'text-green-600' : 'text-yellow-600';
  };

  // Function to determine verification text
  const getVerificationText = (isVerified) => {
    return isVerified ? 'Verified' : 'Pending Verification';
  };

  // Check if profile is complete by validating all required fields
  const isProfileComplete = Boolean(
    user.firstName &&
    user.lastName &&
    user.licenseNumber &&
    user.licenseImageUrl &&
    user.aadharImageUrl
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Customer Profile</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
          {/* Sidebar */}
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-primary">
                {user.profilePictureUrl ? (
                  <Image
                    src={user.profilePictureUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full ${isProfileComplete ? 'bg-green-500' : 'bg-yellow-500'} border-2 border-white`}></div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-500">{user.phoneNumber || "No phone number"}</p>

              <div className="mt-3 flex justify-center">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {isProfileComplete ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Complete
                    </>
                  ) : (
                    <>
                      <Shield className="mr-1 h-3 w-3" />
                      Incomplete
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === 'personal' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === 'documents' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="mr-3 h-5 w-5" />
                ID Documents
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === 'activity' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="mr-3 h-5 w-5" />
                Booking History
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="col-span-2 max-h-[70vh] overflow-y-auto p-6">
            {activeTab === 'personal' && (
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Personal Information</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-gray-500">First Name</h4>
                      <p className="text-gray-900">{user.firstName || "Not provided"}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-gray-500">Last Name</h4>
                      <p className="text-gray-900">{user.lastName || "Not provided"}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-500">Phone Number</h4>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{user.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-500">License Number</h4>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{user.licenseNumber || "Not provided"}</p>
                      {user.licenseNumber && (
                        <span className={`ml-2 text-xs ${getVerificationColor(true)}`}>
                          ({getVerificationText(true)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-500">Account Created</h4>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Account Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700">Profile Status</span>
                      </div>
                      <span className={`text-sm font-medium ${isProfileComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                        {isProfileComplete ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700">Verification Status</span>
                      </div>
                      <span className={`text-sm font-medium ${isProfileComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                        {isProfileComplete ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">ID Documents</h3>
                
                {/* License */}
                <div className="mb-6">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Driver's License</h4>
                  <div className="relative rounded-lg border bg-gray-50 p-2">
                    {user.licenseImageUrl ? (
                      <div className="relative h-48 w-full overflow-hidden rounded border bg-white">
                        <Image
                          src={user.licenseImageUrl}
                          alt="Driver's License"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded border bg-gray-100 p-4 text-center">
                        <p className="text-sm text-gray-500">No license document uploaded</p>
                      </div>
                    )}
                    {user.licenseImageUrl && (
                      <div className="mt-2 flex justify-between">
                        <span className="text-xs text-gray-500">
                          License Number: {user.licenseNumber || "Not provided"}
                        </span>
                        <span className={`text-xs ${getVerificationColor(true)}`}>
                          {getVerificationText(true)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Aadhar Card */}
                <div className="mb-6">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Aadhar Card (Front)</h4>
                  <div className="relative rounded-lg border bg-gray-50 p-2">
                    {user.aadharImageUrl ? (
                      <div className="relative h-48 w-full overflow-hidden rounded border bg-white">
                        <Image
                          src={user.aadharImageUrl}
                          alt="Aadhar Card (Front)"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded border bg-gray-100 p-4 text-center">
                        <p className="text-sm text-gray-500">No Aadhar front image uploaded</p>
                      </div>
                    )}
                    {user.aadharImageUrl && (
                      <div className="mt-2 flex justify-end">
                        <span className={`text-xs ${getVerificationColor(true)}`}>
                          {getVerificationText(true)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Aadhar Card Back */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Aadhar Card (Back)</h4>
                  <div className="relative rounded-lg border bg-gray-50 p-2">
                    {user.aadharBackImageUrl ? (
                      <div className="relative h-48 w-full overflow-hidden rounded border bg-white">
                        <Image
                          src={user.aadharBackImageUrl}
                          alt="Aadhar Card (Back)"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded border bg-gray-100 p-4 text-center">
                        <p className="text-sm text-gray-500">No Aadhar back image uploaded</p>
                      </div>
                    )}
                    {user.aadharBackImageUrl && (
                      <div className="mt-2 flex justify-end">
                        <span className={`text-xs ${getVerificationColor(true)}`}>
                          {getVerificationText(true)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Booking History</h3>
                <p className="text-sm text-gray-500">This section would display the user's booking history.</p>
                
                {/* Placeholder for booking history - would be populated with actual data */}
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">No booking history available for this user.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}