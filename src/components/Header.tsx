"use client";

import Link from "next/link";
import { ShoppingCart, Utensils } from "lucide-react";
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

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block text-lg">
            TuckshopKonnect
          </span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">Menu</Link>
          <Link href="/dashboard/orders" className="transition-colors hover:text-primary">Dashboard</Link>
        </nav>
        <div className="flex flex-1 items-center justify-end">
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
              <OrderSummary />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
