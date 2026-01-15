
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { User } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Download, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import UserDetailDialog from "@/components/UserDetailDialog";
import { useCollection, useFirestore, useUser, useMemoFirebase, useAuth } from "@/firebase";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";


export default function UsersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user: authUser, isUserLoading } = useUser();

  const usersCollection = useMemoFirebase(() => {
    if (!firestore || !authUser || authUser.isAnonymous) return null;
    return collection(firestore, "users");
  },[firestore, authUser]);

  const { data: users, isLoading: isLoadingUsers, error: usersError } = useCollection<User>(usersCollection);

  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [activeTab, setActiveTab] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  // This is the critical change: determine if it's the initial setup.
  const isInitialSetup = !isLoadingUsers && (!users || users.length === 0);

  const filteredUsers = React.useMemo(() => {
    if (isInitialSetup || !users) return [];
    return users
      .filter(user => {
        if (activeTab === "all") return true;
        return user.role.toLowerCase() === activeTab;
      })
      .filter(user => {
        if (searchTerm === "") return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      });
  }, [users, activeTab, searchTerm, isInitialSetup]);

  const handleExportPDF = async () => {
    if (!filteredUsers) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { exportUsersPDF } = await import('@/lib/pdf-utils');
    exportUsersPDF(filteredUsers, jsPDF, autoTable);
  };

  const handleExportCSV = async () => {
    if (!filteredUsers) return;
    const { exportUsersCSV } = await import('@/lib/csv-utils');
    exportUsersCSV(filteredUsers);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !firestore) return;
    try {
      // Note: Deleting a user from Auth requires a recent sign-in.
      // This will often fail on the client and is better handled by a server function.
      // For this client-side demo, we'll focus on deleting the Firestore record.
      await deleteDoc(doc(firestore, "users", userToDelete.id.toString()));
      toast({
        title: "User Deleted",
        description: `${userToDelete.name}'s profile has been deleted. Auth record may still exist.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: error.message,
      });
    }
    setUserToDelete(null);
  };

  const handleOpenDialog = (user: User | null, mode: 'view' | 'edit' | 'create') => {
    if (mode === 'create') {
      setSelectedUser(null);
      setIsCreating(true);
      setIsEditing(true);
    } else {
      setSelectedUser(user);
      setIsCreating(false);
      setIsEditing(mode === 'edit');
    }
    setIsUserDetailOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsUserDetailOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSaveUser = async (userToSave: User & {password?: string}): Promise<boolean> => {
     if (!auth || !firestore) return false;
    
    if (isCreating) {
        // --- Create a new user ---
        try {
            // 1. Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, userToSave.email, userToSave.password!);
            const newUserId = userCredential.user.uid;

            // 2. Prepare user data for Firestore
            const userDataForFirestore = {
                ...userToSave,
                id: newUserId, // Use the UID from Auth as the document ID
            };
            delete (userDataForFirestore as any).password; // Don't store the password in Firestore

            // 3. Create user document in Firestore
            const userDocRef = doc(firestore, 'users', newUserId);
            // This now uses setDoc directly because it's part of an async operation
            // that depends on the user being created first.
            await setDoc(userDocRef, userDataForFirestore);
            
            toast({
                title: "User Created",
                description: `${userToSave.name} has been added successfully.`,
            });
            handleCloseDialog();
            return true;

        } catch (error: any) {
            console.error("Error creating user:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to create user',
                description: error.message || 'An unknown error occurred.',
            });
            return false;
        }

    } else {
        // --- Update an existing user ---
        if (!selectedUser) return false;
        try {
             const userDocRef = doc(firestore, 'users', selectedUser.id.toString());
             const updateData = { ...userToSave };
             delete (updateData as any).password;
             
             await setDoc(userDocRef, updateData, { merge: true });

             toast({
                title: "User Updated",
                description: `${userToSave.name}'s details have been saved.`,
             });
             handleCloseDialog();
             return true;

        } catch (error: any) {
             console.error("Error updating user:", error);
             toast({
                variant: 'destructive',
                title: 'Failed to update user',
                description: error.message || 'An unknown error occurred.',
            });
            return false;
        }
    }
  };


  if (isUserLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  

  return (
    <>
      <ConfirmationDialog
        open={!!userToDelete}
        onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title={`Delete ${userToDelete?.name}?`}
        description="This action cannot be undone. This will permanently delete the user's account and all associated data."
        confirmButtonText="Yes, Delete User"
      />
      
      <UserDetailDialog
          user={selectedUser}
          allUsers={users || []}
          isOpen={isUserDetailOpen}
          onOpenChange={handleCloseDialog}
          onSave={handleSaveUser}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isCreating={isCreating}
      />
      

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center gap-4">
          <TabsList>
            <TabsTrigger value="all" disabled={isInitialSetup}>All</TabsTrigger>
            <TabsTrigger value="student" disabled={isInitialSetup}>Students</TabsTrigger>
            <TabsTrigger value="parent" disabled={isInitialSetup}>Parents</TabsTrigger>
            <TabsTrigger value="admin" disabled={isInitialSetup}>Admins</TabsTrigger>
          </TabsList>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isInitialSetup}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={isInitialSetup || !users || users.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>Export to PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>Export to CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => handleOpenDialog(null, 'create')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {isInitialSetup 
                  ? "No admin account found. Click 'Add User' to create the first administrator."
                  : `Manage all user accounts. Showing ${filteredUsers.length} of ${users?.length || 0} users.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Balance</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-primary">Daily Limit</TableHead>
                    <TableHead className="hidden md:table-cell">Class</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                     <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                          <p className="mt-2 text-muted-foreground">Loading users...</p>
                        </TableCell>
                      </TableRow>
                  ) : isInitialSetup ? (
                     <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                        {isInitialSetup 
                          ? "Click 'Add User' to create the first administrator."
                          : "No users found for the current filter."
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="hidden h-9 w-9 sm:flex">
                              <AvatarImage src={user.avatarUrl} alt="Avatar" />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                              <p className="text-sm font-medium leading-none">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Parent' ? 'secondary' : 'outline'}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.role === 'Student' ? `₦${(user.balance || 0).toFixed(2)}` : 'N/A'}
                        </TableCell>
                        <TableCell className={cn("hidden md:table-cell font-medium", user.role === 'Student' && "text-primary")}>
                          {user.role === 'Student' && user.dailyLimit ? `₦${user.dailyLimit.toFixed(2)}` : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.class || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleOpenDialog(user, 'edit')}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleOpenDialog(user, 'view')}>View Details</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => setUserToDelete(user)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
