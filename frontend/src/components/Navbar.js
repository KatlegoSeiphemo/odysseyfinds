import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const Navbar = () => {
  const { currency, setCurrency } = useCurrency();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" data-testid="nav-home-link">
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Odyssey <span className="text-blue-500 italic">Finds</span>
            </h1>
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              to="/products" 
              className="font-mono text-xs uppercase tracking-widest hover:text-blue-400 transition-colors"
              data-testid="nav-products-link"
            >
              Shop
            </Link>

            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger 
                className="w-20 h-8 bg-transparent border-white/10 font-mono text-xs" 
                data-testid="currency-selector"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent data-testid="currency-dropdown">
                <SelectItem value="USD" data-testid="currency-usd">USD</SelectItem>
                <SelectItem value="EUR" data-testid="currency-eur">EUR</SelectItem>
                <SelectItem value="GBP" data-testid="currency-gbp">GBP</SelectItem>
                <SelectItem value="JPY" data-testid="currency-jpy">JPY</SelectItem>
              </SelectContent>
            </Select>

            <Link to="/cart" className="relative" data-testid="nav-cart-link">
              <ShoppingCart className="w-5 h-5 hover:text-blue-400 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-mono" data-testid="cart-count-badge">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};