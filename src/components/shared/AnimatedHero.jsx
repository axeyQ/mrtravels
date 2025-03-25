"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AnimatedHero() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
      >
        Bike Booking Made Simple
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 text-lg leading-8 text-gray-600"
      >
        Rent a bike with just a few clicks. Fast, reliable, and affordable.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10 flex items-center justify-center gap-x-6"
      >
        <Link
          href="/bikes"
          className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Browse Bikes
        </Link>
        <Link
          href="#how-it-works"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Learn more <span aria-hidden="true">→</span>
        </Link>
      </motion.div>
    </div>
  );
}