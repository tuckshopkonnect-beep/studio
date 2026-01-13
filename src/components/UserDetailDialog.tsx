
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Edit, Save, X, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDetailDialogProps {
  user: User | null;
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
  dailyLimit: 0,
};

export default function UserDetailDialog({
  user,
  isOpen,
  onOpenChange,
  onSave,
  isEditing,
  setIsEditing,
  isCreating,
}: UserDetailDialogProps) {
  const [userData, setUserData] = useState<User>(user || emptyUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserData(user || emptyUser);
  }, [user]);

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

  const handleSaveClick = () => {
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
  const description = isCreating ? "Fill in the details to add a new user." : `Viewing details for ${user?.name}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {!isEditing && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid gap-6 py-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Avatar 
                        className={cn("h-16 w-16", isEditing && "cursor-pointer")}
                        onClick={handleAvatarClick}
                    >
                        <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                        <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                            onClick={handleAvatarClick}
                        >
                            <Camera className="h-6 w-6 text-white" />
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
                <div className='flex-1'>
                    {isEditing ? (
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" value={userData.name} onChange={handleInputChange} />
                        </div>
                    ) : (
                        <div className="grid gap-1">
                            <h3 className="text-xl font-semibold">{userData.name}</h3>
                            <p className="text-sm text-muted-foreground">{userData.email}</p>
                            <Badge variant={userData.role === 'Admin' ? 'destructive' : userData.role === 'Parent' ? 'secondary' : 'outline'}>{userData.role}</Badge>
                        </div>
                    )}
                </div>
            </div>

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
            {userData.role === 'Student' && (
                <div className={cn("grid grid-cols-2 gap-4 transition-all duration-300", userData.role === 'Student' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden')}>
                    <div className="grid gap-2">
                        <Label htmlFor="class">Class</Label>
                        <Input id="class" name="class" value={userData.class} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="balance">Balance</Label>
                        <Input id="balance" name="balance" type="number" value={userData.balance} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                     <div className="grid gap-2 col-span-2">
                        <Label htmlFor="dailyLimit">Daily Spending Limit</Label>
                        <Input id="dailyLimit" name="dailyLimit" type="number" value={userData.dailyLimit || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="No limit" />
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
                <Save className="mr-2 h-4 w-4" /> Save Changes
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
