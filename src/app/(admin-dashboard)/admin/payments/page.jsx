// src/app/(admin-dashboard)/admin/payments/page.jsx
"use client";
import { Suspense } from 'react';
import PaymentReconciliation from '@/components/admin/PaymentReconciliation';
import { ClipboardList } from 'lucide-react';

// Loading skeleton
function PaymentReconciliationSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow animate-pulse">
      <div className="p-6 border-b">
        <div className="h-7 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 p-4 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t border-b">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="w-full sm:w-64 h-10 bg-gray-200 rounded mb-4 sm:mb-0"></div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="p-6">
          <div className="border border-gray-200 rounded-md">
            <div className="h-12 bg-gray-100 rounded-t-md"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 border-t border-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payments & Reconciliation</h1>
        <p className="text-gray-600 mt-1">
          Manage and track all payments across the platform
        </p>
      </div>
      
      <Suspense fallback={<PaymentReconciliationSkeleton />}>
        <PaymentReconciliation />
      </Suspense>
      
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-800">Payment Summary</h3>
            <p className="mt-2 text-sm text-blue-700">
              All UPI payments are manually verified by admin. Once the Phase 4 payment gateway 
              integration is complete, this process will be automated for a seamless user experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}