'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '../../../lib/data';
import { useCartStore } from '../../../store/useCartStore';
import { useSidebarStore } from '../../../store/useSidebarStore';
import { ChevronRight, Minus, Plus, ShoppingBag, Clock, ShieldCheck, Truck, RotateCcw, ChevronLeft, Maximize2 } from 'lucide-react';
import Link from 'next/link';

import ProductCard from '../../../components/ProductCard';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useSidebarStore((state) => state.openCart);

  // Find product by ID
  const product = MOCK_PRODUCTS.find(p => p.product_id === id);

  // Find related products (same category, excluding current)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return MOCK_PRODUCTS
      .filter(p => p.category === product.category && p.product_id !== product.product_id)
      .slice(0, 4);
  }, [product]);

  const [selectedUnit, setSelectedUnit] = useState(product?.available_units?.[0] || product?.unit || '');
  const [quantity, setQuantity] = useState(1);

  // Helper to extract numeric value from units
  const getUnitMultiplier = (unitStr) => {
    if (!unitStr) return 1;
    const match = unitStr.match(/^(\d+(\.\d+)?)\s*(kg|g|l|ml|dozen|pieces|pcs|ltr)?$/i);
    if (!match) return 1;
    const value = parseFloat(match[1]);
    const unit = match[3]?.toLowerCase();
    if (unit === 'g' && product?.unit?.toLowerCase() === 'kg') return value / 1000;
    if (unit === 'ml' && product?.unit?.toLowerCase() === 'l') return value / 1000;
    return value;
  };

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    const multiplier = getUnitMultiplier(selectedUnit);
    return product.unit_price * multiplier;
  }, [selectedUnit, product]);

  const priceRange = useMemo(() => {
    if (!product || !product.available_units || product.available_units.length <= 1) {
      return product ? `${product.unit_price.toLocaleString()}৳` : '';
    }
    const prices = product.available_units.map(unit => product.unit_price * getUnitMultiplier(unit));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return `${minPrice.toLocaleString()}৳ — ${maxPrice.toLocaleString()}৳`;
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <button 
          onClick={() => router.push('/shop')}
          className="bg-black text-white px-6 py-2 rounded-xl font-bold"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    const modifiedProduct = {
      ...product,
      unit_price: currentPrice,
      selected_unit: selectedUnit
    };
    addItem(modifiedProduct, quantity);
    openCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop" className="hover:text-amber-500 transition-colors">{product.category}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 group">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110"
            />
            <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur shadow-sm rounded-full text-gray-600 hover:text-amber-500 transition-all active:scale-95">
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
             <div className="flex items-center justify-between mb-4">
               <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full uppercase tracking-widest">
                 {product.category}
               </span>
               <div className="flex items-center gap-2">
                 <button className="p-2 text-gray-400 hover:text-amber-500 transition-colors"><ChevronLeft size={20} /></button>
                 <button className="p-2 text-gray-400 hover:text-amber-500 transition-colors"><ChevronRight size={20} /></button>
               </div>
             </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="text-2xl font-bold text-amber-500">
              {priceRange}
            </div>
          </div>

          <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
            <p>{product.description}</p>
            <ul className="mt-4 space-y-2 list-none p-0">
              <li className="flex items-start gap-2 italic text-gray-500">
                 — High quality fresh product sourced directly from farmers.
              </li>
              <li className="flex items-start gap-2 italic text-gray-500">
                 — Rich in nutrients and processed with extreme care.
              </li>
            </ul>
          </div>

          {/* Unit Selection */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Weight:</span>
              <span className="text-sm text-gray-500">{selectedUnit || 'No selection'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {(product.available_units || [product.unit]).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setSelectedUnit(unit)}
                  className={`px-6 py-2.5 min-w-[80px] text-sm font-bold border transition-all active:scale-95 ${
                    selectedUnit === unit
                      ? 'border-gray-900 bg-white text-gray-900 ring-1 ring-gray-900'
                      : 'border-gray-200 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-10">
            <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden h-14">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 hover:bg-gray-50 text-gray-500 transition-colors"
              >
                <Minus size={18} />
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 text-center font-bold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 hover:bg-gray-50 text-gray-500 transition-colors border-l border-gray-100"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#D1E9D2] hover:bg-[#C1D9C2] text-gray-800 font-bold px-8 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 h-14"
            >
              <ShoppingBag size={20} />
              Add to cart
            </button>
          </div>

          {/* Delivery & Service Info */}
          <div className="space-y-4 pt-8 border-t border-gray-100">
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Flat shipping Rate All Over Dhaka</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="flex items-center gap-3 text-gray-600">
                 <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                   <Clock size={16} />
                 </div>
                 <span className="text-sm font-medium">2 days easy returns</span>
               </div>
               <div className="flex items-center gap-3 text-gray-600">
                 <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                   <Clock size={16} />
                 </div>
                 <span className="text-sm font-medium">Order before 2.30pm for same day dispatch</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Related Products</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">You might also be interested in these items from {product.category}</p>
            </div>
            <Link href="/shop" className="text-amber-600 font-bold hover:underline text-sm">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
