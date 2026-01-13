
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage all user accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Users page content will go here.</p>
      </CardContent>
    </Card>
  );
}
