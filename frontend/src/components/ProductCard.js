import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

export const ProductCard = ({ product }) => {
  const { convertPrice, getCurrencySymbol } = useCurrency();

  return (
    <Link to={`/product/${product.id}`} data-testid={`product-card-${product.id}`}>
      <div className="group relative overflow-hidden bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 transition-all duration-500">
        <div className="aspect-square overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            data-testid={`product-image-${product.id}`}
          />
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500" data-testid={`product-brand-${product.id}`}>
              {product.brand}
            </span>
            {product.condition === 'used' && (
              <span className="font-mono text-xs uppercase tracking-widest text-yellow-500" data-testid={`product-condition-${product.id}`}>
                Used
              </span>
            )}
          </div>
          
          <h3 className="font-serif text-lg font-bold" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl text-blue-400" data-testid={`product-price-${product.id}`}>
              {getCurrencySymbol()}{convertPrice(product.price)}
            </span>
            <span className="font-mono text-xs text-zinc-500" data-testid={`product-stock-${product.id}`}>
              {product.stock} in stock
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};