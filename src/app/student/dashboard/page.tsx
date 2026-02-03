
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
import { DollarSign, History, ShoppingCart, TrendingUp, Loader2, UserX } from "lucide-react";
import Link from "next/link";
import { getPersonalizedFoodRecommendations, PersonalizedFoodRecommendationsInput, PersonalizedFoodRecommendationsOutput } from "@/app/actions";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { User } from "@/lib/data";
import FullPageLoader from "@/components/FullPageLoader";

interface AppSettings {
  jssLimit?: number;
  sssLimit?: number;
}

export default function StudentDashboard() {
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, "users", authUser.uid);
  }, [firestore, authUser]);

  const { data: student, isLoading: isLoadingStudent } = useDoc<User>(studentDocRef);

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "settings", "global");
  }, [firestore]);
  const { data: appSettings, isLoading: isLoadingSettings } = useDoc<AppSettings>(settingsDocRef);

  const [recommendations, setRecommendations] = useState<PersonalizedFoodRecommendationsOutput | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;

    const fetchRecommendations = async () => {
      setIsLoadingRecs(true);
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
        setIsLoadingRecs(false);
      }
    };
    
    fetchRecommendations();
  }, [student]);

  const defaultDailyLimit = useMemo(() => {
    if (!appSettings || !student || !student.class) return null;
    if (student.class.startsWith('JSS')) {
      return appSettings.jssLimit ?? null;
    }
    if (student.class.startsWith('SSS')) {
      return appSettings.sssLimit ?? null;
    }
    return null;
  }, [appSettings, student]);

  const todayString = new Date().toISOString().split('T')[0];
  const spentToday = student?.spendingToday?.date === todayString ? student.spendingToday.amount : 0;

  if (isUserLoading || isLoadingStudent || isLoadingSettings) {
    return <FullPageLoader message="Opening Student Portal..." />;
  }

  if (!student) {
      return (
        <div className="container mx-auto p-4 md:p-6 text-center">
          <UserX className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Could Not Load Profile</h1>
          <p className="text-muted-foreground">We couldn't find your student profile. Please try logging out and back in.</p>
           <Button asChild className="mt-4">
            <Link href="/portal/student">Login Again</Link>
          </Button>
        </div>
      );
  }

  const effectiveDailyLimit = student.dailyLimit ?? defaultDailyLimit;

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
            <div className="text-2xl font-bold">₦{spentToday.toFixed(2)} / ₦{(effectiveDailyLimit || 0).toFixed(2)}</div>
            <Progress value={(spentToday / (effectiveDailyLimit || 1)) * 100} className="mt-2" />
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
                    {isLoadingRecs ? (
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
}
