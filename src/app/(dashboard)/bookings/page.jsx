"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import the component with no SSR
const BookingsPage = dynamic(
  () => import('@/components/dashboard/BookingPage'),
  { ssr: false }
);

// Add a simple loading state
function Loading() {
  return <div className="p-8">Loading bookings...</div>;
}

export default function BookingsPageWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <BookingsPage />
    </Suspense>
  );
}