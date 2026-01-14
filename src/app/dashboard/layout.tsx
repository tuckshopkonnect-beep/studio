
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Home,
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  Settings,
  PanelLeft,
  Search,
  Bell,
  KeyRound,
  LogOut,
  Moon,
  Sun,
  Palette,
  QrCode,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/dashboard/inventory", icon: Package, label: "Menu" },
    { href: "/dashboard/users", icon: Users2, label: "Users" },
    { href: "/dashboard/reports", icon: LineChart, label: "Reports" },
];

const secondaryNavItems = [
    { href: "/dashboard/scanner", icon: QrCode, label: "POS Scanner", feature: "posScanner" },
    { href: "/dashboard/appearance", icon: Palette, label: "Appearance" },
    { href: "/dashboard/password-resets", icon: KeyRound, label: "Password Resets" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [featureSettings, setFeatureSettings] = useState({ posScanner: true });
  
  useEffect(() => {
    // Ensure this code runs only on the client
    const storedTheme = localStorage.getItem("theme") || "light";
    const storedColor = localStorage.getItem("primaryColor") || "262 52% 47%";

    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.setProperty("--primary", storedColor);
    
    const posScannerEnabled = localStorage.getItem('posScannerEnabled') === 'true';
    setFeatureSettings({ posScanner: posScannerEnabled });
  }, []);

  const setTheme = (theme: "light" | "dark") => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const breadcrumbItems = pathname.split('/').filter(Boolean);

  const visibleSecondaryNavItems = secondaryNavItems.filter(item => !item.feature || featureSettings[item.feature as keyof typeof featureSettings]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className={cn(
            "fixed inset-y-0 left-0 z-10 flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
            isSidebarCollapsed ? "w-16" : "w-60"
        )}>
          <div className="flex h-16 items-center gap-2 border-b border-purple-400/30 px-4 justify-center">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                <Package />
                <span className={cn(isSidebarCollapsed && "hidden")}>Tuckshop</span>
            </Link>
          </div>
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-2 px-2 py-4">
            {navItems.map((item) => (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                        "flex h-10 items-center justify-center gap-4 rounded-lg px-4 text-base font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full",
                        pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                        isSidebarCollapsed ? "w-10 justify-center" : "justify-start"
                    )}
                  >
                    <item.icon className="size-5" />
                    <span className={cn("truncate", isSidebarCollapsed && "hidden")}>{item.label}</span>
                  </Link>
                </TooltipTrigger>
                {isSidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            ))}
          </nav>
          <hr className="mx-4 border-t border-purple-400/30" />
           <nav className="flex flex-col items-center gap-2 px-2 py-4">
            {visibleSecondaryNavItems.map((item) => (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                        "flex h-10 items-center justify-center gap-4 rounded-lg px-4 text-base font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full",
                        pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                        isSidebarCollapsed ? "w-10 justify-center" : "justify-start"
                    )}
                  >
                    <item.icon className="size-5" />
                    <span className={cn("truncate", isSidebarCollapsed && "hidden")}>{item.label}</span>
                  </Link>
                </TooltipTrigger>
                {isSidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            ))}
          </nav>
           <nav className="mt-auto flex flex-col items-center gap-2 px-2 py-4">
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href="/portal"
                    className={cn(
                        "flex h-10 items-center justify-center gap-4 rounded-lg px-4 text-base font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-muted-foreground",
                        isSidebarCollapsed ? "w-10 justify-center" : "justify-start"
                    )}
                  >
                    <LogOut className="size-5" />
                    <span className={cn(isSidebarCollapsed && "hidden")}>Logout</span>
                  </Link>
                </TooltipTrigger>
                {isSidebarCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
              </Tooltip>
           </nav>
        </TooltipProvider>
      </aside>
      <div className={cn("flex flex-col sm:gap-4 sm:py-4 transition-all duration-300", isSidebarCollapsed ? "sm:pl-16" : "sm:pl-60")}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
                 <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-r-0">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                        href="#"
                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                    >
                        <Package className="h-5 w-5 transition-all group-hover:scale-110" />
                        <span className="sr-only">Tuckshop Konnect</span>
                    </Link>
                    {[...navItems, ...visibleSecondaryNavItems].map(item => (
                         <Link
                            key={item.href}
                            href={item.href}
                            className={cn("flex items-center gap-4 px-2.5", pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard") ? "text-sidebar-accent-foreground" : "text-muted-foreground hover:text-foreground")}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>
          <Button size="icon" variant="outline" className="hidden sm:flex" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems.slice(1).map((item, index) => (
                <React.Fragment key={item}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        {index === breadcrumbItems.length - 2 ? (
                             <BreadcrumbPage className="capitalize">{item.replace('-', ' ')}</BreadcrumbPage>
                        ) : (
                             <BreadcrumbLink asChild>
                                <Link href={`/${breadcrumbItems.slice(0, index + 2).join('/')}`} className="capitalize">{item.replace('-', ' ')}</Link>
                            </BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>New Order #ORD-005</DropdownMenuItem>
                <DropdownMenuItem>Stock for "Meat Pie" is low</DropdownMenuItem>
             </DropdownMenuContent>
          </DropdownMenu>
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
              <Button variant="secondary" size="icon" className="rounded-full">
                <Users2 className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/portal">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
    
    
