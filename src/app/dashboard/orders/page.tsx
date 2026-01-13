
"use client";

import { useState } from 'react';
import { initialOrders, Order } from '@/lib/data';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Manage and fulfill incoming student orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                </TableCell>
                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                 <TableCell className="text-center">{format(new Date(order.orderDate), "PPp")}</TableCell>
                <TableCell className="text-center">
                  <Select
                    value={order.status}
                    onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className={cn("w-40 mx-auto",
                       {
                        'bg-accent/20 text-accent-foreground border-accent/40': order.status === 'Pending',
                        'bg-primary/10 text-primary border-primary/40': order.status === 'Preparing',
                        'bg-chart-2/20 text-chart-2 border-chart-2/40': order.status === 'Ready for Pickup',
                        'bg-muted text-muted-foreground border-border': order.status === 'Completed'
                      }
                    )}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Preparing">Preparing</SelectItem>
                      <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
