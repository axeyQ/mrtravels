import Link from "next/link";
import AnimatedHero from "../components/shared/AnimatedHero";
import AuthButtons from "../components/shared/AuthButtons";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              BikeFlix
            </Link>
          </div>
          <AuthButtons />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative isolate">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <AnimatedHero />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} BikeFlix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}