
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Controls</CardTitle>
          <CardDescription>Manage the operational status of the tuck shop.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="stop-orders" className="text-base">Stop All Orders</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable all new orders from being placed.
                </p>
              </div>
              <Switch id="stop-orders" aria-label="Stop all orders" />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="order-timer" className="text-base">Enable Order Timer</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically open and close the shop at specific times.
                </p>
              </div>
              <Switch id="order-timer" aria-label="Enable order timer" />
            </div>
          </form>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Spending Limits</CardTitle>
          <CardDescription>Set the default daily spending limits for students.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="jss-limit">Junior Students (JSS)</Label>
              <Input id="jss-limit" type="number" defaultValue="10.00" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sss-limit">Senior Students (SSS)</Label>
              <Input id="sss-limit" type="number" defaultValue="15.00" />
            </div>
            <div className="md:col-span-2">
              <Button>Save Limits</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Academics</CardTitle>
          <CardDescription>
            Manage end-of-year academic tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-base">Promote All Students</Label>
              <p className="text-sm text-muted-foreground">
                Move all students to their next class level (e.g., JSS1 to JSS2). This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive">Promote Students</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway</CardTitle>
          <CardDescription>
            View your integration details for Paystack.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
              <Label htmlFor="paystack-key">Paystack Public Key</Label>
              <Input id="paystack-key" defaultValue="pk_test_94b05b50b19eae02848d09a3b44a52aab1eec139" readOnly />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
