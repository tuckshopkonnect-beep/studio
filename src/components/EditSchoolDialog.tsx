"use client";

import React, { useState, useEffect } from 'react';
import type { School } from '@/lib/data';
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
import { Loader2, Save, X } from 'lucide-react';

interface EditSchoolDialogProps {
  school: School | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (school: School) => Promise<boolean>;
}

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "School name is required."),
});

export default function EditSchoolDialog({
  school,
  isOpen,
  onOpenChange,
  onSave,
}: EditSchoolDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: school?.id || '',
        name: school?.name || '',
    },
  });

  useEffect(() => {
    if (school) {
      form.reset(school);
    }
  }, [school, form]);

  const handleSaveClick = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    const success = await onSave(values as School);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveClick)}>
            <DialogHeader>
              <DialogTitle>Edit School Name</DialogTitle>
              <DialogDescription>
                Update the name for this school. This change will be reflected across the app.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
