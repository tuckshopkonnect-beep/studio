
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "@/lib/data";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@campusconnect.hub");
  const [password, setPassword] = useState("AdminPassword123");
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Authentication service not ready.",
            description: "Please try again in a moment.",
        });
        return;
    }
    setIsLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // This operation is now idempotent. It will create the user doc on first login,
        // and safely merge on subsequent logins. This avoids the problematic `getDoc` 
        // call which was causing a circular dependency in the security rules.
        const userDocRef = doc(firestore, "users", user.uid);
        const newUserProfile = {
            id: user.uid,
            name: user.email?.split('@')[0] || 'Admin',
            email: user.email!,
            role: 'Admin' as const,
            avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
            balance: 0,
        };
        
        await setDoc(userDocRef, newUserProfile, { merge: true });

        toast({
            title: "Login Successful",
            description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard");
    } catch (error: any) {
        console.error("Login failed:", error);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.code === 'auth/invalid-credential' 
                ? "Invalid email or password. Please try again."
                : error.message || "An unexpected error occurred."
        });
    } finally {
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
          <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
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
                <Label htmlFor="password">Password</Label>
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
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
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
