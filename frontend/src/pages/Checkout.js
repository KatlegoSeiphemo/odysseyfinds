import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Checkout = () => {
  const { cart, sessionId, getCartTotal, clearCart } = useCart();
  const { convertPrice, getCurrencySymbol, currency } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });

  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        session_id: sessionId,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size
        })),
        total: parseFloat(convertPrice(getCartTotal())),
        currency: currency,
        customer_name: formData.name,
        customer_email: formData.email,
        shipping_address: formData.address
      };

      await axios.post(`${API}/orders`, orderData);
      await clearCart();
      toast.success('Order placed successfully!');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-12" data-testid="checkout-title">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <h2 className="font-serif text-2xl font-bold mb-6">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                  Full Name *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-white/10 focus:border-blue-500 h-12 px-4 font-mono text-sm outline-none transition-colors"
                  data-testid="checkout-name-input"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                  Email *
                </label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-white/10 focus:border-blue-500 h-12 px-4 font-mono text-sm outline-none transition-colors"
                  data-testid="checkout-email-input"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                  Shipping Address *
                </label>
                <textarea 
                  required
                  rows={4}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-white/10 focus:border-blue-500 p-4 font-mono text-sm outline-none transition-colors resize-none"
                  data-testid="checkout-address-input"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 hover:bg-blue-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white px-8 py-6 font-mono uppercase tracking-widest text-xs transition-all hover:tracking-[0.2em]"
                data-testid="place-order-button"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-serif text-2xl font-bold mb-6">Order Summary</h2>
            <div className="bg-zinc-900/50 border border-white/10 p-6" data-testid="checkout-summary">
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={`${item.product_id}-${index}`} className="flex justify-between font-mono text-sm" data-testid={`summary-item-${item.product_id}`}>
                    <span className="text-zinc-400">
                      {item.product?.name} x{item.quantity}
                      {item.size && ` (${item.size})`}
                    </span>
                    <span>{getCurrencySymbol()}{convertPrice(item.product?.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span data-testid="checkout-subtotal">{getCurrencySymbol()}{convertPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-zinc-400">Shipping</span>
                  <span className="text-green-500" data-testid="checkout-shipping">FREE</span>
                </div>
                <div className="flex justify-between font-mono text-xl pt-2">
                  <span>Total</span>
                  <span className="text-blue-400" data-testid="checkout-total">{getCurrencySymbol()}{convertPrice(getCartTotal())}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-zinc-950/50 border border-white/10">
              <p className="font-mono text-xs text-zinc-500">
                This is a prototype. No real payment will be processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};