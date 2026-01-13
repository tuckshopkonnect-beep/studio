
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

export default function ScannerPage() {
  const [transactionId, setTransactionId] = useState("");
  const [scannedOrder, setScannedOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
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
    // In a real application, you would fetch the order details from your backend.
    // For now, we'll simulate finding an order.
    if (transactionId.includes("ORD") || transactionId.includes("txn")) {
        setScannedOrder({
            id: transactionId,
            customerName: "Emma Brown",
            items: [
                { name: "Sausage Roll", quantity: 4 }
            ],
            total: 1400.00,
            status: "Ready for Pickup",
        });
    } else {
        setError("Transaction ID not found.");
    }
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
                    <QrCode className="mx-auto h-16 w-16" />
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
       {hasCameraPermission === false && (
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
            </CardContent>
            <CardFooter>
                 <Button className="w-full">Mark as Completed</Button>
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
