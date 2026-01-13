
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure application-wide settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Settings page content will go here.</p>
      </CardContent>
    </Card>
  );
}
