'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';



export default function CategoryBento() {
  const [activeTab, setActiveTab] = useState('brands'); // 'categories' | 'brands'
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

  const displayData = data.filter(item => item.product_count > 0);

  return (
    <section className="py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Shop by {activeTab === 'categories' ? 'Category' : 'Brand'}
        </h2>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'brands'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Brands
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Categories
            </button>
          </div>

        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, index) => (
            <div key={`skeleton-${index}`} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayData.map((item, index) => {
            const href = activeTab === 'categories'
              ? `/shop?category=${item.slug}`
              : `/shop?brand=${item.slug}`;

            return (
              <Link
                key={item.id || index}
                href={href}
                className="flex items-center bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow group"
              >
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center mr-4">
                  {item.icon ? (
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
                    {item.product_count || 0} Product{(item.product_count > 1) ? 's' : ''}
                  </span>
                </div>
              </Link>
            );
          })}

          {displayData.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
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
