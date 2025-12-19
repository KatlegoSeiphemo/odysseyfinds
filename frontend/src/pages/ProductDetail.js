import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { convertPrice, getCurrencySymbol } = useCurrency();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API}/products/${id}`);
        setProduct(response.data);
        if (response.data.sizes && response.data.sizes.length > 0) {
          setSelectedSize(response.data.sizes[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity, selectedSize || null);
    if (success) {
      toast.success('Added to cart!');
    } else {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" data-testid="loading-indicator">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" data-testid="product-not-found">
        <p className="font-serif text-2xl">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors mb-8"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-zinc-900/50 border border-white/10 overflow-hidden" data-testid="product-image-container">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-detail-image"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500" data-testid="product-detail-brand">
                {product.brand}
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mt-2 mb-4" data-testid="product-detail-name">
                {product.name}
              </h1>
              <p className="font-sans text-lg text-zinc-400" data-testid="product-detail-description">
                {product.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-4xl text-blue-400" data-testid="product-detail-price">
                {getCurrencySymbol()}{convertPrice(product.price)}
              </span>
              {product.condition === 'used' && (
                <span className="font-mono text-xs uppercase tracking-widest text-yellow-500 px-3 py-1 border border-yellow-500/30" data-testid="product-detail-condition">
                  Used
                </span>
              )}
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-3">
                  Select Size
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-40 bg-zinc-900/50 border-white/10" data-testid="size-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent data-testid="size-dropdown">
                    {product.sizes.map(size => (
                      <SelectItem key={size} value={size} data-testid={`size-${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-zinc-900/50 border border-white/10 hover:border-white/30 transition-colors font-mono"
                  data-testid="quantity-decrease"
                >
                  -
                </button>
                <span className="font-mono text-xl w-12 text-center" data-testid="quantity-display">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 bg-zinc-900/50 border border-white/10 hover:border-white/30 transition-colors font-mono"
                  data-testid="quantity-increase"
                >
                  +
                </button>
              </div>
              <p className="font-mono text-xs text-zinc-500 mt-2" data-testid="stock-info">
                {product.stock} in stock
              </p>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-800 hover:bg-blue-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white px-8 py-6 font-mono uppercase tracking-widest text-xs transition-all hover:tracking-[0.2em]"
              data-testid="add-to-cart-button"
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};