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

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Parent' | 'Student';
  avatarUrl: string;
  balance: number;
  class?: string;
  dailyLimit?: number;
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
  { id: 'ORD-001', customerName: 'Liam Johnson', items: [{ name: 'Meat Pie', quantity: 2 }, { name: 'Can of Soda', quantity: 1 }], total: 11.50, status: 'Ready for Pickup', orderDate: '2023-10-27T10:00:00Z' },
  { id: 'ORD-002', customerName: 'Olivia Smith', items: [{ name: 'Garden Salad', quantity: 1 }], total: 6.00, status: 'Preparing', orderDate: '2023-10-27T10:05:00Z' },
  { id: 'ORD-003', customerName: 'Noah Williams', items: [{ name: 'Classic Sandwich', quantity: 1 }, { name: 'Bottled Water', quantity: 1 }], total: 7.50, status: 'Pending', orderDate: '2023-10-27T10:10:00Z' },
  { id: 'ORD-004', customerName: 'Emma Brown', items: [{ name: 'Sausage Roll', quantity: 4 }], total: 14.00, status: 'Completed', orderDate: '2023-10-26T12:30:00Z' },
  { id: 'ORD-005', customerName: 'James Jones', items: [{ name: 'Choc Chip Cookie', quantity: 5 }], total: 7.50, status: 'Completed', orderDate: '2023-10-26T12:35:00Z' },
];

export const initialInventory: InventoryItem[] = menuItems.map(item => ({
    id: item.id,
    name: item.name,
    stock: Math.floor(Math.random() * 80) + 20, // Random stock between 20 and 100
    lowStockThreshold: 15,
}));

export const initialUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@school.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', balance: 0 },
    { id: 2, name: 'Liam Johnson', email: 'liam.j@school.com', role: 'Student', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', balance: 25.50, class: 'JSS 2', dailyLimit: 15.00 },
    { id: 3, name: 'Olivia Smith', email: 'olivia.s@school.com', role: 'Student', avatarUrl: 'https://i.pravatar.cc/150?u=a04258114e29026702d', balance: 15.00, class: 'SSS 1', dailyLimit: 20.00 },
    { id: 4, name: 'Mr. Williams', email: 'noah.williams.p@parent.com', role: 'Parent', avatarUrl: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', balance: 0 },
    { id: 5, name: 'Emma Brown', email: 'emma.b@school.com', role: 'Student', avatarUrl: 'https://i.pravatar.cc/150?u=a092581f4e29026703d', balance: 50.25, class: 'JSS 3' },
    { id: 6, name: 'Mrs. Brown', email: 'emma.brown.p@parent.com', role: 'Parent', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', balance: 0 },
];
