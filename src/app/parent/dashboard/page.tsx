
"use client";

import { useState, useEffect } from "react";
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
import { PlusCircle, History, Phone, Loader2, UserX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import FundWalletDialog from "@/components/FundWalletDialog";
import type { User, Order } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";

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
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();

  const { data: parent, isLoading: isLoadingParent } = useDoc<User>(
    useMemoFirebase(() => (firestore && authUser) ? collection(firestore, "users").doc(authUser.uid) : null, [firestore, authUser])
  );

  const childrenQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(collection(firestore, 'users'), where('parentId', '==', authUser.uid));
  }, [firestore, authUser]);

  const { data: children, isLoading: isLoadingChildren } = useCollection<User>(childrenQuery);
  
  const [fundingChild, setFundingChild] = useState<User | null>(null);
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);

  // Note: Spending data would require fetching all orders for each child, which can be inefficient.
  // A better real-world solution would be a separate 'spending' summary document updated by a cloud function.
  // For this demo, we'll assume spending is 0 for simplicity.
  const getSpending = (childId: string) => {
    return 0; 
  }

  const handleOpenFundDialog = (child: User) => {
    setFundingChild(child);
    setIsFundDialogOpen(true);
  };
  
  const handleFundingSuccess = (amount: number, childId: string) => {
    // This logic is now handled by Firestore updates and real-time listeners.
    // We just show a success message.
    toast({
        title: "Funding Successful",
        description: `₦${amount.toFixed(2)} has been added to ${fundingChild?.name}'s account. The balance will update shortly.`,
    });
    setIsFundDialogOpen(false);
    setFundingChild(null);
  };


  if (isUserLoading || isLoadingParent || isLoadingChildren) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!parent) {
      return (
        <div className="container mx-auto p-4 md:p-6 text-center">
          <UserX className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Could Not Load Profile</h1>
          <p className="text-muted-foreground">We couldn't find your user profile. Please try logging out and back in.</p>
          <Button asChild className="mt-4">
            <Link href="/portal/parent">Login Again</Link>
          </Button>
        </div>
      );
  }
  
  return (
    <>
    {fundingChild && parent && (
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
            {children && children.map((child) => {
              const spent = getSpending(child.id);
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

             {children?.length === 0 && (
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                        <UserX className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Children Linked</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Please contact the school administrator to link your children's accounts to your parent profile.
                        </p>
                    </CardContent>
                </Card>
            )}
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
