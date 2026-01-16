
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VoteOfThanksPage() {
  const people = [
    "God",
    "Mr. Joshua A.",
    "Mr. Daniel Kadri",
    "Mr. Tolulope M.",
    "Samuel Ayomide",
    "Staffs of DLHS (2024/25 session)",
    "Miss Patience",
    "My Parents",
    "and to the members of Set 2k25"
  ];

  return (
    <div className="container mx-auto max-w-3xl py-12 md:py-20 px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center items-center">
          <Heart className="w-12 h-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">A Special Vote of Thanks</CardTitle>
          <CardDescription className="text-muted-foreground">
            This project would not have been possible without the support and contributions of some very special people.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-lg text-center">
            A special thing to be following people.
          </p>
          <ul className="space-y-3 text-center text-lg text-card-foreground">
            {people.map((person, index) => (
              <li key={index} className="font-medium">
                {person}
              </li>
            ))}
          </ul>
           <div className="mt-8 text-center">
            <Button asChild>
                <Link href="/">
                    &larr; Back to Home
                </Link>
            </Button>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
