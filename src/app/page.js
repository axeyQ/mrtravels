import Link from 'next/link';
import AnimatedHero from '@/components/shared/AnimatedHero';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative isolate">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <AnimatedHero />
          </div>
        </div>
        
        {/* Features Section */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Booking a bike has never been easier. Our simple process gets you on the road in minutes.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    Create an Account
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Sign up in seconds with just your email or social accounts. No lengthy forms or paperwork.
                    </p>
                  </dd>
                </div>
                
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    </div>
                    Find Your Bike
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Browse our selection of bikes and choose the one that fits your needs. Filter by type, price, and more.
                    </p>
                  </dd>
                </div>
                
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    Book & Ride
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Select your date and time, confirm your booking, and you`&apos;`re all set. Enjoy your ride!
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-primary">
          <div className="mx-auto max-w-7xl py-12 px-6 sm:py-16 lg:px-8 lg:py-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Browse our collection of bikes and find your perfect ride today.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/bikes"
                className="inline-flex items-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-primary hover:bg-gray-50"
              >
                Browse Bikes
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}