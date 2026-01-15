
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { User } from '@/lib/data';
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Edit, Save, X, Camera, Check, ChevronsUpDown, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDetailDialogProps {
  user: User | null;
  allUsers: User[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (user: User & { password?: string }) => Promise<boolean>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isCreating: boolean;
}

const emptyUser: Omit<User, 'id'> = {
  name: '',
  email: '',
  role: 'Student',
  avatarUrl: '',
  balance: 0,
  class: '',
  parentId: undefined,
  dailyLimit: undefined
};

const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

const baseUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  password: z.string().optional(),
  role: z.enum(['Student', 'Parent', 'Admin']),
  class: z.string().optional(),
  balance: z.number().optional(),
  parentId: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const userSchemaWithRefinement = baseUserSchema.refine(data => !(data.role === 'Student' && !data.class), {
    message: "Class is required for students.",
    path: ["class"],
});

const createUserSchemaWithRefinement = baseUserSchema.extend({
    password: z.string().min(6, "Password must be at least 6 characters."),
}).refine(data => !(data.role === 'Student' && !data.class), {
    message: "Class is required for students.",
    path: ["class"],
});


export default function UserDetailDialog({
  user,
  allUsers,
  isOpen,
  onOpenChange,
  onSave,
  isEditing,
  setIsEditing,
  isCreating,
}: UserDetailDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parentSearchTerm, setParentSearchTerm] = useState('');

  const parentUsers = allUsers.filter(u => u.role === 'Parent' && u.name.toLowerCase().includes(parentSearchTerm.toLowerCase()));
  
  const form = useForm<z.infer<typeof baseUserSchema>>({
    resolver: zodResolver(isCreating ? createUserSchemaWithRefinement : userSchemaWithRefinement),
    defaultValues: isCreating ? { ...emptyUser, password: '' } : user || emptyUser,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(isCreating ? { ...emptyUser, password: '' } : { ...(user || emptyUser), password: '' });
      setParentSearchTerm('');
    }
  }, [isOpen, isCreating, user, form]);


  const handleSaveClick = async (values: z.infer<typeof baseUserSchema>) => {
    setIsSaving(true);
    const success = await onSave(values as User & { password?: string });
    setIsSaving(false);
    if (!success) {
      // Don't close the dialog if save failed (e.g., duplicate email)
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('avatarUrl', reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const title = isCreating ? "Create New User" : isEditing ? `Edit User` : `User Details`;
  
  const watchRole = form.watch('role');
  const watchParentId = form.watch('parentId');
  const avatarUrl = form.watch('avatarUrl');
  const name = form.watch('name');
  
  const selectedParent = parentUsers.find((parent) => parent.id === watchParentId);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveClick)}>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {!isCreating && <DialogDescription>Details for {user?.name}</DialogDescription>}
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="relative group">
                  <Avatar 
                      className={cn("h-24 w-24 border-2 border-primary/20", isEditing && "cursor-pointer")}
                      onClick={handleAvatarClick}
                  >
                      <AvatarImage src={avatarUrl} alt={name} className="object-cover"/>
                      <AvatarFallback className="text-3xl">{name ? name.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                      <div 
                          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={handleAvatarClick}
                      >
                          <Camera className="h-8 w-8 text-white" />
                      </div>
                  )}
                  <Input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange} 
                  />
              </div>
            </div>

            <div className="grid gap-6 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Student">Student</SelectItem>
                                        <SelectItem value="Parent">Parent</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {isCreating && (
                     <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="relative">
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type={showPassword ? 'text' : 'password'} className="pr-10" />
                                </FormControl>
                                 <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-[26px] h-7 w-7 text-muted-foreground"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {watchRole === 'Student' && (
                    <div className={cn("grid gap-4 transition-all duration-300", watchRole === 'Student' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none')}>
                       <div className="grid grid-cols-2 gap-4">
                         <FormField
                          control={form.control}
                          name="class"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a class..." /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {classLevels.map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="balance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Initial Balance</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       </div>
                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Link to Parent</FormLabel>
                                    <div className="rounded-md border">
                                        <div className="p-2 border-b">
                                          <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                              placeholder="Search parents..." 
                                              className="pl-8"
                                              value={parentSearchTerm}
                                              onChange={(e) => setParentSearchTerm(e.target.value)}
                                              disabled={!isEditing}
                                            />
                                          </div>
                                        </div>
                                        <ScrollArea className="h-32">
                                            <div className="p-2 space-y-1">
                                                {parentUsers.map(parent => (
                                                    <div key={parent.id} className="flex items-center space-x-2 rounded-md hover:bg-accent p-2">
                                                        <Checkbox
                                                            id={`parent-${parent.id}`}
                                                            checked={field.value === parent.id}
                                                            disabled={!isEditing}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange(parent.id)
                                                                    : field.onChange(undefined);
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`parent-${parent.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                                                        >
                                                            {parent.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>

            <DialogFooter>
              {isEditing ? (
                <>
                  <Button type="button" variant="outline" onClick={() => {
                    if (isCreating) {
                        onOpenChange(false);
                    } else {
                        setIsEditing(false);
                        form.reset(user || emptyUser);
                    }
                  }}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving || (!form.formState.isDirty && !isCreating)}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? "Saving..." : isCreating ? "Create User" : "Save Changes"}
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
