
"use client";
import React, { useState, useEffect } from "react";

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
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [posScannerEnabled, setPosScannerEnabled] = useState(true);

  useEffect(() => {
    const storedValue = localStorage.getItem('posScannerEnabled');
    // Set to true if not found in storage, making it enabled by default
    setPosScannerEnabled(storedValue !== 'false');
  }, []);

  const handlePosScannerToggle = (enabled: boolean) => {
    setPosScannerEnabled(enabled);
    localStorage.setItem('posScannerEnabled', String(enabled));
     // Optional: force a reload to reflect sidebar changes immediately, though not ideal.
     // window.location.reload(); 
  };


  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader>
          <CardTitle>Spending Limits</CardTitle>
          <CardDescription>Set the default daily spending limits for students.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="jss-limit">Junior Students (JSS)</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₦</span>
                <Input id="jss-limit" type="number" defaultValue="1000.00" className="pl-6" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sss-limit">Senior Students (SSS)</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₦</span>
                <Input id="sss-limit" type="number" defaultValue="1500.00" className="pl-6" />
              </div>
            </div>
            <div className="md:col-span-2">
              <Button>Save Limits</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store Controls</CardTitle>
            <CardDescription>Manage the operational status of the tuck shop.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="flex-1">
                    <Label htmlFor="stop-orders" className="font-semibold">Stop All Orders</Label>
                    <p className="text-xs text-muted-foreground">
                    Temporarily disable all new orders from being placed.
                    </p>
                </div>
                <Switch id="stop-orders" aria-label="Stop all orders" />
            </div>
             <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="flex-1">
                <Label htmlFor="order-timer" className="font-semibold">Enable Order Timer</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically open and close the shop at specific times.
                </p>
              </div>
              <Switch id="order-timer" aria-label="Enable order timer" />
            </div>
             <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="flex-1">
                <Label htmlFor="pos-scanner" className="font-semibold">Enable POS Scanner</Label>
                <p className="text-xs text-muted-foreground">
                  Allow staff to scan QR codes to verify orders.
                </p>
              </div>
              <Switch 
                id="pos-scanner" 
                aria-label="Enable POS Scanner" 
                checked={posScannerEnabled}
                onCheckedChange={handlePosScannerToggle}
              />
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
              <Label className="text-base font-semibold">Promote All Students</Label>
              <p className="text-sm text-muted-foreground">
                Move all students to their next class level (e.g., JSS1 to JSS2). This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive">Promote Students</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
