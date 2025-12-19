import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Trash2, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const { cart, updateCart, removeFromCart, getCartTotal } = useCart();
  const { convertPrice, getCurrencySymbol } = useCurrency();
  const navigate = useNavigate();

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.product_id, item.size);
      return;
    }
    const updatedItems = cart.map(cartItem => 
      cartItem.product_id === item.product_id && cartItem.size === item.size
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );
    updateCart(updatedItems);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center" data-testid="empty-cart">
        <h1 className="font-serif text-4xl font-bold mb-4">Your cart is empty</h1>
        <p className="font-sans text-zinc-400 mb-8">Start adding some items to your cart</p>
        <Link to="/products">
          <button className="bg-blue-800 hover:bg-blue-700 text-white px-8 py-4 font-mono uppercase tracking-widest text-xs transition-all" data-testid="shop-now-button">
            Shop Now
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-12" data-testid="cart-title">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items-container">
            {cart.map((item, index) => (
              <div 
                key={`${item.product_id}-${item.size}-${index}`}
                className="bg-zinc-900/50 border border-white/10 p-6 flex gap-6"
                data-testid={`cart-item-${item.product_id}`}
              >
                <img 
                  src={item.product?.image_url} 
                  alt={item.product?.name}
                  className="w-24 h-24 object-cover"
                  data-testid={`cart-item-image-${item.product_id}`}
                />
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold mb-1" data-testid={`cart-item-name-${item.product_id}`}>
                    {item.product?.name}
                  </h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-zinc-500" data-testid={`cart-item-brand-${item.product_id}`}>
                    {item.product?.brand}
                  </p>
                  {item.size && (
                    <p className="font-mono text-xs text-zinc-400 mt-2" data-testid={`cart-item-size-${item.product_id}`}>
                      Size: {item.size}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <button 
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      className="w-8 h-8 bg-zinc-800 border border-white/10 hover:border-white/30 transition-colors font-mono text-sm"
                      data-testid={`decrease-quantity-${item.product_id}`}
                    >
                      -
                    </button>
                    <span className="font-mono" data-testid={`cart-item-quantity-${item.product_id}`}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      className="w-8 h-8 bg-zinc-800 border border-white/10 hover:border-white/30 transition-colors font-mono text-sm"
                      data-testid={`increase-quantity-${item.product_id}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="font-mono text-xl text-blue-400" data-testid={`cart-item-price-${item.product_id}`}>
                    {getCurrencySymbol()}{convertPrice(item.product?.price * item.quantity)}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.product_id, item.size)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    data-testid={`remove-item-${item.product_id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-white/10 p-6 sticky top-24" data-testid="cart-summary">
              <h2 className="font-serif text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span data-testid="cart-subtotal">{getCurrencySymbol()}{convertPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-zinc-400">Shipping</span>
                  <span className="text-green-500" data-testid="cart-shipping">FREE</span>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between font-mono text-xl">
                    <span>Total</span>
                    <span className="text-blue-400" data-testid="cart-total">{getCurrencySymbol()}{convertPrice(getCartTotal())}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-800 hover:bg-blue-700 text-white px-8 py-4 font-mono uppercase tracking-widest text-xs transition-all hover:tracking-[0.2em] flex items-center justify-center gap-2"
                data-testid="proceed-to-checkout-button"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};