
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
import { initialUsers } from "@/lib/data";
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
import { MoreHorizontal, PlusCircle, Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import UserDetailDialog from "@/components/UserDetailDialog";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState(initialUsers);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [activeTab, setActiveTab] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const filteredUsers = React.useMemo(() => {
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
  }, [users, activeTab, searchTerm]);

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { exportUsersPDF } = await import('@/lib/pdf-utils');
    exportUsersPDF(filteredUsers, jsPDF, autoTable);
  };

  const handleExportCSV = async () => {
    const { exportUsersCSV } = await import('@/lib/csv-utils');
    exportUsersCSV(filteredUsers);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setUsers(users.filter(user => user.id !== userToDelete.id));
    toast({
      title: "User Deleted",
      description: `${userToDelete.name} has been successfully deleted.`,
    });
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

  const handleSaveUser = (userToSave: User): boolean => {
    if (isCreating) {
      // Check for email uniqueness
      if (users.some(user => user.email === userToSave.email)) {
        toast({
          variant: "destructive",
          title: "Email Already Exists",
          description: "A user with this email address is already registered.",
        });
        return false; // Indicate failure
      }
      // Add new user
      const newUser = { 
        ...userToSave, 
        id: Date.now(), 
        avatarUrl: userToSave.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}` 
      };
      setUsers(prev => [...prev, newUser]);
      toast({ title: "User Created", description: `${newUser.name} has been added.` });
    } else {
      // Update existing user
      setUsers(prev => prev.map(u => u.id === userToSave.id ? userToSave : u));
      toast({ title: "User Updated", description: `${userToSave.name}'s details have been saved.` });
    }
    handleCloseDialog();
    return true; // Indicate success
  };

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
      {isUserDetailOpen && (
        <UserDetailDialog
            user={selectedUser}
            allUsers={users}
            isOpen={isUserDetailOpen}
            onOpenChange={handleCloseDialog}
            onSave={handleSaveUser}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isCreating={isCreating}
        />
      )}

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center gap-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="student">Students</TabsTrigger>
            <TabsTrigger value="parent">Parents</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
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
                Manage all user accounts. 
                {mounted && ` Showing ${filteredUsers.length} of ${users.length} users.`}
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
                  {filteredUsers.length > 0 ? (
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
                          {user.role === 'Student' ? `₦${user.balance.toFixed(2)}` : 'N/A'}
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
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
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
