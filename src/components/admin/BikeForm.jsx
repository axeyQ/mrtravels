"use client";
import { useState } from "react";
import { BiX } from "react-icons/bi";
import BikeImageUpload from "./BikeImageUpload";

// Updated to only have "Bike" and "Moped" options
const VEHICLE_TYPES = ["Bike", "Moped"];

export default function BikeForm({ bike = null, onSubmit, onCancel, title }) {
  const [formData, setFormData] = useState({
    name: bike?.name || "",
    type: bike?.type || VEHICLE_TYPES[0],
    description: bike?.description || "",
    pricePerHour: bike?.pricePerHour || 10,
    imageUrl: bike?.imageUrl || "",
    isAvailable: bike?.isAvailable ?? true,
    registrationNumber: bike?.registrationNumber || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const handleImageUpload = (imageUrl) => {
    setFormData({
      ...formData,
      imageUrl,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that we have an image URL
    if (!formData.imageUrl) {
      alert("Please upload a bike image");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <BiX className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Cloudinary Image Upload */}
          <BikeImageUpload 
            initialImage={formData.imageUrl}
            onImageUpload={handleImageUpload}
          />
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Vehicle Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <div className="mt-1">
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field for registration number - admin only */}
            <div className="sm:col-span-3">
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                Registration Number (Admin Only)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="registrationNumber"
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g. MH01AB1234"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will only be visible to administrators.
                </p>
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700">
                Price per Hour (₹)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="pricePerHour"
                  id="pricePerHour"
                  required
                  min="0"
                  step="0.01"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isAvailable"
                    name="isAvailable"
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isAvailable" className="font-medium text-gray-700">
                    Available for booking
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}