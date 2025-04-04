"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function StoreClosedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md"
      >
        <div className="mb-6 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v2m0 0v2m0-2h2m-2 0H9m3-10v2m0 0v2m0-2h2m-2 0H9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Currently Closed</h1>
        
        <p className="text-gray-600 mb-6">
          We&apos;re sorry, but our bike rental service is currently closed. Please check back during our regular business hours to make a booking.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="font-medium text-gray-700 mb-2">Business Hours</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Monday - Friday:</span>
              <span className="font-medium">9:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Saturday:</span>
              <span className="font-medium">10:00 AM - 4:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sunday:</span>
              <span className="font-medium">Closed</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/"
            className="inline-block w-full bg-primary hover:bg-primary-600 text-white font-medium py-2 px-4 rounded"
          >
            Return to Home
          </Link>
          
          <Link 
            href="/contact"
            className="inline-block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded"
          >
            Contact Us
          </Link>
        </div>
      </motion.div>
    </div>
  );
}