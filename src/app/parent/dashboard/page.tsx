
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
import { PlusCircle, History, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ParentDashboard() {
  // Placeholder data
  const children = [
    { name: "Alex Doe", balance: 2550.00, limit: 1500.00, spent: 450, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { name: "Jamie Doe", balance: 1500.00, limit: 1000.00, spent: 800, avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  ];

  const parent = {
    name: "Jane Doe"
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome, {parent.name}</h1>
            <p className="text-muted-foreground">Manage your children's tuckshop accounts with ease.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {children.map((child, index) => (
                <Card key={index} className="flex flex-col transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={child.avatar} alt={child.name} />
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
                                <span>₦{child.spent.toFixed(2)} / ₦{child.limit.toFixed(2)}</span>
                            </div>
                            <Progress value={(child.spent / child.limit) * 100} />
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
            ))}

            <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50 hover:border-primary/50 transition-colors">
                <CardContent className="text-center p-6">
                    <button className="flex flex-col items-center justify-center w-full h-full">
                        <PlusCircle className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium text-muted-foreground">Link Another Child</span>
                    </button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

