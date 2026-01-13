
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
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { passwordResetRequests as initialRequests } from "@/lib/data";
import type { PasswordResetRequest } from "@/lib/data";
import { formatDistanceToNow } from 'date-fns';
import ConfirmationDialog from "@/components/ConfirmationDialog";


export default function PasswordResetsPage() {
    const { toast } = useToast();
    const [requests, setRequests] = React.useState<PasswordResetRequest[]>(initialRequests);
    const [requestToProcess, setRequestToProcess] = React.useState<{request: PasswordResetRequest, action: 'approve' | 'deny'} | null>(null);

    const handleProcessRequest = () => {
        if (!requestToProcess) return;

        const { request, action } = requestToProcess;

        setRequests(prev => prev.filter(r => r.id !== request.id));
        
        toast({
            title: `Request ${action === 'approve' ? 'Approved' : 'Denied'}`,
            description: `Password reset for ${request.userName} has been ${action === 'approve' ? 'approved' : 'denied'}.`,
        });

        setRequestToProcess(null);
    }
  
    const openConfirmation = (request: PasswordResetRequest, action: 'approve' | 'deny') => {
        setRequestToProcess({ request, action });
    };


  return (
    <>
    <ConfirmationDialog
        open={!!requestToProcess}
        onOpenChange={(isOpen) => !isOpen && setRequestToProcess(null)}
        onConfirm={handleProcessRequest}
        title={`${requestToProcess?.action === 'approve' ? 'Approve' : 'Deny'} Request?`}
        description={`Are you sure you want to ${requestToProcess?.action} the password reset request for ${requestToProcess?.request.userName}?`}
        confirmButtonVariant={requestToProcess?.action === 'approve' ? 'default' : 'destructive'}
        confirmButtonText={`Yes, ${requestToProcess?.action === 'approve' ? 'Approve' : 'Deny'}`}
    />
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
                             <Button variant="outline" size="sm" onClick={() => openConfirmation(request, 'deny')}>
                                <XCircle className="mr-2 h-4 w-4" /> Deny
                            </Button>
                             <Button size="sm" onClick={() => openConfirmation(request, 'approve')}>
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
