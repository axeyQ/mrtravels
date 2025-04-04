// src/app/(admin-dashboard)/admin/bikes/page.jsx
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-toastify";
import { BiPlus } from "react-icons/bi";
import BikeForm from "@/components/admin/BikeForm";
import BikesTable from "@/components/admin/BikesTable"; // Import our new responsive component

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold md:block hidden">Manage Vehicles</h1>
        <div className="flex-grow md:flex-grow-0"></div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary-600 text-white py-2 px-4 rounded-md flex items-center whitespace-nowrap"
        >
          <BiPlus className="mr-2" /> Add Vehicle
        </button>
      </div>
      
      {/* Use our new responsive table component */}
      <BikesTable
        bikes={bikes}
        onEdit={setEditingBike}
        onDelete={setDeletingBike}
        onToggleAvailability={handleToggleAvailability}
        isLoading={isLoading}
        togglingBikes={togglingBikes}
      />
      
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
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