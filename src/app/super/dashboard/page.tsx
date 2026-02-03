
'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking, useUser, useDoc } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import type { School, User } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Building, MoreHorizontal, ShieldCheck, Users, Globe } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditSchoolDialog from '@/components/EditSchoolDialog';
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from '@/components/ConfirmationDialog';
import FullPageLoader from '@/components/FullPageLoader';
import AccessDenied from '@/components/AccessDenied';

export default function SuperAdminDashboardPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: authUser, isUserLoading } = useUser();

  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useDoc<User>(currentUserDocRef);

  const isCurrentUserAdmin = currentUserProfile?.role === 'Admin';

  const schoolsCollection = useMemoFirebase(() => {
    // Only attempt to list schools once we know who the user is
    if (!firestore || !authUser) return null;
    return collection(firestore, 'schools');
  }, [firestore, authUser]);
  const { data: schools, isLoading: isLoadingSchools } = useCollection<School>(schoolsCollection);

  const usersCollection = useMemoFirebase(() => {
    // CRITICAL: Only attempt to list global users if the authenticated user is an Admin
    if (!firestore || !isCurrentUserAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, isCurrentUserAdmin]);
  const { data: globalUsers, isLoading: isLoadingUsers } = useCollection<User>(usersCollection);

  const [schoolToEdit, setSchoolToEdit] = React.useState<School | null>(null);
  const [schoolToDelete, setSchoolToDelete] = React.useState<School | null>(null);

  const handleUpdateSchool = async (school: School): Promise<boolean> => {
    if (!firestore) return false;
    const schoolDocRef = doc(firestore, 'schools', school.id);
    updateDocumentNonBlocking(schoolDocRef, { name: school.name });
    toast({ title: "School Updated", description: `"${school.name}" has been updated.` });
    setSchoolToEdit(null);
    return true;
  };

  const handleDeleteSchool = () => {
    if (!firestore || !schoolToDelete) return;
    deleteDocumentNonBlocking(doc(firestore, 'schools', schoolToDelete.id));
    toast({ title: "School Deleted", description: `"${schoolToDelete.name}" has been removed.` });
    setSchoolToDelete(null);
  };

  if (isUserLoading || isLoadingCurrentUser) {
    return <FullPageLoader message="Verifying System Owner status..." />;
  }

  if (!authUser || currentUserProfile?.role !== 'Admin') {
    return (
        <div className="container mx-auto p-6">
            <AccessDenied 
                currentUserProfile={currentUserProfile} 
                message="This is the Master Control page for the System Owner. You must be signed in with an Administrator account to access these global tools." 
            />
        </div>
    );
  }

  return (
    <>
    <EditSchoolDialog
      school={schoolToEdit}
      isOpen={!!schoolToEdit}
      onOpenChange={(isOpen) => !isOpen && setSchoolToEdit(null)}
      onSave={handleUpdateSchool}
    />
     <ConfirmationDialog
      open={!!schoolToDelete}
      onOpenChange={(isOpen) => !isOpen && setSchoolToDelete(null)}
      onConfirm={handleDeleteSchool}
      title={`Delete "${schoolToDelete?.name}"?`}
      description="WARNING: This will permanently remove the school registration. Associated data (users, orders) will remain but will be orphaned."
      confirmButtonText="Delete School Registration"
    />
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">System Control Center</h1>
            <p className="text-muted-foreground">Global administration and school orchestration.</p>
        </div>
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/super/admin">
            <PlusCircle className="mr-2 h-5 w-5" />
            Onboard New School
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active institutions on platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global User Base</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalUsers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Students, Parents, and Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All services operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Management</CardTitle>
          <CardDescription>
            High-level overview of all registered schools in the TuckshopKonnect network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Network ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingSchools ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Syncing network data...</p>
                  </TableCell>
                </TableRow>
              ) : schools && schools.length > 0 ? (
                schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                                <Building className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">{school.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{school.id}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Network Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setSchoolToEdit(school)}>
                            Edit Institution Name
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setSchoolToDelete(school)}
                          >
                            Deregister School
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Building className="h-12 w-12 opacity-20" />
                        <h3 className="text-lg font-semibold">Network is Empty</h3>
                        <p>No schools have been onboarded yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
