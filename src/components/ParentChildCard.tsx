
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, History } from "lucide-react";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/data";
import { Skeleton } from "./ui/skeleton";
import { useTodaysSpending } from "@/hooks/use-spending";

interface ParentChildCardProps {
  childId: string;
  onFundWallet: (child: User) => void;
}

const ChildCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-6">
            <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-28" />
            </div>
            <div>
                <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full" />
            </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export default function ParentChildCard({ childId, onFundWallet }: ParentChildCardProps) {
    const firestore = useFirestore();

    const childDocRef = useMemoFirebase(() => {
        if (!firestore || !childId) return null;
        return doc(firestore, 'users', childId);
    }, [firestore, childId]);

    const { data: child, isLoading: isLoadingChild } = useDoc<User>(childDocRef);
    const { spentToday, isLoadingSpending } = useTodaysSpending(childId);
  
    if (isLoadingChild || isLoadingSpending) {
        return <ChildCardSkeleton />;
    }

    if (!child) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-destructive">
                    Could not load data for child with ID: {childId}. They may have been removed.
                </CardContent>
            </Card>
        );
    }
    
    const limit = child.dailyLimit || 0;
    const progress = limit > 0 ? (spentToday / limit) * 100 : 0;

    return (
        <Card key={child.id} className="flex flex-col transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={child.avatarUrl} alt={child.name} />
                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                    <CardDescription>{child.class} - Student Account</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                    <p className="text-3xl font-bold text-primary">₦{child.balance.toFixed(2)}</p>
                </div>
                <div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Daily Spending</span>
                        <span>₦{spentToday.toFixed(2)} / ₦{limit > 0 ? limit.toFixed(2) : 'No Limit'}</span>
                    </div>
                    <Progress value={progress} />
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                <Button className="w-full" onClick={() => onFundWallet(child)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Fund
                </Button>
                <Button variant="outline" className="w-full">
                    <History className="mr-2 h-4 w-4" /> History
                </Button>
            </CardFooter>
        </Card>
    );
}
