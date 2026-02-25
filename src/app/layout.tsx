import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/hooks/use-cart.tsx";
import RootLayoutClient from './layout.client';
import { FirebaseClientProvider } from '@/firebase/client-provider';


export const metadata: Metadata = {
  title: {
    default: 'TuckshopKonnect | The Modern School Tuckshop',
    template: '%s | TuckshopKonnect'
  },
  description: 'A seamless, cashless ordering experience for students and schools. Manage orders, fund wallets, and control spending with ease.',
  keywords: ['tuckshop', 'school lunch', 'cashless payment', 'school management', 'TuckshopKonnect', 'student ordering', 'parental control', 'school cafeteria'],
  authors: [{ name: 'Seme Productions' }],
  creator: 'Seme Productions',
  publisher: 'Seme Productions',
  openGraph: {
    title: 'TuckshopKonnect | The Modern School Tuckshop',
    description: 'Transforming school lunch into a seamless digital experience.',
    url: 'https://tuckshopkonnect.com',
    siteName: 'TuckshopKonnect',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TuckshopKonnect',
    description: 'The cashless solution for modern schools.',
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
