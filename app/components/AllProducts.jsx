'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ShoppingCart, ChevronDown, Loader2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useSidebarStore } from '../../store/useSidebarStore';

// Products load in pages as the visitor scrolls, so every product is reachable on the home page
const PAGE_SIZE = 24;

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [listKey, setListKey] = useState(null); // which filters `products` was loaded for
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const requestId = useRef(0); // ignore responses for filters that are no longer selected
  const sentinelRef = useRef(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useSidebarStore((state) => state.openCart);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch categories for the filter
  useEffect(() => {
    async function fetchFilters() {
      try {
        const cRes = await api.getCategories();
        if (cRes?.success) setCategories((cRes.data || []).filter(c => c.product_count > 0));
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    }
    fetchFilters();
  }, []);

  const fetchPage = useCallback(async (pageNum) => {
    const params = { page: pageNum, page_size: PAGE_SIZE };
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy) params.sort = sortBy;
    return api.getProducts(params);
  }, [selectedCategory, sortBy]);

  const filterKey = `${selectedCategory}|${sortBy}`;
  const loading = listKey !== filterKey;

  // First page whenever the filters change
  useEffect(() => {
    const req = ++requestId.current;
    fetchPage(1).then((res) => {
      if (req !== requestId.current) return;
      setProducts(res?.success ? res.data || [] : []);
      setTotal(res?.success ? res.meta?.count ?? 0 : 0);
      setPage(1);
      setLoadError(!res?.success);
      setListKey(filterKey);
    });
  }, [fetchPage, filterKey]);

  const hasMore = products.length < total;

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    const req = requestId.current;
    setLoadingMore(true);
    const res = await fetchPage(page + 1);
    if (req !== requestId.current) return;
    if (res?.success) {
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...(res.data || []).filter((p) => !seen.has(p.id))];
      });
      setTotal(res.meta?.count ?? total);
      setPage(page + 1);
    } else {
      setLoadError(true);
    }
    setLoadingMore(false);
  }, [loading, loadingMore, hasMore, fetchPage, page, total]);

  // Load the next page when the bottom of the grid comes into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loadError) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '600px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loadError]);

  const displayedProducts = products;

  return (
    <section className="py-8 sm:py-12 border-t border-gray-100">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-end mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore All Products</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {loading ? 'Discover our wide range of quality items for your daily needs.' : `${total} product${total === 1 ? '' : 's'}${selectedCategory ? ` in ${categories.find((c) => c.slug === selectedCategory)?.name || 'this category'}` : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-50">
          {/* Invisible overlay to close dropdowns when clicking outside */}
          {openDropdown && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenDropdown(null)}
            />
          )}

          {/* Category Dropdown */}
          <div className="relative z-50 flex-1 lg:flex-none">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              className="bg-white border border-gray-200 text-sm font-medium rounded-lg px-4 py-2.5 text-gray-700 outline-none hover:border-gray-300 focus:ring-2 focus:ring-[#0D9488] flex items-center justify-between w-full lg:min-w-[150px] transition-all"
            >
              <span className="truncate">{selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'All Categories' : 'All Categories'}</span>
              <ChevronDown size={16} className={`ml-2 text-gray-500 transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'category' && (
              <div className="absolute top-full mt-2 w-full min-w-[180px] left-0 lg:left-auto lg:right-0 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50">
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
          <div className="relative z-50 flex-1 lg:flex-none">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              className="bg-white border border-gray-200 text-sm font-medium rounded-lg px-4 py-2.5 text-gray-700 outline-none hover:border-gray-300 focus:ring-2 focus:ring-[#0D9488] flex items-center justify-between w-full lg:min-w-[140px] transition-all"
            >
              <span className="truncate">
                {sortBy === 'price_low' ? 'Price: Low to High' :
                  sortBy === 'price_high' ? 'Price: High to Low' :
                    sortBy === 'newest' ? 'Newest' : 'Sort By'}
              </span>
              <ChevronDown size={16} className={`ml-2 text-gray-500 transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'sort' && (
              <div className="absolute top-full mt-2 w-full min-w-[180px] right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
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
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${sortBy === 'newest' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 font-medium'}`}
                  onClick={() => { setSortBy('newest'); setOpenDropdown(null); }}
                >
                  Newest
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-[260px] sm:h-[340px] bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          No products found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {displayedProducts.map(product => {
            const price = parseFloat(product.price) || 0;
            const discount = parseFloat(product.discount_amount) || 0;
            const discountPct = price > 0 ? Math.round((discount / price) * 100) : 0;

            const handleAddToCart = (e) => {
              e.preventDefault();
              const productToAdd = {
                ...product,
                product_id: product.id || product.slug,
                unit_price: product.discounted_price ? parseFloat(product.discounted_price) : parseFloat(product.price) || 0,
                image_url: product.first_image || (product.images && product.images.length > 0 ? product.images[0].image : '/placeholder.png'),
                name: product.name,
                unit: product.unit,
              };
              addItem(productToAdd, 1);
              openCart();
            };

            return (
              <div key={product.id || product.slug} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow relative flex flex-col h-full group">
                <Link href={`/product/${product.slug || product.id}`} className="relative h-36 sm:h-52 lg:h-60 w-full p-3 sm:p-4 flex items-center justify-center">
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

                <div className="p-3 sm:p-4 flex-1 flex flex-col border-t border-gray-50">
                  <Link href={`/product/${product.slug || product.id}`} className="block">
                    <h3 className="font-bold text-gray-800 text-sm mb-2 truncate hover:text-[#0D9488] transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-3">
                    {discount > 0 && (
                      <span className="text-gray-400 text-xs sm:text-sm line-through font-medium">{'৳'}{price}</span>
                    )}
                    <span className="text-red-600 font-bold text-lg sm:text-xl">{'৳'}{product.discounted_price || price}</span>
                    {product.unit && <span className="text-xs text-gray-500">{product.unit}</span>}
                  </div>

                  <div className="mt-auto">
                    <button onClick={handleAddToCart} className="w-full bg-brand-bright-orange hover:bg-brand-coral text-white text-xs font-bold py-2.5 rounded-md flex items-center justify-center gap-1.5 transition-colors">
                      <ShoppingCart size={14} /> Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && displayedProducts.length > 0 && (
        <div ref={sentinelRef} className="mt-10 flex flex-col items-center gap-3">
          {loadingMore && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin text-brand-bright-orange" /> Loading more products…
            </div>
          )}
          {hasMore && !loadingMore && (
            <button
              onClick={loadMore}
              className="bg-slate-900 hover:bg-[#FA8B24] text-white text-sm font-bold py-3 px-8 rounded-lg transition-colors"
            >
              {loadError ? 'Retry' : 'Load more'}
            </button>
          )}
          <p className="text-xs text-gray-400">
            {hasMore ? `Showing ${displayedProducts.length} of ${total}` : `You've seen all ${total} products`}
          </p>
        </div>
      )}
    </section>
  );
}
