import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [conditionFilter, setConditionFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, conditionFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (conditionFilter !== 'all') params.condition = conditionFilter;

      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    if (value !== 'all') {
      setSearchParams({ category: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4" data-testid="products-title">
            Collection
          </h1>
          <p className="font-sans text-lg text-zinc-400" data-testid="products-subtitle">
            {products.length} items available
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-12" data-testid="filters-container">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
              Category
            </label>
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-40 bg-zinc-900/50 border-white/10" data-testid="category-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent data-testid="category-filter-dropdown">
                <SelectItem value="all" data-testid="category-all">All</SelectItem>
                <SelectItem value="sneakers" data-testid="category-sneakers">Sneakers</SelectItem>
                <SelectItem value="phones" data-testid="category-phones">Phones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
              Condition
            </label>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-40 bg-zinc-900/50 border-white/10" data-testid="condition-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent data-testid="condition-filter-dropdown">
                <SelectItem value="all" data-testid="condition-all">All</SelectItem>
                <SelectItem value="new" data-testid="condition-new">New</SelectItem>
                <SelectItem value="used" data-testid="condition-used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20" data-testid="loading-indicator">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20" data-testid="no-products-message">
            <p className="font-serif text-2xl mb-2">No products found</p>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};