"use client";
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function CloudinaryDocumentUpload({
  label,
  onChange,
  value,
  helpText,
  id,
  folder = "user_documents",
  acceptTypes = "image/jpeg,image/png,image/jpg"
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const fileInputRef = useRef(null);

  // Update preview URL when value prop changes
  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileClick = () => {
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
    
    // Create a preview of the image (for local UI)
    const reader = new FileReader();
    reader.onloadend = () => {
      // This is just for the local preview, not for storage
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      // Create form data for API request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
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
      
      // Call onChange with the Cloudinary URL
      onChange(data.url);
      
      // Update preview with the Cloudinary URL
      setPreviewUrl(data.url);
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error uploading document');
      
      // If upload fails, clear the preview
      setPreviewUrl(value); // Revert to original value if upload fails
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {helpText && <span className="text-xs text-gray-500">({helpText})</span>}
      </label>
      
      {previewUrl ? (
        <div className="relative border rounded-md overflow-hidden h-60 bg-gray-100">
          {typeof previewUrl === 'string' && (
            <div className="relative w-full h-full">
              <Image
                src={previewUrl}
                alt={`${label} preview`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleFileClick}
          className="border-2 border-dashed border-gray-300 rounded-md p-6 mt-1 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-500">Uploading to Cloudinary...</p>
            </div>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-500">
                Click to upload {label.toLowerCase()}
              </span>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG or JPEG (max 5MB)
              </p>
            </>
          )}
        </div>
      )}
      
      <input
        id={id}
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Upload ${label}`}
      />
    </div>
  );
}