'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Flame } from 'lucide-react';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/useCartStore';
import { useSidebarStore } from '../../store/useSidebarStore';

export default function HotDealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useSidebarStore((state) => state.openCart);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await api.getHotDeals();
        if (res?.success) {
          setDeals(res.data || []);
        } else if (Array.isArray(res)) {
          setDeals(res);
        }
      } catch (error) {
        console.error("Failed to fetch hot deals:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-brand-bright-orange">
          <Flame size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Hot Deals Right Now</h1>
        <p className="text-gray-500 max-w-2xl text-lg">Don't miss out on these limited-time offers! Grab them before they're gone.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="h-[340px] bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : deals.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {deals.map((product) => {
            const price = parseFloat(product.price) || 0;
            const discount = parseFloat(product.discount_amount) || 0;
            const discountedPrice = parseFloat(product.discounted_price) || price;

            return (
              <div key={product.id || product.slug} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full group">
                <Link href={`/product/${product.slug || product.id}`} className="relative aspect-[4/3] p-4 flex items-center justify-center block">
                  <img
                    src={product.first_image || (product.images && product.images.length > 0 ? product.images[0].image : '/placeholder.png')}
                    alt={product.name}
                    className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                  />
                  {discount > 0 && (
                    <div 
                      className="absolute top-0 left-4 bg-[#E50000] text-white font-bold px-1.5 pt-1.5 pb-2 flex flex-col items-center justify-center z-10 w-[36px]" 
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 83% 90%, 66% 100%, 50% 90%, 33% 100%, 16% 90%, 0 100%)" }}
                    >
                      <span className="text-[10px] leading-tight font-extrabold">৳{discount}</span>
                      <span className="text-[8px] leading-tight font-extrabold mt-0.5">OFF</span>
                    </div>
                  )}
                </Link>

                <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                  <Link href={`/product/${product.slug || product.id}`} className="block">
                    <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 hover:text-[#0D9488] transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mb-1.5">
                    {discount > 0 && (
                      <span className="text-gray-400 text-sm line-through font-medium">{'৳'}{price}</span>
                    )}
                    <span className="text-red-600 font-bold text-xl">{'৳'}{discountedPrice}</span>
                    <span className="text-xs text-gray-500">{product.unit || '1 unit'}</span>
                  </div>

                  {/* Rating & Sold */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const rating = parseFloat(product.average_rating || product.rating || 0);
                        return (
                          <svg key={star} className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        );
                      })}
                      {(product.average_rating || product.rating) ? (
                        <span className="text-[10px] text-gray-500 ml-1 font-medium">{parseFloat(product.average_rating || product.rating).toFixed(1)}</span>
                      ) : null}
                    </div>
                    {(product.total_sold || product.sold_count) ? (
                      <span className="text-[10px] text-gray-400 font-medium">{product.total_sold || product.sold_count} sold</span>
                    ) : null}
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => {
                        addItem({
                          ...product,
                          product_id: product.id || product.slug,
                          unit_price: discountedPrice,
                          selected_unit: product.unit || '1 unit',
                          image_url: product.first_image || (product.images?.[0]?.image) || '/placeholder.png',
                        }, 1);
                        openCart();
                      }}
                      className="w-full bg-brand-bright-orange hover:bg-brand-coral text-white text-xs font-bold py-2.5 rounded-md flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag size={14} /> Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-20 text-center shadow-sm">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-bright-orange">
            <Flame size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">No hot deals right now</h3>
          <p className="text-gray-500 font-medium max-w-xs mx-auto">Check back later for amazing new offers and discounts.</p>
          <Link
            href="/shop"
            className="inline-block mt-8 font-bold text-white bg-brand-bright-orange hover:bg-brand-coral px-8 py-3 rounded-lg transition-all active:scale-95"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
