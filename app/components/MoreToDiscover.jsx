'use client';

import React from 'react';
import Link from 'next/link';

const DISCOVER_ITEMS = [
  {
    id: 1,
    bg: "/CategoryImg/DiscoverImg1.webp",
  },
  {
    id: 2,
    bg: "/CategoryImg/DiscoverImg2.webp",
  },
  {
    id: 3,
    bg: "/CategoryImg/DiscoverImg3.webp",
  },
];

export default function MoreToDiscover() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">More to Discover</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DISCOVER_ITEMS.map((item) => (
          <Link
            key={item.id}
            href="/shop"
            className="group relative h-56 rounded-3xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200"
          >
            {/* Full Background Image */}
            <img
              src={item.bg}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              alt=""
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

            {/* Centered Shop Button (Consistent with Featured Offers) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-6 py-3 rounded-xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 uppercase tracking-widest shadow-xl">
                EXPLORE
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
