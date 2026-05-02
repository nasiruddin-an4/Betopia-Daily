"use client";

import React, { useState, useMemo } from "react";
import { useCartStore } from "../store/useCartStore";
import { useSidebarStore } from "../store/useSidebarStore";
import {
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { calculateDeliveryDate, formatDeliveryDate } from "../lib/utils";

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useSidebarStore((state) => state.openCart);
  const [selectedUnit, setSelectedUnit] = useState(
    product.available_units?.[0] || product.unit,
  );

  const isOutOfStock = product.stock_status === "Out of stock";
  const isLimited = product.stock_status === "Limited";

  // Helper to extract numeric value from units like "5 kg", "500g", "1 L"
  const getUnitMultiplier = (unitStr) => {
    if (!unitStr) return 1;
    const match = unitStr.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)?/);
    if (!match) return 1;

    const value = parseFloat(match[1]);
    const unit = match[3]?.toLowerCase();

    // Handle grams to kg conversion
    if (unit === "g" && product.unit?.toLowerCase() === "kg")
      return value / 1000;
    // Handle mg to g conversion
    if (unit === "mg" && product.unit?.toLowerCase() === "g")
      return value / 1000;
    // Handle ml to L conversion
    if (unit === "ml" && product.unit?.toLowerCase() === "l")
      return value / 1000;

    return value;
  };

  const currentPrice = useMemo(() => {
    const multiplier = getUnitMultiplier(selectedUnit);
    return product.unit_price * multiplier;
  }, [selectedUnit, product.unit_price]);

  // Calculate price range for display
  const priceRange = useMemo(() => {
    if (!product.available_units || product.available_units.length <= 1) {
      return `${product.unit_price.toLocaleString()}৳`;
    }
    const prices = product.available_units.map(
      (unit) => product.unit_price * getUnitMultiplier(unit),
    );
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return `${minPrice.toLocaleString()}৳ — ${maxPrice.toLocaleString()}৳`;
  }, [product.available_units, product.unit_price]);

  const [hasSelected, setHasSelected] = useState(false);

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setHasSelected(true);
  };

  const handleAddToCart = () => {
    // Create a modified product object with the selected unit's price
    const modifiedProduct = {
      ...product,
      unit_price: currentPrice,
      selected_unit: selectedUnit,
    };
    addItem(modifiedProduct, 1);
    openCart();
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden transition-all duration-300 relative group border border-gray-100 p-3 rounded-2xl hover:bg-white hover:border-amber-100 hover:shadow-xl hover:shadow-amber-500/5">
      {/* Image Container */}
      <Link href={`/product/${product.product_id}`} className="relative aspect-[4/3] overflow-hidden bg-white mb-4 rounded-xl block">
        <img
          src={product.image_url}
          alt={product.name}
          className={`object-contain w-full h-full transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? "grayscale opacity-30" : ""}`}
        />

        {/* Discount Badge */}
        {product.discount_pct && !isOutOfStock && (
          <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 uppercase">
            {product.discount_pct}% OFF
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 px-1">
        <div className="mb-4">
          {/* Category Label - All Caps */}
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 opacity-70">
            {product.category}
          </div>

          {/* Title - Bold */}
          <Link href={`/product/${product.product_id}`}>
            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 group-hover:text-amber-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Price Range */}
          <div className="text-base font-bold text-gray-800">{priceRange}</div>
        </div>

        {/* Unit Selection Buttons - Square Border Style */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            {(product.available_units || [product.unit]).map((unit) => (
              <button
                key={unit}
                onClick={() => handleUnitSelect(unit)}
                className={`px-3 py-1.5 min-w-[70px] text-xs font-bold border transition-all active:scale-95 ${
                  selectedUnit === unit && hasSelected
                    ? "border-gray-900 bg-gray-900 text-white shadow-md"
                    : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={isOutOfStock}
              >
                {unit}
              </button>
            ))}
          </div>

          {/* Add to Cart Button - Revealed on Hover */}
          <div className="transition-all duration-500 ease-out h-12 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
            {!isOutOfStock ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-gray-900 text-white text-xs font-bold py-3 rounded-lg shadow-lg shadow-black/10 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 text-xs font-bold py-3 rounded-lg cursor-not-allowed"
              >
                Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
