import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, BookUser, User, ArrowRight, Package } from "lucide-react";
import Image from "next/image";

export default function PortalPage() {
  const portals = [
    {
      name: "Admin Portal",
      description: "Manage menu, orders, users, and settings.",
      href: "/portal/admin",
      icon: <Shield className="size-8 text-primary" />,
    },
    {
      name: "Parent Portal",
      description: "Manage your children's accounts and funds.",
      href: "/portal/parent",
      icon: <BookUser className="size-8 text-primary" />,
    },
    {
      name: "Student Portal",
      description: "Order your favorite meals and snacks.",
      href: "/portal/student",
      icon: <User className="size-8 text-primary" />,
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Image
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop"
        alt="Library of books"
        fill
        className="object-cover -z-20"
        priority
      />
      <div className="absolute inset-0 bg-black/70 -z-10" />

      <div className="container flex flex-col items-center max-w-6xl text-center">
        <div className="mb-12 flex flex-col items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-full border border-primary/30">
                <Package className="h-8 w-8 text-primary" />
            </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Welcome to TuckshopKonnect
          </h1>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
            Please select your role to continue. Each portal is tailored for a seamless experience.
          </p>
        </div>
        
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-3">
          {portals.map((portal) => (
             <Card 
                key={portal.name} 
                className="flex flex-col text-center transition-all duration-300 bg-black/30 backdrop-blur-xl hover:bg-black/40 hover:shadow-2xl hover:-translate-y-2 border-white/20 text-white"
             >
                <CardHeader className="items-center pt-8">
                    <div className="p-4 bg-primary/10 rounded-full mb-4 border border-primary/20">
                        {portal.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">{portal.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription className="text-white/80">{portal.description}</CardDescription>
                </CardContent>
                <CardContent>
                    <Button asChild className="w-full font-semibold">
                        <Link href={portal.href}>
                            Proceed <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
            <Button variant="link" asChild className="text-white hover:text-white/80">
                <Link href="/schools">&larr; Back to School Selection</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
