"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Link from 'next/link';
import CloudinaryDocumentUpload from '@/components/ui/CloudinaryDocumentUpload';
import Image from 'next/image';

export default function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { user, isLoaded, isSignedIn } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState([]);
  const [formInitialized, setFormInitialized] = useState(false);

  // Get current user data from database
  const userData = useQuery(
    api.users.getUser,
    isLoaded && isSignedIn ? { userId: user.id } : "skip"
  );
  
  const isProfileComplete = useQuery(
    api.users.isProfileComplete,
    isLoaded && isSignedIn ? { userId: user.id } : "skip"
  );
  
  const directUpdateUser = useMutation(api.users.directUpdateUser);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    licenseNumber: "",
    licenseImageUrl: null,
    aadharImageUrl: null,
    aadharBackImageUrl: null, // New field for Aadhar back
    profilePictureUrl: null, // New field for profile picture
  });

  // Initialize form with user data when it's loaded
  useEffect(() => {
    if (userData && !formInitialized) {
      console.log("Loading user data:", userData);
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        licenseNumber: userData.licenseNumber || "",
        licenseImageUrl: userData.licenseImageUrl || null,
        aadharImageUrl: userData.aadharImageUrl || null,
        aadharBackImageUrl: userData.aadharBackImageUrl || null,
        profilePictureUrl: userData.profilePictureUrl || null,
      });
      setFormInitialized(true);
    } else if (user && !formInitialized) {
      // Fallback to Clerk data if Convex data is not available
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        licenseNumber: "",
        licenseImageUrl: null,
        aadharImageUrl: null,
        aadharBackImageUrl: null,
        profilePictureUrl: null,
      });
      setFormInitialized(true);
    }
  }, [userData, user, formInitialized]);

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionErrors([]);
    
    // Validate all required fields
    if (!formData.firstName || !formData.lastName || !formData.licenseNumber) {
      toast.error("Name and license number are required");
      return;
    }
    
    // Check for all required document uploads
    if (!formData.licenseImageUrl) {
      toast.error("Please upload your driver's license");
      return;
    }
    
    if (!formData.aadharImageUrl) {
      toast.error("Please upload the front side of your Aadhar card");
      return;
    }
    
    if (!formData.aadharBackImageUrl) {
      toast.error("Please upload the back side of your Aadhar card");
      return;
    }
    
    if (!formData.profilePictureUrl) {
      toast.error("Please upload your profile picture");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting profile data:", formData);
      
      // Use the direct update method to bypass validation issues
      await directUpdateUser({
        userId: user.id,
        updateData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          licenseNumber: formData.licenseNumber,
          licenseImageUrl: formData.licenseImageUrl,
          aadharImageUrl: formData.aadharImageUrl,
          aadharBackImageUrl: formData.aadharBackImageUrl,
          profilePictureUrl: formData.profilePictureUrl,
        }
      });
      
      toast.success("Profile updated successfully");
      
      // Redirect to the original path if it exists
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        // Otherwise just redirect to bikes
        router.push('/bikes');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSubmissionErrors(prev => [...prev, error.message || "Unknown error"]);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display a loading state while waiting for user data
  if (!isLoaded || userData === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="mt-2 text-gray-600">
          Please provide your details and documents to start booking bikes
        </p>
      </motion.div>
      
      {/* Error messages display */}
      {submissionErrors.length > 0 && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Errors encountered</h3>
              <div className="mt-2 text-xs text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {submissionErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <form onSubmit={handleSubmit}>
          {/* Profile Preview Section */}
          {formData.profilePictureUrl && (
            <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary">
                  <Image 
                    src={formData.profilePictureUrl} 
                    alt="Profile Preview" 
                    fill 
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">{formData.firstName} {formData.lastName}</p>
              </div>
            </div>
          )}
          
          {/* Profile Picture Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Picture</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please upload a clear photo of yourself. This will be used for identification.
            </p>
            <div className="max-w-md mx-auto">
              <CloudinaryDocumentUpload
                id="profilePicture"
                label="Profile Picture"
                helpText="A recent photo of yourself"
                value={formData.profilePictureUrl}
                folder="profile_pictures"
                onChange={(url) => setFormData(prev => ({ ...prev, profilePictureUrl: url }))}
              />
            </div>
          </div>
          
          {/* Personal Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Your first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Your last name"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                License Number *
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Your driver's license number"
              />
              <p className="mt-1 text-sm text-gray-500">
                This is required for booking bikes and will be verified during pickup
              </p>
            </div>
          </div>
          
          {/* Identity Documents Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Identity Documents</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please upload clear photos of your license and both sides of your Aadhar card. These will be verified during pickup.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <CloudinaryDocumentUpload
                id="licenseImage"
                label="Driver's License"
                helpText="Front side with photo"
                value={formData.licenseImageUrl}
                folder="license_images"
                onChange={(url) => setFormData(prev => ({ ...prev, licenseImageUrl: url }))}
              />
              <div className="space-y-6">
                <CloudinaryDocumentUpload
                  id="aadharFrontImage"
                  label="Aadhar Card (Front)"
                  helpText="Front side with photo"
                  value={formData.aadharImageUrl}
                  folder="aadhar_images"
                  onChange={(url) => setFormData(prev => ({ ...prev, aadharImageUrl: url }))}
                />
                <CloudinaryDocumentUpload
                  id="aadharBackImage"
                  label="Aadhar Card (Back)"
                  helpText="Back side with address"
                  value={formData.aadharBackImageUrl}
                  folder="aadhar_images"
                  onChange={(url) => setFormData(prev => ({ ...prev, aadharBackImageUrl: url }))}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : isProfileComplete ? "Update Profile" : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
      
      {isProfileComplete === false && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Profile Incomplete</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You must complete your profile with all required information and documents before you can book a bike.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}