'use client'
// This is a direct fix you can add to one of your admin components temporarily

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

export default function FixBikes() {
  const { user } = useUser();
  const [status, setStatus] = useState("");
  const [isFixing, setIsFixing] = useState(false);
  
  // Get all bikes
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  
  // Create a reusable update bike mutation
  const updateBike = useMutation(api.bikes.updateBike);
  
  const handleFixBikes = async () => {
    if (!user) {
      setStatus("You must be logged in as admin to fix bikes");
      return;
    }
    
    setIsFixing(true);
    setStatus("Fixing bikes...");
    
    try {
      let fixedCount = 0;
      const now = Date.now();
      
      // Process each bike
      for (const bike of bikes) {
        // If the bike is missing adminId, we'll update it
        if (!bike.adminId) {
          await updateBike({
            adminId: user.id,
            bikeId: bike._id,
            // Include any other required fields
            createdAt: now,
            updatedAt: now
          });
          
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        setStatus(`Fixed ${fixedCount} bikes successfully!`);
      } else {
        setStatus("No bikes needed fixing");
      }
    } catch (error) {
      setStatus(`Error fixing bikes: ${error.message}`);
      console.error("Error fixing bikes:", error);
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">Fix Bikes Missing AdminId</h2>
      
      <button
        onClick={handleFixBikes}
        disabled={isFixing}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
      >
        {isFixing ? "Fixing..." : "Fix Missing AdminId"}
      </button>
      
      {status && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
          {status}
        </div>
      )}
    </div>
  );
}