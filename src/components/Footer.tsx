import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Utensils, Twitter, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-muted/50 border-t">
        <div className="container py-8 px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Utensils className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">TuckshopKonnect</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                The modern, cashless solution for school tuckshops.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold mb-2">Navigate</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/#how-it-works" className="text-muted-foreground hover:text-primary">How It Works</Link></li>
                        <li><Link href="/#menu" className="text-muted-foreground hover:text-primary">Menu</Link></li>
                        <li><Link href="/portal" className="text-muted-foreground hover:text-primary">Portals</Link></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="space-y-4">
                 <h4 className="font-semibold">Follow Us</h4>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <a href="#" aria-label="Twitter"><Twitter /></a>
                    </Button>
                     <Button variant="outline" size="icon" asChild>
                        <a href="#" aria-label="Instagram"><Instagram /></a>
                    </Button>
                     <Button variant="outline" size="icon" asChild>
                        <a href="#" aria-label="Facebook"><Facebook /></a>
                    </Button>
                 </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TuckshopKonnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
};

export default Footer;