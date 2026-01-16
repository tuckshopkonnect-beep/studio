
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { MenuItem as MenuItemType } from '@/lib/data';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Edit, Save, X, Camera, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { generateMenuItemImageAction } from '@/app/actions';

interface MenuItemDetailDialogProps {
  item: MenuItemType | null;
  menuItems: MenuItemType[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (item: MenuItemType) => Promise<boolean>;
  isCreating: boolean;
  isSaving?: boolean;
}

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  category: z.enum(['Meals', 'Snacks', 'Drinks', 'Fruit', 'Other']),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer."),
  isAvailable: z.boolean(),
  image: z.object({
    id: z.string().optional(),
    imageUrl: z.string(), // Allow empty string
    imageHint: z.string(),
    description: z.string().optional(),
  }),
});


export default function MenuItemDetailDialog({
  item,
  menuItems,
  isOpen,
  onOpenChange,
  onSave,
  isCreating,
  isSaving = false,
}: MenuItemDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(isCreating);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();

  const getNextId = () => {
    // In a real app, Firestore would generate this ID upon document creation.
    // For this client-side demo, we generate a reasonably unique temporary ID.
    return String(Date.now() + Math.random());
  };

  const emptyItem: Omit<MenuItemType, 'image'> & { stock: number, image: any } = {
    id: getNextId(),
    name: '',
    description: '',
    price: 0,
    category: 'Other',
    stock: 0,
    isAvailable: true,
    image: { imageUrl: '', imageHint: '', id: 'no-image'},
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isCreating ? emptyItem : { ...item, stock: (item as any)?.stock ?? 100 },
  });

  useEffect(() => {
    setIsEditing(isCreating);
    const defaultValues = isCreating ? { ...emptyItem, id: getNextId() } : { ...item, stock: (item as any)?.stock ?? 100 };
    form.reset(defaultValues as any);
  }, [isOpen, isCreating, item, menuItems, form]);

  const handleGenerateImage = async () => {
    const watchName = form.getValues('name');
    if (!watchName) {
      toast({
        variant: 'destructive',
        title: 'Item Name Required',
        description: 'Please enter a name for the item before generating an image.',
      });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const result = await generateMenuItemImageAction({ itemName: watchName });
      if (result.success && result.data) {
        form.setValue('image', {
          imageUrl: result.data.imageUrl,
          imageHint: watchName,
          id: 'generated',
        }, { shouldDirty: true });
        toast({
          title: 'Image Generated!',
          description: 'A new image has been generated for your item.',
        });
      } else {
        throw new Error(result.error || 'Failed to generate image.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Image Generation Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSaveClick = async (values: z.infer<typeof formSchema>) => {
    let finalData = { ...values };

    // If a placeholder was selected, find the full object
    if (finalData.image.id && finalData.image.id !== 'generated' && finalData.image.id !== 'no-image') {
        const imagePlaceholder = PlaceHolderImages.find(p => p.id === finalData.image.id);
        if (imagePlaceholder) {
            finalData.image = imagePlaceholder;
        }
    }
    
    // If no image is selected or generated, use a default placeholder
    if (!finalData.image.imageUrl) {
        finalData.image = {
            imageUrl: `https://placehold.co/600x400/EFEFEF/333333?text=${encodeURIComponent(finalData.name) || 'No Image'}`,
            imageHint: finalData.name,
            id: 'placeholder'
        }
    }

    const success = await onSave(finalData as unknown as MenuItemType);
    if (success) {
      onOpenChange(false);
    }
  };
  
  const title = isCreating ? "Create New Menu Item" : isEditing ? `Edit Item` : `Item Details`;
  const watchImage = form.watch('image');
  const watchName = form.watch('name');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveClick)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {!isCreating && <DialogDescription>Details for {item?.name}</DialogDescription>}
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {/* --- Image Column --- */}
              <div className="md:col-span-1 flex flex-col items-center gap-4 pt-4">
                <Avatar className="h-32 w-32 rounded-md border-2 border-primary/20">
                  <AvatarImage src={watchImage?.imageUrl} alt={watchName} className="object-cover" />
                  <AvatarFallback className="text-3xl rounded-md">{watchName ? watchName.charAt(0) : '?'}</AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="image.id"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Placeholder</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          if (value === 'no-image') {
                              form.setValue('image', { imageUrl: '', imageHint: watchName, id: 'no-image'}, { shouldDirty: true });
                          } else {
                              const selectedImage = PlaceHolderImages.find(p => p.id === value);
                              if(selectedImage) form.setValue('image', selectedImage as any, { shouldDirty: true });
                          }
                        }} 
                        value={field.value} 
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select an image" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-image">-- No Image --</SelectItem>
                          {PlaceHolderImages.map(img => (
                            <SelectItem key={img.id} value={img.id}>{img.id.replace(/-/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGenerateImage}
                    disabled={!isEditing || isGeneratingImage}
                >
                    {isGeneratingImage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate with AI
                </Button>
              </div>

              {/* --- Details Column --- */}
              <div className="md:col-span-2 grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea {...field} disabled={!isEditing} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₦)</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={!isEditing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={!isEditing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Meals">Meals</SelectItem>
                                    <SelectItem value="Snacks">Snacks</SelectItem>
                                    <SelectItem value="Drinks">Drinks</SelectItem>
                                    <SelectItem value="Fruit">Fruit</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isAvailable"
                        render={({ field }) => (
                            <FormItem className="flex flex-col pt-2 gap-2">
                                <FormLabel>Available</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={!isEditing}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
              </div>
            </div>

            <DialogFooter>
              {isEditing ? (
                <>
                  <Button type="button" variant="outline" onClick={() => {
                    if (isCreating) {
                      onOpenChange(false);
                    } else {
                      setIsEditing(false);
                      form.reset(item as any);
                    }
                  }}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button type="submit" disabled={(!form.formState.isDirty && !isCreating) || isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? "Saving..." : isCreating ? "Create Item" : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
