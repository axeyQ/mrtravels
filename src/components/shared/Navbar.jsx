// src/components/shared/Navbar.jsx  
"use client";

import { useState, useEffect } from 'react';  
import Link from 'next/link';  
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';  
import { UserButton } from '@clerk/nextjs';  
import { motion } from 'framer-motion';  
import { Home, Bike, Calendar, User, Menu, X } from 'lucide-react';  
import { usePathname } from 'next/navigation';

export default function Navbar() {  
  const { user, isSignedIn, isLoaded } = useUser();  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  
  const [isAdmin, setIsAdmin] = useState(false);  
  const pathname = usePathname();  
   
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
    <>  
      {/* Top Navbar */}  
      <motion.nav  
        initial={{ y: -20, opacity: 0 }}  
        animate={{ y: 0, opacity: 1 }}  
        className="bg-white shadow-sm sticky top-0 z-50"  
      >  
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">  
          <div className="flex h-16 justify-between">  
            <div className="flex">  
              <div className="flex flex-shrink-0 items-center">  
                <Link href="/" className="text-xl text-red-400 font-bold text-primary">  
                  Zip<span className=' font-thin text-black'>Bikes</span> 
                </Link>  
              </div>  
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">  
                <Link  
                  href="/bikes"  
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${  
                    pathname === '/bikes' || pathname.startsWith('/bikes/')  
                      ? 'border-b-2 border-primary text-gray-900'  
                      : 'border-b-2 border-transparent text-gray-500 hover:border-primary hover:text-gray-700'  
                  }`}  
                >  
                  Browse Bikes  
                </Link>  
                 
                {isSignedIn && (  
                  <Link  
                    href="/bookings"  
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${  
                      pathname === '/bookings'  
                        ? 'border-b-2 border-primary text-gray-900'  
                        : 'border-b-2 border-transparent text-gray-500 hover:border-primary hover:text-gray-700'  
                    }`}  
                  >  
                    My Bookings  
                  </Link>  
                )}  
                 
                {isSignedIn && isAdmin && (  
                  <Link  
                    href="/admin"  
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${  
                      pathname === '/admin' || pathname.startsWith('/admin/')  
                        ? 'border-b-2 border-primary text-gray-900'  
                        : 'border-b-2 border-transparent text-gray-500 hover:border-primary hover:text-gray-700'  
                    }`}  
                  >  
                    Admin Panel  
                  </Link>  
                )}  
              </div>  
            </div>  
            <div className="hidden sm:ml-6 sm:flex sm:items-center">  
              {isSignedIn ? (  
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
                  <Menu className="block h-6 w-6" aria-hidden="true" />  
                ) : (  
                  <X className="block h-6 w-6" aria-hidden="true" />  
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
                className={`block py-2 pl-3 pr-4 text-base font-medium ${  
                  pathname === '/bikes' || pathname.startsWith('/bikes/')  
                    ? 'border-l-4 border-primary bg-primary-50 text-primary'  
                    : 'border-l-4 border-transparent text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700'  
                }`}  
                onClick={() => setIsMobileMenuOpen(false)}  
              >  
                Browse Bikes  
              </Link>  
               
              {isSignedIn && (  
                <Link  
                  href="/bookings"  
                  className={`block py-2 pl-3 pr-4 text-base font-medium ${  
                    pathname === '/bookings'  
                      ? 'border-l-4 border-primary bg-primary-50 text-primary'  
                      : 'border-l-4 border-transparent text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700'  
                  }`}  
                  onClick={() => setIsMobileMenuOpen(false)}  
                >  
                  My Bookings  
                </Link>  
              )}  
               
              {isSignedIn && (  
                <Link  
                  href="/profile"  
                  className={`block py-2 pl-3 pr-4 text-base font-medium ${  
                    pathname === '/profile'  
                      ? 'border-l-4 border-primary bg-primary-50 text-primary'  
                      : 'border-l-4 border-transparent text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700'  
                  }`}  
                  onClick={() => setIsMobileMenuOpen(false)}  
                >  
                  My Profile  
                </Link>  
              )}  
               
              {isSignedIn && isAdmin && (  
                <Link  
                  href="/admin"  
                  className={`block py-2 pl-3 pr-4 text-base font-medium ${  
                    pathname === '/admin' || pathname.startsWith('/admin/')  
                      ? 'border-l-4 border-primary bg-primary-50 text-primary'  
                      : 'border-l-4 border-transparent text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700'  
                  }`}  
                  onClick={() => setIsMobileMenuOpen(false)}  
                >  
                  Admin Panel  
                </Link>  
              )}  
               
              <Link  
                href="/contact"  
                className={`block py-2 pl-3 pr-4 text-base font-medium ${  
                  pathname === '/contact'  
                    ? 'border-l-4 border-primary bg-primary-50 text-primary'  
                    : 'border-l-4 border-transparent text-gray-500 hover:border-primary hover:bg-gray-50 hover:text-gray-700'  
                }`}  
                onClick={() => setIsMobileMenuOpen(false)}  
              >  
                Contact Us  
              </Link>  
            </div>  
            <div className="border-t border-gray-200 pt-4 pb-3">  
              {isSignedIn ? (  
                <div className="flex items-center px-4">  
                  <div className="flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden">  
                    <Image  
                      src={user?.imageUrl || "/placeholder-avatar.png"}  
                      alt="Profile"  
                      fill
                      className="object-cover"  
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
       
      {/* Bottom mobile navigation bar */}  
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t z-40 border-t border-gray-200">  
        <div className="flex justify-around">  
          <Link  
            href="/"  
            className={`flex flex-col items-center justify-center py-2 flex-1 ${  
              pathname === '/' ? 'text-primary' : 'text-gray-500'  
            }`}  
          >  
            <Home className="h-6 w-6" />  
            <span className="text-xs mt-1">Home</span>  
          </Link>  
           
          <Link  
            href="/bikes"  
            className={`flex flex-col items-center justify-center py-2 flex-1 ${  
              pathname === '/bikes' || pathname.startsWith('/bikes/') ? 'text-primary' : 'text-gray-500'  
            }`}  
          >  
            <Bike className="h-6 w-6" />  
            <span className="text-xs mt-1">Bikes</span>  
          </Link>  
           
          {isSignedIn && (  
            <Link  
              href="/bookings"  
              className={`flex flex-col items-center justify-center py-2 flex-1 ${  
                pathname === '/bookings' ? 'text-primary' : 'text-gray-500'  
              }`}  
            >  
              <Calendar className="h-6 w-6" />  
              <span className="text-xs mt-1">Bookings</span>  
            </Link>  
          )}  
           
          {isSignedIn ? (  
            <Link  
              href="/profile"  
              className={`flex flex-col items-center justify-center py-2 flex-1 ${  
                pathname === '/profile' ? 'text-primary' : 'text-gray-500'  
              }`}  
            >  
              <User className="h-6 w-6" />  
              <span className="text-xs mt-1">Profile</span>  
            </Link>  
          ) : (  
            <Link  
              href="/sign-in"  
              className="flex flex-col items-center justify-center py-2 flex-1 text-gray-500"  
            >  
              <User className="h-6 w-6" />  
              <span className="text-xs mt-1">Login</span>  
            </Link>  
          )}  
        </div>  
      </div>  
       
      {/* Add padding to bottom of content on mobile */}  
      <div className="sm:hidden h-16"></div>  
    </>  
  );  
}