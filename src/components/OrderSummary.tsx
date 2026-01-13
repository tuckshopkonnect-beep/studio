
"use client";

import { useCart } from "@/hooks/use-cart.tsx";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart, CircleCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function OrderSummary() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const [justOrdered, setJustOrdered] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      setJustOrdered(false);
    }
  }, [cartItems]);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Your cart is empty",
        description: "Please add items to your cart before placing an order.",
      });
      return;
    }
    
    // In a real app, this would trigger payment processing and order creation.
    clearCart();
    setJustOrdered(true);
  };

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-6">
          {cartItems.length === 0 ? (
            justOrdered ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                <CircleCheck className="h-16 w-16 mb-4 text-chart-2" />
                <p className="text-lg font-semibold">Order Placed!</p>
                <p>Thank you for your order.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p className="text-lg font-semibold">Your cart is empty</p>
                <p>Add some tasty items from the menu!</p>
              </div>
            )
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
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
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
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
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
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" onClick={handlePlaceOrder}>
            Place Order
          </Button>
        </div>
      )}
    </>
  );
}
