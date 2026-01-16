
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { User } from "@/lib/data";

interface AccessDeniedProps {
    currentUserProfile: User | null | undefined;
    message?: string;
}

export default function AccessDenied({ currentUserProfile, message }: AccessDeniedProps) {
    const defaultMessage = "This section is for administrators only. If you believe this is an error, please contact support.";
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Access Denied</CardTitle>
                <CardDescription>You do not have permission to access this page.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{message || defaultMessage}</p>
                 <div className="flex flex-wrap gap-4 mt-4">
                    {currentUserProfile?.role === 'Parent' && (
                        <Button asChild>
                            <Link href="/parent/dashboard">Go to Parent Dashboard</Link>
                        </Button>
                    )}
                    {currentUserProfile?.role === 'Student' && (
                        <Button asChild>
                            <Link href="/student/dashboard">Go to Student Dashboard</Link>
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href="/portal">Return to Portal</Link>
                    </Button>
                 </div>
            </CardContent>
        </Card>
    );
}
