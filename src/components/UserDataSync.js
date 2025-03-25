"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "react-toastify";

export default function UserDataSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const storeUser = useMutation(api.users.storeUser);
  
  useEffect(() => {
    const syncUserData = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Get user's first and last name
          const firstName = user.firstName || "";
          const lastName = user.lastName || "";
          
          // Get user's phone number if available
          const phoneNumber = user.primaryPhoneNumber?.phoneNumber || "";
          
          // Get user's image URL if available
          const imageUrl = user.imageUrl || "";
          
          // Store user data in Convex
          await storeUser({
            userId: user.id,
            firstName,
            lastName,
            phoneNumber,
            imageUrl
          });
          
          console.log("User data synchronized with Convex");
        } catch (error) {
          console.error("Failed to sync user data:", error);
          toast.error("Failed to sync user data");
        }
      }
    };
    
    syncUserData();
  }, [isLoaded, isSignedIn, user, storeUser]);
  
  // This component doesn't render anything
  return null;
}