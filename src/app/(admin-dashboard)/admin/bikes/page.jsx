"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-toastify";
import { BiEdit, BiTrash, BiPlus } from "react-icons/bi";
import Link from "next/link";
import BikeForm from "@/components/admin/BikeForm";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import Image from "next/image";

export default function AdminBikes() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  const isLoading = bikes === undefined;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [deletingBike, setDeletingBike] = useState(null);
  const [togglingBikes, setTogglingBikes] = useState({});

  const addBike = useMutation(api.bikes.addBike);
  const updateBike = useMutation(api.bikes.updateBike);
  const deleteBike = useMutation(api.bikes.deleteBike);
  const toggleAvailability = useMutation(api.bikes.toggleBikeAvailability);
  
  // Handle adding a new bike
  const handleAddBike = async (bikeData) => {
    if (!isUserLoaded || !user) return;
    try {
      await addBike({
        adminId: user.id,
        ...bikeData,
      });
      toast.success("Vehicle added successfully");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error(error.message || "Failed to add vehicle");
    }
  };
  
  // Handle updating a bike
  const handleUpdateBike = async (bikeData) => {
    if (!isUserLoaded || !user || !editingBike) return;
    try {
      await updateBike({
        adminId: user.id,
        bikeId: editingBike._id,
        ...bikeData,
      });
      toast.success("Vehicle updated successfully");
      setEditingBike(null);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error(error.message || "Failed to update vehicle");
    }
  };

  // Handle deleting a bike
  const handleDeleteBike = async () => {
    if (!isUserLoaded || !user || !deletingBike) return;
    try {
      await deleteBike({
        adminId: user.id,
        bikeId: deletingBike._id,
      });
      toast.success("Vehicle deleted successfully");
      setDeletingBike(null);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error(error.message || "Failed to delete vehicle");
    }
  };
  
  // Handle toggling bike availability
  const handleToggleAvailability = async (bikeId, newAvailability) => {
    if (!isUserLoaded || !user) return;
    
    // Set the bike as toggling to show a loading state
    setTogglingBikes(prev => ({ ...prev, [bikeId]: true }));
    
    try {
      await toggleAvailability({
        adminId: user.id,
        bikeId,
        isAvailable: newAvailability,
      });
      toast.success(`Vehicle is now ${newAvailability ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error("Error toggling vehicle availability:", error);
      toast.error(error.message || "Failed to update availability");
    } finally {
      // Remove the toggling state
      setTogglingBikes(prev => ({ ...prev, [bikeId]: false }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-gray-200 h-8 w-1/4 rounded"></div>
          <div className="bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <div className="grid grid-cols-6 gap-4">
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
            </div>
          </div>
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b last:border-0 border-gray-200 py-4 grid grid-cols-6 gap-4">
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Vehicles</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary-600 text-white py-2 px-4 rounded-md flex items-center"
        >
          <BiPlus className="mr-2" /> Add Vehicle
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {bikes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No vehicles found</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 text-primary hover:text-primary-600 font-medium"
            >
              Add your first vehicle
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Hour
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bikes.map((bike) => (
                    <tr key={bike._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            <Image 
                              className="rounded-full object-cover"
                              src={bike.imageUrl || "/placeholder-bike.jpg"} 
                              alt={bike.name}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {bike.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bike.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {bike.registrationNumber || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {bike.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{bike.pricePerHour}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ToggleSwitch 
                            checked={bike.isAvailable}
                            onChange={(newState) => handleToggleAvailability(bike._id, newState)}
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
                          onClick={() => setEditingBike(bike)}
                          className="text-primary hover:text-primary-600 mr-4"
                        >
                          <BiEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeletingBike(bike)}
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
          </>
        )}
      </div>
      
      {/* Add Bike Modal */}
      {isAddModalOpen && (
        <BikeForm
          onSubmit={handleAddBike}
          onCancel={() => setIsAddModalOpen(false)}
          title="Add New Vehicle"
        />
      )}
      
      {/* Edit Bike Modal */}
      {editingBike && (
        <BikeForm
          bike={editingBike}
          onSubmit={handleUpdateBike}
          onCancel={() => setEditingBike(null)}
          title="Edit Vehicle"
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deletingBike && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete &quot;{deletingBike.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeletingBike(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBike}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}