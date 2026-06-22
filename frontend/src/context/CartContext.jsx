import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'customer') return;
    try {
      const { data } = await API.get('/cart');
      setCart(data.cart);
    } catch {}
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (foodItemId, quantity = 1) => {
    const { data } = await API.post('/cart/add', { foodItemId, quantity });
    setCart(data.cart);
    return data.cart;
  };

  const updateQuantity = async (foodItemId, quantity) => {
    const { data } = await API.put('/cart/update', { foodItemId, quantity });
    setCart(data.cart);
  };

  const removeItem = async (foodItemId) => {
    const { data } = await API.delete(`/cart/remove/${foodItemId}`);
    setCart(data.cart);
  };

  const clearCart = async () => {
    await API.delete('/cart/clear');
    setCart({ items: [], totalAmount: 0 });
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Always recompute totalAmount client-side from populated items — backend virtual is a fallback
  const computedTotal = cart.items?.reduce((sum, item) => {
    const price = item.foodItem?.price ?? 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  const cartWithTotal = { ...cart, totalAmount: computedTotal || cart.totalAmount || 0 };

  return (
    <CartContext.Provider value={{ cart: cartWithTotal, loading, addToCart, updateQuantity, removeItem, clearCart, cartCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
