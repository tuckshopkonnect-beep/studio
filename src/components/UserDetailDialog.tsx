
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Edit, Save, X, Camera, Check, ChevronsUpDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDetailDialogProps {
  user: User | null;
  allUsers: User[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (user: User) => boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isCreating: boolean;
}

const emptyUser: User = {
  id: 0,
  name: '',
  email: '',
  role: 'Student',
  avatarUrl: '',
  balance: 0,
  class: '',
};

const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parentComboboxOpen, setParentComboboxOpen] = useState(false)

  const parentUsers = allUsers.filter(u => u.role === 'Parent');

  const userSchema = z.object({
      name: z.string().min(1, "Name is required."),
      email: z.string().email("Invalid email address."),
      password: isCreating ? z.string().min(1, "Password is required.") : z.string().optional(),
      role: z.enum(['Student', 'Parent', 'Admin']),
      class: z.string().optional(),
      balance: z.number().optional(),
      parentId: z.number().optional(),
      avatarUrl: z.string().optional(),
      id: z.number().optional(),
  });


  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: isCreating ? { ...emptyUser, password: '' } : { ...user, password: '' }
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(isCreating ? { ...emptyUser, password: '' } : { ...user, password: '' });
    }
  }, [isOpen, isCreating, user, form]);


  const handleSaveClick = (values: z.infer<typeof userSchema>) => {
    const success = onSave(values as User);
    if (success) {
      form.reset();
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
        form.setValue('avatarUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const title = isCreating ? "Create New User" : isEditing ? `Edit ${user?.name}` : `User Details`;
  const description = isCreating ? "Fill in the details to add a new user." : isEditing ? `Editing details for ${user?.name}` : `Viewing details for ${user?.name}`;

  const watchRole = form.watch('role');
  const avatarUrl = form.watch('avatarUrl');
  const name = form.watch('name');
  const email = form.watch('email');
  const parentId = form.watch('parentId');


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveClick)}>
            <DialogHeader>
              <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="relative">
                      <Avatar 
                          className={cn("h-24 w-24 border-2 border-primary/20", isEditing && "cursor-pointer group")}
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
                   {isEditing ? (
                      <div className="grid gap-2 w-full text-center">
                          <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="name" className="sr-only">First & Last Name</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field}
                                        id="name"
                                        placeholder="First & Last Name"
                                        className="text-center text-xl font-semibold h-auto p-1 bg-transparent border-0 focus-visible:ring-1"
                                      />
                                    </FormControl>
                                  </FormItem>
                              )}
                          />
                      </div>
                  ) : (
                      <div className="grid gap-1 text-center">
                          <DialogTitle>{name}</DialogTitle>
                          <DialogDescription className="mt-[-1rem]">{email}</DialogDescription>
                          <Badge variant={watchRole === 'Admin' ? 'destructive' : watchRole === 'Parent' ? 'secondary' : 'outline'} className="mx-auto mt-1">{watchRole}</Badge>
                      </div>
                  )}
              </div>
            </DialogHeader>

            <div className="grid gap-6 py-4">

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
                    <div className={cn("grid grid-cols-2 gap-4 transition-all duration-300", watchRole === 'Student' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden')}>
                       <FormField
                          control={form.control}
                          name="class"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
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
                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-2 col-span-2">
                             <FormField
                              control={form.control}
                              name="parentId"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Link to Parent</FormLabel>
                                  <Popover open={parentComboboxOpen} onOpenChange={setParentComboboxOpen}>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                          disabled={!isEditing}
                                        >
                                          {field.value
                                            ? parentUsers.find((parent) => parent.id === field.value)?.name
                                            : "Select parent..."}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Search parent..." />
                                        <CommandList>
                                          <CommandEmpty>No parent found.</CommandEmpty>
                                          <CommandGroup>
                                            {parentUsers.map((parent) => (
                                              <CommandItem
                                                value={parent.name}
                                                key={parent.id}
                                                onSelect={() => {
                                                  field.onChange(parent.id);
                                                  setParentComboboxOpen(false);
                                                }}
                                              >
                                                <Check
                                                  className={cn("mr-2 h-4 w-4", parent.id === field.value ? "opacity-100" : "opacity-0")}
                                                />
                                                {parent.name}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
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
                  <Button type="submit" disabled={!form.formState.isDirty}>
                    <Save className="mr-2 h-4 w-4" /> {isCreating ? "Create User" : "Save Changes"}
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
