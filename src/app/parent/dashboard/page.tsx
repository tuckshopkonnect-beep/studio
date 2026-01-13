
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { initialUsers } from "@/lib/data";

export default function ParentDashboard() {
  // Placeholder data - in a real app, this would be fetched based on the logged-in parent
  const childrenOfParent = initialUsers.filter(u => u.name === 'Emma Brown'); // Example
  
  const parent = {
    name: "Mrs. Brown"
  };

  // Mocked spending data
  const spending = {
    "Emma Brown": 450.00
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome, {parent.name}</h1>
            <p className="text-muted-foreground">Manage your children's tuckshop accounts with ease.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {childrenOfParent.map((child) => {
              const spent = spending[child.name as keyof typeof spending] || 0;
              const limit = child.dailyLimit || 0;
              const progress = limit > 0 ? (spent / limit) * 100 : 0;

              return (
                <Card key={child.id} className="flex flex-col transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={child.avatarUrl} alt={child.name} />
                            <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl">{child.name}</CardTitle>
                            <CardDescription>Student Account</CardDescription>
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
                                <span>₦{spent.toFixed(2)} / ₦{limit.toFixed(2)}</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Fund
                        </Button>
                        <Button variant="outline" className="w-full">
                            <History className="mr-2 h-4 w-4" /> History
                        </Button>
                    </CardFooter>
                </Card>
              )
            })}
        </div>
    </div>
  );
}
