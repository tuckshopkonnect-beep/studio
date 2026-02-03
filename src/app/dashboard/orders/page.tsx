
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
import type { Order } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ListFilter, MoreHorizontal, File, Download, ShoppingBag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, doc, where, increment } from "firebase/firestore";
import AccessDenied from "@/components/AccessDenied";

export default function OrdersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();

  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useDoc(currentUserDocRef);
  const isCurrentUserAdmin = currentUserProfile?.role === 'Admin';
  
  // Use hybrid filtering logic to support legacy orders for legacy admins
  const ordersCollection = useMemoFirebase(() => {
    if (!firestore || !isCurrentUserAdmin) return null;
    return collection(firestore, "orders");
  }, [firestore, isCurrentUserAdmin]);

  const { data: rawOrders, isLoading: isLoadingOrders } = useCollection<Order>(ordersCollection);

  const adminSchoolId = currentUserProfile?.schoolId;

  const orders = React.useMemo(() => {
    if (!rawOrders) return [];
    return rawOrders.filter(o => !o.schoolId || o.schoolId === adminSchoolId);
  }, [rawOrders, adminSchoolId]);

  const [orderToCancel, setOrderToCancel] = React.useState<Order | null>(null);

  const handleExportPDF = async () => {
    if (!orders) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { exportOrdersPDF } = await import('@/lib/pdf-utils');
    exportOrdersPDF(orders, jsPDF, autoTable);
  };

  const handleExportCSV = async () => {
    if(!orders) return;
    const { exportOrdersCSV } = await import('@/lib/csv-utils');
    exportOrdersCSV(orders);
  };
  
  const handleCancelOrder = () => {
    if (!orderToCancel || !firestore) return;
    
    // 1. Refund the student's balance
    if (orderToCancel.userId && orderToCancel.total > 0) {
        const userDocRef = doc(firestore, 'users', orderToCancel.userId);
        updateDocumentNonBlocking(userDocRef, {
            balance: increment(orderToCancel.total)
        });
    }

    // 2. Restore item stock
    if (orderToCancel.items && orderToCancel.items.length > 0) {
        orderToCancel.items.forEach(item => {
            const menuItem = item as any;
            if (menuItem.id && menuItem.quantity > 0) {
                const menuItemRef = doc(firestore, 'menuItems', menuItem.id);
                updateDocumentNonBlocking(menuItemRef, {
                    stock: increment(menuItem.quantity)
                });
            }
        });
    }
    
    // 3. Delete the order records
    const adminOrderRef = doc(firestore, "orders", orderToCancel.id);
    deleteDocumentNonBlocking(adminOrderRef);

    if (orderToCancel.userId) {
        const userOrderRef = doc(firestore, "users", orderToCancel.userId, "orders", orderToCancel.id);
        deleteDocumentNonBlocking(userOrderRef);
    }
    
    toast({
      title: "Order Cancelled & Refunded",
      description: `Order #${orderToCancel.id} has been cancelled. ₦${orderToCancel.total.toFixed(2)} refunded and stock updated.`,
    });
    setOrderToCancel(null);
  };

  if (isUserLoading || isLoadingCurrentUser) {
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
        open={!!orderToCancel}
        onOpenChange={(isOpen) => !isOpen && setOrderToCancel(null)}
        onConfirm={handleCancelOrder}
        title={`Cancel Order #${orderToCancel?.id}?`}
        description="This will refund the student and restock the items. This action cannot be undone."
        confirmButtonVariant="destructive"
        confirmButtonText="Yes, Cancel & Refund"
    />
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ready">Ready for Pickup</TabsTrigger>
          <TabsTrigger value="preparing">Preparing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ListFilter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Ready for Pickup
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Preparing</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={!orders || orders.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportPDF}>Export to PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>Export to CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TabsContent value="all">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>View and manage all student transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingOrders ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading orders...</p>
                    </TableCell>
                </TableRow>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {order.customerName.toLowerCase().replace(" ", ".")}@school.com
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'Ready for Pickup' ? 'outline' :
                        order.status === 'Completed' ? 'default' :
                        order.status === 'Preparing' ? 'secondary' : 'destructive'
                      }>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">₦{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => alert(`Viewing details for order #${order.id}`)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => alert(`Viewing student ${order.customerName}`)}>View Student</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setOrderToCancel(order)}
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Orders Yet</h3>
                        <p className="text-muted-foreground">When new orders are placed, they will appear here.</p>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </TabsContent>
    </Tabs>
    </>
  );
}
