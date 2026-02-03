
"use client";

import Link from "next/link";
import { ShoppingCart, Utensils, UserCircle, Moon, Sun, LayoutDashboard, LogOut, Loader2 } from "lucide-react";
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
import { useEffect, useState, useMemo } from "react";
import type { User } from "@/lib/data";
import { usePathname } from "next/navigation";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';

interface AppSettings {
  jssLimit?: number;
  sssLimit?: number;
}

export default function Header() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();
  const [theme, setThemeState] = useState<'light' | 'dark' | null>(null);
  
  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, "users", authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useDoc<User>(currentUserDocRef);
  
  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, "settings", "global");
  }, [firestore, authUser]);
  const { data: appSettings, isLoading: isLoadingSettings } = useDoc<AppSettings>(settingsDocRef);

  const isStudent = currentUser?.role === 'Student';
  
  const todayString = new Date().toISOString().split('T')[0];
  const spentTodayForDisplay = (isStudent && currentUser?.spendingToday?.date === todayString) 
    ? currentUser.spendingToday.amount 
    : 0;


  useEffect(() => {
    const storedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setThemeState(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isParentPortal = pathname.startsWith('/parent');
  const dashboardLink = isParentPortal ? "/parent/dashboard" : "/student/dashboard";

  const studentUser = currentUser?.role === 'Student' ? currentUser : undefined;
  
  const isCartDataLoading = isLoadingCurrentUser || isUserLoading || isLoadingSettings;
  const canDisplayCart = !isCartDataLoading && studentUser;

  const defaultDailyLimit = useMemo(() => {
    if (!appSettings || !studentUser || !studentUser.class) return null;
    if (studentUser.class.startsWith('JSS')) {
      return appSettings.jssLimit ?? null;
    }
    if (studentUser.class.startsWith('SSS')) {
      return appSettings.sssLimit ?? null;
    }
    return null;
  }, [appSettings, studentUser]);

  const effectiveDailyLimitForDisplay = studentUser?.dailyLimit ?? defaultDailyLimit;
  
  if (!theme) {
      // Render a placeholder or skeleton while theme is loading to avoid flash
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-end">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                </div>
            </div>
        </header>
    )
  }

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
          <Link href="/student/order" className="transition-colors hover:text-primary">Menu</Link>
          <Link href="/portal" className="transition-colors hover:text-primary">User Portals</Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>

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
                {isCartDataLoading && (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {canDisplayCart && (
                  <OrderSummary 
                    student={studentUser} 
                    spentTodayForDisplay={spentTodayForDisplay} 
                    effectiveDailyLimitForDisplay={effectiveDailyLimitForDisplay} 
                  />
                )}
                {!isCartDataLoading && !studentUser && (
                   <div className="p-6 text-center text-muted-foreground">
                      Could not load your student profile. Please try logging in again.
                  </div>
                )}
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
