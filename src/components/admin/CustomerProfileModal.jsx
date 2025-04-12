"use client";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tag as TagIcon } from 'lucide-react';

export default function CustomerProfileModal({ userId, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(null);
  
  // Fetch user data
  const userData = useQuery(api.users.getUser, { 
    userId: userId || "" 
  });

  useEffect(() => {
    if (userData !== undefined) {
      setIsLoading(false);
    }
  }, [userData]);

  // Close modal when escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        if (enlargedImage) {
          setEnlargedImage(null);
        } else {
          onClose();
        }
      }
    };
    
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose, enlargedImage]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Get verification status badges
  const getVerificationStatus = () => {
    if (!userData) return { status: "Unknown", color: "gray" };
    
    const hasLicense = !!userData.licenseImageUrl;
    const hasAadhar = !!userData.aadharImageUrl && !!userData.aadharBackImageUrl;
    const hasProfilePic = !!userData.profilePictureUrl;
    
    if (hasLicense && hasAadhar && hasProfilePic) {
      return { status: "Fully Verified", color: "green" };
    } else if (hasLicense || hasAadhar || hasProfilePic) {
      return { status: "Partially Verified", color: "orange" };
    } else {
      return { status: "Not Verified", color: "red" };
    }
  };

  const verificationStatus = getVerificationStatus();

  // Function to open an image in fullscreen view
  const openImage = (e, imageUrl, title) => {
    if (!imageUrl) return;
    e.stopPropagation(); // Prevent event from bubbling up
    setEnlargedImage({ url: imageUrl, title });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
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
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Customer Profile</h3>
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
        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !userData ? (
            <div className="text-center py-8">
              <p className="text-gray-500">User information not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Profile Picture */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-primary flex-shrink-0">
                  {userData.profilePictureUrl ? (
                    <div 
                      className="w-full h-full cursor-pointer"
                      onClick={(e) => openImage(e, userData.profilePictureUrl, "Profile Picture")}
                    >
                      <img
                        src={userData.profilePictureUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : userData.imageUrl ? (
                    <div 
                      className="w-full h-full cursor-pointer"
                      onClick={(e) => openImage(e, userData.imageUrl, "Profile Picture")}
                    >
                      <img
                        src={userData.imageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
                      <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  
                  <p className="text-gray-500 mt-1">
                    {userData.phoneNumber || "No phone number"}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${verificationStatus.color === 'green' ? 'bg-green-100 text-green-800' : 
                          verificationStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' : 
                          'bg-red-100 text-red-800'}`}
                    >
                      {verificationStatus.status}
                    </span>
                    
                    {userData.role === "admin" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                    
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Tags Section */}
              {userData && userData.tags && userData.tags.length > 0 && (
  <div className="mt-4 mb-6">
    <div className="flex items-center mb-2">
      <TagIcon className="h-4 w-4 text-primary mr-2" />
      <h3 className="text-sm font-medium text-gray-800">Customer Tags</h3>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {userData.tags.map((tag, index) => (
        <span 
          key={index}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
)}

              {/* Verification Documents */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Documents</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Driver's License */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="font-medium text-gray-700">Driver&apos;s License</h4>
                    </div>
                    <div className="p-4">
                      {userData.licenseNumber && (
                        <p className="text-sm text-gray-500 mb-2">
                          License #: <span className="font-medium text-gray-700">{userData.licenseNumber}</span>
                        </p>
                      )}
                      
                      {userData.licenseImageUrl ? (
                        <div 
                          className="h-40 w-full mt-2 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden"
                        >
                          <img
                            src={userData.licenseImageUrl}
                            alt="Driver's License"
                            className="max-h-full max-w-full object-contain cursor-pointer"
                            onClick={(e) => openImage(e, userData.licenseImageUrl, "Driver's License")}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-document.jpg';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded mt-2">
                          <p className="text-gray-400">No license uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aadhar Card */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="font-medium text-gray-700">Aadhar Card</h4>
                    </div>
                    <div className="p-4">
                      {userData.aadharImageUrl ? (
                        <div className="space-y-4">
                          <div className="h-40 w-full relative border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                            <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800 text-white text-xs rounded z-10">
                              Front
                            </div>
                            <img
                              src={userData.aadharImageUrl}
                              alt="Aadhar Card (Front)"
                              className="max-h-full max-w-full object-contain cursor-pointer"
                              onClick={(e) => openImage(e, userData.aadharImageUrl, "Aadhar Card (Front)")}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-document.jpg';
                              }}
                            />
                          </div>
                          
                          {userData.aadharBackImageUrl && (
                            <div className="h-40 w-full relative border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                              <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800 text-white text-xs rounded z-10">
                                Back
                              </div>
                              <img
                                src={userData.aadharBackImageUrl}
                                alt="Aadhar Card (Back)"
                                className="max-h-full max-w-full object-contain cursor-pointer"
                                onClick={(e) => openImage(e, userData.aadharBackImageUrl, "Aadhar Card (Back)")}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/placeholder-document.jpg';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded">
                          <p className="text-gray-400">No Aadhar card uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}