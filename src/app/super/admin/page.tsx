
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSchoolAndAdmin } from "@/app/actions";
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc } from "firebase/firestore";
import type { School, User } from "@/lib/data";
import FullPageLoader from "@/components/FullPageLoader";
import AccessDenied from "@/components/AccessDenied";

export default function SuperAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();

  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useDoc<User>(currentUserDocRef);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !adminName || !adminEmail || !adminPassword) {
        toast({
            variant: "destructive",
            title: "All fields are required",
        });
        return;
    }
    
    if (!firestore || !auth?.currentUser) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in as an admin to perform this action.",
        });
        return;
    }

    setIsLoading(true);

    const schoolsCol = collection(firestore, "schools");
    const schoolData = { name: schoolName } as Omit<School, 'id'>;

    addDoc(schoolsCol, schoolData)
        .then(async (schoolDocRef) => {
            const schoolId = schoolDocRef.id;
            const result = await createSchoolAndAdmin(schoolId, adminName, adminEmail, adminPassword);
            
            if (result.success) {
                toast({
                    title: "School Created Successfully!",
                    description: `School "${schoolName}" and its admin account have been created.`,
                });
                // Clear form
                setSchoolName("");
                setAdminName("");
                setAdminEmail("");
                setAdminPassword("");
                router.push("/super/dashboard");
            } else {
                toast({
                    variant: "destructive",
                    title: "Admin Creation Failed",
                    description: result.error || "The school was created, but the admin account could not be set up.",
                });
            }
        })
        .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: 'schools', 
                operation: 'create',
                requestResourceData: schoolData,
            });
            errorEmitter.emit('permission-error', permissionError);

            toast({
                variant: "destructive",
                title: "School Creation Failed",
                description: "Permission denied. Please ensure you are logged in as an administrator.",
            });
        })
        .finally(() => {
            setIsLoading(false);
        });
  };

  if (isUserLoading || isLoadingCurrentUser) {
    return <FullPageLoader message="Verifying credentials..." />;
  }

  if (!authUser || currentUserProfile?.role !== 'Admin') {
    return (
        <div className="container mx-auto p-6">
            <AccessDenied 
                currentUserProfile={currentUserProfile} 
                message="You must be signed in as an administrator to create new schools." 
            />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit border-2 border-primary/20 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Super Admin Portal</CardTitle>
          <CardDescription className="pt-2">
            Create a new school and its primary administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate}>
            <div className="grid gap-6">
              <fieldset className="grid gap-2 border-t pt-4">
                <legend className="text-sm font-medium text-muted-foreground px-1 -translate-y-4 bg-background w-fit">School Details</legend>
                <div className="grid gap-2">
                    <Label htmlFor="school-name">School Name</Label>
                    <Input
                    id="school-name"
                    type="text"
                    placeholder="Example High School"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    />
                </div>
              </fieldset>

              <fieldset className="grid gap-2 border-t pt-4">
                <legend className="text-sm font-medium text-muted-foreground px-1 -translate-y-4 bg-background w-fit">Administrator Account</legend>
                <div className="grid gap-2">
                    <Label htmlFor="admin-name">Admin Full Name</Label>
                    <Input
                    id="admin-name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <div className="relative">
                        <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="pr-10"
                        placeholder="Must be at least 6 characters"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                            <span className="sr-only">Toggle password visibility</span>
                        </Button>
                    </div>
                </div>
              </fieldset>
              
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create School & Admin"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
