import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/products`);
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1722970882096-b479417e3d24?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 tracking-tight" data-testid="hero-title">
            Where <span className="italic text-blue-500">Street</span> Meets <span className="italic text-red-600">Royal</span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto" data-testid="hero-subtitle">
            Curated sneakers and premium tech. Every piece tells a story.
          </p>
          <Link to="/products">
            <button 
              className="bg-blue-800 hover:bg-blue-700 text-white px-12 py-6 font-mono uppercase tracking-widest text-xs transition-all hover:tracking-[0.2em] inline-flex items-center gap-3"
              data-testid="hero-cta-button"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 px-6" data-testid="featured-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-2" data-testid="featured-title">
                Featured Drops
              </h2>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Limited Availability</p>
            </div>
            <Link to="/products">
              <button 
                className="font-mono text-xs uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                data-testid="view-all-link"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-6 bg-zinc-950/50" data-testid="categories-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-12 text-center" data-testid="categories-title">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/products?category=sneakers" data-testid="category-sneakers">
              <div className="relative h-80 overflow-hidden border border-white/5 group">
                <img 
                  src="https://images.unsplash.com/photo-1757343432297-9ed369786199?w=800" 
                  alt="Sneakers"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end">
                  <div className="p-8">
                    <h3 className="font-serif text-3xl font-bold mb-2">Sneakers</h3>
                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Premium Footwear</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/products?category=phones" data-testid="category-phones">
              <div className="relative h-80 overflow-hidden border border-white/5 group">
                <img 
                  src="https://images.unsplash.com/photo-1759588071847-6ba0f3dbd16e?w=800" 
                  alt="Phones"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end">
                  <div className="p-8">
                    <h3 className="font-serif text-3xl font-bold mb-2">Phones</h3>
                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Second-Hand Tech</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};