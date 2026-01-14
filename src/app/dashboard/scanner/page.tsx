
"use client";

import { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
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
import { QrCode, Search, VideoOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { initialOrders } from "@/lib/data"; // Using static data for now

export default function ScannerPage() {
  const [transactionId, setTransactionId] = useState("");
  const [scannedOrder, setScannedOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  // In a real app, this would be a shared state (e.g., Context or Zustand)
  const [orders, setOrders] = useState(initialOrders);
  
  useEffect(() => {
    // When the component unmounts, stop the camera and scanning loop
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScan = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not available on this browser");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
        videoRef.current.play();
        setIsScanning(true);
        animationFrameId.current = requestAnimationFrame(tick);
      }

    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser to use the QR scanner.',
      });
    }
  };

  useEffect(() => {
    // Start scanning when component mounts
    startScan();
  }, [toast]);
  

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
          });

          if (code) {
            setTransactionId(code.data);
            handleManualLookup(code.data); // Automatically look up after scan
            
            // Stop scanning
            setIsScanning(false);
            if (animationFrameId.current) {
               cancelAnimationFrame(animationFrameId.current);
            }
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }

            toast({
                title: "QR Code Scanned!",
                description: `Transaction ID: ${code.data}`,
            })
            return; // Exit the loop
          }
      }
    }
    // Continue scanning if no code is found
    animationFrameId.current = requestAnimationFrame(tick);
  };


  const handleManualLookup = (idToLookup?: string) => {
    const lookupId = idToLookup || transactionId;
    setError(null);
    setScannedOrder(null);
    if (!lookupId) {
      setError("Please enter or scan a Transaction ID.");
      return;
    }
    
    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]') || initialOrders;
    
    const foundOrder = allOrders.find(
      (order: any) => order.id.toLowerCase() === lookupId.toLowerCase()
    );

    if (foundOrder) {
        setScannedOrder(foundOrder);
    } else {
        // Mock finding a newly created order that isn't in initialData
        if (lookupId.toLowerCase().startsWith('txn-')) {
             setScannedOrder({
                id: lookupId,
                customerName: "Alex Doe", // This part is mocked
                items: [
                    { name: "Sausage Roll", quantity: 2 },
                    { name: "Orange Juice", quantity: 1 }
                ],
                total: 1400,
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
    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    const updatedOrders = allOrders.map((order: any) => 
        order.id === scannedOrder.id ? { ...order, status: 'Completed' } : order
    );
    localStorage.setItem('allOrders', JSON.stringify(updatedOrders));

    toast({
        title: "Order Completed",
        description: `Order #${scannedOrder.id} has been marked as completed.`
    });

    // Reset the scanner page
    setScannedOrder(null);
    setTransactionId("");
    startScan(); // Restart scanning for the next order
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
              <video ref={videoRef} className="w-full h-full object-cover" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {hasCameraPermission === false && (
                <div className="absolute text-center text-muted-foreground z-10 p-4">
                    <VideoOff className="mx-auto h-16 w-16" />
                    <p className="mt-2 font-semibold">Camera access denied</p>
                    <p className="text-sm">Please enable camera permissions in your browser settings and refresh the page.</p>
                </div>
              )}
               {hasCameraPermission === null && (
                <div className="absolute text-center text-muted-foreground z-10">
                    <Loader2 className="mx-auto h-16 w-16 animate-spin" />
                    <p className="mt-2 font-semibold">Requesting Camera...</p>
                </div>
              )}
              {isScanning && hasCameraPermission && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2/3 h-2/3 border-4 border-primary/50 rounded-lg animate-pulse" />
                  </div>
              )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="transaction-id">Manual Transaction ID Lookup</Label>
                <div className="flex gap-2">
                <Input
                    id="transaction-id"
                    placeholder="Enter or scan a Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
                />
                <Button onClick={() => handleManualLookup()}>
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
            <CardFooter className="flex-col gap-2">
                 <Button className="w-full" onClick={handleMarkAsCompleted} disabled={scannedOrder.status === 'Completed'}>
                    {scannedOrder.status === 'Completed' ? 'Order Already Completed' : 'Mark as Completed & Collect'}
                 </Button>
                 <Button variant="outline" className="w-full" onClick={() => { setScannedOrder(null); setTransactionId(''); startScan(); }}>
                    Scan Next
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
