"use client";

import dynamic from 'next/dynamic'
import { Suspense } from 'react';
import Link from 'next/link';

// Dynamically import the BookingPage component with no SSR
const BookingPageComponent = dynamic(
  () => import('@/components/dashboard/BookingPage'),
  { ssr: false }
);

// Add a loading state
function BookingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/4"></div>
      </div>
      <div className="mb-8">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/6 mb-4"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-20 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="ml-4">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsLoading />}>
      <BookingPageComponent />
    </Suspense>
  );
}