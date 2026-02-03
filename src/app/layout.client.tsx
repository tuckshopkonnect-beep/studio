'use client';

import Header from '@/components/Header';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function RootLayoutClient({ children }: { children: React.ReactNode}) {
  const pathname = usePathname();

  // Define paths where the default header should not be shown
  const noHeaderPaths = [
    '/', // Hide on the main landing page
    '/dashboard',
    '/parent/dashboard',
    '/student/dashboard',
    '/portal',
    '/schools',
    '/super', // Hide on super admin pages
  ];

  // A more robust check to see if the path starts with any of the noHeaderPaths
  const hideHeader = noHeaderPaths.some(p => {
    if (p === '/') return pathname === '/';
    return pathname.startsWith(p);
  });


  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
}
