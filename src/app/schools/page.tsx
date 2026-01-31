'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ArrowRight, Home, Loader2, University } from "lucide-react";
import Image from "next/image";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { School } from "@/lib/data";

export default function SchoolsPage() {
  const firestore = useFirestore();

  const schoolsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'schools');
  }, [firestore]);

  const { data: schools, isLoading: isLoadingSchools } = useCollection<School>(schoolsCollection);

  // Manually add the default school if no schools are in the database yet.
  const displaySchools = (!isLoadingSchools && (!schools || schools.length === 0)) 
    ? [{ id: 'default', name: 'Deeper Life High School (Yen)' }] 
    : schools;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Image
        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
        alt="University campus background"
        fill
        className="object-cover -z-20"
        priority
      />
      <div className="absolute inset-0 bg-black/70 -z-10" />

      <div className="container flex flex-col items-center max-w-6xl text-center">
        <div className="mb-12 flex flex-col items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-full border border-primary/30">
                <University className="h-8 w-8 text-primary" />
            </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Select Your School
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Please choose your school to proceed to the correct portal.
          </p>
        </div>
        
        {isLoadingSchools ? (
            <div className="text-white flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Loading schools...</p>
            </div>
        ) : (
            <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(displaySchools || []).map((school) => (
                 <Link href="/portal" key={school.id} className="block group">
                    <Card className="flex flex-col text-center h-full transition-all duration-300 bg-black/30 backdrop-blur-xl hover:bg-black/40 hover:shadow-2xl hover:-translate-y-2 border-white/20 text-white">
                        <CardHeader className="items-center pt-8">
                            <div className="p-4 bg-primary/10 rounded-full mb-4 border border-primary/20">
                                <Building className="size-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-semibold">{school.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end justify-center">
                             <Button variant="ghost" className="w-full font-semibold text-white/80 group-hover:text-white group-hover:bg-white/10">
                                Continue <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </CardContent>
                    </Card>
                 </Link>
              ))}
            </div>
        )}

        <div className="text-center mt-12">
            <Button variant="link" asChild className="text-white/80 hover:text-white">
                <Link href="/">&larr; Back to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
