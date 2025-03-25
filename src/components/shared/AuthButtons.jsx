"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/sign-in"
        className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600"
      >
        Sign In
      </Link>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}