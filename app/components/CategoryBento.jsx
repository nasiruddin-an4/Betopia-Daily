'use client';

import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 1, name: 'All Products', size: 'col-span-12 md:col-span-6 lg:col-span-5', image: '/CategoryImg/10016.jpg' },
  { id: 2, name: 'Grocery', size: 'col-span-12 md:col-span-6 lg:col-span-3', image: '/CategoryImg/c2.jpg' },
  { id: 3, name: 'Dairy & Eggs', size: 'col-span-12 md:col-span-12 lg:col-span-4', image: '/CategoryImg/c4.jpg' },
  { id: 4, name: 'Home and Cleaning', size: 'col-span-12 md:col-span-6 lg:col-span-3', image: '/CategoryImg/c3.jpg' },
  { id: 5, name: 'Beverages', size: 'col-span-12 md:col-span-6 lg:col-span-3', image: '/CategoryImg/c5.jpg' },
  { id: 6, name: 'Boishakh Offer', size: 'col-span-12 md:col-span-12 lg:col-span-6', image: '/CategoryImg/c7.jpg' },
  { id: 7, name: 'Food', size: 'col-span-12 md:col-span-12 lg:col-span-6', image: '/CategoryImg/c1.jpg' },
  { id: 8, name: 'Toiletries & Body Sprays', size: 'col-span-12 md:col-span-6 lg:col-span-3', image: '/CategoryImg/c8.jpg' },
  { id: 9, name: 'Pest Control', size: 'col-span-12 md:col-span-6 lg:col-span-3', image: '/CategoryImg/c9.jpg' },
];

export default function CategoryBento() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
        <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.name}`}
            className={`${cat.size} group relative h-52 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500`}
          >
            {/* Full Card Image */}
            <img
              src={cat.image}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={cat.name}
            />

            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500" />

            {/* Category Tag */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-block bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg shadow-xl uppercase tracking-tight">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
