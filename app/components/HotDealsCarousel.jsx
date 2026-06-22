'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Clock, Zap, Users } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { api } from '@/lib/api';
import { useCartStore } from '../../store/useCartStore';
import { useSidebarStore } from '../../store/useSidebarStore';
import { useUserStore } from '../../store/useUserStore';
import { useRouter } from 'next/navigation';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function HotDealsCarousel() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useSidebarStore((state) => state.openCart);
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

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

  if (loading) {
    return (
      <section className="py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">🔥 Hot Deals Right Now</h2>
          <p className="text-gray-500 mt-2">Join these deals before they're gone!</p>
        </div>
        <div className="flex gap-4 overflow-hidden px-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[280px] h-80 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (!deals || deals.length === 0) {
    return null; // hide if no deals
  }

  return (
    <section className="py-12 bg-white relative">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Hot Deals Right Now</h2>
        <p className="text-gray-500 mt-2">Join these deals before they're gone!</p>
      </div>

      <div className="relative group">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            768: { slidesPerView: 3.2 },
            1024: { slidesPerView: 4.5 },
          }}
          className="py-4 !px-2 md:!px-4"
        >
          {deals.map((deal) => {
            const price = parseFloat(deal.price) || 0;
            const discount = parseFloat(deal.discount_amount) || 0;
            const discountPct = price > 0 ? Math.round((discount / price) * 100) : 0;

            let daysLeft = null;
            if (deal.hot_deal_end) {
              daysLeft = differenceInDays(new Date(deal.hot_deal_end), new Date());
            }

            const handleAddToCart = (e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                router.push('/login?redirect=/hot-deals');
                return;
              }
              const productToAdd = {
                ...deal,
                product_id: deal.id,
                unit_price: deal.discounted_price ? parseFloat(deal.discounted_price) : parseFloat(deal.price) || 0,
                image_url: deal.first_image,
                name: deal.name,
                unit: deal.unit,
              };
              addItem(productToAdd, 1);
              openCart();
            };

            return (
              <SwiperSlide key={deal.id} className="h-auto">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow relative flex flex-col h-[450px] group/card">
                  <Link href={`/product/${deal.slug}`} className="flex flex-col flex-1">
                    {/* Image Container */}
                    <div className="relative h-68 w-full p-4 bg-white flex items-center justify-center">
                      <img
                        src={deal.first_image || '/placeholder.png'}
                        alt={deal.name}
                        className="object-contain w-full h-full"
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
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                      <h3 className="font-bold text-gray-800 text-sm truncate group-hover/card:text-brand-bright-orange transition-colors" title={deal.name}>
                        {deal.name}
                      </h3>

                      <div className="flex flex-wrap items-baseline gap-2 mb-2 mt-1">
                        {discount > 0 && (
                          <span className="text-gray-400 text-sm line-through font-medium">৳{price}</span>
                        )}
                        <span className="text-red-600 font-bold text-xl">৳{deal.discounted_price || price}</span>
                        <span className="text-xs text-gray-500">{deal.unit || '1 unit'}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="px-4 pb-4 mt-auto">
                    <button onClick={handleAddToCart} className="w-full bg-brand-bright-orange hover:bg-brand-coral text-white text-xs font-bold py-2.5 rounded-md flex items-center justify-center gap-1.5 transition-colors">
                      <Zap size={14} className="fill-white" /> Add to Bag
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      <div className="mt-6 flex justify-center">
        <Link href="/hot-deals" className="bg-[#1e293b] hover:bg-gray-800 text-white text-sm font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/10">
          View All Deals <span className="bg-brand-bright-orange text-white text-xs font-bold rounded-full px-2.5 py-0.5 ml-1">{deals.length}</span>
        </Link>
      </div>
    </section>
  );
}
