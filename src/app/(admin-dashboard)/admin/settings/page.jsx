"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function AdminSettings() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  // This is just a placeholder for settings
  // In a real app, you would have more admin settings
  const [settings, setSettings] = useState({
    adminNotifications: true,
    autoConfirmBookings: false,
    maintenanceMode: false,
  });
  
  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      [name]: checked,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating an API call to save settings
    setTimeout(() => {
      toast.success("Settings saved successfully");
      setIsLoading(false);
    }, 1000);
  };
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        <div className="px-6 py-4">
          <h2 className="text-lg font-medium">General Settings</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="adminNotifications"
                  name="adminNotifications"
                  type="checkbox"
                  checked={settings.adminNotifications}
                  onChange={handleChange}
                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="adminNotifications" className="font-medium text-gray-700">
                  Admin Notifications
                </label>
                <p className="text-gray-500">
                  Receive notifications for new bookings and user registrations.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="autoConfirmBookings"
                  name="autoConfirmBookings"
                  type="checkbox"
                  checked={settings.autoConfirmBookings}
                  onChange={handleChange}
                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="autoConfirmBookings" className="font-medium text-gray-700">
                  Auto-Confirm Bookings
                </label>
                <p className="text-gray-500">
                  Automatically confirm new bookings without admin approval.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="maintenanceMode"
                  name="maintenanceMode"
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                  Maintenance Mode
                </label>
                <p className="text-gray-500">
                  Put the website in maintenance mode (only admins can access).
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow divide-y divide-gray-200">
        <div className="px-6 py-4">
          <h2 className="text-lg font-medium">Admin Account</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-12 w-12 rounded-full"
                src={user?.imageUrl || "/placeholder-avatar.png"}
                alt="Profile"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                Administrator
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <a
              href="/admin/setup"
              className="text-sm font-medium text-primary hover:text-primary-600"
            >
              Manage admin access →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}