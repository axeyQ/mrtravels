"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function Navbar() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Only check profile completion if user is signed in
  const isProfileComplete = useQuery(
    api.users.isProfileComplete,
    isLoaded && isSignedIn && user ? { userId: user.id } : "skip"
  );
  
  // We'll handle admin check separately to avoid the Convex query error
  useEffect(() => {
    // Only check admin status if the user is signed in
    if (isLoaded && isSignedIn && user) {
      // You can implement admin check here using localStorage or another method
      // For now, we'll just set it to false to avoid the error
      setIsAdmin(false);
    } else {
      setIsAdmin(false);
    }
  }, [isLoaded, isSignedIn, user]);
  
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm sticky top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                BikeFlix
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/bikes"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-primary hover:text-gray-700"
              >
                Browse Bikes
              </Link>
              {isLoaded && isSignedIn && (
                <>
                  <Link
                    href="/bookings"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-primary hover:text-gray-700"
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/profile"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-primary hover:text-gray-700"
                  >
                    My Profile
                    {isProfileComplete === false && (
                      <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Link>
                </>
              )}
              {isLoaded && isSignedIn && isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-primary hover:text-gray-700"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoaded && isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden"
          id="mobile-menu"
        >
          <div className="space-y-1 pt-2 pb-3">
            <Link
              href="/bikes"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Bikes
            </Link>
            {isLoaded && isSignedIn && (
              <>
                <Link
                  href="/bookings"
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  href="/profile"
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                  {isProfileComplete === false && (
                    <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              </>
            )}
            {isLoaded && isSignedIn && isAdmin && (
              <Link
                href="/admin"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
          <div className="border-t border-gray-200 pt-4 pb-3">
            {isLoaded && isSignedIn ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user?.imageUrl || "/placeholder-avatar.png"}
                    alt="Profile"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.primaryPhoneNumber?.phoneNumber}
                  </div>
                </div>
                <div className="ml-auto">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-around mt-3 px-4">
                <Link
                  href="/sign-in"
                  className="flex-1 mr-2 rounded-md border border-transparent bg-white px-4 py-2 text-center text-sm font-medium text-primary hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="flex-1 rounded-md border border-transparent bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}