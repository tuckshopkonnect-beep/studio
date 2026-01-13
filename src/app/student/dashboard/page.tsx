

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, History, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const student = {
    name: "Alex Doe",
    balance: 2550.00,
    dailyLimit: 1000.00,
    spentToday: 450.00,
  };

  return (
    <div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Welcome, {student.name}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦{student.balance.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Ready for your next order</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Spending</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦{student.spentToday.toFixed(2)} / ₦{student.dailyLimit.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Your spending limit for today</p>
                </CardContent>
            </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
             <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Start a New Order</CardTitle>
                    <CardDescription>Browse the menu and pick your favorites for lunch.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                    <Button size="lg" asChild>
                        <Link href="/student/order">
                            <ShoppingCart className="mr-2"/> Go to Menu
                        </Link>
                    </Button>
                </CardContent>
            </Card>
             <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>Review your past orders and transactions.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                     <Button size="lg" variant="outline" asChild>
                        <Link href="#">
                            <History className="mr-2"/> View History
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
