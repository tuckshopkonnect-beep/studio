
import { PlaceHolderImages } from './placeholder-images';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: (typeof PlaceHolderImages)[number];
  category: 'Meals' | 'Snacks' | 'Drinks' | 'Fruit' | 'Other';
}

export interface Order {
  id: string;
  customerName: string;
  userId: string;
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
  id: string; // Changed to string to match Firebase UID
  name: string;
  email: string;
  role: 'Admin' | 'Parent' | 'Student';
  avatarUrl: string;
  balance: number;
  class?: string;
  dailyLimit?: number;
  parentId?: string; // Changed to string to match Firebase UID
}

export interface PasswordResetRequest {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar: string;
  requestDate: string;
}


export const menuItems: MenuItem[] = [
  { id: 1, name: 'Classic Sandwich', description: 'A delicious ham and cheese sandwich.', price: 1500, image: PlaceHolderImages[0], category: 'Meals' },
  { id: 2, name: 'Garden Salad', description: 'Fresh greens with a vinaigrette dressing.', price: 1800, image: PlaceHolderImages[1], category: 'Meals' },
  { id: 3, name: 'Meat Pie', description: 'A classic savory meat pie.', price: 800, image: PlaceHolderImages[2], category: 'Meals' },
  { id: 4, name: 'Sausage Roll', description: 'Flaky pastry with a sausage filling.', price: 500, image: PlaceHolderImages[3], category: 'Meals' },
  { id: 5, name: 'Fresh Apple', description: 'A crisp and juicy apple.', price: 200, image: PlaceHolderImages[4], category: 'Fruit' },
  { id: 6, name: 'Potato Crisps', description: 'A bag of salted potato crisps.', price: 300, image: PlaceHolderImages[5], category: 'Snacks' },
  { id: 7, name: 'Chocolate Bar', description: 'A bar of milk chocolate.', price: 500, image: PlaceHolderImages[6], category: 'Snacks' },
  { id: 8, name: 'Choc Chip Cookie', description: 'A warm, gooey cookie.', price: 350, image: PlaceHolderImages[7], category: 'Snacks' },
  { id: 9, name: 'Bottled Water', description: '600ml of still spring water.', price: 200, image: PlaceHolderImages[8], category: 'Drinks' },
  { id: 10, name: 'Orange Juice', description: 'A carton of fresh orange juice.', price: 400, image: PlaceHolderImages[9], category: 'Drinks' },
  { id: 11, name: 'Can of Soda', description: 'A can of your favorite soda.', price: 300, image: PlaceHolderImages[10], category: 'Drinks' },
];

// All initial data is now cleared. The app will rely on Firestore.
export const initialOrders: Order[] = [];

export const initialInventory: InventoryItem[] = [];

export const initialUsers: User[] = [];

export const passwordResetRequests: PasswordResetRequest[] = [];
