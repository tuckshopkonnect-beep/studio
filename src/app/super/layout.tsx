
import Link from "next/link";
import { Package, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/super/dashboard" className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg hidden sm:inline-block">
                Super Admin Console
              </span>
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal">
              <ChevronLeft className="mr-2 h-4 w-4" /> Exit to Portals
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 container mx-auto">
        {children}
      </main>
    </div>
  );
}
