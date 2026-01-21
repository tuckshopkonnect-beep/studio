
"use client";

import Link from 'next/link';

// This page is intentionally left blank to resolve a build error.
export default function RegisterSchoolPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center text-center">
      <div>
        <h1 className="text-2xl font-bold">Page Not Available</h1>
        <p className="text-muted-foreground">This feature has been removed.</p>
        <Link href="/" className="text-primary underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
