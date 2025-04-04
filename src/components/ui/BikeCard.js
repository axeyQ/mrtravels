"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function BikeCard({ bike, isBooked = false, isReallyAvailable = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-md overflow-hidden ${!isReallyAvailable ? 'opacity-75' : ''}`}
    >
      <div className="relative h-48">
        <Image
          src={bike.imageUrl || '/placeholder-bike.jpg'}
          alt={bike.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {/* Price tag */}
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg">
          ₹{bike.pricePerHour}/hr
        </div>
        {/* Booking status badge */}
        {isBooked && (
          <div className="absolute bottom-0 w-full bg-red-600 text-white text-center py-1 font-semibold">
            BOOKED
          </div>
        )}
        {!bike.isAvailable && (
          <div className="absolute bottom-0 w-full bg-red-600 text-white text-center py-1 font-semibold">
            UNAVAILABLE
          </div>
        )}
      </div>
      <div className="p-4">
      <div className='flex justify-between items-center mb-2'>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{bike.name}</h3>
        <div className="flex items-center mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {bike.type}
          </span>
        </div>
        </div>
        {!bike.description ||
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {bike.description || 'No description available'}
        </p>
        }
        <div className="flex justify-end">
          <Link
            href={`/bikes/${bike._id}`}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              isReallyAvailable
                ? 'bg-primary text-white hover:bg-primary-600'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            onClick={(e) => !isReallyAvailable && e.preventDefault()}
          >
            {isReallyAvailable ? 'Book Now' : isBooked ? 'Booked' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}