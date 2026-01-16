
import { PlaceHolderImages } from './placeholder-images';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: {
    id?: string;
    imageUrl: string;
    imageHint: string;
    description?: string;
  };
  category: 'Meals' | 'Snacks' | 'Drinks' | 'Fruit' | 'Other';
  stock: number;
  isAvailable: boolean;
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
    id: string; // Changed to string
    name: string;
    stock: number;
    lowStockThreshold: number;
}

export interface User {
  id: string; 
  name: string;
  email: string;
  role: 'Admin' | 'Parent' | 'Student';
  avatarUrl: string;
  balance: number;
  class?: string;
  dailyLimit?: number;
  parentId?: string;
  childIds?: string[];
}

export interface PasswordResetRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  requestDate: string;
}
