"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BikeCard({ bike }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/bikes/${bike._id}`}>
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={bike.imageUrl || '/placeholder-bike.jpg'}
            alt={bike.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
          {!bike.isAvailable && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
              Not Available
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">{bike.name}</h3>
            <span className="text-primary font-bold">${bike.pricePerHour}/hr</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{bike.type}</p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{bike.description}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">{bike.location}</span>
            <motion.span
              className="text-primary text-sm font-semibold"
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              View Details →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}