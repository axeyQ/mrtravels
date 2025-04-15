// src/components/shared/Footer.jsx
'use client';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ChevronDown, Github, Linkedin, Globe } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Toggle mobile accordion sections
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <footer className="bg-white border-t">
      {/* Mobile Footer with Accordions */}
      <div className="md:hidden border-b">
        {/* Company Info */}
        <div className="border-b">
          <button 
            onClick={() => toggleSection('company')}
            className="flex w-full justify-between items-center p-4"
          >
            <span className="font-semibold">About ZipBikes</span>
            <ChevronDown 
              className={`h-5 w-5 text-gray-500 transition-transform ${
                expandedSection === 'company' ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSection === 'company' && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-500 mb-4">
                ZipBikes offers convenient bike rentals for your daily commute or adventure. 
                Book bikes easily through our platform.
              </p>
              <div className="flex flex-col space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  <span>+91 8982611817, +91 8120291777</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary" />
                  <span>mrtravels1817@gmail.com</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>WARD NO 3, NEAR IISER COLLEGE, BOURI, HUZUR, Bhopal</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Links */}
        <div className="border-b">
          <button 
            onClick={() => toggleSection('links')}
            className="flex w-full justify-between items-center p-4"
          >
            <span className="font-semibold">Quick Links</span>
            <ChevronDown 
              className={`h-5 w-5 text-gray-500 transition-transform ${
                expandedSection === 'links' ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSection === 'links' && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-primary">
                Home
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-primary">
                Terms & Conditions
              </Link>
             
              <Link href="/contact" className="text-sm text-gray-500 hover:text-primary">
                Contact Us
              </Link>
              
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary">
                Privacy Policy
              </Link> 
              <Link href="/bikes" className="text-sm text-gray-500 hover:text-primary">
                Bikes
              </Link>
              <Link href="/refund-policy" className="text-sm text-gray-500 hover:text-primary">
                Refund Policy
              </Link>
            </div>
          )}
        </div>
        
        {/* Business Hours */}
        <div>
          <button 
            onClick={() => toggleSection('hours')}
            className="flex w-full justify-between items-center p-4"
          >
            <span className="font-semibold">Business Hours</span>
            <ChevronDown 
              className={`h-5 w-5 text-gray-500 transition-transform ${
                expandedSection === 'hours' ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSection === 'hours' && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-500">
                Open 7 Days a Week <br />
                <span className="font-medium">9:00 AM - 10:00 PM</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Social Links */}
        <div className="p-4 flex justify-center space-x-6">
        <Link href="https://github.com/axeyQ" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800">
    <span className="sr-only">GitHub</span>
    <Github className="h-6 w-6" />
  </Link>
  <Link href="https://linkedin.com/in/your-linkedin-profile" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700">
    <span className="sr-only">LinkedIn</span>
    <Linkedin className="h-6 w-6" />
  </Link>
  <Link href="https://axeyqs.vercel.app" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-600">
    <span className="sr-only">Portfolio</span>
    <Globe className="h-6 w-6" />
  </Link>
        </div>
      </div>
      
      {/* Desktop Footer */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About ZipBikes</h3>
            <p className="text-gray-500 mb-4">
              ZipBikes offers convenient bike rentals for your daily commute or adventure. 
              Book bikes easily through our platform and enjoy a hassle-free riding experience.
            </p>
            <div className="space-y-2 text-gray-500">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <span>+91 7909611817</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <span>mrtravels1817@gmail.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>WARD NO 3, NEAR IISER COLLEGE, BOURI, HUZUR, Bhopal, SHOP NO 2,
                Madhya Pradesh, PIN: 462030</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/bikes" className="text-gray-500 hover:text-primary">
                  Browse Bikes
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-500 hover:text-primary">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-500 hover:text-primary">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-primary">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-500 hover:text-primary">
                  Refund Policy
                </Link>
              </li>
            </ul>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Business Hours</h3>
            <p className="text-gray-500">
              Open 7 Days a Week<br />
              <span className="font-medium">9:00 AM - 10:00 PM</span>
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} ZipBikes. by M.R Travels And Rental Services All rights reserved.
          </p>
          
          <div className="flex justify-center space-x-6 mt-4 md:mt-0">
  <Link href="https://github.com/axeyQ" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800">
    <span className="sr-only">GitHub</span>
    <Github className="h-6 w-6" />
  </Link>
  <Link href="https://linkedin.com/in/your-linkedin-profile" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700">
    <span className="sr-only">LinkedIn</span>
    <Linkedin className="h-6 w-6" />
  </Link>
  <Link href="https://your-portfolio-website.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-600">
    <span className="sr-only">Portfolio</span>
    <Globe className="h-6 w-6" />
  </Link>
</div>
        </div>
      </div>
      
      {/* Copyright - Mobile */}
      <div className="md:hidden py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} ZipBikes. by MR Travels and Rental Services | All rights reserved
      </div>
    </footer>
  );
}