import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Wrap the Clerk middleware in a try-catch block
export default function middleware(request) {
  try {
    // Log request to help with debugging
    console.log("Processing request:", request.nextUrl.pathname);
    
    // Apply Clerk middleware with expanded public routes
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

// Use a more specific matcher pattern
export const config = {
  matcher: [
    // Skip static files and known browser files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};