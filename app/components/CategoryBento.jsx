'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Computer, Laptop, Monitor, Armchair, Table, Mouse, Keyboard, Tv } from 'lucide-react';

// Demo categories shown alongside real ones (skipped if a real category has the same slug)
const DEMO_CATEGORIES = [
  { slug: 'computer', name: 'Computer', Icon: Computer, product_count: 24 },
  { slug: 'laptop', name: 'Laptop', Icon: Laptop, product_count: 36 },
  { slug: 'monitor', name: 'Monitor', Icon: Monitor, product_count: 18 },
  { slug: 'chair', name: 'Chair', Icon: Armchair, product_count: 12 },
  { slug: 'table', name: 'Table', Icon: Table, product_count: 9 },
  { slug: 'mouse', name: 'Mouse', Icon: Mouse, product_count: 42 },
  { slug: 'keyboard', name: 'Keyboard', Icon: Keyboard, product_count: 30 },
  { slug: 'tv', name: 'TV', Icon: Tv, product_count: 15 },
].map(item => ({ ...item, isDemo: true }));

export default function CategoryBento() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await api.getCategories();

        if (res?.success) {
          setData(res.data || []);
        } else if (Array.isArray(res)) {
          setData(res);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const realCategories = data.filter(item => item.product_count > 0);
  const realSlugs = new Set(realCategories.map(item => item.slug?.toLowerCase()));
  const displayData = [
    ...realCategories,
    ...DEMO_CATEGORIES.filter(item => !realSlugs.has(item.slug)),
  ];

  return (
    <section className="py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Shop by Category
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, index) => (
            <div key={`skeleton-${index}`} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayData.map((item, index) => (
            <Link
              key={item.id || index}
              href={`/shop?category=${item.slug}`}
              className="flex items-center bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow group"
            >
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center mr-4">
                {item.Icon ? (
                  <div className="w-full h-full bg-orange-50 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <item.Icon className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
                  </div>
                ) : item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <span className="text-gray-400 font-bold text-lg uppercase">{item.name?.substring(0, 2)}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start justify-center flex-1">
                <span className="text-gray-900 font-medium text-lg line-clamp-1">{item.name}</span>
                <span className="text-gray-500 text-xs mt-0.5">
                  {item.product_count || 0} Product{item.product_count > 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}

          {displayData.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No categories found.
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-center md:hidden">
        <Link href="/shop" className="text-sm font-bold text-red-600 border border-red-200 bg-red-50 px-6 py-2 rounded-full hover:bg-red-100 transition-colors">
          See All
        </Link>
      </div>
    </section>
  );
}
