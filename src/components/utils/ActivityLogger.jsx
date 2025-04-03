"use client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function ActivityLogger() {
  const { user, isLoaded, isSignedIn } = useUser();
  const logUserActivity = useMutation(api.userActivities.logUserActivity);
  
  // Log user login
  useEffect(() => {
    const logLoginActivity = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Get IP address from a service like ipify
          let ipAddress = "unknown";
          try {
            const ipResponse = await fetch("https://api.ipify.org?format=json");
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              ipAddress = ipData.ip;
            }
          } catch (ipError) {
            console.error("Failed to get IP address:", ipError);
          }
          
          // Log the login activity
          await logUserActivity({
            userId: user.id,
            action: "login",
            details: JSON.stringify({
              timestamp: new Date().toISOString(),
            }),
            ipAddress,
            userAgent: navigator.userAgent,
          });
          
          console.log("Login activity logged");
        } catch (error) {
          console.error("Failed to log login activity:", error);
        }
      }
    };
    
    logLoginActivity();
  }, [isLoaded, isSignedIn, user, logUserActivity]);
  
  // This component doesn't render anything
  return null;
}

// Utility function to log user activities - can be imported and used in other components
export const logActivity = async (logUserActivity, userId, action, details) => {
  if (!userId || !action) return;
  
  try {
    // Get IP address from ipify
    let ipAddress = "unknown";
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      }
    } catch (ipError) {
      console.error("Failed to get IP address:", ipError);
    }
    
    // Log the activity
    await logUserActivity({
      userId,
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      ipAddress,
      userAgent: navigator.userAgent,
    });
    
    console.log(`Activity ${action} logged for user ${userId}`);
  } catch (error) {
    console.error(`Failed to log activity ${action}:`, error);
  }
};