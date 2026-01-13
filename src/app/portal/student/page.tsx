import Link from "next/link";
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

export default function StudentLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Student Login</CardTitle>
          <CardDescription>
            Enter your student ID and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input
                id="student-id"
                type="text"
                placeholder="Your student ID"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
                <Link href="/student/dashboard">Login</Link>
            </Button>
          </div>
           <div className="mt-4 text-center text-sm">
            <Link href="/portal" className="underline">
              Back to portal selection
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
