'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
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
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Loader2, UserX } from "lucide-react";
import type { CompletedOrder } from "@/hooks/use-cart";
import { format } from "date-fns";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import type { User } from '@/lib/data';
import AccessDenied from '@/components/AccessDenied';

export default function ParentChildHistoryPage() {
  const params = useParams();
  const childId = params.childId as string;
  
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();

  // 1. Fetch parent's data to verify relationship
  const parentDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: parent, isLoading: isLoadingParent } = useDoc<User>(parentDocRef);
  
  // 2. Fetch child's data to get their name
  const childDocRef = useMemoFirebase(() => {
    if (!firestore || !childId) return null;
    return doc(firestore, 'users', childId);
  }, [firestore, childId]);
  const { data: child, isLoading: isLoadingChild } = useDoc<User>(childDocRef);

  // 3. Fetch order history for the child
  const orderHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !childId) return null;
    return query(
        collection(firestore, `users/${childId}/orders`),
        orderBy("orderDate", "desc")
    );
  }, [firestore, childId]);
  const { data: orderHistory, isLoading: isLoadingHistory } = useCollection<CompletedOrder>(orderHistoryQuery);

  const isAuthorized = parent?.childIds && parent.childIds[childId];
  const isLoading = isUserLoading || isLoadingParent || isLoadingChild || isLoadingHistory;

  if (isLoading) {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Order History</h1>
                <p className="text-muted-foreground">Reviewing past orders and receipts.</p>
            </div>
            <Card>
                <CardContent className="h-96 flex items-center justify-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    )
  }

  // Security check after loading has finished
  if (!isAuthorized) {
    return <AccessDenied currentUserProfile={parent} message="You do not have permission to view this child's history." />;
  }

  if (!child) {
    return (
        <div className="container mx-auto p-4 md:p-6 text-center">
          <UserX className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Child Not Found</h1>
          <p className="text-muted-foreground">We couldn't find a profile for this child.</p>
           <Button asChild className="mt-4">
            <Link href="/parent/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        </div>
      );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
            <Link href="/parent/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Order History for {child.name}</h1>
        <p className="text-muted-foreground">Reviewing past orders and receipts for your child.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{child.name}'s Orders</CardTitle>
          <CardDescription>
            A list of all recent transactions for this child.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderHistory && orderHistory.length > 0 ? (
                orderHistory.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id.substring(0, 11)}</TableCell>
                    <TableCell>{format(new Date(order.orderDate), "PPp")}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'Ready for Pickup' ? 'outline' :
                        order.status === 'Completed' ? 'default' : 'secondary'
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">₦{order.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Orders Yet</h3>
                    <p className="text-muted-foreground">{child.name} hasn't placed any orders.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
