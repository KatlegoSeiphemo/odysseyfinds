import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Get or create session ID
    let sid = localStorage.getItem('odyssey_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('odyssey_session_id', sid);
    }
    setSessionId(sid);
    loadCart(sid);
  }, []);

  const loadCart = async (sid) => {
    try {
      const response = await axios.get(`${API}/cart/${sid}`);
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1, size = null) => {
    try {
      await axios.post(`${API}/cart/${sessionId}`, {
        product_id: productId,
        quantity,
        size
      });
      await loadCart(sessionId);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  };

  const updateCart = async (items) => {
    try {
      const itemsToSend = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size
      }));
      await axios.put(`${API}/cart/${sessionId}`, itemsToSend);
      await loadCart(sessionId);
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const removeFromCart = async (productId, size = null) => {
    const updatedItems = cart.filter(item => 
      !(item.product_id === productId && item.size === size)
    );
    await updateCart(updatedItems);
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API}/cart/${sessionId}`);
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      sessionId,
      addToCart, 
      updateCart, 
      removeFromCart, 
      clearCart,
      getCartTotal,
      getCartCount,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};