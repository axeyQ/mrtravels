// src/components/auth/ProfilePictureSync.jsx
"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";

export default function ProfilePictureSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  
  // Get user data from Convex
  const userData = useQuery(
    api.users.getUser,
    isLoaded && isSignedIn ? { userId: user?.id } : "skip"
  );

  // Synchronize profile picture with Clerk when user data changes
  useEffect(() => {
    const syncProfilePicture = async () => {
      if (
        isLoaded && 
        isSignedIn && 
        user && 
        userData && 
        userData.profilePictureUrl && 
        userData.profilePictureUrl !== user.imageUrl
      ) {
        try {
          // Update Clerk user profile image
          await user.setProfileImage({ 
            file: await fetchImageAsFile(userData.profilePictureUrl) 
          });
          console.log("Profile picture synced with Clerk");
        } catch (error) {
          console.error("Failed to sync profile picture with Clerk:", error);
        }
      }
    };
    
    syncProfilePicture();
  }, [userData, user, isLoaded, isSignedIn]);

  // Helper function to fetch an image and convert it to a File object
  async function fetchImageAsFile(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      // Create a File from the blob
      return new File([blob], "profile-picture.jpg", { type: blob.type });
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;
    }
  }

  // This component doesn't render anything
  return null;
}