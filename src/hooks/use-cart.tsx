
"use client";

import { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { MenuItem } from '@/lib/data';

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface CompletedOrder {
  id: string;
  userId: string;
  schoolId?: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed';
  orderDate: string;
  customerName: string;
}


interface CartContextType {
  cart: CartItem[];
  completedOrder: CompletedOrder | null;
  setCompletedOrder: (order: CompletedOrder | null) => void;
  addOrderToHistory: (order: CompletedOrder) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedOrder = sessionStorage.getItem('completedOrder');
    if (savedOrder) {
      setCompletedOrderState(JSON.parse(savedOrder));
    }
  }, []);

  const [completedOrder, setCompletedOrderState] = useState<CompletedOrder | null>(null);
  
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

  const addToCart = (item: MenuItem) => {
    setCart(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        // Check against the item's original stock property
        if (existingItem.quantity < existingItem.stock) {
          return prevItems.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return prevItems; // Don't add if it would exceed stock
      }
      // Can only add if stock is greater than 0
      if (item.stock > 0) {
        return [...prevItems, { ...item, quantity: 1 }];
      }
      return prevItems;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevItems => prevItems.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const cartItem = cart.find(i => i.id === itemId);
    if (!cartItem) return;

    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    // Do not allow quantity to exceed the original stock
    if (quantity > cartItem.stock) {
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

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    completedOrder,
    setCompletedOrder,
    addOrderToHistory,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  }), [cart, completedOrder, totalItems, totalPrice]);

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
