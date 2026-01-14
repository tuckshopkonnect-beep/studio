
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, History, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getPersonalizedFoodRecommendations, PersonalizedFoodRecommendationsInput, PersonalizedFoodRecommendationsOutput } from "@/app/actions";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { initialUsers, initialOrders } from "@/lib/data";


export default function StudentDashboard() {
  const student = initialUsers.find(u => u.role === 'Student' && u.name === 'Alex Doe') || {
    name: "Alex Doe",
    balance: 7500.00,
    dailyLimit: 3000.00,
    spentToday: 450.00,
  };

  const spentToday = initialOrders
    .filter(o => {
      const orderDate = new Date(o.orderDate);
      const today = new Date();
      return o.customerName === student.name &&
             orderDate.getDate() === today.getDate() &&
             orderDate.getMonth() === today.getMonth() &&
             orderDate.getFullYear() === today.getFullYear() &&
             o.status === 'Completed';
    })
    .reduce((acc, order) => acc + order.total, 0);

  const [recommendations, setRecommendations] = useState<PersonalizedFoodRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      const input: PersonalizedFoodRecommendationsInput = {
        orderHistory: [], // Placeholder, no history initially
        dietaryRestrictions: ""
      };
      try {
        const result = await getPersonalizedFoodRecommendations(input);
        if (result.success && result.data) {
          setRecommendations(result.data);
        } else {
          setError(result.error || "Failed to fetch recommendations.");
        }
      } catch (e) {
         setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);


  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome, {student.name}!</h1>
        <p className="text-muted-foreground">Ready for your next tasty meal?</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">₦{student.balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
        <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{spentToday.toFixed(2)} / ₦{(student.dailyLimit || 0).toFixed(2)}</div>
            <Progress value={(spentToday / (student.dailyLimit || 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col transform transition-all duration-300 hover:shadow-lg hover:border-primary/50">
          <CardHeader>
            <CardTitle>Start a New Order</CardTitle>
            <CardDescription>Browse the menu and pick your favorites.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Button size="lg" asChild>
              <Link href="/student/order">
                <ShoppingCart className="mr-2" /> Go to Menu
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col transform transition-all duration-300 hover:shadow-lg hover:border-primary/50">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Review your past orders and transactions.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/student/order-history">
                <History className="mr-2" /> View History
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Just for You ✨</CardTitle>
                    <CardDescription>Personalized recommendations based on your recent orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : error ? (
                         <div className="text-center text-destructive p-4 border-2 border-dashed border-destructive/50 rounded-lg">
                           <p>{error}</p>
                        </div>
                    ) : recommendations ? (
                        <div>
                            <p className="font-semibold text-primary">{recommendations.recommendedItems.join(', ')}</p>
                            <p className="text-sm text-muted-foreground mt-1">{recommendations.reasoning}</p>
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                           <p>No recommendations available at this time.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
