
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [posScannerEnabled, setPosScannerEnabled] = useState(true);
  const [orderTimerEnabled, setOrderTimerEnabled] = useState(false);
  const [orderOpenTime, setOrderOpenTime] = useState("08:00");
  const [orderCloseTime, setOrderCloseTime] = useState("14:00");
  const [stopOrders, setStopOrders] = useState(false);

  useEffect(() => {
    const storedPosScanner = localStorage.getItem('posScannerEnabled');
    setPosScannerEnabled(storedPosScanner !== 'false');
    
    const storedOrderTimer = localStorage.getItem('orderTimerEnabled');
    setOrderTimerEnabled(storedOrderTimer === 'true');

    const storedOpenTime = localStorage.getItem('orderOpenTime') || "08:00";
    setOrderOpenTime(storedOpenTime);
    
    const storedCloseTime = localStorage.getItem('orderCloseTime') || "14:00";
    setOrderCloseTime(storedCloseTime);

    const storedStopOrders = localStorage.getItem('stopOrders');
    setStopOrders(storedStopOrders === 'true');

  }, []);

  const handlePosScannerToggle = (enabled: boolean) => {
    setPosScannerEnabled(enabled);
    localStorage.setItem('posScannerEnabled', String(enabled));
     // Optional: force a reload to reflect sidebar changes immediately, though not ideal.
     window.location.reload(); 
  };

  const handleOrderTimerToggle = (enabled: boolean) => {
    setOrderTimerEnabled(enabled);
    localStorage.setItem('orderTimerEnabled', String(enabled));
  };
  
  const handleTimeChange = () => {
    localStorage.setItem('orderOpenTime', orderOpenTime);
    localStorage.setItem('orderCloseTime', orderCloseTime);
    toast({
        title: "Order times saved",
        description: "The shop open and close times have been updated."
    });
  };

  const handleStopOrdersToggle = (enabled: boolean) => {
    setStopOrders(enabled);
    localStorage.setItem('stopOrders', String(enabled));
    toast({
        title: enabled ? "All orders have been stopped" : "Ordering has been re-enabled",
        variant: enabled ? "destructive" : "default"
    });
  };


  return (
    <div className="grid gap-6">
       <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Default Spending Limits</CardTitle>
            <CardDescription>Set the default daily spending limits for all students by class level.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6">
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
            </form>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button>Save Defaults</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Individual Spending Limits</CardTitle>
            <CardDescription>
                To override the default limits for a specific student, find the user and edit their profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
                You can set a custom daily spending limit for any individual student from the main user management page.
            </p>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
             <Button asChild variant="outline">
                <Link href="/dashboard/users">
                  Manage Users <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
             </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store Controls</CardTitle>
            <CardDescription>Manage the operational status of the tuck shop.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between space-x-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex-1">
                    <Label htmlFor="stop-orders" className="font-semibold text-destructive">Stop All Orders (Override)</Label>
                    <p className="text-xs text-muted-foreground">
                    Temporarily disable all new orders from being placed. This will override the timer.
                    </p>
                </div>
                <Switch 
                    id="stop-orders" 
                    aria-label="Stop all orders" 
                    checked={stopOrders}
                    onCheckedChange={handleStopOrdersToggle}
                />
            </div>
             <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                    <Label htmlFor="order-timer" className="font-semibold">Enable Order Timer</Label>
                    <p className="text-xs text-muted-foreground">
                    Automatically open and close the shop at specific times.
                    </p>
                </div>
                <Switch 
                    id="order-timer" 
                    aria-label="Enable order timer" 
                    checked={orderTimerEnabled}
                    onCheckedChange={handleOrderTimerToggle}
                    disabled={stopOrders}
                />
              </div>
              {orderTimerEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="grid gap-2">
                        <Label htmlFor="open-time">Open Time</Label>
                        <Input 
                            id="open-time" 
                            type="time" 
                            value={orderOpenTime}
                            onChange={(e) => setOrderOpenTime(e.target.value)}
                            onBlur={handleTimeChange}
                            disabled={stopOrders}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="close-time">Close Time</Label>
                        <Input 
                            id="close-time" 
                            type="time" 
                            value={orderCloseTime}
                            onChange={(e) => setOrderCloseTime(e.target.value)}
                            onBlur={handleTimeChange}
                            disabled={stopOrders}
                        />
                    </div>
                </div>
              )}
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

    