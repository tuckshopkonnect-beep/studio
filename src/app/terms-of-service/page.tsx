
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 md:py-20 px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center items-center">
          <FileText className="w-12 h-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <CardDescription className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the TuckshopKonnect application (the "Service") operated by us.
          </p>

          <h2>Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>
          
          <h2>Orders and Payments</h2>
          <p>
            By placing an order, you agree to pay the specified price for the items selected. All payments are processed through Paystack, and are subject to their terms and conditions. The school administration reserves the right to refuse or cancel any order at their discretion. Spending limits, either default or parent-set, will be enforced.
          </p>

          <h2>Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at <a href="mailto:tuckshopkonnect@gmail.com" className="font-semibold text-primary hover:underline">tuckshopkonnect@gmail.com</a>.
          </p>

           <div className="mt-8 text-center not-prose">
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
