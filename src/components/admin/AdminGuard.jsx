"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [isChecking, setIsChecking] = useState(true);
  
  // Only make the query if the user is signed in
  const isAdmin = useQuery(
    api.users.isAdmin,
    isUserLoaded && isSignedIn ? { userId: user.id } : "skip" // Use "skip" instead of null
  );
  
  useEffect(() => {
    // If user has loaded and user is not signed in, redirect
    if (isUserLoaded && !isSignedIn) {
      router.push("/unauthorized");
      return;
    }
    
    // If user is loaded, signed in, and we have a response from isAdmin query
    if (isUserLoaded && isSignedIn && isAdmin !== undefined) {
      // If not admin, redirect
      if (isAdmin === false) {
        router.push("/unauthorized");
        return;
      }
      
      // If admin or still checking, update state
      setIsChecking(false);
    }
  }, [isUserLoaded, isSignedIn, isAdmin, router, user]);
  
  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }
  
  return children;
}