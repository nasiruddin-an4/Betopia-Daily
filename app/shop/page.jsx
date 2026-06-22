'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Search, Filter, SlidersHorizontal, Grid2X2, LayoutGrid, ShoppingBag, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/useCartStore';
import { useSidebarStore } from '../../store/useSidebarStore';

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [activeBrand, setActiveBrand] = useState(searchParams.get('brand') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    setActiveBrand(searchParams.get('brand') || '');
    setActiveCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('search') || '');
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useSidebarStore((state) => state.openCart);

  // Fetch categories and brands
  useEffect(() => {
    async function fetchFilters() {
      try {
        const [cRes, bRes] = await Promise.all([
          api.getCategories(),
          api.getBrands()
        ]);
        if (cRes?.success) setCategories(cRes.data || []);
        else if (Array.isArray(cRes)) setCategories(cRes);

        if (bRes?.success) setBrands(bRes.data || []);
        else if (Array.isArray(bRes)) setBrands(bRes);
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    }
    fetchFilters();
  }, []);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {
          page,
          page_size: pageSize
        };
        if (activeCategory) params.category = activeCategory;
        if (activeBrand) params.brand = activeBrand;
        if (searchQuery) params.search = searchQuery;
        if (sortBy !== 'default') params.sort = sortBy;

        const res = await api.getProducts(params);
        let list = [];
        let count = 0;

        if (res?.success) {
          if (res.data?.results) {
            list = res.data.results;
            count = res.data.count || 0;
          } else {
            list = res.data || [];
            count = list.length;
          }
        } else if (res?.results) {
          list = res.results;
          count = res.count || 0;
        } else if (Array.isArray(res)) {
          list = res;
          count = res.length;
        }

        setProducts(list);
        setTotalCount(count);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeCategory, activeBrand, searchQuery, sortBy, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleCategorySelect = (catSlug) => {
    setActiveCategory(catSlug);
    setPage(1);
  };

  const handleBrandSelect = (brandSlug) => {
    setActiveBrand(brandSlug);
    setPage(1);
  };

  const renderFilters = () => (
    <div className="space-y-4 lg:sticky lg:top-28">
      {/* Categories Accordion */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div
          className="flex items-center justify-between p-4 bg-white cursor-pointer select-none"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
        >
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Categories</h3>
          {isCategoryOpen ? <Minus size={16} className="text-gray-900" /> : <Plus size={16} className="text-gray-900" />}
        </div>

        {isCategoryOpen && (
          <div className="px-4 pb-4 pt-1 bg-white space-y-2.5">
            {categories.map((category) => {
              const count = category.product_count !== undefined ? category.product_count : (category.count || 0);
              if (count === 0) return null;
              return (
              <label key={category.slug || category.id} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={activeCategory === category.slug}
                    onChange={() => {
                      handleCategorySelect(activeCategory === category.slug ? '' : category.slug);
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488] cursor-pointer"
                  />
                  <span className={`text-sm ${activeCategory === category.slug ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {category.name}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">({count})</span>
              </label>
            )})}
          </div>
        )}
      </div>

      {/* Brands Accordion */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div
          className="flex items-center justify-between p-4 bg-white cursor-pointer select-none"
          onClick={() => setIsBrandOpen(!isBrandOpen)}
        >
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Brand</h3>
          {isBrandOpen ? <Minus size={16} className="text-gray-900" /> : <Plus size={16} className="text-gray-900" />}
        </div>

        {isBrandOpen && (
          <div className="px-4 pb-4 pt-1 bg-white space-y-2.5">
            {brands.map((brand) => {
              const count = brand.product_count !== undefined ? brand.product_count : (brand.count || 0);
              if (count === 0) return null;
              return (
              <label key={brand.slug || brand.id} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={activeBrand === brand.slug}
                    onChange={() => {
                      handleBrandSelect(activeBrand === brand.slug ? '' : brand.slug);
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488] cursor-pointer"
                  />
                  <span className={`text-sm ${activeBrand === brand.slug ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {brand.name}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">({count})</span>
              </label>
            )})}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-3">
          {renderFilters()}
        </div>

        {/* Dynamic Product Grid */}
        <div className="lg:col-span-9">

          {/* Mobile Search & Filter Bar */}
          <div className="lg:hidden flex flex-row items-center gap-3 mb-6">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-[#0D9488] transition-colors flex items-center justify-center flex-shrink-0"
            >
              <Filter size={20} />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D9488]">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden flex">
              <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsMobileFilterOpen(false)}
              ></div>
              <div className="relative w-4/5 max-w-[320px] bg-gray-50 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 text-gray-500 hover:text-[#0D9488] hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  {renderFilters()}
                </div>
              </div>
            </div>
          )}


          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[340px] bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => {
                  const price = parseFloat(product.price) || 0;
                  const discount = parseFloat(product.discount_amount) || 0;

                  return (
                    <div key={product.id || product.slug || Math.random()} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full group">
                      <Link href={`/product/${product.slug || product.id}`} className="relative h-72 w-full p-4 flex items-center justify-center block">
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

                      <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                        <Link href={`/product/${product.slug || product.id}`} className="block">
                          <h3 className="font-bold text-gray-800 text-sm mb-2 truncate hover:text-[#0D9488] transition-colors" title={product.name}>
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-baseline gap-2 mb-4">
                          {discount > 0 && (
                            <span className="text-gray-400 text-sm line-through font-medium">{'৳'}{price}</span>
                          )}
                          <span className="text-red-600 font-bold text-xl">{'৳'}{product.discounted_price || price}</span>
                          <span className="text-xs text-gray-500">{product.unit || '1 unit'}</span>
                          {/* Sold Count */}
                          <span className="text-xs text-gray-500 justify-end ml-auto">{(product.total_sold || product.sold_count) ? (
                            <span className="text-[10px] text-gray-400 font-medium">{product.total_sold || product.sold_count} sold</span>
                          ) : <div className="h-3.5"></div>}</span>
                        </div>

                        <div className="mt-auto">
                          <button
                            onClick={() => {
                              addItem({
                                ...product,
                                product_id: product.id || product.slug,
                                unit_price: parseFloat(product.discounted_price) || parseFloat(product.price) || 0,
                                selected_unit: product.unit || '1 unit',
                                image_url: product.first_image || (product.images?.[0]?.image) || '/placeholder.png',
                              }, 1);
                              openCart();
                            }}
                            className="w-full bg-brand-bright-orange hover:bg-brand-coral text-white text-xs font-bold py-2.5 rounded-md flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ShoppingBag size={14} /> Add to Bag
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4 border-t border-gray-100 pt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-brand-bright-orange hover:border-brand-bright-orange'
                      }`}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span className="text-gray-600 font-medium text-sm">
                    Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                  </span>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-bright-orange text-white shadow-md shadow-brand-bright-orange/20 hover:bg-brand-coral'
                      }`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-20 text-center shadow-sm">
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-200">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">No products found</h3>
              <p className="text-gray-500 font-medium max-w-xs mx-auto">We couldn't find any products matching your current search or category.</p>
              <button
                onClick={() => { setSearchInput(''); setSearchQuery(''); setActiveCategory(''); setActiveBrand(''); setSortBy('default'); setPage(1); }}
                className="mt-8 font-bold text-white bg-brand-bright-orange hover:bg-brand-coral px-8 py-3 rounded-lg transition-all active:scale-95"
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
