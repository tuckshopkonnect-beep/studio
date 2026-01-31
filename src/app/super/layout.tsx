import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/super/dashboard" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>Super Admin</span>
        </Link>
        <nav className="flex items-center gap-4 ml-auto">
            <Button variant="outline" asChild>
                <Link href="/dashboard">Return to Main Dashboard</Link>
            </Button>
        </nav>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
