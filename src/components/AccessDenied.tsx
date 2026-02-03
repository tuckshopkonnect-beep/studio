
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { User } from "@/lib/data";
import { ShieldAlert, LogIn } from "lucide-react";

interface AccessDeniedProps {
    currentUserProfile: User | null | undefined;
    message?: string;
}

export default function AccessDenied({ currentUserProfile, message }: AccessDeniedProps) {
    const defaultMessage = "This section is for administrators only. If you believe this is an error, please contact support.";
    
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="max-w-md w-full shadow-lg border-destructive/20">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                        <ShieldAlert className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
                    <CardDescription>You do not have permission to access this page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-muted-foreground">{message || defaultMessage}</p>
                    
                    <div className="flex flex-col gap-3">
                        {!currentUserProfile ? (
                            <Button asChild className="w-full">
                                <Link href="/portal/admin">
                                    <LogIn className="mr-2 h-4 w-4" /> Login as Administrator
                                </Link>
                            </Button>
                        ) : (
                            <>
                                {currentUserProfile.role === 'Parent' && (
                                    <Button asChild className="w-full">
                                        <Link href="/parent/dashboard">Go to Parent Dashboard</Link>
                                    </Button>
                                )}
                                {currentUserProfile.role === 'Student' && (
                                    <Button asChild className="w-full">
                                        <Link href="/student/dashboard">Go to Student Dashboard</Link>
                                    </Button>
                                )}
                            </>
                        )}
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/portal">Return to Portals</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
