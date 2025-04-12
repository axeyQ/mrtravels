"use client";
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'react-toastify';
import { 
  Star, X, AlertTriangle, Upload, Check, Wrench,
  Droplet, ThumbsUp, ThumbsDown, DollarSign
} from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

export default function VehicleReturnInspection({ bookingId, onClose, adminId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inspectionData, setInspectionData] = useState({
    returnInspectionNotes: '',
    returnDamageFound: false,
    damageDescription: '',
    damageImages: [],
    cleanlinessRating: 5,
    mechanicalRating: 5,
    fuelLevel: 100,
    additionalCharges: 0,
    chargeReason: '',
  });
  
  // Mutations and queries - FIXED to avoid conditional hooks
  const saveInspection = useMutation(api.bookings.saveReturnInspection);
  const bookingDetails = useQuery(api.bookings.getBikeBookingById, bookingId ? { bookingId } : "skip");
  
  // Fixed this line to avoid conditional hook usage
  const bikeDetails = useQuery(
    api.bikes.getBikeById, 
    bookingDetails?.bikeId ? { bikeId: bookingDetails.bikeId } : "skip"
  );
  
  // Handle input change
  const handleChange = (field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Toggle damage found
  const toggleDamageFound = () => {
    const newValue = !inspectionData.returnDamageFound;
    setInspectionData(prev => ({
      ...prev,
      returnDamageFound: newValue,
      // Reset damage description if no damage
      damageDescription: newValue ? prev.damageDescription : '',
    }));
  };
  
  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const uploadedUrls = [];
    setIsSubmitting(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'damage_images');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      if (uploadedUrls.length > 0) {
        setInspectionData(prev => ({
          ...prev,
          damageImages: [...prev.damageImages, ...uploadedUrls]
        }));
        toast.success(`${uploadedUrls.length} images uploaded`);
      }
    } catch (error) {
      toast.error("Error uploading images: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Remove uploaded image
  const removeImage = (index) => {
    setInspectionData(prev => ({
      ...prev,
      damageImages: prev.damageImages.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await saveInspection({
        adminId,
        bookingId,
        inspectionData,
      });
      
      toast.success("Vehicle inspection saved successfully");
      onClose();
    } catch (error) {
      toast.error("Error saving inspection: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render stars for ratings
  const renderRatingStars = (rating, field) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleChange(field, star)}
            className={`${
              star <= inspectionData[field] 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } focus:outline-none p-1`}
          >
            <Star className="h-5 w-5" fill={star <= inspectionData[field] ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    );
  };

  // Loading state
  if (!bookingDetails || !bikeDetails) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex justify-center items-center py-12">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Vehicle Return Inspection</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Booking Details Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{bikeDetails.name}</h4>
                <p className="text-sm text-gray-500">{bikeDetails.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="text-sm font-medium">{bookingId.substring(0, 8)}...</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between">

              <div>
                <p className="text-gray-500">Booked By</p>
                <p className="font-medium">{bookingDetails.userName}</p>
              </div>
              <div>
                <p className="text-gray-500">Return Date</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {/* Damage Section */}
          <div className="mb-6">
            <div className="flex items-start mb-2">
              <div className="flex h-5 items-center">
                <input
                  id="damageToggle"
                  type="checkbox"
                  checked={inspectionData.returnDamageFound}
                  onChange={toggleDamageFound}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm flex items-center">
                <AlertTriangle 
                  className={`h-4 w-4 mr-1 ${inspectionData.returnDamageFound ? 'text-red-500' : 'text-gray-400'}`} 
                />
                <label htmlFor="damageToggle" className="font-medium text-gray-700">
                  Damage found during inspection
                </label>
              </div>
            </div>
            
            
            {inspectionData.returnDamageFound && (
              <div className="mt-3 space-y-4">
                <div>
                  <Label htmlFor="damageDescription" className="block text-sm font-medium text-gray-700">
                    Damage Description
                  </Label>
                  <Textarea
                    id="damageDescription"
                    rows={3}
                    value={inspectionData.damageDescription}
                    onChange={(e) => handleChange('damageDescription', e.target.value)}
                    placeholder="Describe the damage in detail..."
                  />
                </div>
                
                {/* Damage Images */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Damage Photos
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                        id="damagePhotoUpload"
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="damagePhotoUpload"
                        className="inline-flex items-center text-sm text-primary hover:text-primary-600 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Photos
                      </label>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  {inspectionData.damageImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {inspectionData.damageImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square w-full rounded-md border border-gray-200 overflow-hidden">
                            <img src={url} alt={`Damage ${index+1}`} className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Vehicle Condition Ratings */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium mb-4">Vehicle Condition</h4>
            
            <div className="space-y-4">
              {/* Cleanliness Rating */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Cleanliness</span>
                </div>
                {renderRatingStars(inspectionData.cleanlinessRating, 'cleanlinessRating')}
              </div>
              
              {/* Mechanical Rating */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Wrench className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Mechanical Condition</span>
                </div>
                {renderRatingStars(inspectionData.mechanicalRating, 'mechanicalRating')}
              </div>
              
              {/* Fuel Level */}
              <div>
                <div className="flex items-center mb-2">
                  <Droplet className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Fuel Level: {inspectionData.fuelLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={inspectionData.fuelLevel}
                  onChange={(e) => handleChange('fuelLevel', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          {/* Additional Charges */}
          <div className="mb-6">
          <LabelInputContainer>
              <Label htmlFor="additionalCharges" >
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                  Additional Charges (₹)
                </div>
              </Label>
              <Input
                type="number"
                id="additionalCharges"
                min="0"
                step="10"
                value={inspectionData.additionalCharges}
                onChange={(e) => handleChange('additionalCharges', Number(e.target.value))}
              />
                
                </LabelInputContainer>
            {inspectionData.additionalCharges > 0 && (
              <div>
                <label htmlFor="chargeReason" className="block text-sm font-medium text-gray-700">
                  Reason for Additional Charges
                </label>
                <input
                  type="text"
                  id="chargeReason"
                  value={inspectionData.chargeReason}
                  onChange={(e) => handleChange('chargeReason', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="e.g., Late return fee, cleaning fee, etc."
                />
              </div>
            )}
          </div>
          
          {/* General Notes */}
          <div className="mb-6">
            <Label htmlFor="returnInspectionNotes" className="block text-sm font-medium text-gray-700">
              Inspection Notes
            </Label>
            <Textarea
              id="returnInspectionNotes"
              rows={3}
              value={inspectionData.returnInspectionNotes}
              onChange={(e) => handleChange('returnInspectionNotes', e.target.value)}
              placeholder="Any additional notes about the vehicle condition..."
            />
          </div>
        </form>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Complete Inspection
              </>
            )}
          </button>
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