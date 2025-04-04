// src/app/(dashboard)/payment-simulation/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

// Separate component that uses useSearchParams
function PaymentSimulationContent() {
  const router = useRouter();
  
  // Simulate redirection to API endpoint
  useEffect(() => {
    // Construct the redirect URL based on the current URL
    // This avoids direct usage of useSearchParams in the main component
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    let redirectUrl = `/api/payment-simulation?`;
    
    // Copy all search params to the new URL
    for (const [key, value] of url.searchParams.entries()) {
      redirectUrl += `${key}=${value}&`;
    }
    
    // Remove trailing & if exists
    redirectUrl = redirectUrl.endsWith('&')
      ? redirectUrl.slice(0, -1)
      : redirectUrl;

    // Redirect to the API endpoint
    router.push(redirectUrl);
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Redirecting to payment simulation...</p>
      </motion.div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSimulationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading payment details...</p>
      </div>
    }>
      <PaymentSimulationContent />
    </Suspense>
  );
}