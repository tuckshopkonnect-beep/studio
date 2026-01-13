
"use client";

import { useCart } from "@/hooks/use-cart.tsx";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { User, Order } from "@/lib/data";
import { CompletedOrder } from "@/hooks/use-cart";


interface OrderSummaryProps {
  student?: User;
  spentToday: number;
}

export default function OrderSummary({ student, spentToday }: OrderSummaryProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice, setCompletedOrder, addOrderToHistory } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  if (!student) {
      // Handle case where student is not found or not logged in
      return <div className="p-6 text-center text-muted-foreground">Please log in as a student to place an order.</div>
  }

  const potentialBalance = student.balance - totalPrice;
  const potentialSpentToday = spentToday + totalPrice;
  const remainingLimit = student.dailyLimit ? student.dailyLimit - spentToday : Infinity;

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
      toast({
        variant: "destructive",
        title: "Daily Limit Exceeded",
        description: `This order would exceed your daily spending limit. You have ₦${remainingLimit.toFixed(2)} left to spend today.`,
      });
      return;
    }
    
    const newOrder: CompletedOrder = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      items: [...cartItems],
      total: totalPrice,
      status: 'Ready for Pickup', // New orders are ready for pickup
      orderDate: new Date().toISOString(),
    };

    setCompletedOrder(newOrder);
    addOrderToHistory(newOrder);
    clearCart();
    router.push('/student/order/confirmation');
  };


  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-6">
          {cartItems.length === 0 ? (
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
              <span className="text-muted-foreground">Daily Limit Remaining</span>
              <span className={remainingLimit < totalPrice ? "text-destructive" : ""}>
                {student.dailyLimit ? `₦${remainingLimit.toFixed(2)}` : 'Unlimited'}
              </span>
            </div>
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
    </>
  );
}
