'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../lib/data';
import { useCartStore } from '../../store/useCartStore';

export default function RecommendationCarousel() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Use a different slice of products for recommendations
  const products = MOCK_PRODUCTS.slice(20, 35);

  const scroll = useCallback((direction) => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const cardWidth = clientWidth / 5;
      let scrollTo;
      
      if (direction === 'right') {
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollTo = 0;
        } else {
          scrollTo = scrollLeft + cardWidth;
        }
      } else {
        if (scrollLeft <= 0) {
          scrollTo = scrollWidth - clientWidth;
        } else {
          scrollTo = scrollLeft - cardWidth;
        }
      }
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => scroll('right'), 5000);
    return () => clearInterval(interval);
  }, [scroll, isPaused]);

  return (
    <section 
      className="py-12 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">You Might Also Like</h2>
        <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
          See All Products
        </Link>
      </div>

      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-[55%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 -translate-x-5"
      >
        <ChevronLeft size={20} strokeWidth={3} />
      </button>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-[55%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 translate-x-5"
      >
        <ChevronRight size={20} strokeWidth={3} />
      </button>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 transition-all duration-500 snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {products.map((product) => (
          <div 
            key={product.product_id}
            className="min-w-[calc(100%/2)] sm:min-w-[calc((100%-16px)/3)] lg:min-w-[calc((100%-64px)/5)] bg-white border border-gray-100 rounded-2xl p-4 flex flex-col snap-start hover:shadow-lg transition-all duration-300"
          >
            <Link href={`/product/${product.product_id}`} className="aspect-square mb-4 flex items-center justify-center overflow-hidden block">
               <img src={product.image_url} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" alt={product.name} />
            </Link>

            <div className="flex-1 space-y-2">
              <Link href={`/product/${product.product_id}`}>
                <h3 className="text-xs font-bold text-gray-600 line-clamp-2 min-h-[32px] leading-snug hover:text-red-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 flex-wrap">
                 <span className="text-sm font-bold text-gray-900 italic">৳{product.unit_price}</span>
                 {product.discount_pct && (
                   <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded">
                      {product.discount_pct}% OFF
                   </span>
                 )}
              </div>
            </div>

            <button 
              onClick={() => addItem(product, 1)}
              className="mt-4 w-full py-2 border border-black text-black text-[10px] font-bold rounded-lg hover:bg-black hover:text-white transition-all uppercase tracking-widest"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

