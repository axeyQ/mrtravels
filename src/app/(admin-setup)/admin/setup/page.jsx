// app/(admin-setup)/admin/setup/page.jsx
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function AdminSetup() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [adminCode, setAdminCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Admin setup code - in a real app, this would be stored more securely
  const ADMIN_SETUP_CODE = "BIKE1234";
  
  const setFirstAdmin = useMutation(api.users.setFirstAdmin);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoaded || !isSignedIn) {
      toast.error("Please sign in to continue");
      router.push("/sign-in");
      return;
    }
    
    if (adminCode !== ADMIN_SETUP_CODE) {
      toast.error("Invalid admin code");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Special case - first user becomes admin without requiring an existing admin
      await setFirstAdmin({
        userId: user.id,
        setupCode: adminCode,
      });
      
      toast.success("You have been successfully promoted to admin!");
      setAdminCode("");
      // Redirect to admin dashboard
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (error) {
      console.error("Error setting up admin:", error);
      toast.error(error.message || "Failed to set up admin access");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-3xl font-bold">Sign In Required</h1>
          <p className="mt-2 text-gray-600">
            You need to sign in to access the admin setup.
          </p>
          <div className="mt-6">
            <a
              href="/sign-in"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">Admin Setup</h1>
          <p className="mt-2 text-center text-gray-600">
            Enter the admin setup code to gain administrator access.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="admin-code" className="sr-only">
                Admin Setup Code
              </label>
              <input
                id="admin-code"
                name="admin-code"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Admin Setup Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Administrator access gives you full control over the application including all bikes, bookings, and users. Use with caution.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Set Up Admin Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}