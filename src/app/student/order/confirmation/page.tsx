
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/hooks/use-cart.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Home, Loader2, AlertTriangle, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { initialUsers } from "@/lib/data";

export default function OrderConfirmationPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { cart, completedOrder, setCompletedOrder, clearCart } = useCart();
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const downloadTriggered = useRef(false);
    const [isPosEnabled, setIsPosEnabled] = useState(true);

    useEffect(() => {
        // Check if POS scanner is enabled from localStorage
        const posEnabled = localStorage.getItem('posScannerEnabled') !== 'false';
        setIsPosEnabled(posEnabled);
    }, []);

    const student = initialUsers.find(u => u.role === 'Student' && u.name === 'Alex Doe')!;
    const studentBalance = student ? student.balance - (completedOrder?.total ?? 0) : 0;

    const handleDownloadReceipt = async () => {
        if (completedOrder && qrCodeRef.current) {
            setIsDownloading(true);
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const { downloadReceiptPDF } = await import('@/lib/pdf-utils');
            try {
                // Pass isPosEnabled to the PDF utility
                await downloadReceiptPDF(completedOrder, student.name, studentBalance, isPosEnabled ? qrCodeRef : null, jsPDF, autoTable);
            } catch (error) {
                console.error("Failed to download PDF:", error);
            } finally {
                setIsDownloading(false);
            }
        }
    };
    
    useEffect(() => {
        // Auto-download only once when the component mounts with an order
        if (completedOrder && !downloadTriggered.current) {
            downloadTriggered.current = true;
            // Use a timeout to ensure the QR code is rendered before download
            setTimeout(() => handleDownloadReceipt(), 500);
        }
    }, [completedOrder]);

    useEffect(() => {
        // Clean up completed order from context and sessionStorage when user navigates away
        const handleRouteChange = () => {
            if (pathname !== '/student/order/confirmation') {
                 setCompletedOrder(null);
                 clearCart();
            }
        };
        
        handleRouteChange();

        return () => {
           handleRouteChange();
        };
    }, [pathname, setCompletedOrder, clearCart]);

    if (!completedOrder) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center text-center p-4 md:p-6 min-h-[calc(100vh-8rem)]">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl md:text-3xl font-bold mb-2">No Order Found</h1>
                <p className="text-muted-foreground mb-6">There are no completed order details to display.</p>
                <Button onClick={() => router.push('/student/dashboard')}>
                    <Home className="mr-2 h-4 w-4" /> Go to Dashboard
                </Button>
            </div>
        );
    }
  
    return (
        <div className="container mx-auto flex flex-col items-center justify-center p-4 md:p-6 min-h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-lg text-center shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
                <CardHeader className="bg-green-50 dark:bg-green-900/20 rounded-t-lg items-center py-6">
                    <CheckCircle className="h-16 w-16 text-green-600 mb-2" />
                    <CardTitle className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400">Order Placed Successfully!</CardTitle>
                    <CardDescription>
                        {isPosEnabled
                            ? "Show this QR code to the tuckshop staff to collect your order."
                            : "Your order is ready for pickup. Please state your name at the counter."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {isPosEnabled ? (
                        <div ref={qrCodeRef} className="p-4 bg-white rounded-lg my-4 flex items-center justify-center mx-auto max-w-xs">
                            <QRCode value={completedOrder.id} size={256} />
                        </div>
                    ) : (
                        <div className="p-4 bg-muted rounded-lg my-4 flex flex-col items-center justify-center mx-auto max-w-xs">
                           <QrCode className="h-24 w-24 text-muted-foreground opacity-30" />
                           <p className="mt-2 text-sm text-muted-foreground">QR Code scanning is disabled.</p>
                        </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                        <p>Transaction ID:</p>
                        <p className="font-mono">{completedOrder.id}</p>
                    </div>
                    <ul className="text-left text-sm space-y-2 border-t border-b py-4">
                       {completedOrder.items.map(item => (
                            <li key={item.id} className="flex justify-between">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-medium">₦{(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                       ))}
                    </ul>
                     <div className="text-right font-bold text-lg">
                        Total: ₦{completedOrder.total.toFixed(2)}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <Button onClick={handleDownloadReceipt} disabled={isDownloading}>
                            {isDownloading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Receipt Again
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/student/dashboard')}>
                            <Home className="mr-2 h-4 w-4" /> Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
