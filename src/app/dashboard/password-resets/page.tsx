
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
import type { User, PasswordResetRequest } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Loader2, UserX, ShieldQuestion, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import PasswordResetDialog from "@/components/PasswordResetDialog";
import { formatDistanceToNow } from 'date-fns';
import AccessDenied from "@/components/AccessDenied";


type MergedRequest = PasswordResetRequest & {
    userId: string;
    userName: string;
    userAvatar: string;
};


export default function PasswordResetsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();

  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useDoc(currentUserDocRef);
  const isCurrentUserAdmin = currentUserProfile?.role === 'Admin';


  const requestsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'passwordResetRequests');
  }, [firestore]);
  const { data: requests, isLoading: isLoadingRequests } = useCollection<PasswordResetRequest>(requestsCollection);

  const usersCollection = useMemoFirebase(() => {
      if(!firestore || !isCurrentUserAdmin) return null;
      return collection(firestore, 'users');
  }, [firestore, isCurrentUserAdmin]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollection);
  
  const mergedData = React.useMemo(() => {
    if (!requests || !users) return [];
    
    // Add a sample request if no real requests exist for demonstration purposes
    if (requests.length === 0) {
        return [{
            id: 'sample-1',
            userEmail: 'student@example.com',
            requestDate: new Date().toISOString(),
            status: 'Pending' as const,
            userId: 'sample-user-id',
            userName: 'Sample Student',
            userAvatar: 'https://i.pravatar.cc/150?u=sample-student'
        }];
    }

    return requests
        .map(req => {
            const user = users.find(u => u.email === req.userEmail);
            if (!user) return null;
            return {
                ...req,
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatarUrl,
            };
        })
        .filter((r): r is MergedRequest => r !== null)
        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [requests, users]);
  

  const [requestToDeny, setRequestToDeny] = React.useState<MergedRequest | null>(null);
  const [requestToApprove, setRequestToApprove] = React.useState<MergedRequest | null>(null);
  
  const handleDenyRequest = () => {
    if (!requestToDeny || !firestore) return;
    
    // Don't delete the sample request
    if(requestToDeny.id.startsWith('sample-')) {
        toast({ title: "Sample request cannot be denied."});
        setRequestToDeny(null);
        return;
    }

    deleteDocumentNonBlocking(doc(firestore, "passwordResetRequests", requestToDeny.id));

    toast({
      title: "Request Denied",
      description: `Password reset request for ${requestToDeny.userName} has been denied.`,
    });
    
    setRequestToDeny(null);
  };
  
  const handleApproveRequest = (requestId: string, newPassword?: string) => {
    // In a real app, you would have a Cloud Function here to securely reset the password.
    // For this demonstration, we'll simulate the success action.
    if(requestId.startsWith('sample-')) {
        toast({
            title: "Password Reset (Simulated)",
            description: `Password for ${requestToApprove?.userName} has been reset. Please communicate the new password to them securely.`,
        });
    } else {
        deleteDocumentNonBlocking(doc(firestore, "passwordResetRequests", requestId));
        toast({
            title: "Password Reset",
            description: `The request has been resolved. Please communicate the new password to ${requestToApprove?.userName} securely.`,
        });
    }

    setRequestToApprove(null);
  };


  const isLoading = isUserLoading || isLoadingCurrentUser || isLoadingRequests || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isCurrentUserAdmin) {
    return <AccessDenied currentUserProfile={currentUserProfile} />;
  }

  return (
    <>
      <ConfirmationDialog
        open={!!requestToDeny}
        onOpenChange={(isOpen) => !isOpen && setRequestToDeny(null)}
        onConfirm={handleDenyRequest}
        title={`Deny request for ${requestToDeny?.userName}?`}
        description="This will remove the request from the queue. The user will need to submit another one if they still need a reset."
        confirmButtonText="Yes, Deny Request"
      />
      
      {requestToApprove && (
        <PasswordResetDialog
            isOpen={!!requestToApprove}
            onOpenChange={() => setRequestToApprove(null)}
            onConfirm={handleApproveRequest}
            request={requestToApprove}
        />
      )}
      

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound/> Password Reset Requests</CardTitle>
          <CardDescription>
            Approve or deny requests from users who have forgotten their password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                    <TableCell colSpan={3} className="h-48 text-center">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                      <p className="mt-2 text-muted-foreground">Loading Requests...</p>
                    </TableCell>
                  </TableRow>
              ) : mergedData.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center text-muted-foreground">
                    <ShieldQuestion className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No Pending Requests</h3>
                    <p>When users request a password reset, it will appear here.</p>
                  </TableCell>
                </TableRow>
              ) : (
                mergedData.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={request.userAvatar} alt={request.userName} />
                          <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none">{request.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.userEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        {formatDistanceToNow(new Date(request.requestDate), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setRequestToDeny(request)}>Deny</Button>
                        <Button size="sm" onClick={() => setRequestToApprove(request)}>Approve</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
