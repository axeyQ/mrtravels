// src/components/admin/BikesTable.jsx
"use client";
import { useState } from 'react';
import Image from 'next/image';
import { BiEdit, BiTrash } from 'react-icons/bi';
import ToggleSwitch from '@/components/ui/ToggleSwitch'; // Assuming you have this component

export default function BikesTable({ 
  bikes = [], 
  onEdit, 
  onDelete, 
  onToggleAvailability,
  isLoading = false,
  togglingBikes = {}
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on component mount and window resize
  useState(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {/* Loading skeleton */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="border-b border-gray-200 p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                    <div className="w-1/4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="w-1/4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (bikes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No vehicles found</p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {bikes.map((bike) => (
          <div key={bike._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 relative rounded-full overflow-hidden bg-gray-100 mr-3">
                  <Image
                    src={bike.imageUrl || "/placeholder-bike.jpg"}
                    alt={bike.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{bike.name}</h3>
                  <p className="text-sm text-gray-500">{bike.type}</p>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-500">Registration</span>
                <p className="text-sm font-medium">{bike.registrationNumber || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Price</span>
                <p className="text-sm font-medium">₹{bike.pricePerHour}/hr</p>
              </div>
            </div>
            
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Availability</span>
                <div className="flex items-center">
                  <ToggleSwitch
                    checked={bike.isAvailable}
                    onChange={() => onToggleAvailability(bike._id, !bike.isAvailable)}
                    disabled={togglingBikes[bike._id]}
                  />
                  <span className="ml-2 text-xs text-gray-500">
                    {togglingBikes[bike._id] ? (
                      <span className="text-blue-500 animate-pulse">Updating...</span>
                    ) : (
                      bike.isAvailable ? "Available" : "Unavailable"
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex justify-end space-x-3">
              <button
                onClick={() => onEdit(bike)}
                className="p-2 text-primary hover:bg-gray-100 rounded-full"
              >
                <BiEdit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(bike)}
                className="p-2 text-red-600 hover:bg-gray-100 rounded-full"
              >
                <BiTrash className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Hour</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bikes.map((bike) => (
            <tr key={bike._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 relative rounded-full overflow-hidden">
                    <Image
                      src={bike.imageUrl || "/placeholder-bike.jpg"}
                      alt={bike.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{bike.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{bike.registrationNumber || "—"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{bike.type}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">₹{bike.pricePerHour}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <ToggleSwitch
                    checked={bike.isAvailable}
                    onChange={() => onToggleAvailability(bike._id, !bike.isAvailable)}
                    disabled={togglingBikes[bike._id]}
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    {togglingBikes[bike._id] ? (
                      <span className="text-blue-500 animate-pulse">Updating...</span>
                    ) : (
                      bike.isAvailable ? "Available" : "Unavailable"
                    )}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(bike)}
                  className="text-primary hover:text-primary-600 mr-4"
                >
                  <BiEdit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(bike)}
                  className="text-red-600 hover:text-red-800"
                >
                  <BiTrash className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}