'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
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
import { Loader2, PlusCircle, Building } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboardPage() {
  const firestore = useFirestore();

  const schoolsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'schools');
  }, [firestore]);

  const { data: schools, isLoading: isLoadingSchools } = useCollection<School>(schoolsCollection);

  return (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingSchools ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-48 text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading schools...</p>
                  </TableCell>
                </TableRow>
              ) : schools && schools.length > 0 ? (
                schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{school.id}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-48 text-center">
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
  );
}
