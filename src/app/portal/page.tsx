import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, BookUser, User } from "lucide-react";

export default function PortalPage() {
  const portals = [
    {
      name: "Admin Portal",
      description: "Manage menu items, orders, and users.",
      href: "/portal/admin",
      icon: <Shield className="h-8 w-8" />,
    },
    {
      name: "Parent Portal",
      description: "Manage your children's accounts and funds.",
      href: "/portal/parent",
      icon: <BookUser className="h-8 w-8" />,
    },
    {
      name: "Student Portal",
      description: "Order your favorite meals and snacks.",
      href: "/portal/student",
      icon: <User className="h-8 w-8" />,
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="container max-w-4xl py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline mb-2">TuckshopKonnect Portal</h1>
          <p className="text-lg text-muted-foreground">Please select your role to log in.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {portals.map((portal) => (
            <Card key={portal.name} className="flex flex-col text-center transition-transform transform hover:-translate-y-2 hover:shadow-xl">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
                  {portal.icon}
                </div>
                <CardTitle>{portal.name}</CardTitle>
                <CardDescription>{portal.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end justify-center">
                <Button asChild className="w-full">
                  <Link href={portal.href}>Proceed to Login</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
            <Button variant="link" asChild>
                <Link href="/">&larr; Back to Main Site</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
