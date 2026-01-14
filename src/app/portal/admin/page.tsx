
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
import { signInAnonymously } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if a non-anonymous user is already logged in
    if (user && !user.isAnonymous) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleAnonymousSignIn = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Authentication service not available.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      // The useEffect will catch the new anonymous user and redirect
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Anonymous sign-in failed:", error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: "Could not initiate the setup process. Please try again.",
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
            This will begin the secure, one-time setup for the first administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button 
              variant="secondary" 
              onClick={handleAnonymousSignIn} 
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
                    Begin Admin Setup
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
