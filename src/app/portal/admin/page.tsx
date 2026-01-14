
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import Image from "next/image";
import { Loader2, Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminLoginPage() {
  const [email] = useState("admin@campusconnect.hub");
  const [password] = useState("AdminPassword123");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const firestore = getFirestore();

  useEffect(() => {
    // If user is logged in (and not anonymous), redirect to dashboard.
    if (!isUserLoading && user && !user.isAnonymous) {
        router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    setIsLoggingIn(true);

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Successful login will be handled by the useEffect hook
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: "User does not exist or password was incorrect. Try creating the first admin user.",
        });
    } finally {
      setIsLoading(false);
      setIsLoggingIn(false);
    }
  };

  const handleCreateFirstAdmin = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newAdmin = userCredential.user;

      // 2. Create the user document in Firestore with the 'Admin' role
      const userDocRef = doc(firestore, "users", newAdmin.uid);
      const adminUserData = {
        id: newAdmin.uid,
        name: "Default Admin",
        email: newAdmin.email,
        role: "Admin",
        avatarUrl: `https://i.pravatar.cc/150?u=${newAdmin.uid}`,
        balance: 0,
      };
      
      // Use setDoc to create the user profile document.
      // The security rule is what protects this one-time action.
      await setDoc(userDocRef, adminUserData);

      toast({
        title: "Admin Account Created!",
        description: "Redirecting you to the dashboard.",
      });

      // The useEffect will catch the new auth state and redirect.
      // A small delay ensures a smoother transition.
      setTimeout(() => router.push("/dashboard"), 1000);

    } catch (error: any) {
        let description = "An unexpected error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            description = "This admin account already exists. Please use the login form.";
        } else if (error instanceof FirebaseError && error.code.includes('permission-denied')) {
            description = "Permission denied. An admin account may already exist, or security rules are preventing the creation of the first user.";
        } else {
            description = error.message;
        }
        toast({
            variant: 'destructive',
            title: 'Admin Creation Failed',
            description,
        });
        setIsLoading(false);
    }
  };


  if (isUserLoading || (user && !user.isAnonymous)) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background">
      <Image
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop"
        alt="School background"
        fill
        className="object-cover -z-20"
        priority
      />
      <div className="absolute inset-0 bg-black/80 -z-10" />

      <Card className="mx-auto max-w-sm w-full bg-black/30 backdrop-blur-xl border-white/20 text-white rounded-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Admin Portal Setup</CardTitle>
          <CardDescription className="text-white/80 pt-2">
            Click to create the default administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
             {/* Create Admin Button */}
            <Button variant="secondary" onClick={handleCreateFirstAdmin} disabled={isLoading} className="w-full text-lg py-6">
              {isLoading && !isLoggingIn ? (
                 <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
              ) : (
                <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create First Admin Account
                </>
              )}
            </Button>
            
            {/* Separator */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-white/80">
                  Or
                  </span>
              </div>
            </div>
            
            {/* Login Form */}
            <form onSubmit={handleLogin} className="grid gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    "Login as Admin"
                  )}
                </Button>
            </form>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <Link href="/portal" className="underline hover:text-primary">
              &larr; Back to portal selection
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
