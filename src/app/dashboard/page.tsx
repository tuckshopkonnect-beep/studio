
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, ShoppingBag, Users, Activity, Star, ShoppingCart, ArrowDown, ArrowUp, Archive, BarChart, Loader2 } from "lucide-react";
import type { Order, User, MenuItem } from '@/lib/data';
import WeeklySalesChart from "@/components/WeeklySalesChart";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "orders"));
  }, [firestore, user]);
  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
  
  const usersCollection = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, "users")
    }, [firestore, user]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollection);
  
  const menuItemsCollection = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, "menuItems");
    }, [firestore, user]);
  const { data: menuItems, isLoading: isLoadingMenuItems } = useCollection<MenuItem>(menuItemsCollection);


  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfThisYear = new Date(now.getFullYear(), 0, 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const safeOrders = orders || [];

  const ordersThisMonth = safeOrders.filter(o => new Date(o.orderDate) >= startOfThisMonth);

  const revenueThisMonth = ordersThisMonth.reduce((acc, order) => acc + order.total, 0);
  
  const revenueLastMonth = safeOrders
    .filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
    })
    .reduce((acc, order) => acc + order.total, 0);

  const revenueThisYear = safeOrders
    .filter(o => new Date(o.orderDate) >= startOfThisYear)
    .reduce((acc, order) => acc + order.total, 0);
    
  const ordersLast7Days = safeOrders.filter(o => new Date(o.orderDate) >= sevenDaysAgo).length;
  const ordersPrevious7Days = safeOrders.filter(o => {
      const orderDate = new Date(o.orderDate);
      return orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo;
  }).length;

  const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) {
          return current > 0 ? 100 : 0;
      }
      return ((current - previous) / previous) * 100;
  };

  const monthlyRevenueChange = calculatePercentageChange(revenueThisMonth, revenueLastMonth);
  const weeklyOrderChange = calculatePercentageChange(ordersLast7Days, ordersPrevious7Days);

  const totalUsers = users?.length ?? 0;
  
  // Mock low stock count as we cannot query inventory directly
  const lowStockItemsCount = 5;
  
  const averageOrderValue = ordersThisMonth.length > 0 ? revenueThisMonth / ordersThisMonth.length : 0;


  // Calculate top selling items
  const itemSales = safeOrders.flatMap(o => o.items).reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topSellingItems = Object.entries(itemSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, quantity]) => ({
      name,
      quantity,
      image: PlaceHolderImages.find(mi => mi.id === name.toLowerCase().replace(/ /g, '-'))?.imageUrl || 'https://placehold.co/100x100'
    }));

  const recentActivities: any[] = [
    // This will now be empty by default
  ];

  const recentOrders = safeOrders.slice(0, 5);

  if (isUserLoading || isLoadingOrders || isLoadingUsers || isLoadingMenuItems) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue (This Month)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{revenueThisMonth.toFixed(2)}</div>
            <p className={cn(
              "text-xs flex items-center",
              monthlyRevenueChange >= 0 ? "text-green-600" : "text-destructive"
            )}>
              {monthlyRevenueChange >= 0 ? <ArrowUp className="h-4 w-4 mr-1"/> : <ArrowDown className="h-4 w-4 mr-1"/>}
              {monthlyRevenueChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
             Total Revenue (This Year)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{revenueThisYear.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue from successful sales in {now.getFullYear()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders (7 days)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{ordersLast7Days}</div>
            <p className={cn(
              "text-xs flex items-center",
              weeklyOrderChange >= 0 ? "text-green-600" : "text-destructive"
            )}>
              {weeklyOrderChange >= 0 ? <ArrowUp className="h-4 w-4 mr-1"/> : <ArrowDown className="h-4 w-4 mr-1"/>}
              {weeklyOrderChange.toFixed(1)}% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{lowStockItemsCount}</div>
                <p className="text-xs text-muted-foreground">Items needing restock</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₦{averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">For this month</p>
            </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Weekly Sales</CardTitle>
            <CardDescription>A visual representation of sales over the past week.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <WeeklySalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Your 5 most recent orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
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
                  <TableCell className="hidden sm:table-cell">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">₦{order.total.toFixed(2)}</TableCell>
                </TableRow>
              ))) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No recent orders.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A log of recent events in the system.</CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/dashboard/reports">
                    View All
                    <Activity className="h-4 w-4" />
                  </Link>
                </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
              {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                 <div key={index} className="flex items-center gap-4">
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">{activity.time}</div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>No recent activity.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>The most popular items this week.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Quantity Sold</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topSellingItems.length > 0 ? (
                          topSellingItems.map((item) => (
                          <TableRow key={item.name}>
                              <TableCell>
                                <div className="flex items-center gap-4">
                                  <Avatar className="hidden h-10 w-10 sm:flex rounded-md">
                                    <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                                    <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="font-medium">{item.name}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                          </TableRow>
                        ))
                        ) : (
                          <TableRow>
                              <TableCell colSpan={2} className="h-24 text-center">
                                  No items sold yet.
                              </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
       </div>
    </div>
  )
}
