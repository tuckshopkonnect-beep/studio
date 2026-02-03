
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
import { Loader2, Eye, EyeOff, ShieldCheck, Building, UserPlus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSchoolAndAdmin } from "@/app/actions";
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc } from "firebase/firestore";
import type { School, User } from "@/lib/data";
import FullPageLoader from "@/components/FullPageLoader";
import AccessDenied from "@/components/AccessDenied";
import Link from "next/link";

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
        toast({ variant: "destructive", title: "All fields are required" });
        return;
    }
    
    if (!firestore || !authUser) {
        toast({ variant: "destructive", title: "Authentication Error", description: "Session expired. Please log in again." });
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
                toast({ title: "School Onboarded!", description: `"${schoolName}" is now active on the platform.` });
                router.push("/super/dashboard");
            } else {
                toast({ variant: "destructive", title: "Local Admin Setup Failed", description: result.error });
            }
        })
        .catch((error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'schools', 
                operation: 'create',
                requestResourceData: schoolData,
            }));
        })
        .finally(() => setIsLoading(false));
  };

  if (isUserLoading || isLoadingCurrentUser) {
    return <FullPageLoader message="Initializing School Onboarding..." />;
  }

  if (!authUser || currentUserProfile?.role !== 'Admin') {
    return <AccessDenied currentUserProfile={currentUserProfile} message="System Owner access required for onboarding." />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
      <Link href="/super/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Network Overview
      </Link>

      <Card className="shadow-2xl border-primary/10">
        <CardHeader className="text-center pb-8 border-b bg-muted/30">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit border-2 border-primary/20 mb-4">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Onboard New School</CardTitle>
          <CardDescription>
            Register a new institution and provision its first administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleCreate} className="space-y-8">
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <Building className="h-5 w-5" />
                    <h3>Institution Profile</h3>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="school-name">Official School Name</Label>
                    <Input
                        id="school-name"
                        placeholder="e.g., Green Valley International School"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="h-12"
                    />
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <UserPlus className="h-5 w-5" />
                    <h3>Primary School Administrator</h3>
                </div>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-name">Full Name</Label>
                        <Input
                            id="admin-name"
                            placeholder="John Doe"
                            required
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="admin-email">Business Email</Label>
                        <Input
                            id="admin-email"
                            type="email"
                            placeholder="admin@school.com"
                            required
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="admin-password">Initial Password</Label>
                        <div className="relative">
                            <Input
                                id="admin-password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Min. 6 characters"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
            
            <Button type="submit" className="w-full text-lg py-7 rounded-xl shadow-lg hover:shadow-primary/20 transition-all" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Provisioning Institution...</>
                ) : (
                  "Activate School & Admin"
                )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
