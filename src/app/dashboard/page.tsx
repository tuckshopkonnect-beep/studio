
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, ShoppingBag, Users, Activity, Star } from "lucide-react";
import { initialOrders, initialUsers, initialInventory, menuItems } from "@/lib/data";
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

const totalRevenue = initialOrders.reduce((acc, order) => acc + order.total, 0);
const totalOrders = initialOrders.length;
const totalUsers = initialUsers.length;
const totalItemsSold = initialOrders.flatMap(o => o.items).reduce((acc, item) => acc + item.quantity, 0);

// Calculate top selling items
const itemSales = initialOrders.flatMap(o => o.items).reduce((acc, item) => {
  acc[item.name] = (acc[item.name] || 0) + item.quantity;
  return acc;
}, {} as Record<string, number>);

const topSellingItems = Object.entries(itemSales)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([name, quantity]) => ({
    name,
    quantity,
    image: menuItems.find(mi => mi.name === name)?.image.imageUrl || 'https://placehold.co/100x100'
  }));

const recentActivities = [
  { type: "New Order", description: "Order #ORD-005 placed by James Jones.", time: "5 minutes ago" },
  { type: "New User", description: "A new parent account was created for Mrs. Brown.", time: "1 hour ago" },
  { type: "Low Stock", description: "Stock for 'Meat Pie' is running low.", time: "3 hours ago" },
  { type: "New Order", description: "Order #ORD-004 placed by Emma Brown.", time: "Yesterday" },
  { type: "User Update", description: "Admin User updated settings for spending limits.", time: "Yesterday" },
];

export default function DashboardPage() {
  const recentOrders = initialOrders.slice(0, 5);
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12.2% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalItemsSold}</div>
            <p className="text-xs text-muted-foreground">+31 since yesterday</p>
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
              {recentOrders.map((order) => (
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
              ))}
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
              {recentActivities.map((activity, index) => (
                 <div key={index} className="flex items-center gap-4">
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
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
                        {topSellingItems.map((item) => (
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
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
       </div>
    </div>
  )
}
