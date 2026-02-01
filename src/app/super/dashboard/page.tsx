'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { School } from '@/lib/data';
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
import { Loader2, PlusCircle, Building, MoreHorizontal } from 'lucide-react';
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


export default function SuperAdminDashboardPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const schoolsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'schools');
  }, [firestore]);

  const { data: schools, isLoading: isLoadingSchools } = useCollection<School>(schoolsCollection);

  const [schoolToEdit, setSchoolToEdit] = React.useState<School | null>(null);
  const [schoolToDelete, setSchoolToDelete] = React.useState<School | null>(null);

  const handleUpdateSchool = async (school: School): Promise<boolean> => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firestore not available.",
      });
      return false;
    }

    const schoolDocRef = doc(firestore, 'schools', school.id);
    updateDocumentNonBlocking(schoolDocRef, { name: school.name });
    
    toast({
      title: "School Updated",
      description: `"${school.name}" has been updated successfully.`,
    });
    setSchoolToEdit(null); // Close dialog
    return true;
  };

  const handleDeleteSchool = () => {
    if (!firestore || !schoolToDelete) return;
    
    const schoolDocRef = doc(firestore, 'schools', schoolToDelete.id);
    deleteDocumentNonBlocking(schoolDocRef);
    
    toast({
        title: "School Deleted",
        description: `"${schoolToDelete.name}" has been successfully deleted.`,
    });
    setSchoolToDelete(null);
  };


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
      description="This action cannot be undone. This will permanently delete the school record. It will NOT delete associated users, orders, or menu items."
      confirmButtonText="Yes, Delete School"
    />
    <div className="grid gap-6">
      <div className="flex items-center">
        <div>
            <h1 className="text-2xl font-bold">Schools Overview</h1>
            <p className="text-muted-foreground">Manage all registered schools in the system.</p>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/super/admin">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New School
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registered Schools</CardTitle>
          <CardDescription>
            A list of all schools that have been created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>School ID</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingSchools ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading schools...</p>
                  </TableCell>
                </TableRow>
              ) : schools && schools.length > 0 ? (
                schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{school.id}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setSchoolToEdit(school)}>
                            Edit Name
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setSchoolToDelete(school)}
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
                  <TableCell colSpan={3} className="h-48 text-center">
                    <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Schools Found</h3>
                    <p className="text-muted-foreground">Click "Create New School" to get started.</p>
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
