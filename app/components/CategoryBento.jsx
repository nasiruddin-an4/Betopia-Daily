'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const BENTO_SIZES = [
  'col-span-12 md:col-span-6 lg:col-span-5',
  'col-span-12 md:col-span-6 lg:col-span-3',
  'col-span-12 md:col-span-12 lg:col-span-4',
  'col-span-12 md:col-span-6 lg:col-span-3',
  'col-span-12 md:col-span-6 lg:col-span-3',
  'col-span-12 md:col-span-12 lg:col-span-6',
  'col-span-12 md:col-span-12 lg:col-span-6',
  'col-span-12 md:col-span-6 lg:col-span-3',
  'col-span-12 md:col-span-6 lg:col-span-3',
];

export default function CategoryBento() {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'brands'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let res;
        if (activeTab === 'categories') {
          res = await api.getCategories();
        } else {
          res = await api.getBrands();
        }
        
        if (res?.success) {
          setData(res.data || []);
        } else {
          if (Array.isArray(res)) {
            setData(res);
          } else {
            setData([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  return (
    <section className="py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Shop by {activeTab === 'categories' ? 'Category' : 'Brand'}
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'categories' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'brands' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Brands
            </button>
          </div>
          <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors hidden md:block">
            See All
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-12 gap-4 animate-pulse">
          {BENTO_SIZES.slice(0, 6).map((size, index) => (
            <div key={`skeleton-${index}`} className={`${size} h-52 bg-gray-200 rounded-2xl`}></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {data.map((item, index) => {
            const sizeClass = BENTO_SIZES[index % BENTO_SIZES.length];
            const href = activeTab === 'categories' 
              ? `/shop?category=${item.slug}`
              : `/shop?brand=${item.slug}`;
              
            return (
              <Link
                key={item.id || index}
                href={href}
                className={`${sizeClass} group relative h-52 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 bg-gray-100 flex items-center justify-center`}
              >
                {/* Full Card Image or Icon */}
                {item.icon ? (
                  <img
                    src={item.icon}
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                    alt={item.name}
                    onError={(e) => {
                       e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                    <span className="text-gray-400 font-bold text-xl uppercase tracking-widest">{item.name?.substring(0,2)}</span>
                  </div>
                )}

                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500" />

                {/* Category/Brand Tag */}
                {activeTab !== 'brands' && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg shadow-xl uppercase tracking-tight">
                      {item.name}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
          
          {data.length === 0 && (
            <div className="col-span-12 py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No {activeTab} found.
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
