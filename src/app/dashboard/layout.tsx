"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListOrdered, LayoutGrid, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard/orders", icon: ListOrdered, label: "Orders" },
    { href: "/dashboard/inventory", icon: LayoutGrid, label: "Inventory" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-background sm:flex mt-16">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-4 px-2 py-4">
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      size="icon"
                      className={cn("rounded-lg", pathname === item.href && "text-primary")}
                      aria-label={item.label}
                    >
                      <item.icon className="size-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    aria-label="Home"
                  >
                    <Home className="size-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Back to Store</TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-20 flex-1">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
