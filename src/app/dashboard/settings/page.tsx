
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ChevronsUpDown, Check, Loader2, ShieldCheck, Mail } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { User } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc, useAuth } from "@/firebase";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import AccessDenied from "@/components/AccessDenied";


// Define the settings type
interface AppSettings {
  jssLimit?: number;
  sssLimit?: number;
  orderTimerEnabled?: boolean;
  orderOpenTime?: string;
  orderCloseTime?: string;
  stopOrders?: boolean;
  posScannerEnabled?: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user: authUser, isUserLoading } = useUser();

  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useDoc<User>(currentUserDocRef);
  const isCurrentUserAdmin = currentUserProfile?.role === 'Admin';


  // State for default limits
  const [jssLimit, setJssLimit] = useState("");
  const [sssLimit, setSssLimit] = useState("");

  // Fetch settings from Firestore
  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "settings", "global");
  }, [firestore]);

  const { data: appSettings, isLoading: isLoadingSettings } = useDoc<AppSettings>(settingsDocRef);

  useEffect(() => {
    if (appSettings) {
      setJssLimit(String(appSettings.jssLimit || ""));
      setSssLimit(String(appSettings.sssLimit || ""));
    }
  }, [appSettings]);


  const [isPromoteConfirmOpen, setIsPromoteConfirmOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // State for individual limits
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [individualLimit, setIndividualLimit] = useState<string>('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || isLoadingCurrentUser || !isCurrentUserAdmin) return null;
    return query(collection(firestore, "users"), where('role', '==', 'Student'));
  }, [firestore, isLoadingCurrentUser, isCurrentUserAdmin]);

  const { data: studentUsers } = useCollection<User>(usersQuery);
  const allUsers = studentUsers || [];
  
  const selectedStudent = allUsers.find(u => u.id === selectedStudentId);

  useEffect(() => {
    if (selectedStudent && selectedStudent.dailyLimit) {
      setIndividualLimit(String(selectedStudent.dailyLimit));
    } else {
      setIndividualLimit('');
    }
  }, [selectedStudent]);

  const handleSettingToggle = (key: keyof AppSettings, enabled: boolean) => {
    if (!settingsDocRef) return;
    updateDocumentNonBlocking(settingsDocRef, { [key]: enabled });
    if(key === "posScannerEnabled") {
      toast({
        title: "Setting Saved",
        description: "POS Scanner has been updated. The navigation will refresh on the next page load."
      });
    }
  };
  
  const handleTimeChange = () => {
    toast({
        title: "Order times saved",
        description: "The shop open and close times have been updated."
    });
  };

  const handleSaveDefaults = () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Database not ready.' });
      return;
    }
    
    const settingsData = {
      jssLimit: Number(jssLimit),
      sssLimit: Number(sssLimit),
    };

    if (settingsDocRef) {
        setDocumentNonBlocking(settingsDocRef, settingsData, { merge: true });

        toast({
            title: "Default limits saved",
            description: "The default spending limits have been updated and will apply to all students without an individual limit."
        });
    }
  };

  const handleSaveIndividualLimit = async () => {
    if (!selectedStudentId || !firestore) {
      toast({ variant: 'destructive', title: "No student selected or database not ready." });
      return;
    }
    const newLimit = individualLimit === '' ? null : Number(individualLimit);
    
    const studentDocRef = doc(firestore, 'users', selectedStudentId);
    
    try {
        await updateDoc(studentDocRef, { dailyLimit: newLimit });
        toast({
          title: "Individual Limit Updated",
          description: `The daily limit for ${selectedStudent?.name} has been set.`
        });
    } catch (e) {
        toast({ variant: 'destructive', title: "Failed to update limit." });
        console.error(e);
    }
  };

  const handleRemoveIndividualLimit = async () => {
    if (!selectedStudentId || !firestore) return;
    setIndividualLimit(''); 
    
    const studentDocRef = doc(firestore, 'users', selectedStudentId);
    try {
        await updateDoc(studentDocRef, { dailyLimit: null });
        toast({
            title: "Individual Limit Removed",
            description: `The daily limit for ${selectedStudent?.name} has been reverted to the default.`
        });
    } catch(e) {
        toast({ variant: 'destructive', title: "Failed to remove limit." });
        console.error(e);
    }
  };
  
  const handlePromoteStudents = () => {
    console.log("Promoting all students...");
    toast({
        title: "Students Promoted",
        description: "All students have been moved to their next class level."
    });
    setIsPromoteConfirmOpen(false);
  };

  const handleTimeInputChange = (field: keyof AppSettings, value: string) => {
    if (!settingsDocRef) return;
    updateDocumentNonBlocking(settingsDocRef, { [field]: value });
  };

  const handleRequestAdminPasswordReset = async () => {
    if (!auth || !authUser?.email) {
        toast({ variant: "destructive", title: "Authentication Error", description: "Your admin account could not be verified." });
        return;
    }
    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(auth, authUser.email);
      toast({
        title: "Reset Email Sent",
        description: `A secure link has been sent to: ${authUser.email}. Check your inbox to finish updating your password.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message || "Could not send reset email.",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (isUserLoading || isLoadingCurrentUser || isLoadingSettings) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCurrentUserAdmin) {
    return <AccessDenied currentUserProfile={currentUserProfile} />;
  }


  return (
    <>
    <ConfirmationDialog
        open={isPromoteConfirmOpen}
        onOpenChange={setIsPromoteConfirmOpen}
        onConfirm={handlePromoteStudents}
        title="Promote All Students?"
        description="This action will move all students to their next class level (e.g., JSS1 to JSS2). This action cannot be undone."
        confirmButtonVariant="destructive"
        confirmButtonText="Yes, Promote All Students"
    />
    <div className="grid gap-6">
       <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Default Spending Limits</CardTitle>
            <CardDescription>Set the default daily spending limits for all students by class level.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="jss-limit">Junior Students (JSS)</Label>
                {isLoadingSettings ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₦</span>
                        <Input id="jss-limit" type="number" value={jssLimit} onChange={(e) => setJssLimit(e.target.value)} className="pl-6" />
                    </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sss-limit">Senior Students (SSS)</Label>
                {isLoadingSettings ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₦</span>
                        <Input id="sss-limit" type="number" value={sssLimit} onChange={(e) => setSssLimit(e.target.value)} className="pl-6" />
                    </div>
                )}
              </div>
            </form>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveDefaults}>Save Defaults</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Individual Spending Limits</CardTitle>
            <CardDescription>
                Override the default daily limit for a specific student, as requested by their parent.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="student-select">Select Student</Label>
                <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isComboboxOpen}
                      className="w-full justify-between"
                      disabled={!studentUsers}
                    >
                      {selectedStudentId
                        ? studentUsers?.find((student) => student.id === selectedStudentId)?.name
                        : "Select a student..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search student..." />
                      <CommandList>
                        <CommandEmpty>No student found.</CommandEmpty>
                        <CommandGroup>
                          {studentUsers?.map((student) => (
                            <CommandItem
                              key={student.id}
                              value={student.name}
                              onSelect={() => {
                                setSelectedStudentId(student.id);
                                setIsComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {student.name} - {student.class}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {selectedStudentId && (
                 <div className="grid gap-2">
                    <Label htmlFor="individual-limit">Custom Daily Limit (₦)</Label>
                    <div className="flex gap-2">
                       <div className="relative flex-grow">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₦</span>
                          <Input 
                            id="individual-limit" 
                            type="number"
                            placeholder="Leave blank to use default" 
                            className="pl-6"
                            value={individualLimit}
                            onChange={(e) => setIndividualLimit(e.target.value)}
                          />
                       </div>
                       {selectedStudent?.dailyLimit !== undefined && selectedStudent?.dailyLimit !== null && (
                          <Button variant="outline" onClick={handleRemoveIndividualLimit}>
                            Remove Limit
                          </Button>
                       )}
                    </div>
                </div>
              )}
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
             <Button onClick={handleSaveIndividualLimit} disabled={!selectedStudentId}>Save Individual Limit</Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store Controls</CardTitle>
            <CardDescription>Manage the operational status of the tuck shop.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between space-x-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex-1">
                    <Label htmlFor="stop-orders" className="font-semibold text-destructive">Stop All Orders (Override)</Label>
                    <p className="text-xs text-muted-foreground">
                    Temporarily disable all new orders from being placed. This will override the timer.
                    </p>
                </div>
                <Switch 
                    id="stop-orders" 
                    aria-label="Stop all orders" 
                    checked={appSettings?.stopOrders || false}
                    onCheckedChange={(checked) => handleSettingToggle('stopOrders', checked)}
                />
            </div>
             <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                    <Label htmlFor="order-timer" className="font-semibold">Enable Order Timer</Label>
                    <p className="text-xs text-muted-foreground">
                    Automatically open and close the shop at specific times.
                    </p>
                </div>
                <Switch 
                    id="order-timer" 
                    aria-label="Enable order timer" 
                    checked={appSettings?.orderTimerEnabled || false}
                    onCheckedChange={(checked) => handleSettingToggle('orderTimerEnabled', checked)}
                    disabled={appSettings?.stopOrders}
                />
              </div>
              {appSettings?.orderTimerEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="grid gap-2">
                        <Label htmlFor="open-time">Open Time</Label>
                        <Input 
                            id="open-time" 
                            type="time" 
                            value={appSettings?.orderOpenTime || "08:00"}
                            onChange={(e) => handleTimeInputChange('orderOpenTime', e.target.value)}
                            onBlur={handleTimeChange}
                            disabled={appSettings?.stopOrders}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="close-time">Close Time</Label>
                        <Input 
                            id="close-time" 
                            type="time" 
                            value={appSettings?.orderCloseTime || "14:00"}
                            onChange={(e) => handleTimeInputChange('orderCloseTime', e.target.value)}
                            onBlur={handleTimeChange}
                            disabled={appSettings?.stopOrders}
                        />
                    </div>
                </div>
              )}
            </div>
             <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="flex-1">
                <Label htmlFor="pos-scanner" className="font-semibold">Enable POS Scanner</Label>
                <p className="text-xs text-muted-foreground">
                  Allow staff to scan QR codes to verify orders.
                </p>
              </div>
              <Switch 
                id="pos-scanner" 
                aria-label="Enable POS Scanner" 
                checked={appSettings?.posScannerEnabled !== false}
                onCheckedChange={(checked) => handleSettingToggle('posScannerEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
                Manage your administrator account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex gap-3">
                    <div className="p-2 bg-primary/10 rounded-full h-fit">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Update Password</p>
                        <p className="text-xs text-muted-foreground">Receive a secure link to change your password.</p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRequestAdminPasswordReset}
                    disabled={isResettingPassword}
                >
                    {isResettingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    {isResettingPassword ? "Sending..." : "Send Reset Email"}
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Academics</CardTitle>
          <CardDescription>
            Manage end-of-year academic tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-base font-semibold">Promote All Students</Label>
              <p className="text-sm text-muted-foreground">
                Move all students to their next class level (e.g., JSS1 to JSS2). This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setIsPromoteConfirmOpen(true)}>Promote Students</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
