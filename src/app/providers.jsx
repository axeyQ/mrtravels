"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useState } from "react";
import ProfilePictureSync from "@/components/auth/ProfilePictureSync";
import ActivityLogger from "@/components/utils/ActivityLogger";
import { StoreStatusProvider } from "@/lib/storeStatusContext";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function Providers({ children }) {
  const [convex] = useState(() => new ConvexReactClient(convexUrl));

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
       <ActivityLogger/>        
       <ProfilePictureSync/>
       <StoreStatusProvider>
        {children}
       </StoreStatusProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}