
"use client";

import React, { useState, useEffect } from 'react';
import type { PasswordResetRequest } from '@/lib/data';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X, Eye, EyeOff } from 'lucide-react';

interface PasswordResetDialogProps {
  request: PasswordResetRequest;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (requestId: string, newPassword?: string) => void;
}

const formSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
});

export default function PasswordResetDialog({
  request,
  isOpen,
  onOpenChange,
  onConfirm,
}: PasswordResetDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: '' },
  });

  const handleConfirmClick = (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    // Note: In a real application, a secure backend function would be called here
    // to update the user's password in Firebase Auth. The client-side SDK
    // does not have permission to change another user's password.
    onConfirm(request.id, values.newPassword);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleConfirmClick)}>
            <DialogHeader>
              <DialogTitle>Reset Password for {request.userName}</DialogTitle>
              <DialogDescription>
                Enter a new temporary password for this user. You will need to communicate this to them securely.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input {...field} type={showPassword ? "text" : "password"} />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? "Resetting..." : "Reset Password"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
