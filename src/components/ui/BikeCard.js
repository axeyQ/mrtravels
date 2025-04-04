// src/components/dashboard/BikeCard.jsx
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Info } from 'lucide-react';

export default function BikeCard({ bike, selectedTimeRange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col"
    >
      <div className="relative h-36 sm:h-48">
        <Image
          src={bike.imageUrl || '/placeholder-bike.jpg'}
          alt={bike.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
        />
        {/* Price tag */}
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg font-medium">
          ₹{bike.pricePerHour}/hr
        </div>
      </div>
      <div className="p-3 sm:p-4 flex-grow flex flex-col">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{bike.name}</h3>
        <div className="flex items-center mb-2 flex-wrap gap-1">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {bike.type}
          </span>
          {bike.location && (
            <span className="flex items-center text-xs text-gray-500 ml-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{bike.location}</span>
            </span>
          )}
        </div>
        {bike.description !== "" ? (
          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2">
            {bike.description || 'No description available'}
          </p>
        ) : null}
        <div className="flex justify-between items-center mt-auto">
          <div className="text-xs sm:text-sm">
            {bike.features && bike.features.length > 0 ? (
              <span className="text-gray-600">{bike.features.length} features</span>
            ) : null}
          </div>
          <Link
            href={`/bikes/${bike._id}`}
            className="px-3 py-1 rounded-md text-xs sm:text-sm font-medium bg-primary text-white hover:bg-primary-600 flex items-center"
          >
            Book Now
            <Info className="h-3 w-3 ml-1 hidden sm:inline" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}