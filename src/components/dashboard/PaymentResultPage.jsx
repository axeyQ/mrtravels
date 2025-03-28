// Create a new file: src/components/dashboard/PaymentResultPage.jsx

"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'success';
  
  // Redirect to bookings after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/bookings');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'success' ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
            <p className="mt-2 text-gray-600">
              Your booking has been confirmed. A confirmation has been sent to your phone.
            </p>
            <div className="bg-green-50 p-4 rounded-md mt-4">
              <p className="text-sm text-green-800">
                Your deposit payment of ₹42 has been processed successfully.
              </p>
              <p className="text-sm text-green-800 mt-1">
                The remaining balance will be collected when you return the bike.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Payment Failed</h2>
            <p className="mt-2 text-gray-600">
              We couldn&apos;t process your payment. Your booking has not been confirmed.
            </p>
            <div className="bg-red-50 p-4 rounded-md mt-4">
              <p className="text-sm text-red-800">
                Please try again or contact customer support if you continue experiencing issues.
              </p>
            </div>
          </motion.div>
        )}
        
        <div className="mt-6 flex flex-col space-y-4">
          <Link
            href="/bookings"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            View My Bookings
          </Link>
          <Link
            href="/bikes"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Browse More Bikes
          </Link>
        </div>
        
        <p className="mt-4 text-sm text-gray-500">
          You will be redirected to your bookings in a few seconds...
        </p>
      </div>
    </div>
  );
}