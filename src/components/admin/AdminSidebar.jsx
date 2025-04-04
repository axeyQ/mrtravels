// src/components/admin/AdminSidebar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  BiHome, 
  BiCar, 
  BiCalendarCheck, 
  BiUser, 
  BiBarChartAlt, 
  BiCog, 
  BiLogOut,
  BiMenu,
  BiX
} from "react-icons/bi";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: "Dashboard", icon: <BiHome className="h-5 w-5" />, href: "/admin", exactMatch: true },
    { name: "Bikes", icon: <BiCar className="h-5 w-5" />, href: "/admin/bikes", exactMatch: false },
    { name: "Bookings", icon: <BiCalendarCheck className="h-5 w-5" />, href: "/admin/bookings", exactMatch: false },
    { name: "Users", icon: <BiUser className="h-5 w-5" />, href: "/admin/users", exactMatch: false },
    { name: "Analytics", icon: <BiBarChartAlt className="h-5 w-5" />, href: "/admin/analytics", exactMatch: false },
    { name: "Settings", icon: <BiCog className="h-5 w-5" />, href: "/admin/settings", exactMatch: false },
  ];

  // Function to check if a menu item is active
  const isMenuItemActive = (item) => {
    if (item.exactMatch) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <>
      {/* DESKTOP SIDEBAR - This will only be visible on desktop and won't be affected by mobile styles */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="px-4 py-5 flex flex-col flex-grow">
            <div className="flex items-center flex-shrink-0 px-2">
              <span className="text-xl font-bold text-primary">BikeFlix Admin</span>
            </div>
            <div className="mt-8 flex-1 flex flex-col">
              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const isActive = isMenuItemActive(item);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <BiLogOut className="h-5 w-5" />
                  <span className="ml-3">Exit Admin</span>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU BUTTON - Only visible on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-700"
          aria-label="Open menu"
        >
          <BiMenu className="h-6 w-6" />
        </button>
      </div>
      
      {/* MOBILE TITLE - Center page title on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 py-4 px-12 text-center bg-white shadow-sm z-40">
        <h1 className="text-lg font-bold truncate">
          {menuItems.find(item => isMenuItemActive(item))?.name || "Admin Dashboard"}
        </h1>
      </div>

      {/* MOBILE SIDEBAR - Slide-out menu for mobile only */}
      {isMobile && (
        <>
          {/* Mobile overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          
          {/* Mobile sidebar */}
          <div 
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xl font-bold text-primary">BikeFlix Admin</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500"
              >
                <BiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = isMenuItemActive(item);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BiLogOut className="h-5 w-5" />
                  <span className="ml-3">Exit Admin</span>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* MOBILE BOTTOM NAV - Quick access navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = isMenuItemActive(item);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center p-2 ${
                  isActive ? "text-primary" : "text-gray-600"
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}