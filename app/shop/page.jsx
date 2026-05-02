'use client';

import React, { useState } from 'react';
import { MOCK_PRODUCTS, CATEGORIES } from '../../lib/data';
import ProductCard from '../../components/ProductCard';
import { Search, Filter, SlidersHorizontal, Grid2X2, LayoutGrid } from 'lucide-react';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on category and search
  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-8">

      {/* Light Department Style Header */}
      <div className="relative rounded-2xl overflow-hidden bg-[#FDF8F7] h-32 md:h-40 flex items-center shadow-sm border border-orange-100/50">
        {/* Background Products Decoration (Stylized Collage) */}
        <div className="absolute right-0 top-0 bottom-0 w-2/3 opacity-40 pointer-events-none overflow-hidden">
          <div className="flex items-center gap-4 h-full transform rotate-12 translate-x-12">
            <img src="/CategoryImg/c1.jpg" className="w-32 h-32 rounded-3xl object-cover shadow-2xl" alt="" />
            <img src="/CategoryImg/c2.jpg" className="w-24 h-24 rounded-2xl object-cover shadow-xl -translate-y-4" alt="" />
            <img src="/CategoryImg/c3.jpg" className="w-28 h-28 rounded-2xl object-cover shadow-xl translate-y-6" alt="" />
            <img src="/CategoryImg/c4.jpg" className="w-20 h-20 rounded-xl object-cover shadow-lg -translate-y-8" alt="" />
            <img src="/CategoryImg/c5.jpg" className="w-32 h-32 rounded-3xl object-cover shadow-2xl translate-y-2" alt="" />
          </div>
        </div>

        <div className="container mx-auto px-8 md:px-12 relative z-10 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">All Departments</h1>

          <div className="hidden md:flex relative group w-72 lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder-gray-400 font-medium outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Modern Sidebar Filters */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm sticky top-28">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Filter size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-xl tracking-tight">Categories</h3>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => setActiveCategory('All')}
                className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeCategory === 'All'
                  ? 'bg-black text-white shadow-xl shadow-black/20'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-amber-600'
                  }`}
              >
                All Products
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.name)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all flex items-center justify-between ${activeCategory === category.name
                    ? 'bg-black text-white shadow-xl shadow-black/20'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-amber-600'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Promo Card in Sidebar */}
            <div className="mt-12 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Member Benefit</p>
              <p className="text-sm font-bold text-gray-900 leading-snug">Pay using Salary Credit for instant 5% cashback.</p>
            </div>
          </div>
        </div>

        {/* Dynamic Product Grid */}
        <div className="lg:col-span-9">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 px-2 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Available Items</h2>
              <p className="text-gray-500 font-medium text-sm">
                Showing <span className="text-amber-600 font-bold">{filteredProducts.length}</span> items in {activeCategory}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-1 rounded-xl flex">
                <button className="p-2 bg-white rounded-lg shadow-sm text-amber-600"><LayoutGrid size={18} /></button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Grid2X2 size={18} /></button>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-5 py-2.5 rounded-xl hover:shadow-md transition-all">
                <SlidersHorizontal size={16} /> Sort by
              </button>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center shadow-sm">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-200">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">No products found</h3>
              <p className="text-gray-500 font-medium max-w-xs mx-auto">We couldn't find any products matching your current search or category.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="mt-8 font-bold text-white bg-black hover:bg-gray-900 px-8 py-3 rounded-2xl shadow-xl shadow-black/20 transition-all active:scale-95"
              >
                Reset Selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
