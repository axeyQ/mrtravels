// src/app/(dashboard)/payment-simulation/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PaymentSimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get all query parameters
  const order_id = searchParams.get('order_id');
  const session_id = searchParams.get('session_id');
  const booking_id = searchParams.get('booking_id') || searchParams.get('bookingId');
  const action = searchParams.get('action');
  
  // Redirect to the API endpoint for simulation handling
  useEffect(() => {
    // Construct the redirect URL with all parameters
    let redirectUrl = `/api/payment-simulation?`;
    
    if (order_id) redirectUrl += `order_id=${order_id}&`;
    if (session_id) redirectUrl += `session_id=${session_id}&`;
    if (booking_id) redirectUrl += `booking_id=${booking_id}&`;
    if (action) redirectUrl += `action=${action}`;
    
    // Remove trailing & if exists
    redirectUrl = redirectUrl.endsWith('&') 
      ? redirectUrl.slice(0, -1) 
      : redirectUrl;
      
    // Redirect to the API endpoint
    router.push(redirectUrl);
  }, [order_id, session_id, booking_id, action, router]);
  
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