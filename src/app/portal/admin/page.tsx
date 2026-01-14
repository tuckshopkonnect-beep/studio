
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@campusconnect.hub");
  const [password, setPassword] = useState("AdminPassword123");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

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

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Successful login will be handled by the useEffect hook, which redirects to /dashboard
    } catch (error) {
        setIsLoading(false);
        toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: (error as FirebaseError).message || 'Please check your credentials.',
        });
    }
  };

  // Function to handle temporary anonymous login to bootstrap the admin user
  const handleAnonymousLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
        await signInAnonymously(auth);
        // This will set a user object, and the dashboard will become accessible.
        router.push('/dashboard/users');
        toast({
            title: "Anonymous Session Started",
            description: "Please navigate to the Users page to create your admin account.",
        });
    } catch (error) {
        setIsLoading(false);
        toast({
            variant: 'destructive',
            title: 'Anonymous Login Failed',
            description: 'Could not start a temporary session. Please try again.',
        });
    }
  };

  // Prevent flash of login page if user is already logged in and being redirected
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
          <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
          <CardDescription className="text-white/80 pt-2">
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-white/70 hover:text-white hover:bg-white/20"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || isUserLoading}>
                {isLoading || isUserLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
               <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    First time setup?
                    </span>
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={handleAnonymousLogin} disabled={isLoading || isUserLoading}>
                  Start Admin Setup
              </Button>
            </div>
          </form>
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
