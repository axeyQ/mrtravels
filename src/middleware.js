import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default function middleware(request) {
  try {
    // Check if this is a request with the clerk handshake parameter
    const url = new URL(request.url);
    const hasClerkHandshake = url.searchParams.has('__clerk_handshake');
    
    if (hasClerkHandshake) {
      // For handshake requests, bypass normal middleware and just pass through
      // This prevents the middleware from trying to process the handshake parameter
      console.log("Detected Clerk handshake request, bypassing middleware checks");
      return NextResponse.next();
    }
    
    // For all other requests, apply the Clerk middleware
    return clerkMiddleware({
      publicRoutes: [
        "/",
        "/sign-in(.*)",
        "/sign-up(.*)",
        "/bikes",
        "/bikes/(.*)",
        "/contact",
        "/terms",
        "/refund-policy",
        "/api/(.*)",
        "/_vercel(.*)"
      ]
    })(request);
    
  } catch (error) {
    console.error("Middleware error:", error.message);
    // Return Next Response to prevent the app from crashing
    return NextResponse.next();
  }
}

// Use a more specific matcher pattern that excludes handshake requests
export const config = {
  matcher: [
    // Skip static files and known browser files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};