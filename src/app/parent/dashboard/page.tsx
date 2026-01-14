
"use client";

import { useState } from "react";
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
import { PlusCircle, History, Phone } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { initialUsers } from "@/lib/data";
import FundWalletDialog from "@/components/FundWalletDialog";
import type { User } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


export default function ParentDashboard() {
  const { toast } = useToast();
  // In a real app, this would come from an auth context
  const parent = initialUsers.find(u => u.email === "emma.brown.p@parent.com")!;
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  
  const childrenOfParent = allUsers.filter(u => u.parentId === parent.id);

  // State for the funding dialog
  const [fundingChild, setFundingChild] = useState<User | null>(null);
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);

  // Mocked spending data
  const spending = {
    "Emma Brown": 2000.00,
    // Add other children's spending here if needed
  };

  const handleOpenFundDialog = (child: User) => {
    setFundingChild(child);
    setIsFundDialogOpen(true);
  };
  
  const handleFundingSuccess = (amount: number, childId: number) => {
    // This is a client-side simulation of updating the balance
    setAllUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === childId ? { ...user, balance: user.balance + amount } : user
      )
    );
    toast({
        title: "Funding Successful",
        description: `₦${amount.toFixed(2)} has been added to ${fundingChild?.name}'s account.`,
    });
    setIsFundDialogOpen(false);
    setFundingChild(null);
  };


  return (
    <>
    {fundingChild && (
      <FundWalletDialog
        isOpen={isFundDialogOpen}
        onOpenChange={setIsFundDialogOpen}
        child={fundingChild}
        parentEmail={parent.email}
        onSuccess={handleFundingSuccess}
      />
    )}

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
                                <span>₦{spent.toFixed(2)} / ₦{limit > 0 ? limit.toFixed(2) : 'No Limit'}</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button className="w-full" onClick={() => handleOpenFundDialog(child)}>
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
        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>Contact the school admin for any support or inquiries.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="w-full" style={{backgroundColor: '#25D366', color: 'white'}}>
                        <a href="https://wa.me/2349025884232" target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="mr-2 h-5 w-5" />
                            Message on WhatsApp
                        </a>
                    </Button>
                     <Button asChild variant="outline" className="w-full">
                        <a href="tel:+2349025884232">
                           <Phone className="mr-2 h-5 w-5" />
                           Call Admin
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
    </>
  );
