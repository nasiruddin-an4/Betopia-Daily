'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '../../../store/useCartStore';
import { useSidebarStore } from '../../../store/useSidebarStore';
import { ChevronRight, Minus, Plus, ShoppingBag, Clock, ShieldCheck, Truck, Search, RotateCcw, ChevronLeft, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useSidebarStore((state) => state.openCart);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await api.getProduct(id);
        let fetchedProduct = null;
        if (res?.success) fetchedProduct = res.data;
        else if (res && res.name) fetchedProduct = res;
        
        setProduct(fetchedProduct);

        if (fetchedProduct) {
           const categorySlug = typeof fetchedProduct.category === 'object' ? fetchedProduct.category?.slug : fetchedProduct.category;
           if (categorySlug) {
             const relRes = await api.getProducts({ category: categorySlug });
             let relList = [];
             if (relRes?.success) relList = relRes.data;
             else if (Array.isArray(relRes)) relList = relRes;

             setRelatedProducts(relList.filter(p => p.slug !== id && p.id !== id).slice(0, 4));
           } else {
             const relRes = await api.getProducts();
             let relList = [];
             if (relRes?.success) relList = relRes.data;
             else if (Array.isArray(relRes)) relList = relRes;
             setRelatedProducts(relList.filter(p => p.slug !== id && p.id !== id).slice(0, 4));
           }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const [selectedUnit, setSelectedUnit] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedUnit(product.unit || '1 unit');
    }
  }, [product]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return parseFloat(product.discounted_price) || parseFloat(product.price) || 0;
  }, [product]);

  const oldPrice = useMemo(() => {
    if (!product) return 0;
    return parseFloat(product.price) || 0;
  }, [product]);
  
  const discountAmount = useMemo(() => {
    if (!product) return 0;
    return parseFloat(product.discount_amount) || 0;
  }, [product]);

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!product || !product.is_hot_deal || !product.hot_deal_end) return;

    const endDate = new Date(product.hot_deal_end).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance < 0) {
        setTimeLeft('00:00:00:00 Left');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const d = days < 10 ? `0${days}` : days;
      const h = hours < 10 ? `0${hours}` : hours;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      const s = seconds < 10 ? `0${seconds}` : seconds;

      setTimeLeft(`${d}:${h}:${m}:${s} Left`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0D9488]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <button 
          onClick={() => router.push('/shop')}
          className="bg-[#0D9488] text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700 transition-colors"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    const modifiedProduct = {
      ...product,
      product_id: product.id || product.slug, // Ensure cart has ID
      unit_price: currentPrice,
      selected_unit: selectedUnit,
      image_url: product.first_image || (product.images?.[0]?.image) || '/placeholder.png',
    };
    addItem(modifiedProduct, quantity);
    openCart();
  };

  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-[#0D9488] transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop" className="hover:text-[#0D9488] transition-colors">{categoryName || 'Category'}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden bg-white border border-gray-100 group flex items-center justify-center p-8">
            <img 
              src={product.first_image || (product.images?.[0]?.image) || '/placeholder.png'} 
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=No+Image'; }}
            />
            {discountAmount > 0 && (
              <div 
                className="absolute top-0 left-6 bg-[#E50000] text-white font-bold px-2 pt-2 pb-3 flex flex-col items-center justify-center z-10 w-[42px]" 
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 83% 90%, 66% 100%, 50% 90%, 33% 100%, 16% 90%, 0 100%)" }}
              >
                <span className="text-[10px] leading-tight font-extrabold">৳{discountAmount}</span>
                <span className="text-[9px] leading-tight font-extrabold mt-0.5">OFF</span>
              </div>
            )}
            <button className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-all z-10">
              <Search size={22} strokeWidth={1.5} />
            </button>
          </div>
          
          {/* Thumbnails */}
          {(product.images && product.images.length > 0) && (
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {product.images.map((img, idx) => (
                <button key={img.id || idx} className={`w-20 h-20 border rounded-sm p-2 flex-shrink-0 bg-white ${img.is_primary || idx === 0 ? 'border-gray-300' : 'border-gray-100'}`}>
                  <img src={img.image} alt="thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
              {product.name}
            </h1>
            
            {product.is_hot_deal && product.hot_deal_end && timeLeft && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                 <span className="font-bold text-gray-900">Hurry Up! Sales Ends In</span>
                 <div className="bg-[#FFD700] px-4 py-1.5 font-bold text-gray-900 text-sm rounded-sm tabular-nums tracking-wide">
                   {timeLeft}
                 </div>
              </div>
            )}
            
            <div className="flex items-end gap-2 mb-8">
              {discountAmount > 0 && (
                <span className="text-gray-400 text-lg line-through font-medium">৳{oldPrice}</span>
              )}
              <span className="text-[#E50000] font-bold text-2xl leading-none">৳{currentPrice}</span>
              <span className="text-sm font-medium text-gray-400 ml-1">Per {selectedUnit || 'Piece'}</span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mb-10">
            <button
              onClick={handleAddToCart}
              className="bg-[#E50000] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2 max-w-[200px]"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add to Bag
            </button>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-[15px]">Product Tags :</h4>
              <div className="flex flex-wrap gap-2">
                 {product.tags.map((tag) => (
                   <span key={tag.id} className="px-3 py-1 bg-[#F0F8FF] text-[#00A1E0] text-[13px] font-medium rounded-sm">
                     {tag.name}
                   </span>
                 ))}
              </div>
            </div>
          )}

          {/* Delivery & Service Info */}
          <div className="space-y-4 pt-8 mt-6 border-t border-gray-100">
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Flat shipping Rate All Over Dhaka</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="flex items-center gap-3 text-gray-600">
                 <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#0D9488]">
                   <RotateCcw size={16} />
                 </div>
                 <span className="text-sm font-medium">2 days easy returns</span>
               </div>
               <div className="flex items-center gap-3 text-gray-600">
                 <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#0D9488]">
                   <Clock size={16} />
                 </div>
                 <span className="text-sm font-medium">Order before 2.30pm for same day dispatch</span>
               </div>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 text-[15px] mb-3">Product Description :</h4>
              <div 
                className="prose prose-sm text-gray-600 max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Related Products</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">You might also be interested in these items</p>
            </div>
            <Link href="/shop" className="text-[#0D9488] font-bold hover:underline text-sm">View all</Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => {
              const pPrice = parseFloat(p.price) || 0;
              const pDiscount = parseFloat(p.discount_amount) || 0;

              return (
                <div key={p.id || p.slug || Math.random()} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full group">
                  <Link href={`/product/${p.slug || p.id}`} className="relative aspect-[4/3] p-4 flex items-center justify-center block">
                    <img 
                      src={p.first_image || (p.images && p.images.length > 0 ? p.images[0].image : '/placeholder.png')} 
                      alt={p.name}
                      className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                    />
                    {pDiscount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2 py-1.5 rounded-r-xl rounded-tl-xl shadow-sm z-10">
                        {pDiscount} TK OFF
                      </div>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                    <Link href={`/product/${p.slug || p.id}`} className="block">
                      <h3 className="font-bold text-gray-800 text-sm mb-1 truncate hover:text-[#0D9488] transition-colors" title={p.name}>
                        {p.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-baseline gap-2 mb-4 mt-2">
                      {pDiscount > 0 && (
                        <span className="text-gray-400 text-sm line-through font-medium">৳{pPrice}</span>
                      )}
                      <span className="text-red-600 font-bold text-xl">৳{p.discounted_price || pPrice}</span>
                      <span className="text-xs text-gray-500">{p.unit || '1 unit'}</span>
                    </div>
                    
                    <div className="mt-auto">
                      <button 
                        onClick={() => {
                          addItem({
                            ...p,
                            product_id: p.id || p.slug,
                            unit_price: parseFloat(p.discounted_price) || parseFloat(p.price) || 0,
                            selected_unit: p.unit || '1 unit',
                            image_url: p.first_image || (p.images?.[0]?.image) || '/placeholder.png',
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
        </section>
      )}
    </div>
  );
}
