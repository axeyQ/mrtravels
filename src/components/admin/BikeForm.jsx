// src/components/admin/BikeForm.jsx
"use client";
import { useState, useEffect } from "react";
import { BiX } from "react-icons/bi";
import BikeImageUpload from "./BikeImageUpload";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";

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
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4">
        <div className="flex justify-between items-center p-4 md:p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <BiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          <form onSubmit={handleSubmit}>
            {/* Cloudinary Image Upload */}
            <BikeImageUpload
              initialImage={formData.imageUrl}
              onImageUpload={handleImageUpload}
            />
            
            <div className="flex justify-center items-center flex-col">
              {/* Responsive grid layout for form fields */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <LabelInputContainer>
                  <Label htmlFor="name">Vehicle Name</Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </LabelInputContainer>
                
                <LabelInputContainer>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    type="text"
                    name="registrationNumber"
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. MH01AB1234"
                  />
                </LabelInputContainer>
                
                <LabelInputContainer>
                  <Label htmlFor="pricePerHour">Price per Hour (₹)</Label>
                  <Input
                    type="number"
                    name="pricePerHour"
                    id="pricePerHour"
                    required
                    min="0"
                    step="5"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                  />
                </LabelInputContainer>
                
                <LabelInputContainer>
                  <Label htmlFor="type">Vehicle Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  >
                    {VEHICLE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </LabelInputContainer>
              </div>
              
              {/* Description field - full width */}
              <div className="mb-4 w-full">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="You can write Vehicle Description here..."
                />
              </div>
              
              {/* Availability toggle */}
              <div className="flex items-center space-x-2 my-2 self-start">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAvailable: checked })
                  }
                />
                <Label htmlFor="isAvailable">Available for Booking</Label>
              </div>
            </div>
            
            {/* Form buttons */}
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
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};