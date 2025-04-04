"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStoreStatus } from '@/lib/storeStatusContext';
import StoreClosedPage from '@/components/pages/StoreClosedPage';
import { useUser } from '@clerk/nextjs';

// Non-protected routes that should be accessible even when store is closed
const publicRoutes = [
  '/',              // Home page
  '/contact',       // Contact page
  '/terms',         // Terms page
  '/refund-policy', // Refund policy page 
  '/sign-in',       // Auth pages
  '/sign-up',
  '/profile'
];

// Admin routes that should always be accessible
const isAdminRoute = (pathname) => {
  return pathname.startsWith('/admin');
};

export default function StoreStatusCheck({ children }) {
  const { isStoreOpen, isLoading } = useStoreStatus();
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get user role - admin or regular user
  const isAdmin = isLoaded && isSignedIn && user?.publicMetadata?.role === 'admin';
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Allow access if:
  // 1. Still loading store status
  // 2. Store is open
  // 3. Current route is a public route
  // 4. Current route is an admin route and user is admin
  const allowAccess = isLoading || 
                      isStoreOpen || 
                      isPublicRoute || 
                      (isAdminRoute(pathname) && isAdmin);
  
  // If access is not allowed, show store closed page
  if (!allowAccess) {
    return <StoreClosedPage />;
  }
  
  // Otherwise, render children normally
  return children;
}