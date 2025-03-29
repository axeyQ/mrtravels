"use client";
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function BikeImageUpload({ initialImage, onImageUpload }) {
  const [imageUrl, setImageUrl] = useState(initialImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Set uploading state
    setIsUploading(true);

    try {
      // Create form data for API request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'bike_images');

      // Upload to Cloudinary via our API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      
      // Set the Cloudinary URL
      setImageUrl(data.url);
      
      // Notify parent component
      onImageUpload(data.url);
      
      toast.success("Bike image uploaded successfully");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Bike Image
      </label>
      
      <div 
        className="relative border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
        onClick={handleImageClick}
      >
        {imageUrl ? (
          <div className="relative h-60 w-full">
            <Image 
              src={imageUrl} 
              alt="Bike preview" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white font-medium">Click to change image</span>
            </div>
          </div>
        ) : (
          <div className={`h-60 flex flex-col items-center justify-center p-6 ${isUploading ? 'bg-gray-100' : ''}`}>
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-gray-500">Uploading image...</p>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-sm text-gray-500">
                  Click to upload bike image
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PNG, JPG or JPEG (max 5MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {imageUrl && (
        <p className="mt-1 text-sm text-gray-500">
          Click the image to change it
        </p>
      )}
    </div>
  );
}