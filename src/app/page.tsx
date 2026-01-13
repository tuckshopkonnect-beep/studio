import { menuItems } from '@/lib/data';
import MenuItemCard from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';
import { Utensils } from 'lucide-react';
import Link from 'next/link';


export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Welcome to TuckshopKonnect</h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">The easiest way to order school lunches. Fresh, fast, and right at your fingertips.</p>
        <div className="flex justify-center items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/portal">
              <Utensils className="mr-2" /> Portal Login
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-headline font-bold mb-8 text-center text-primary-foreground bg-primary/90 py-2 rounded-lg shadow-md">Today's Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {menuItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
