import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";


export default function ParentDashboard() {
  // Placeholder data
  const children = [
    { name: "Alex Doe", balance: 25.50, limit: 10.00 },
    { name: "Jamie Doe", balance: 15.00, limit: 8.00 },
  ];

  return (
    <div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Parent Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children.map((child, index) => (
            <Card key={index}>
            <CardHeader>
                <CardTitle>{child.name}</CardTitle>
                <CardDescription>Student Account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">${child.balance.toFixed(2)}</p>
                </div>
                <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Spending Limit</p>
                <p className="text-lg font-semibold">${child.limit.toFixed(2)}</p>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Fund Account
                </Button>
                <Button variant="outline" className="w-full">View History</Button>
            </CardFooter>
            </Card>
        ))}
        </div>
    </div>
  );
}
