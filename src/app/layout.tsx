import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/hooks/use-cart.tsx";
import RootLayoutClient from './layout.client';
import { FirebaseClientProvider } from '@/firebase/client-provider';


export const metadata: Metadata = {
  title: {
    default: 'TuckshopKonnect | Modern School Tuckshop Solution',
    template: '%s | TuckshopKonnect'
  },
  description: 'TuckshopKonnect is a modern, cashless solution for school tuckshops. Seamless ordering for students, spending controls for parents, and efficient management for schools.',
  keywords: ['tuckshop', 'school lunch', 'cashless payment', 'school management', 'TuckshopKonnect', 'student ordering', 'parental control', 'school cafeteria', 'DLHS'],
  authors: [{ name: 'Seme Productions' }],
  creator: 'Seme Productions',
  publisher: 'Seme Productions',
  metadataBase: new URL('https://tuckshopkonnect.com'), // Replace with your actual domain when live
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TuckshopKonnect | Modern School Tuckshop Solution',
    description: 'A seamless, cashless ordering experience for students and schools.',
    url: 'https://tuckshopkonnect.com',
    siteName: 'TuckshopKonnect',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TuckshopKonnect | Modern School Tuckshop Solution',
    description: 'A seamless, cashless ordering experience for students and schools.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")} suppressHydrationWarning>
        <FirebaseClientProvider>
          <CartProvider>
              <RootLayoutClient>
                {children}
              </RootLayoutClient>
              <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
