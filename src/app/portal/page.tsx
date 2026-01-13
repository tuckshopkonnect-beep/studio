
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, BookUser, User, ArrowRight } from "lucide-react";

export default function PortalPage() {
  const portals = [
    {
      name: "Admin Portal",
      description: "Manage menu items, orders, and users.",
      href: "/portal/admin",
      icon: <Shield className="size-8" />,
    },
    {
      name: "Parent Portal",
      description: "Manage your children's accounts and funds.",
      href: "/portal/parent",
      icon: <BookUser className="size-8" />,
    },
    {
      name: "Student Portal",
      description: "Order your favorite meals and snacks.",
      href: "/portal/student",
      icon: <User className="size-8" />,
    },
  ];

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden bg-background">
        {/* Background shapes */}
        <div className="absolute inset-0 -z-10 h-full w-full">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_34px]"></div>
            <div className="absolute left-0 -top-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-blob"></div>
            <div className="absolute top-1/4 right-0 h-72 w-72 rounded-full bg-secondary/20 blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-accent/20 blur-3xl animate-blob animation-delay-4000"></div>
        </div>

      <div className="container max-w-5xl py-12 text-center">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">TuckshopKonnect Portal</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Please select your role to continue. Each portal is tailored to your needs.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {portals.map((portal) => (
            <div key={portal.name} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card className="relative flex flex-col text-center transition-all duration-300 h-full bg-card/60 backdrop-blur-sm border-white/10 shadow-lg">
                    <CardHeader className="items-center flex-grow">
                        <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary border border-primary/20">
                        {portal.icon}
                        </div>
                        <CardTitle className="text-xl font-semibold">{portal.name}</CardTitle>
                        <CardDescription className="mt-2">{portal.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-end justify-center p-6">
                        <Button asChild className="w-full font-semibold">
                        <Link href={portal.href}>
                            Proceed to Login <ArrowRight className="ml-2 size-4" />
                        </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
            <Button variant="ghost" asChild>
                <Link href="/">&larr; Back to Main Site</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
