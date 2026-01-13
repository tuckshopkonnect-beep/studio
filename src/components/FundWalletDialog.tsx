
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/data";
import { usePaystackPayment } from 'react-paystack';
import { CreditCard, Loader2 } from "lucide-react";

interface FundWalletDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  child: User;
  parentEmail: string;
  onSuccess: (amount: number, childId: number) => void;
}

const paystackPublicKey = "pk_test_94b05b50b19eae02848d09a3b44a52aab1eec139";

export default function FundWalletDialog({
  isOpen,
  onOpenChange,
  child,
  parentEmail,
  onSuccess,
}: FundWalletDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const amountInKobo = Number(amount) * 100;

  const config = {
      reference: new Date().getTime().toString(),
      email: parentEmail,
      amount: amountInKobo,
      publicKey: paystackPublicKey,
      metadata: {
        child_id: child.id,
        child_name: child.name,
        custom_fields: [
            {
                display_name: "Funding For",
                variable_name: "funding_for",
                value: `Tuckshop account for ${child.name}`
            }
        ]
      }
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to fund.",
      });
      return;
    }
    
    setIsLoading(true);

    initializePayment({
        onSuccess: () => {
            onSuccess(numericAmount, child.id);
            resetAndClose();
        },
        onClose: () => {
           setIsLoading(false);
           // User may have closed the Paystack modal
           toast({
               variant: "default",
               title: "Payment window closed",
               description: "The payment process was not completed.",
           });
        }
    });
  };

  const resetAndClose = () => {
      setAmount('');
      setIsLoading(false);
      onOpenChange(false);
  }

  const handleAmountButtonClick = (value: number) => {
    setAmount(String(value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) resetAndClose();
        else onOpenChange(true);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fund {child.name}'s Wallet</DialogTitle>
          <DialogDescription>
            Enter the amount you want to add to their account. Current balance is ₦{child.balance.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="amount" className="text-left">
                Amount to Add
                </Label>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₦</span>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 5000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-6 text-xl h-12"
                    />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => handleAmountButtonClick(1000)}>₦1,000</Button>
                <Button variant="outline" onClick={() => handleAmountButtonClick(2500)}>₦2,500</Button>
                <Button variant="outline" onClick={() => handleAmountButtonClick(5000)}>₦5,000</Button>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handlePayment} disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment (₦{Number(amount || 0).toFixed(2)})
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
