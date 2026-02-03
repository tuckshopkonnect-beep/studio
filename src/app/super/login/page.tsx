
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
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

export default function SuperAdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        // SECURITY CHECK: Only allow users with the 'Admin' role to proceed.
        if (!userDoc.exists() || userData?.role !== 'Admin') {
            await signOut(auth);
            toast({
                variant: "destructive",
                title: "Access Denied",
                description: "This portal is reserved for System Owners. Your account does not have sufficient privileges.",
            });
            setIsLoading(false);
            return;
        }

        toast({
            title: "Access Granted",
            description: "Welcome to the System Control Center.",
        });
        router.push("/super/dashboard");

    } catch (error: any) {
      console.error("Super Admin login failed:", error);
      let description = "Invalid credentials. Please verify your email and password.";
      if (error instanceof FirebaseError) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
              description = "The credentials you entered are incorrect.";
          }
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4">
      <Image
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
        alt="Server room background"
        fill
        className="object-cover -z-20"
        priority
      />
      <div className="absolute inset-0 bg-black/85 -z-10" />

      <Card className="mx-auto max-w-sm w-full bg-black/40 backdrop-blur-2xl border-white/10 text-white rounded-2xl shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto bg-primary/20 p-4 rounded-2xl w-fit mb-4 border border-primary/30">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">System Owner</CardTitle>
          <CardDescription className="text-white/60 pt-2">
            Secure gateway for global platform management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Administrative Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@tuckshopkonnect.com"
                required
                className="bg-white/5 border-white/10 placeholder:text-white/30 h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Security Key</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 placeholder:text-white/30 pr-10 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full text-lg py-7 rounded-xl shadow-lg hover:shadow-primary/20 transition-all" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying Credentials...</>
              ) : (
                "Initialize Dashboard"
              )}
            </Button>
          </form>
          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-white/30 hover:text-white transition-colors uppercase tracking-widest">
              &larr; Exit to Public Site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
