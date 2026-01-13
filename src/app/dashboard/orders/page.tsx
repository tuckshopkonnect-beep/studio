
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
import { initialOrders } from "@/lib/data";
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
import { ListFilter, MoreHorizontal, File, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const [orderToCancel, setOrderToCancel] = React.useState<Order | null>(null);

  React.useEffect(() => {
    // In a real app, you'd fetch this from a server. Here we use localStorage.
    if (typeof window !== 'undefined') {
        const storedOrders = localStorage.getItem('allOrders');
        const allOrders = storedOrders ? JSON.parse(storedOrders) : initialOrders;
        setOrders(allOrders);
    }
  }, []);

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { exportOrdersPDF } = await import('@/lib/pdf-utils');
    exportOrdersPDF(orders, jsPDF, autoTable);
  };

  const handleExportCSV = async () => {
    const { exportOrdersCSV } = await import('@/lib/csv-utils');
    exportOrdersCSV(orders);
  };
  
  const handleCancelOrder = () => {
    if (!orderToCancel) return;
    
    const updatedOrders = orders.filter(order => order.id !== orderToCancel.id);
    setOrders(updatedOrders);
    localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
    
    toast({
      title: "Order Cancelled",
      description: `Order #${orderToCancel.id} has been cancelled.`,
    });
    setOrderToCancel(null);
  };

  return (
    <>
    <ConfirmationDialog
        open={!!orderToCancel}
        onOpenChange={(isOpen) => !isOpen && setOrderToCancel(null)}
        onConfirm={handleCancelOrder}
        title={`Cancel Order #${orderToCancel?.id}?`}
        description="This will remove the order from the active list. This action may require manual refund processing."
        confirmButtonVariant="destructive"
        confirmButtonText="Yes, Cancel Order"
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
              <Button size="sm" variant="outline">
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
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {/* In a real app, this would be the customer's email */}
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
                            className="text-destructive"
                            onSelect={() => setOrderToCancel(order)}
                        >
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </TabsContent>
    </Tabs>
    </>
  );
}
