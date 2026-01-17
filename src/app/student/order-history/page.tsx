
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import type { CompletedOrder } from "@/hooks/use-cart";
import { useCart } from "@/hooks/use-cart";
import { format } from "date-fns";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function OrderHistoryPage() {
  const router = useRouter();
  const { setCompletedOrder } = useCart();
  
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();

  const orderHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(
        collection(firestore, `users/${authUser.uid}/orders`),
        orderBy("orderDate", "desc")
    );
  }, [firestore, authUser]);

  const { data: orderHistory, isLoading: isLoadingHistory } = useCollection<CompletedOrder>(orderHistoryQuery);

  const handleViewReceipt = (order: CompletedOrder) => {
    setCompletedOrder(order);
    router.push("/student/order/confirmation");
  };

  if (isUserLoading || isLoadingHistory) {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Order History</h1>
                <p className="text-muted-foreground">Review your past orders and receipts.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                    <CardDescription>
                        A list of all your recent transactions.
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
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                                    <p className="mt-2 text-muted-foreground">Loading your order history...</p>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground">Review your past orders and receipts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>
            A list of all your recent transactions.
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
                <TableHead className="text-right">Action</TableHead>
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
                    <TableCell className="text-right">
                      {order.status === "Ready for Pickup" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(order)}
                        >
                          View Receipt <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Orders Yet</h3>
                    <p className="text-muted-foreground">You haven't placed any orders.</p>
                    <Button asChild className="mt-4">
                      <Link href="/student/order">Start Shopping</Link>
                    </Button>
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
