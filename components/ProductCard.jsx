'use client';

import React, { useState, useMemo } from 'react';
import { useCartStore } from '../store/useCartStore';
import { Plus, Calendar, Clock, AlertTriangle, ShoppingBag } from 'lucide-react';
import { calculateDeliveryDate, formatDeliveryDate } from '../lib/utils';

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedUnit, setSelectedUnit] = useState(product.available_units?.[0] || product.unit);

  const isOutOfStock = product.stock_status === 'Out of stock';
  const isLimited = product.stock_status === 'Limited';

  // Helper to extract numeric value from units like "5 kg", "500g", "1 L"
  const getUnitMultiplier = (unitStr) => {
    if (!unitStr) return 1;
    const match = unitStr.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)?/);
    if (!match) return 1;

    const value = parseFloat(match[1]);
    const unit = match[3]?.toLowerCase();

    // Handle grams to kg conversion
    if (unit === 'g' && product.unit?.toLowerCase() === 'kg') return value / 1000;
    // Handle mg to g conversion
    if (unit === 'mg' && product.unit?.toLowerCase() === 'g') return value / 1000;
    // Handle ml to L conversion
    if (unit === 'ml' && product.unit?.toLowerCase() === 'l') return value / 1000;

    return value;
  };

  const currentPrice = useMemo(() => {
    const multiplier = getUnitMultiplier(selectedUnit);
    return product.unit_price * multiplier;
  }, [selectedUnit, product.unit_price]);

  const handleAddToCart = () => {
    // Create a modified product object with the selected unit's price
    const modifiedProduct = {
      ...product,
      unit_price: currentPrice,
      selected_unit: selectedUnit
    };
    addItem(modifiedProduct, 1);
  };

  return (
    <div className="group flex flex-col bg-white overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-red-600/10 relative border border-gray-50/50">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white h-52">
        <img
          src={product.image_url}
          alt={product.name}
          className={`object-contain w-full h-full transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-30' : ''}`}
        />

        {/* Discount Badge */}
        {product.discount_pct && !isOutOfStock && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-10">
            {product.discount_pct}% OFF
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-20">
            <div className="bg-gray-900 text-white px-5 py-2 rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform">
              <span className="text-[10px] font-bold uppercase tracking-widest">Out of stock</span>
            </div>
          </div>
        )}

        {/* Demand Info Badge */}
        {product.is_demand_based && !isOutOfStock && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-red-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-red-50 z-10">
            <Clock size={12} className="animate-pulse" /> Pre-order
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <div className="mb-2">
          {/* Category Label */}
          <div className="text-xs text-gray-400">
            {product.category}
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price Section with Animation */}
        <div className="flex flex-col mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-medium text-gray-900 transition-all duration-300">
              ৳{currentPrice.toLocaleString()}
            </span>
            {product.discount_pct && (
              <span className="text-sm text-gray-400 line-through font-medium">
                ৳{(currentPrice / (1 - product.discount_pct / 100)).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Unit Selection Buttons - More Elegant UI */}
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-2">
            {(product.available_units || [product.unit]).map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-4 py-2 rounded-md text-[11px] border border-gray-200 text-gray-500 transition-all active:scale-95 flex-1 min-w-[60px] text-center ${selectedUnit === unit
                  ? 'border-amber-600 bg-amber-600 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-200 hover:bg-gray-100'
                  } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isOutOfStock}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {!isOutOfStock ? (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-900 hover:bg-amber-600 text-white text-sm font-bold cursor-pointer py-4 rounded-md transition-all hover:shadow-amber-600/20 active:scale-95 flex items-center justify-center gap-2 group/btn"
            >
              <ShoppingBag size={18} className="transition-transform group-hover/btn:-rotate-12" />
              Add to Cart
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 text-sm font-bold py-4 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              Unavailable
            </button>
          )}



          {isLimited && !isOutOfStock && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold text-red-600">
              <AlertTriangle size={12} className="animate-bounce" /> Low Stock: {product.stock_qty} left
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
