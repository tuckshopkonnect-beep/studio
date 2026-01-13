
"use client";

import { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { MenuItem, InventoryItem } from '@/lib/data';
import { initialInventory, menuItems } from '@/lib/data';

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface CompletedOrder {
  id: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed';
  orderDate: string;
}


interface CartContextType {
  cart: CartItem[];
  inventory: InventoryItem[];
  completedOrder: CompletedOrder | null;
  setCompletedOrder: (order: CompletedOrder | null) => void;
  addOrderToHistory: (order: CompletedOrder) => void;
  getStock: (itemId: number) => number;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Function to generate inventory with random stock, but only on the client
const generateInitialInventory = (): InventoryItem[] => {
  return menuItems.map(item => ({
    id: item.id,
    name: item.name,
    stock: Math.floor(Math.random() * 80) + 20, // Random stock between 20 and 100
    lowStockThreshold: 15,
  }));
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  
  // This state will hold the client-side generated inventory
  const [clientInventory, setClientInventory] = useState<InventoryItem[] | null>(null);


  useEffect(() => {
    // Generate inventory with random stock only on the client-side after mount
    setClientInventory(generateInitialInventory());
  }, []);

  const [completedOrder, setCompletedOrderState] = useState<CompletedOrder | null>(() => {
     if (typeof window === 'undefined') return null;
    const savedOrder = sessionStorage.getItem('completedOrder');
    return savedOrder ? JSON.parse(savedOrder) : null;
  });
  
  const setCompletedOrder = (order: CompletedOrder | null) => {
    setCompletedOrderState(order);
    if (order) {
      sessionStorage.setItem('completedOrder', JSON.stringify(order));
    } else {
      sessionStorage.removeItem('completedOrder');
    }
  };

  const addOrderToHistory = (order: CompletedOrder) => {
    if (typeof window === 'undefined') return;
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]') as CompletedOrder[];
    const updatedHistory = [order, ...history];
    localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));
  };


  const getStock = useCallback((itemId: number): number => {
    const currentInventory = clientInventory || inventory;
    return currentInventory.find(i => i.id === itemId)?.stock ?? 0;
  }, [inventory, clientInventory]);

  const addToCart = (item: MenuItem) => {
    const stock = getStock(item.id);
    if (stock <= 0) return;

    setCart(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        if (existingItem.quantity < stock) {
          return prevItems.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return prevItems; // Don't add if it would exceed stock
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevItems => prevItems.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
      const stock = getStock(itemId);
      const cartItem = cart.find(i => i.id === itemId);
      
      const sourceInventory = clientInventory || initialInventory;
      const originalStock = sourceInventory.find(i => i.id === itemId)?.stock ?? 0;
      
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      
      if (quantity > originalStock) {
        // Can't add more than what's available
        return;
      }

      setCart(prevItems =>
        prevItems.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      );
  };
  
  const clearCart = () => {
    setCart([]);
  };

  useEffect(() => {
    if (!clientInventory) return;
    // Recalculate inventory whenever cart changes
    const newInventory = clientInventory.map(invItem => {
        const cartItem = cart.find(ci => ci.id === invItem.id);
        if (cartItem) {
            return { ...invItem, stock: invItem.stock - cartItem.quantity };
        }
        return invItem;
    });
    setInventory(newInventory);
  }, [cart, clientInventory])


  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    inventory: clientInventory || inventory, // Use client inventory if available
    completedOrder,
    setCompletedOrder,
    addOrderToHistory,
    getStock,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  }), [cart, inventory, clientInventory, completedOrder, getStock]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
