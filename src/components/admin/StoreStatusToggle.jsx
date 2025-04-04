"use client";
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-toastify';

export default function StoreStatusToggle() {
  const { user, isLoaded } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get current store status
  const storeStatus = useQuery(api.storeStatus.getStoreStatus) || { isOpen: true };
  const updateStoreStatus = useMutation(api.storeStatus.updateStoreStatus);
  
  // Handle toggle change
  const handleToggleChange = async (newStatus) => {
    if (!isLoaded || !user) return;
    
    setIsUpdating(true);
    try {
      await updateStoreStatus({
        adminId: user.id,
        isOpen: newStatus
      });
      
      toast.success(`Store is now ${newStatus ? 'open' : 'closed'}`);
    } catch (error) {
      console.error('Failed to update store status:', error);
      toast.error('Failed to update store status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (storeStatus === undefined) {
    return (
      <div className="inline-block">
        <div className="h-6 w-12 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Store Status</h2>
          <p className="text-sm text-gray-500 mt-1">
            {storeStatus.isOpen 
              ? "Store is currently open for bookings" 
              : "Store is currently closed for bookings"}
          </p>
        </div>
        
        <div className="relative inline-block w-16 align-middle select-none transition duration-200 ease-in">
          <input
            type="checkbox"
            name="storeStatus"
            id="storeStatus"
            className="peer sr-only"
            checked={storeStatus.isOpen}
            onChange={() => handleToggleChange(!storeStatus.isOpen)}
            disabled={isUpdating}
          />
          <label
            htmlFor="storeStatus"
            className={`absolute block h-8 overflow-hidden rounded-full bg-gray-300 cursor-pointer
              ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{ width: '52px' }}
          >
            <span
              className={`absolute block h-6 w-6 rounded-full bg-white shadow inset-y-1 left-1 transition-transform duration-200 ease-in transform
                ${storeStatus.isOpen ? 'translate-x-8' : 'translate-x-0'}
                ${isUpdating ? 'bg-gray-200' : ''}
              `}
            ></span>
          </label>
        </div>
      </div>
      
      <div className="mt-4 p-3 rounded-md bg-blue-50 text-sm text-blue-700">
        <p>
          <strong>Note:</strong> When the store is closed, customers will not be able to make new bookings. 
          Existing bookings and admin operations will still function normally.
        </p>
      </div>
    </div>
  );
}