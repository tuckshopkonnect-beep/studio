
"use client";

import Link from "next/link";
import { ShoppingCart, Utensils, UserCircle, Moon, Sun, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart.tsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import OrderSummary from "./OrderSummary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { initialUsers, initialOrders } from "@/lib/data";
import { usePathname } from "next/navigation";

export default function Header() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [spentToday, setSpentToday] = useState(0);
  
  // In a real app, this would come from an auth context
  const student = initialUsers.find(u => u.role === 'Student' && u.name === 'Alex Doe');

  useEffect(() => {
    // This code runs on the client, after the component mounts
    const storedTheme = localStorage.getItem("theme") || "light";
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if(student && typeof window !== "undefined") {
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      const todaySpent = allOrders
        .filter((o: any) => {
          const orderDate = new Date(o.orderDate);
          const today = new Date();
          return o.customerName === student.name &&
                 orderDate.getDate() === today.getDate() &&
                 orderDate.getMonth() === today.getMonth() &&
                 orderDate.getFullYear() === today.getFullYear();
        })
        .reduce((acc: number, order: any) => acc + order.total, 0);
      setSpentToday(todaySpent);
    }
  }, [student, pathname]); // Rerun when path changes to update totals

  const setTheme = (theme: "light" | "dark") => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const isParentPortal = pathname.startsWith('/parent');
  const dashboardLink = isParentPortal ? "/parent/dashboard" : "/student/dashboard";


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block text-lg">
            TuckshopKonnect
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">Menu</Link>
          <Link href="/portal" className="transition-colors hover:text-primary">User Portals</Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                  <Link href={dashboardLink}>
                    <LayoutDashboard className="mr-2" />
                    Dashboard
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/portal">
                  <LogOut className="mr-2" />
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {!isParentPortal && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                  <span className="sr-only">Open cart</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle>Your Order</SheetTitle>
                </SheetHeader>
                <OrderSummary student={student} spentToday={spentToday} />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
