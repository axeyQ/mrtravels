// src/components/admin/IntegratedReturnProcess.jsx
"use client";
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'react-toastify';
import {
  X, AlertTriangle, Upload, Check, DollarSign, Clock,
  Wrench
} from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

export default function IntegratedReturnProcess({ bookingId, onClose, adminId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("inspection");
  const [inspectionData, setInspectionData] = useState({
    returnInspectionNotes: '',
    returnDamageFound: false,
    damageDescription: '',
    damageImages: [],
    // Keeping these in the state even though we're not displaying them
    // since they're required for the backend
    cleanlinessRating: 5,
    mechanicalRating: 5,
    fuelLevel: 100,
    additionalCharges: 0,
    chargeReason: '',
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  
  // Mutations and queries
  const saveInspection = useMutation(api.bookings.saveReturnInspection);
  const completePayment = useMutation(api.bookings.completePayment);
  const bookingDetails = useQuery(api.bookings.getBikeBookingById, bookingId ? { bookingId } : "skip");
  
  // Get the related bike details
  const bikeDetails = useQuery(
    api.bikes.getBikeById,
    bookingDetails?.bikeId ? { bikeId: bookingDetails.bikeId } : "skip"
  );
  
  // Calculate total amount due
  const totalDue = () => {
    const remainingAmount = bookingDetails?.remainingAmount || 0;
    const additionalCharges = parseFloat(inspectionData.additionalCharges) || 0;
    return (remainingAmount + additionalCharges).toFixed(2);
  };
  
  // Handle input change for inspection form
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
  
  // Handle form submission - this now handles both inspection and payment
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First save the inspection data
      await saveInspection({
        adminId,
        bookingId,
        inspectionData,
      });
      
      // Then complete the payment if there's any amount due
      if (totalDue() > 0) {
        await completePayment({
          adminId,
          bookingId,
          paymentMethod,
        });
      }
      
      toast.success("Vehicle return processed successfully");
      onClose();
    } catch (error) {
      toast.error("Error processing return: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Removed renderRatingStars function as it's no longer needed

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
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Process Vehicle Return</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <h4 className="font-medium">{bikeDetails.name}</h4>
              <p className="text-sm text-gray-500">{bikeDetails.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium">{bookingDetails.userName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Booking Period</p>
              <p className="text-sm font-medium">
                {new Date(bookingDetails.startTime).toLocaleString()} - {new Date(bookingDetails.endTime).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <Tabs defaultValue="inspection" className="w-full" onValueChange={setCurrentTab}>
            <div className="sticky top-0 bg-white border-b z-10">
              <TabsList className="w-full grid grid-cols-2 p-0 m-0">
                <TabsTrigger value="inspection" className="py-3">
                  <div className="flex items-center">
                    <Wrench className="mr-2 h-4 w-4" />
                    <span>Vehicle Inspection</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="payment" className="py-3">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Payment</span>
                    {totalDue() > 0 && (
                      <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                        ₹{totalDue()}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="inspection" className="p-6 pt-4">
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
              
              {/* Removed Vehicle Condition section as requested */}
              
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
                  <div className="mt-2">
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
              
              {/* Next button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentTab("payment")}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
                >
                  Continue to Payment
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="payment" className="p-6">
              {/* Payment Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-medium text-blue-800 mb-4">Payment Summary</h4>
                
                <div className="space-y-3">
                  {bookingDetails.depositAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Deposit Paid:</span>
                      <span className="font-medium">₹{bookingDetails.depositAmount || 0}</span>
                    </div>
                  )}
                  
                  {bookingDetails.remainingAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Remaining Balance:</span>
                      <span className="font-medium">₹{bookingDetails.remainingAmount || 0}</span>
                    </div>
                  )}
                  
                  {inspectionData.additionalCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Additional Charges:</span>
                      <span className="font-medium">₹{inspectionData.additionalCharges}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 mt-2 border-t border-blue-200">
                    <div className="flex justify-between font-bold text-blue-800">
                      <span>Total Due Now:</span>
                      <span>₹{totalDue()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Method Selection */}
              {totalDue() > 0 ? (
                <div className="mb-6">
                  <Label className="block text-base font-medium text-gray-700 mb-3">
                    Select Payment Method
                  </Label>
                  
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center">
                        <span className="bg-green-100 p-2 rounded-full mr-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </span>
                        Cash
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phonepe" id="phonepe" />
                      <Label htmlFor="phonepe" className="flex items-center">
                        <span className="bg-indigo-100 p-2 rounded-full mr-2">
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-indigo-600">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#6366F1" />
                            <path d="M8 14l4-8 4 8-4-2-4 2z" fill="white" stroke="white" />
                          </svg>
                        </span>
                        PhonePe
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="flex items-center">
                        <span className="bg-gray-100 p-2 rounded-full mr-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                        </span>
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium text-green-800">No payment due</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This booking is fully paid, and no additional charges are applied.
                  </p>
                </div>
              )}
              
              {/* Back button */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab("inspection")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back to Inspection
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Complete Return Process
                    </>
                  )}
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
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