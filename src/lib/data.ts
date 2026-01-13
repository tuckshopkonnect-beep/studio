import { PlaceHolderImages } from './placeholder-images';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: (typeof PlaceHolderImages)[number];
}

export interface Order {
  id: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
  }[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed';
  orderDate: string;
}

export interface InventoryItem {
    id: number;
    name: string;
    stock: number;
    lowStockThreshold: number;
}


export const menuItems: MenuItem[] = [
  { id: 1, name: 'Classic Sandwich', description: 'A delicious ham and cheese sandwich.', price: 5.50, image: PlaceHolderImages[0] },
  { id: 2, name: 'Garden Salad', description: 'Fresh greens with a vinaigrette dressing.', price: 6.00, image: PlaceHolderImages[1] },
  { id: 3, name: 'Meat Pie', description: 'A classic savory meat pie.', price: 4.50, image: PlaceHolderImages[2] },
  { id: 4, name: 'Sausage Roll', description: 'Flaky pastry with a sausage filling.', price: 3.50, image: PlaceHolderImages[3] },
  { id: 5, name: 'Fresh Apple', description: 'A crisp and juicy apple.', price: 1.00, image: PlaceHolderImages[4] },
  { id: 6, name: 'Potato Crisps', description: 'A bag of salted potato crisps.', price: 2.00, image: PlaceHolderImages[5] },
  { id: 7, name: 'Chocolate Bar', description: 'A bar of milk chocolate.', price: 2.50, image: PlaceHolderImages[6] },
  { id: 8, name: 'Choc Chip Cookie', description: 'A warm, gooey cookie.', price: 1.50, image: PlaceHolderImages[7] },
  { id: 9, name: 'Bottled Water', description: '600ml of still spring water.', price: 2.00, image: PlaceHolderImages[8] },
  { id: 10, name: 'Orange Juice', description: 'A carton of fresh orange juice.', price: 2.50, image: PlaceHolderImages[9] },
  { id: 11, name: 'Can of Soda', description: 'A can of your favorite soda.', price: 2.50, image: PlaceHolderImages[10] },
];

export const initialOrders: Order[] = [
  { id: 'ORD-001', customerName: 'John Doe', items: [{ name: 'Meat Pie', quantity: 2 }, { name: 'Can of Soda', quantity: 1 }], total: 11.50, status: 'Ready for Pickup', orderDate: '2023-10-27T10:00:00Z' },
  { id: 'ORD-002', customerName: 'Jane Smith', items: [{ name: 'Garden Salad', quantity: 1 }], total: 6.00, status: 'Preparing', orderDate: '2023-10-27T10:05:00Z' },
  { id: 'ORD-003', customerName: 'Peter Jones', items: [{ name: 'Classic Sandwich', quantity: 1 }, { name: 'Bottled Water', quantity: 1 }], total: 7.50, status: 'Pending', orderDate: '2023-10-27T10:10:00Z' },
  { id: 'ORD-004', customerName: 'Mary Williams', items: [{ name: 'Sausage Roll', quantity: 4 }], total: 14.00, status: 'Completed', orderDate: '2023-10-26T12:30:00Z' },
];

export const initialInventory: InventoryItem[] = menuItems.map(item => ({
    id: item.id,
    name: item.name,
    stock: Math.floor(Math.random() * 80) + 20, // Random stock between 20 and 100
    lowStockThreshold: 15,
}));
