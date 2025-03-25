import Link from "next/link";

export const metadata = {
  title: 'Unauthorized - Bike Booking App',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Unauthorized Access
        </h1>
        <p className="mt-4 text-gray-600">
          You do not have permission to access the admin dashboard. Please contact the administrator if you believe this is an error.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}