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
import { registerSchoolAndAdmin } from "@/app/actions";

export default function RegisterSchoolPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.length < 6) {
        toast({
            variant: "destructive",
            title: "Password Too Short",
            description: "Password must be at least 6 characters.",
        });
        return;
    }
    setIsLoading(true);

    const result = await registerSchoolAndAdmin({
        schoolName,
        adminName,
        adminEmail,
        adminPassword
    });

    if (result.success) {
        toast({
            title: "School Registered!",
            description: "Your admin account has been created. Redirecting to login...",
        });
        router.push("/portal/admin");
    } else {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: result.error || "An unknown error occurred.",
        });
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background py-12">
      <Image
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop"
        alt="School background"
        fill
        className="object-cover -z-20"
        priority
      />
      <div className="absolute inset-0 bg-black/80 -z-10" />

      <Card className="mx-auto max-w-md w-full bg-black/30 backdrop-blur-xl border-white/20 text-white rounded-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Register Your School</CardTitle>
          <CardDescription className="text-white/80 pt-2">
            Create an account for your school and become the first administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  type="text"
                  placeholder="e.g. Deeper Life High School"
                  required
                  className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
               <hr className="border-white/20" />
              <div className="grid gap-2">
                <Label htmlFor="admin-name">Your Full Name</Label>
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Your Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@yourschool.com"
                  required
                  className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Your Password</Label>
                 <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="bg-white/20 border-white/30 placeholder:text-white/60 focus:ring-white pr-10"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
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
                    Registering...
                  </>
                ) : (
                  "Create School Account"
                )}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/portal/admin" className="underline hover:text-primary">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
