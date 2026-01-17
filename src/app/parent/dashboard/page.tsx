
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, UserX, Phone } from "lucide-react";
import FundWalletDialog from "@/components/FundWalletDialog";
import type { User } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import ParentChildCard from "@/components/ParentChildCard";

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

  const parentDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, "users", authUser.uid);
  }, [firestore, authUser]);

  const { data: parent, isLoading: isLoadingParent } = useDoc<User>(parentDocRef);
  
  const getChildrenIds = (childIds: any): string[] => {
    if (!childIds) {
        return [];
    }
    // Check if it's an array (the old, incorrect format)
    if (Array.isArray(childIds)) {
        return childIds;
    }
    // If it's an object/map (the new, correct format), get the keys
    if (typeof childIds === 'object') {
        return Object.keys(childIds);
    }
    // Fallback for unexpected types
    return [];
  };

  const childrenIds = getChildrenIds(parent?.childIds);
  
  const [fundingChild, setFundingChild] = useState<User | null>(null);
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);

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


  if (isUserLoading || isLoadingParent) {
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
            {childrenIds && childrenIds.length > 0 ? (
                childrenIds.map((childId) => (
                    <ParentChildCard key={childId} childId={childId} onFundWallet={handleOpenFundDialog} />
                ))
            ) : (
                <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
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
}
