import { menuItems } from '@/lib/data';
import MenuItemCard from '@/components/MenuItemCard';
import RecommendationTool from '@/components/RecommendationTool';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-16">
        <RecommendationTool />
      </section>

      <section>
        <h1 className="text-4xl font-headline font-bold mb-8 text-center text-primary-foreground bg-primary/90 py-2 rounded-lg shadow-md">Our Menu</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {menuItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
