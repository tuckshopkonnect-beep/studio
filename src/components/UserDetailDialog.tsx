
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { User } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Edit, Save, X, Camera, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UserDetailDialogProps {
  user: User | null;
  allUsers: User[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (user: User) => void;
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
  const [userData, setUserData] = useState<User>(user || emptyUser);
  const [password, setPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [parentComboboxOpen, setParentComboboxOpen] = useState(false)

  const parentUsers = allUsers.filter(u => u.role === 'Parent');

  useEffect(() => {
    if (isCreating) {
        setUserData(emptyUser);
        setPassword('');
    } else {
        setUserData(user || emptyUser);
    }
  }, [user, isCreating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleRoleChange = (value: 'Student' | 'Parent' | 'Admin') => {
    setUserData(prev => ({ ...prev, role: value }));
  };

  const handleParentLinkChange = (value: string) => {
    setParentComboboxOpen(false);
    const parentId = Number(value)
    setUserData(prev => ({ ...prev, parentId: parentId > 0 ? parentId : undefined }));
  };

  const handleClassChange = (value: string) => {
    setUserData(prev => ({ ...prev, class: value }));
  };
  
  const handleSaveClick = () => {
    // Input validation
    if (!userData.name || !userData.email) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name and email are required fields.",
      });
      return;
    }
    if (isCreating && !password) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Password is required for new users.",
        });
        return;
    }
    // We pass the password separately if you were to handle it, but here it's just for the form
    onSave(userData);
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
        setUserData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const title = isCreating ? "Create New User" : isEditing ? `Edit ${user?.name}` : `User Details`;
  const description = isCreating ? "Fill in the details to add a new user." : isEditing ? `Editing details for ${user?.name}` : `Viewing details for ${user?.name}`;


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(isEditing && 'sr-only')}>
            {title}
          </DialogTitle>
           {isEditing && (
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
          )}

          <div className="flex flex-col items-center gap-4">
              <div className="relative">
                  <Avatar 
                      className={cn("h-24 w-24 border-2 border-primary/20", isEditing && "cursor-pointer group")}
                      onClick={handleAvatarClick}
                  >
                      <AvatarImage src={userData.avatarUrl} alt={userData.name} className="object-cover"/>
                      <AvatarFallback className="text-3xl">{userData.name.charAt(0)}</AvatarFallback>
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
                      <Label htmlFor="name" className="sr-only">First & Last Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={userData.name} 
                        onChange={handleInputChange} 
                        placeholder="First & Last Name"
                        className="text-center text-xl font-semibold h-auto p-1 bg-transparent border-0 focus-visible:ring-1"
                      />
                  </div>
              ) : (
                  <div className="grid gap-1 text-center">
                      <DialogDescription className="mt-[-1rem]">{userData.email}</DialogDescription>
                      <Badge variant={userData.role === 'Admin' ? 'destructive' : userData.role === 'Parent' ? 'secondary' : 'outline'} className="mx-auto mt-1">{userData.role}</Badge>
                  </div>
              )}
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={userData.email} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={userData.role} onValueChange={handleRoleChange} disabled={!isEditing}>
                        <SelectTrigger id="role">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {isCreating && (
                 <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            )}
            {userData.role === 'Student' && (
                <div className={cn("grid grid-cols-2 gap-4 transition-all duration-300", userData.role === 'Student' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden')}>
                    <div className="grid gap-2">
                        <Label htmlFor="class">Class</Label>
                        <Select value={userData.class} onValueChange={handleClassChange} disabled={!isEditing}>
                          <SelectTrigger id="class">
                              <SelectValue placeholder="Select a class..." />
                          </SelectTrigger>
                          <SelectContent>
                              {classLevels.map(level => (
                                  <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="balance">Initial Balance</Label>
                        <Input id="balance" name="balance" type="number" value={userData.balance} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="grid gap-2 col-span-2">
                        <Label htmlFor="parent">Link to Parent</Label>
                        <Popover open={parentComboboxOpen} onOpenChange={setParentComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={parentComboboxOpen}
                                className="w-full justify-between"
                                disabled={!isEditing}
                                >
                                {userData.parentId
                                    ? parentUsers.find((parent) => parent.id === userData.parentId)?.name
                                    : "Select parent..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                <CommandInput placeholder="Search parent..." />
                                <CommandList>
                                <CommandEmpty>No parent found.</CommandEmpty>
                                <CommandGroup>
                                    {parentUsers.map((parent) => (
                                    <CommandItem
                                        key={parent.id}
                                        value={parent.name}
                                        onSelect={() => handleParentLinkChange(String(parent.id))}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            userData.parentId === parent.id ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        {parent.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            )}
        </div>


        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => {
                if (isCreating) {
                    onOpenChange(false);
                } else {
                    setIsEditing(false);
                    setUserData(user!); // Revert changes
                }
              }}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSaveClick}>
                <Save className="mr-2 h-4 w-4" /> {isCreating ? "Create User" : "Save Changes"}
              </Button>
            </>
          ) : (
             <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
