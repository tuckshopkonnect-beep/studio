
"use client";

import { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { MenuItem, InventoryItem } from '@/lib/data';
import { initialInventory } from '@/lib/data';

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
  cartItems: CartItem[];
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  
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
    return inventory.find(i => i.id === itemId)?.stock ?? 0;
  }, [inventory]);

  const addToCart = (item: MenuItem) => {
    const stock = getStock(item.id);
    if (stock <= 0) return;

    setCartItems(prevItems => {
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
    setCartItems(prevItems => prevItems.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
      const stock = getStock(itemId);
      const cartItem = cartItems.find(i => i.id === itemId);
      const originalStock = initialInventory.find(i => i.id === itemId)?.stock ?? 0;
      
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      
      // The available stock is the original stock minus what other people might have in carts,
      // plus what this user already has in their cart.
      // For this simulation, we'll just check against the initial stock.
      if (quantity > originalStock) {
        // Can't add more than what's available
        return;
      }

      setCartItems(prevItems =>
        prevItems.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      );
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  useEffect(() => {
    // Recalculate inventory whenever cartItems change
    const newInventory = initialInventory.map(invItem => {
        const cartItem = cartItems.find(ci => ci.id === invItem.id);
        if (cartItem) {
            return { ...invItem, stock: invItem.stock - cartItem.quantity };
        }
        return invItem;
    });
    setInventory(newInventory);
  }, [cartItems])


  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    inventory,
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
  }), [cartItems, inventory, completedOrder, getStock]);

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
