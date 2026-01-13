
"use client";

import { useCart } from "@/hooks/use-cart.tsx";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { initialUsers } from "@/lib/data";


export default function OrderSummary() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const [orderResult, setOrderResult] = useState<{ id: string; success: boolean, items: typeof cartItems, total: number } | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);


  // In a real app, this would come from an auth context
  const student = initialUsers.find(u => u.role === 'Student' && u.name === 'Alex Doe')!;
  const spentToday = 450.00; // Mock data, would come from transactions

  const potentialBalance = student.balance - totalPrice;
  const potentialSpentToday = spentToday + totalPrice;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Your cart is empty",
        description: "Please add items to your cart before placing an order.",
      });
      return;
    }

    if (totalPrice > student.balance) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `Your balance is ₦${student.balance.toFixed(2)}, but the order total is ₦${totalPrice.toFixed(2)}.`,
      });
      return;
    }

    if (student.dailyLimit && potentialSpentToday > student.dailyLimit) {
      const remainingLimit = student.dailyLimit - spentToday;
      toast({
        variant: "destructive",
        title: "Daily Limit Exceeded",
        description: `This order would exceed your daily spending limit. You have ₦${remainingLimit.toFixed(2)} left to spend today.`,
      });
      return;
    }
    
    // In a real app, this would be a call to the backend to create the order
    // and would involve payment processing.
    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.log("Order placed with transaction ID:", transactionId);

    // For now, we'll just simulate a successful order.
    setOrderResult({ id: transactionId, success: true, items: [...cartItems], total: totalPrice });
    clearCart();
  };

  const closeDialog = () => {
    setOrderResult(null);
  }

  const downloadReceipt = async () => {
    if (!orderResult) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();

    doc.text("Order Receipt", 14, 20);
    doc.text(`Transaction ID: ${orderResult.id}`, 14, 30);
    doc.text(`Student: ${student.name}`, 14, 36);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 42);

    autoTable(doc, {
        head: [['Item', 'Quantity', 'Price', 'Total']],
        body: orderResult.items.map(item => [
            item.name,
            item.quantity,
            `₦${item.price.toFixed(2)}`,
            `₦${(item.price * item.quantity).toFixed(2)}`
        ]),
        startY: 50,
    });
    
    let finalY = (doc as any).lastAutoTable.finalY || 70;

    doc.setFontSize(14);
    doc.text(`Total: ₦${orderResult.total.toFixed(2)}`, 14, finalY + 10);
    
    // Add QR code
    if (qrCodeRef.current) {
        const svgElement = qrCodeRef.current.querySelector('svg');
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement("canvas");
            const svgSize = svgElement.getBoundingClientRect();
            canvas.width = svgSize.width;
            canvas.height = svgSize.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const img = document.createElement("img");
                img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL("image/png");
                    doc.addImage(dataUrl, 'PNG', 14, finalY + 20, 50, 50);
                    doc.save(`receipt-${orderResult.id}.pdf`);
                };
            }
        }
    } else {
        doc.save(`receipt-${orderResult.id}.pdf`);
    }
  };


  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-6">
          {cartItems.length === 0 && !orderResult ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
              <ShoppingCart className="h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p>Add some tasty items from the menu!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                    <Image
                      src={item.image.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      data-ai-hint={item.image.imageHint}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₦{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      {cartItems.length > 0 && (
        <div className="p-6 border-t bg-background">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Balance</span>
              <span>₦{student.balance.toFixed(2)}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">Order Total</span>
              <span>- ₦{totalPrice.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span className="text-muted-foreground">Potential Balance</span>
              <span className={potentialBalance < 0 ? "text-destructive" : ""}>
                ₦{potentialBalance.toFixed(2)}
              </span>
            </div>
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" onClick={handlePlaceOrder}>
            Place Order (₦{totalPrice.toFixed(2)})
          </Button>
        </div>
      )}

      <Dialog open={!!orderResult} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Order Placed Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Show this QR code to the tuckshop staff to collect your order.
            </DialogDescription>
          </DialogHeader>
          <div ref={qrCodeRef} className="p-4 bg-white rounded-lg my-4 flex items-center justify-center">
             {orderResult?.id && <QRCode value={orderResult.id} size={256} />}
          </div>
           <div className="text-center text-sm text-muted-foreground">
              Transaction ID: {orderResult?.id}
            </div>
          <div className="flex flex-col gap-2 mt-4">
             <Button variant="outline" onClick={downloadReceipt}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
            </Button>
            <Button onClick={closeDialog}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
