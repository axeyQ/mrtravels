// src/app/api/update-booking-payment/route.js
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

// Simple in-memory request tracking
const requestTracker = {
  requests: {},
  isRateLimited: function(ip) {
    const now = Date.now();
    const recentRequests = this.requests[ip] || [];
    // Clean up old requests (older than 1 minute)
    const recentValidRequests = recentRequests.filter(time => now - time < 60000);
    // Store updated list
    this.requests[ip] = recentValidRequests;
    // Check if too many requests (more than 5 in the last minute)
    if (recentValidRequests.length >= 5) {
      return true;
    }
    // Add this request
    this.requests[ip].push(now);
    return false;
  }
};

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request) {
  try {
    // Basic rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (requestTracker.isRateLimited(ip)) {
      console.log(`Rate limited request from ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // Get request body
    const body = await request.json();
    const { bookingId, success, transactionId, amount } = body;

    // Check if bookingId is valid
    if (!bookingId || bookingId === 'null') {
      console.log('Missing or invalid booking ID:', bookingId);
      return NextResponse.json({ 
        error: 'Invalid or missing booking ID',
        success: false
      }, { status: 400 });
    }

    console.log(`Updating booking ${bookingId} payment status to ${success ? 'successful' : 'failed'}`);
    
    // Add a small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Call Convex mutation to update booking payment status
      const result = await convex.mutation('bookings:updatePaymentStatus', {
        bookingId,
        success,
        transactionId,
        depositAmount: amount || 42 // Default to 42 if not specified
      });
      
      console.log(`Successfully updated booking ${bookingId} payment status`);
      return NextResponse.json({ success: true, bookingId });
    } catch (convexError) {
      console.error('Error updating booking payment status:', convexError);
      return NextResponse.json({ 
        error: convexError.message || 'Failed to update booking payment status',
        success: false
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in update-booking-payment API:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      success: false
    }, { status: 500 });
  }
}