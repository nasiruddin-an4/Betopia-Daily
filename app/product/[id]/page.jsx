'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '../../../store/useCartStore';
import { useSidebarStore } from '../../../store/useSidebarStore';
import { ChevronRight, Minus, Plus, ShoppingBag, Clock, ShieldCheck, Truck, RotateCcw, ChevronLeft, Maximize2 } from 'lucide-react';
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
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 group flex items-center justify-center p-8">
            <img 
              src={product.first_image || (product.images?.[0]?.image) || '/placeholder.png'} 
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=No+Image'; }}
            />
            {discountAmount > 0 && (
              <div className="absolute top-6 left-6 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-r-xl rounded-tl-xl shadow-sm z-10">
                {discountAmount} TK OFF
              </div>
            )}
            <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur shadow-sm rounded-full text-gray-600 hover:text-[#0D9488] transition-all active:scale-95 z-10">
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
             <div className="flex items-center justify-between mb-4">
               <span className="px-3 py-1 bg-teal-50 text-[#0D9488] text-xs font-bold rounded-full uppercase tracking-widest">
                 {categoryName || 'Product'}
               </span>
               <div className="flex items-center gap-2">
                 <button className="p-2 text-gray-400 hover:text-[#0D9488] transition-colors"><ChevronLeft size={20} /></button>
                 <button className="p-2 text-gray-400 hover:text-[#0D9488] transition-colors"><ChevronRight size={20} /></button>
               </div>
             </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-3 mb-2 mt-4">
              {discountAmount > 0 && (
                <span className="text-gray-400 text-xl line-through font-medium">৳{oldPrice}</span>
              )}
              <span className="text-red-600 font-bold text-3xl">৳{currentPrice}</span>
              <span className="text-sm text-gray-500 ml-2">{selectedUnit}</span>
            </div>
          </div>

          <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
            <p>{product.description || 'No description available for this product.'}</p>
          </div>

          {/* Unit Selection */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Weight / Unit:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-6 py-2.5 min-w-[80px] text-sm font-bold border transition-all border-gray-900 bg-white text-gray-900 ring-1 ring-gray-900 rounded-lg"
              >
                {selectedUnit}
              </button>
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-10">
            <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden h-14 bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
              >
                <Minus size={18} />
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 text-center font-bold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors border-l border-gray-100"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-brand-bright-orange hover:bg-brand-coral text-white font-bold px-8 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 h-14"
            >
              <ShoppingBag size={20} />
              Add to Bag
            </button>
          </div>

          {/* Delivery & Service Info */}
          <div className="space-y-4 pt-8 border-t border-gray-100">
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
