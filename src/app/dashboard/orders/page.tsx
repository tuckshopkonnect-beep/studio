
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>View and manage all student transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Orders page content will go here.</p>
      </CardContent>
    </Card>
  );
}
