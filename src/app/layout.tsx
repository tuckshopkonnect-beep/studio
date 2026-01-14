import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/hooks/use-cart.tsx";
import RootLayoutClient from './layout.client';
import { FirebaseClientProvider } from '@/firebase/client-provider';


export const metadata: Metadata = {
  title: 'TuckshopKonnect',
  description: 'Online tuckshop app for schools',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
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
