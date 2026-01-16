
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PasswordResetRequest, User } from "@/lib/data";
import { formatDistanceToNow } from 'date-fns';
import ConfirmationDialog from "@/components/ConfirmationDialog";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";


export default function PasswordResetsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: authUser, isUserLoading } = useUser();

    const currentUserDocRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);
    const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useDoc<User>(currentUserDocRef);
    const isCurrentUserAdmin = currentUserProfile?.role === 'Admin';
    
    // In a real app, this would come from a Firestore collection
    const [requests, setRequests] = React.useState<PasswordResetRequest[]>([]);
    
    const [requestToDeny, setRequestToDeny] = React.useState<PasswordResetRequest | null>(null);
    const [requestToApprove, setRequestToApprove] = React.useState<PasswordResetRequest | null>(null);


    const handleDenyRequest = () => {
        if (!requestToDeny) return;

        setRequests(prev => prev.filter(r => r.id !== requestToDeny.id));
        
        toast({
            title: "Request Denied",
            description: `Password reset for ${requestToDeny.userName} has been denied.`,
        });

        setRequestToDeny(null);
    }

    const handleApproveRequest = (newPassword: string) => {
        if (!requestToApprove) return;

        // In a real app, you would now update the user's password in the database.
        console.log(`Password for ${requestToApprove.userName} reset to: ${newPassword}`);
        
        setRequests(prev => prev.filter(r => r.id !== requestToApprove.id));
        
        toast({
            title: "Password Reset Successfully",
            description: `A new temporary password has been set for ${requestToApprove.userName}.`,
        });

        setRequestToApprove(null);
    };

    if (isUserLoading || isLoadingCurrentUser) {
        return (
          <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
    }
    
    if (!isCurrentUserAdmin) {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>You do not have permission to access this page.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section is for administrators only. If you believe this is an error, please contact support.</p>
            </CardContent>
          </Card>
        );
    }

  return (
    <>
    {/* --- Dialogs --- */}
    <ConfirmationDialog
        open={!!requestToDeny}
        onOpenChange={(isOpen) => !isOpen && setRequestToDeny(null)}
        onConfirm={handleDenyRequest}
        title={`Deny Request?`}
        description={`Are you sure you want to deny the password reset request for ${requestToDeny?.userName}?`}
        confirmButtonVariant={'destructive'}
        confirmButtonText={`Yes, Deny`}
    />
    <ResetPasswordDialog
        open={!!requestToApprove}
        onOpenChange={(isOpen) => !isOpen && setRequestToApprove(null)}
        onConfirm={handleApproveRequest}
        userName={requestToApprove?.userName || ''}
    />

    {/* --- Page Content --- */}
    <Card>
      <CardHeader>
        <CardTitle>Password Resets</CardTitle>
        <CardDescription>
            Handle user password reset requests. {requests.length} requests pending.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.length > 0 ? requests.map((request) => (
                    <TableRow key={request.id}>
                        <TableCell>
                            <div className="flex items-center gap-4">
                                <Avatar className="hidden h-10 w-10 sm:flex">
                                    <AvatarImage src={request.userAvatar} alt={request.userName} />
                                    <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="font-medium">{request.userName}</p>
                                    <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                           <div className="flex items-center gap-2 text-muted-foreground">
                             <Clock className="h-4 w-4" />
                             {formatDistanceToNow(new Date(request.requestDate), { addSuffix: true })}
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex gap-2 justify-end">
                             <Button variant="outline" size="sm" onClick={() => setRequestToDeny(request)}>
                                <XCircle className="mr-2 h-4 w-4" /> Deny
                            </Button>
                             <Button size="sm" onClick={() => setRequestToApprove(request)}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </Button>
                           </div>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                            No pending password reset requests.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );
}
