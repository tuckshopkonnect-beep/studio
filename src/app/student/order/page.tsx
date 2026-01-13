import { menuItems } from '@/lib/data';
import MenuItemCard from '@/components/MenuItemCard';

export default function OrderPage() {
  return (
    <div>
      <section>
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">Place a New Order</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {menuItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
