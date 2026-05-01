'use client';

import React from 'react';
import Link from 'next/link';

const OFFERS = [
  {
    id: 1,
    bg: "/CategoryImg/10010.jpg",
    size: "lg:col-span-2 lg:row-span-2",
  },
  {
    id: 2,
    bg: "/productImg/Featuredimg2.jpg",
    size: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: 3,
    bg: "/productImg/Featuredimg3.jpg",
    size: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: 4,
    bg: "/productImg/Featuredimg4.jpg",
    size: "lg:col-span-2 lg:row-span-1",
  },
];

export default function FeaturedOffers() {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Our Featured Offers</h2>
        <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
          See All Offers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 auto-rows-[250px]">
        {OFFERS.map((offer) => (
          <Link
            key={offer.id}
            href="/shop"
            className={`${offer.size} relative rounded-lg overflow-hidden group border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-red-600/20`}
          >
            {/* Full Background Image */}
            <img
              src={offer.bg}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              alt=""
            />

            {/* Subtle Overlay on Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />

            {/* Shop Button - Centered or Top-Aligned based on preference, here we'll do centered for impact */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 uppercase tracking-widest border border-white/20 backdrop-blur-sm">
                SHOP NOW
              </span>
            </div>

            {/* Corner Badge Style alternative if requested specifically "top" */}
            <div className="absolute top-6 left-6 z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse hidden group-hover:block" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

