'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../lib/data';
import { useCartStore } from '../../store/useCartStore';

export default function DailyDeals() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Filter products that have discounts
  const dealProducts = MOCK_PRODUCTS.filter(p => p.discount_pct && p.discount_pct > 0).slice(0, 15);

  const scroll = useCallback((direction) => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Calculate one card width (including gap)
      // Since we show 5 cards, one card is roughly 1/5th of clientWidth
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

  // Autoplay Logic
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      scroll('right');
    }, 4000);

    return () => clearInterval(interval);
  }, [scroll, isPaused]);

  return (
    <section 
      className="py-8 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Deals</h2>
        <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
          See All
        </Link>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-[55%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 -translate-x-5"
      >
        <ChevronLeft size={20} strokeWidth={3} />
      </button>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-[55%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 translate-x-5"
      >
        <ChevronRight size={20} strokeWidth={3} />
      </button>

      {/* Horizontal Scroll Container (Slider) */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 transition-all duration-500 snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {dealProducts.map((product) => (
          <div 
            key={product.product_id}
            className="min-w-[calc(100%/2)] sm:min-w-[calc((100%-16px)/3)] lg:min-w-[calc((100%-64px)/5)] bg-white border border-gray-100 rounded-2xl p-4 flex flex-col snap-start hover:shadow-lg transition-all duration-300"
          >
            {/* Product Image */}
            <div className="aspect-square mb-4 flex items-center justify-center overflow-hidden">
               <img 
                src={product.image_url} 
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105" 
                alt={product.name} 
               />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <h3 className="text-xs font-bold text-gray-600 line-clamp-2 min-h-[32px] leading-snug">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                 <span className="text-sm font-bold text-gray-900 italic">৳{product.unit_price}</span>
                 {product.discount_pct && (
                   <>
                     <span className="text-[10px] text-gray-400 line-through font-bold">
                        ৳{Math.round(product.unit_price / (1 - product.discount_pct / 100))}
                     </span>
                     <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded">
                        {product.discount_pct}% OFF
                     </span>
                   </>
                 )}
              </div>
            </div>

            {/* Action */}
            <button 
              onClick={() => addItem(product, 1)}
              className="mt-4 w-full py-2 border border-red-100 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all uppercase tracking-widest active:scale-95"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

