
"use client";

import Link from "next/link";
import { ChevronLeft, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const auth = useAuth();
  const isLoginPage = pathname === "/super/login";

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      window.location.href = "/super/login";
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {!isLoginPage && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/super/dashboard" className="flex items-center space-x-2">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg hidden sm:inline-block">
                  TuckshopKonnect <span className="text-muted-foreground font-medium ml-1">| System Owner</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/portal">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Exit
                </Link>
              </Button>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 container mx-auto">
        {children}
      </main>
    </div>
  );
}
