
"use client";

import { useState } from "react";
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
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication service not available.",
      });
      return;
    }
    setIsLoading(true);
    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, "admin@campusconnect.hub", "AdminPassword123");
      const user = userCredential.user;

      // 2. Create the user profile document in Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        name: "Admin User",
        email: "admin@campusconnect.hub",
        role: "Admin",
        avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
        balance: 0,
      });

      toast({
        title: "Admin Account Created",
        description: "You have been successfully signed in.",
      });

      // 3. Redirect to the dashboard
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Admin creation failed:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This admin account already exists. Please log in normally or reset the password if needed.";
      }
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: description,
      });
      setIsLoading(false);
    }
  };
  
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
            This will perform a one-time setup to create the first administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
             <div className="text-xs text-center text-white/70 space-y-1">
                <p>Email: <span className="font-mono">admin@campusconnect.hub</span></p>
                <p>Password: <span className="font-mono">AdminPassword123</span></p>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleCreateAdmin} 
              disabled={isLoading} 
              className="w-full text-lg py-6"
            >
              {isLoading ? (
                 <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing...
                  </>
              ) : (
                <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create First Admin Account
                </>
              )}
            </Button>
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
