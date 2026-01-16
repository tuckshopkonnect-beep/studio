
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 md:py-20 px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center items-center">
          <Shield className="w-12 h-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <CardDescription className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            Welcome to TuckshopKonnect. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the Application includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Application.
            </li>
            <li>
              <strong>Financial Data:</strong> We do not store any financial information. All payment transactions are handled through our secure payment processor, Paystack.
            </li>
             <li>
              <strong>Order Information:</strong> We collect information about the orders you place, including the items purchased and the total amount.
            </li>
          </ul>

          <h2>Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Process your transactions and manage your orders.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable parent/guardian-to-child account management.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
          </ul>

          <h2>Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:tuckshopkonnect@gmail.com" className="font-semibold text-primary hover:underline">tuckshopkonnect@gmail.com</a>.
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
