
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, Search, VideoOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { initialOrders } from "@/lib/data"; // Using static data for now

export default function ScannerPage() {
  const [transactionId, setTransactionId] = useState("");
  const [scannedOrder, setScannedOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // In a real app, this would be a shared state (e.g., Context or Zustand)
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Note: QR scanning logic (e.g., using jsQR) is not implemented here
        // but this sets up the camera feed for it.
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser to use the QR scanner.',
        });
      }
    };

    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);


  const handleManualLookup = () => {
    setError(null);
    setScannedOrder(null);
    if (!transactionId) {
      setError("Please enter a Transaction ID.");
      return;
    }
    // Simulate finding an order from our "database"
    // In a real app, you would fetch this from your backend.
    // The confirmation page generates txn-..., but static data has ORD-...
    // We'll check for both formats for this prototype.
    const foundOrder = orders.find(
      (order) => order.id.toLowerCase() === transactionId.toLowerCase()
    );

    if (foundOrder) {
        setScannedOrder(foundOrder);
    } else {
        // Mock finding a newly created order that isn't in initialData
        if (transactionId.toLowerCase().startsWith('txn-')) {
             setScannedOrder({
                id: transactionId,
                customerName: "Alex Doe",
                items: [
                    { name: "Sausage Roll", quantity: 2 },
                    { name: "Orange Juice", quantity: 1 }
                ],
                total: 9.50,
                status: "Ready for Pickup",
            });
        } else {
            setError("Transaction ID not found.");
            setScannedOrder(null);
        }
    }
  };

  const handleMarkAsCompleted = () => {
    if (!scannedOrder) return;
    
    // Update the state of the order
    setOrders(prevOrders => prevOrders.map(order => 
        order.id === scannedOrder.id ? { ...order, status: 'Completed' } : order
    ));

    toast({
        title: "Order Completed",
        description: `Order #${scannedOrder.id} has been marked as completed.`
    });

    // Reset the scanner page
    setScannedOrder(null);
    setTransactionId("");
  };


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>POS Scanner</CardTitle>
          <CardDescription>
            Scan a student's QR code to verify their order or use the manual lookup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-md space-y-6">
            <div className="relative flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              {hasCameraPermission === false && (
                <div className="absolute text-center text-muted-foreground z-10">
                    <VideoOff className="mx-auto h-16 w-16" />
                    <p className="mt-2 font-semibold">Camera access denied</p>
                    <p className="text-sm">Please enable camera permissions in your browser.</p>
                </div>
              )}
               {hasCameraPermission === null && (
                <div className="absolute text-center text-muted-foreground z-10">
                    <QrCode className="mx-auto h-16 w-16 animate-pulse" />
                    <p className="mt-2 font-semibold">Requesting Camera...</p>
                </div>
              )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="transaction-id">Manual Transaction ID Lookup</Label>
                <div className="flex gap-2">
                <Input
                    id="transaction-id"
                    placeholder="Enter Transaction ID (e.g., ORD-004)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
                />
                <Button onClick={handleManualLookup}>
                    <Search className="mr-2 h-4 w-4" /> Lookup
                </Button>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {error && (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
       {hasCameraPermission === false && !scannedOrder && (
            <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access in your browser settings to use the QR scanner. You can still use the manual lookup.
                </AlertDescription>
            </Alert>
        )}
      {scannedOrder && (
        <Card>
            <CardHeader>
                <CardTitle>Order Found: {scannedOrder.id}</CardTitle>
                <CardDescription>Customer: {scannedOrder.customerName}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-sm">
                    {scannedOrder.items.map((item: any, index: number) => (
                        <li key={index} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                        </li>
                    ))}
                </ul>
                <hr className="my-4" />
                <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₦{scannedOrder.total.toFixed(2)}</span>
                </div>
                 <div className="mt-4 text-center">
                  Status: <span className="font-semibold text-primary">{scannedOrder.status}</span>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleMarkAsCompleted} disabled={scannedOrder.status === 'Completed'}>
                    {scannedOrder.status === 'Completed' ? 'Order Already Completed' : 'Mark as Completed'}
                 </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}

// Dummy Label component for compilation
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" />
);
