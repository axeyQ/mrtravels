// src/components/admin/ResponsiveTable.jsx
"use client";
import { useState, useEffect } from 'react';

export default function ResponsiveTable({ 
  headers, 
  data, 
  renderRow, 
  renderMobileCard, 
  emptyMessage = "No data available",
  isLoading = false 
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-8 w-1/4 rounded mb-6"></div>
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <div className="grid grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-200 h-6 rounded col-span-1"></div>
              ))}
            </div>
          </div>
          <div className="p-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="border-b last:border-0 border-gray-200 py-4 grid grid-cols-6 gap-4">
                {Array(6).fill(0).map((_, j) => (
                  <div key={j} className="bg-gray-200 h-6 rounded col-span-1"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">{emptyMessage}</p>
      </div>
    );
  }

  if (isMobile) {
    // Mobile card view
    return (
      <div className="space-y-4">
        {data.map((item, index) => renderMobileCard(item, index))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
}