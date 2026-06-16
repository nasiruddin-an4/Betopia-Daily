'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ShoppingCart, ChevronDown } from 'lucide-react';

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch reference data (brands & categories)
  useEffect(() => {
    async function fetchFilters() {
      try {
        const [bRes, cRes] = await Promise.all([
          api.getBrands(),
          api.getCategories()
        ]);
        if (bRes?.success) setBrands(bRes.data || []);
        else if (Array.isArray(bRes)) setBrands(bRes);

        if (cRes?.success) setCategories(cRes.data || []);
        else if (Array.isArray(cRes)) setCategories(cRes);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    }
    fetchFilters();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {};
        if (selectedBrand) params.brand = selectedBrand;
        if (selectedCategory) params.category = selectedCategory;
        if (sortBy) params.sort = sortBy;

        const res = await api.getProducts(params);
        if (res?.success) {
          setProducts(res.data || []);
        } else if (Array.isArray(res)) {
          setProducts(res);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedBrand, selectedCategory, sortBy]);

  const displayedProducts = products.slice(0, 8); // 2 rows of 4

  return (
    <section className="py-12 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Selected Deals for You</h2>
          <p className="text-gray-500 mt-2">Deals ending soon - Don't miss out!</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-50">
          {/* Invisible overlay to close dropdowns when clicking outside */}
          {openDropdown && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenDropdown(null)}
            />
          )}

          {/* Brand Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'brand' ? null : 'brand')}
              className="bg-white border border-gray-200 text-sm font-medium rounded-lg px-4 py-2.5 text-gray-700 outline-none hover:border-gray-300 focus:ring-2 focus:ring-[#0D9488] flex items-center justify-between min-w-[140px] shadow-sm transition-all"
            >
              <span className="truncate">{selectedBrand ? brands.find(b => b.slug === selectedBrand)?.name || 'All Brands' : 'All Brands'}</span>
              <ChevronDown size={16} className={`ml-2 text-gray-500 transition-transform ${openDropdown === 'brand' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'brand' && (
              <div className="absolute top-full mt-2 w-full min-w-[180px] right-0 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 max-h-60 overflow-y-auto">
                <div
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${!selectedBrand ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                  onClick={() => { setSelectedBrand(''); setOpenDropdown(null); }}
                >
                  All Brands
                </div>
                {brands.map(b => (
                  <div
                    key={b.slug}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${selectedBrand === b.slug ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                    onClick={() => { setSelectedBrand(b.slug); setOpenDropdown(null); }}
                  >
                    {b.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              className="bg-white border border-gray-200 text-sm font-medium rounded-lg px-4 py-2.5 text-gray-700 outline-none hover:border-gray-300 focus:ring-2 focus:ring-[#0D9488] flex items-center justify-between min-w-[150px] shadow-sm transition-all"
            >
              <span className="truncate">{selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'All Categories' : 'All Categories'}</span>
              <ChevronDown size={16} className={`ml-2 text-gray-500 transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'category' && (
              <div className="absolute top-full mt-2 w-full min-w-[200px] right-0 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 max-h-60 overflow-y-auto">
                <div
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${!selectedCategory ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                  onClick={() => { setSelectedCategory(''); setOpenDropdown(null); }}
                >
                  All Categories
                </div>
                {categories.map(c => (
                  <div
                    key={c.slug}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${selectedCategory === c.slug ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                    onClick={() => { setSelectedCategory(c.slug); setOpenDropdown(null); }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              className="bg-white border border-gray-200 text-sm font-medium rounded-lg px-4 py-2.5 text-gray-700 outline-none hover:border-gray-300 focus:ring-2 focus:ring-[#0D9488] flex items-center justify-between min-w-[140px] shadow-sm transition-all"
            >
              <span className="truncate">
                {sortBy === 'price_low' ? 'Price: Low to High' :
                  sortBy === 'price_high' ? 'Price: High to Low' :
                    sortBy === 'best_sell' ? 'Best Selling' :
                      sortBy === 'top_review' ? 'Top Reviewed' : 'Sort By'}
              </span>
              <ChevronDown size={16} className={`ml-2 text-gray-500 transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'sort' && (
              <div className="absolute top-full mt-2 w-full min-w-[180px] right-0 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 max-h-60 overflow-y-auto">
                <div
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${!sortBy ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                  onClick={() => { setSortBy(''); setOpenDropdown(null); }}
                >
                  Sort By
                </div>
                <div
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${sortBy === 'price_low' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                  onClick={() => { setSortBy('price_low'); setOpenDropdown(null); }}
                >
                  Price: Low to High
                </div>
                <div
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${sortBy === 'price_high' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                  onClick={() => { setSortBy('price_high'); setOpenDropdown(null); }}
                >
                  Price: High to Low
                </div>
                <div
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${sortBy === 'best_sell' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                  onClick={() => { setSortBy('best_sell'); setOpenDropdown(null); }}
                >
                  Best Selling
                </div>
                <div
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${sortBy === 'top_review' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                  onClick={() => { setSortBy('top_review'); setOpenDropdown(null); }}
                >
                  Top Reviewed
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-[340px] bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          No products found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayedProducts.map(product => {
            const price = parseFloat(product.price) || 0;
            const discount = parseFloat(product.discount_amount) || 0;
            const discountPct = price > 0 ? Math.round((discount / price) * 100) : 0;

            return (
              <div key={product.id || product.slug || Math.random()} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full group">
                <Link href={`/product/${product.slug || product.id}`} className="relative aspect-[4/3] p-4 flex items-center justify-center block">
                  <img
                    src={product.first_image || (product.images && product.images.length > 0 ? product.images[0].image : '/placeholder.png')}
                    alt={product.name}
                    className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                  />
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2 py-1.5 rounded-r-xl rounded-tl-xl shadow-sm z-10">
                      {discount} TK OFF
                    </div>
                  )}
                </Link>

                <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                  <Link href={`/product/${product.slug || product.id}`} className="block">
                    <h3 className="font-bold text-gray-800 text-sm mb-2 truncate hover:text-[#0D9488] transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mb-1.5">
                    {discount > 0 && (
                      <span className="text-gray-400 text-sm line-through font-medium">{'৳'}{price}</span>
                    )}
                    <span className="text-red-600 font-bold text-xl">{'৳'}{product.discounted_price || price}</span>
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
                    <button className="w-full bg-brand-bright-orange hover:bg-brand-coral text-white text-xs font-bold py-2.5 rounded-md flex items-center justify-center gap-1.5 transition-colors">
                      <ShoppingCart size={14} /> Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Link href="/shop" className="bg-[#1e293b] hover:bg-gray-800 text-white text-sm font-bold py-3 px-8 rounded-lg flex items-center transition-colors">
          View All Products
        </Link>
      </div>
    </section>
  );
}
