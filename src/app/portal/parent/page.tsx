
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
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";

export default function ParentLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Authentication service not ready.",
            description: "Please try again in a moment.",
        });
        return;
    }

    if (isSignUp) {
        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Passwords do not match." });
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create user document in Firestore
            await setDoc(doc(firestore, "users", user.uid), {
                id: user.uid,
                name: name,
                email: email,
                role: 'Parent',
                avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
                balance: 0,
            });

            toast({
                title: "Account Created",
                description: "Redirecting to your dashboard...",
            });
            router.push("/parent/dashboard");

        } catch (error: any) {
            console.error("Sign up failed:", error);
            toast({
                variant: "destructive",
                title: "Sign Up Failed",
                description: error.message || "An unknown error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    } else {
        // Login logic
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Login Successful",
                description: "Redirecting to your dashboard...",
            });
            router.push("/parent/dashboard");
        } catch (error: any) {
            console.error("Login failed:", error);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
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
          <CardTitle className="text-3xl font-bold">{isSignUp ? 'Create Parent Account' : 'Parent Login'}</CardTitle>
          <CardDescription className="text-white/80 pt-2">
            {isSignUp ? "Fill in your details to create an account." : "Enter your credentials to manage your child's account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {isSignUp && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  required
                  className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <Link href="#" className="ml-auto inline-block text-sm underline hover:text-primary">
                      Forgot password?
                    </Link>
                  )}
                </div>
                 <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white pr-10"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
              {isSignUp && (
                 <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white pr-10"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                 </div>
              )}
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isSignUp ? "Creating Account..." : "Authenticating..."}
                  </>
                ) : (
                  isSignUp ? "Sign Up" : "Login"
                )}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-white/70">{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
            <Button variant="link" className="text-white hover:text-primary" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Login' : 'Create an account'}
            </Button>
            <br/>
            <Link href="/portal" className="underline hover:text-primary mt-2 inline-block">
              &larr; Back to portal selection
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
