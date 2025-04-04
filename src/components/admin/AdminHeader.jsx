// src/components/admin/AdminHeader.jsx
"use client";
import { BiMenu } from "react-icons/bi";

export default function AdminHeader({ title, toggleSidebar }) {
  return (
    <div className="sticky top-0 z-30 flex w-full items-center justify-between bg-white px-4 py-3 shadow-sm md:px-6">
      {/* Mobile menu toggle button - positioned left */}
      <button
        onClick={toggleSidebar}
        className="md:hidden flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        <BiMenu className="h-6 w-6" />
      </button>
      
      {/* Title - centered for mobile, left-aligned for desktop */}
      <h1 className="absolute left-0 right-0 mx-auto text-center md:static md:mx-0 md:text-left text-xl font-bold">
        {title}
      </h1>
      
      {/* Empty div to balance the header for proper centering */}
      <div className="w-10 md:hidden"></div>
    </div>
  );
}