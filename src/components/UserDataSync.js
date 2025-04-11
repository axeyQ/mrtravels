"use client";

import { useUser } from "@clerk/nextjs";  
import { useEffect, useRef } from "react";  
import { useMutation } from "convex/react";  
import { api } from "../../convex/_generated/api";  
import { toast } from "react-toastify";

export default function UserDataSync() {  
  const { user, isLoaded, isSignedIn } = useUser();  
  const storeUser = useMutation(api.users.storeUser);  
  const syncedRef = useRef(false);
   
  useEffect(() => {  
    const syncUserData = async () => {  
      // Only sync if loaded, signed in, and haven't synced this session yet
      if (isLoaded && isSignedIn && user && !syncedRef.current) {
        syncedRef.current = true; // Mark as synced to prevent repeated calls
        
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
          syncedRef.current = false; // Reset on error to allow retry
        }  
      }  
    };  
     
    syncUserData();

    // When user changes (signs out then in as different user), reset the sync flag
    return () => {
      if (user?.id) {
        syncedRef.current = false;
      }
    };
  }, [isLoaded, isSignedIn, user?.id, storeUser]);  
   
  // This component doesn't render anything  
  return null;  
}