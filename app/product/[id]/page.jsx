'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Minus, Plus, ShoppingBag, Banknote, Building2, PackageCheck, PackageX, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../../store/useCartStore';
import { useSidebarStore } from '../../../store/useSidebarStore';
import { api } from '@/lib/api';

const PLACEHOLDER = 'https://placehold.co/600x600?text=No+Image';
const money = (n) => `৳${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function priceInfo(p) {
  const regular = parseFloat(p.price) || 0;
  const sale = parseFloat(p.discounted_price) || 0;
  const onSale = sale > 0 && sale < regular;
  const current = onSale ? sale : regular;
  return {
    current,
    regular,
    onSale,
    savePct: onSale ? Math.round(((regular - sale) / regular) * 100) : 0,
    hasPrice: current > 0,
  };
}

function StockBadge({ status, qty }) {
  if (status === 'Out of stock') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        <PackageX size={14} /> Out of stock
      </span>
    );
  }
  if (status === 'Limited') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <AlertTriangle size={14} /> Only {qty} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      <PackageCheck size={14} /> In stock
    </span>
  );
}

function Price({ product, size = 'lg' }) {
  const { current, regular, onSale, savePct, hasPrice } = priceInfo(product);
  if (!hasPrice) {
    return <span className={size === 'lg' ? 'text-lg font-semibold text-gray-500' : 'text-sm font-semibold text-gray-500'}>Price to be confirmed</span>;
  }
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={size === 'lg' ? 'text-3xl font-bold text-gray-900' : 'text-lg font-bold text-gray-900'}>{money(current)}</span>
      {onSale && (
        <>
          <span className={size === 'lg' ? 'text-lg text-gray-400 line-through' : 'text-xs text-gray-400 line-through'}>{money(regular)}</span>
          {size === 'lg' && <span className="rounded-md bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-600">Save {savePct}%</span>}
        </>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-4 w-64 bg-gray-100 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-gray-100 rounded" />
          <div className="h-5 w-32 bg-gray-100 rounded" />
          <div className="h-10 w-40 bg-gray-100 rounded" />
          <div className="h-12 w-full bg-gray-100 rounded-xl" />
          <div className="h-40 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { openCart, closeCart } = useSidebarStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      const res = await api.getProduct(id);
      if (cancelled) return;
      const fetched = res?.success ? res.data : null;
      setProduct(fetched);
      setActiveImage(0);
      setQuantity(1);
      setLoading(false);

      if (fetched) {
        const categorySlug = fetched.category?.slug;
        const relRes = await api.getProducts(categorySlug ? { category: categorySlug, page_size: 9 } : { page_size: 9 });
        if (!cancelled && relRes?.success) {
          setRelatedProducts((relRes.data || []).filter((p) => p.slug !== fetched.slug).slice(0, 4));
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <PackageX size={48} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-500 mb-6">It may have been removed or is no longer available.</p>
        <button
          onClick={() => router.push('/shop')}
          className="bg-brand-bright-orange hover:bg-brand-coral text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ id: 1, image: product.first_image || PLACEHOLDER }];
  const outOfStock = product.stock_status === 'Out of stock';
  const maxQty = product.stock_qty != null ? Math.max(1, product.stock_qty) : 99;
  const { current, onSale, regular } = priceInfo(product);
  const isSpecTable = /<table/i.test(product.description || '');

  const cartProduct = (p, qtyUnit = '') => ({
    ...p,
    product_id: p.id || p.slug,
    unit_price: priceInfo(p).current,
    selected_unit: p.unit || qtyUnit,
    image_url: p.first_image || p.images?.[0]?.image || '/placeholder.png',
  });

  const handleAddToCart = async () => {
    const res = await addItem(cartProduct(product), quantity);
    if (res?.success) openCart();
  };

  const handleBuyNow = async () => {
    const res = await addItem(cartProduct(product), quantity);
    if (res?.success) {
      closeCart();
      router.push('/checkout');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 sm:mb-8 min-w-0">
        <Link href="/" className="hover:text-brand-bright-orange transition-colors shrink-0">Home</Link>
        <ChevronRight size={14} className="shrink-0" />
        {product.category ? (
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-bright-orange transition-colors shrink-0">{product.category.name}</Link>
        ) : (
          <Link href="/shop" className="hover:text-brand-bright-orange transition-colors shrink-0">Shop</Link>
        )}
        <ChevronRight size={14} className="shrink-0" />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 self-start w-full">
          <div className="relative aspect-square rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-6 sm:p-10">
            <img
              src={images[activeImage]?.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
            />
            {onSale && (
              <span className="absolute top-4 left-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                Save {money(regular - current)}
              </span>
            )}
            {outOfStock && (
              <span className="absolute top-4 right-4 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-bold text-white">
                Out of stock
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`Show image ${idx + 1}`}
                  className={`w-20 h-20 shrink-0 rounded-xl border-2 bg-gray-50 p-2 transition-colors ${idx === activeImage ? 'border-brand-bright-orange' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={img.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StockBadge status={product.stock_status} qty={product.stock_qty} />
            {product.sku && <span className="text-xs font-medium text-gray-400">SKU: {product.sku}</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">{product.name}</h1>

          {product.short_description && !isSpecTable && (
            <p className="text-gray-600 leading-relaxed mb-4">{product.short_description}</p>
          )}

          <div className="py-5 border-y border-gray-100 mb-6">
            <Price product={product} />
            {product.unit && <p className="text-sm text-gray-500 mt-1">Per {product.unit}</p>}
          </div>

          {/* Quantity + actions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center rounded-xl border border-gray-200 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || outOfStock}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold text-gray-900 tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty || outOfStock}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="hidden sm:flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-brand-bright-orange text-brand-bright-orange font-bold py-3 transition-colors hover:bg-orange-50 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-bright-orange hover:bg-brand-coral text-white font-bold py-3 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>
          </div>

          {/* Service info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-brand-bright-orange shrink-0"><Banknote size={18} /></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when you receive it</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-brand-bright-orange shrink-0"><Building2 size={18} /></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">For Betopia employees</p>
                <p className="text-xs text-gray-500">Confirmed by the Betopia team</p>
              </div>
            </div>
          </div>

          {/* Specifications / description */}
          {product.description && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{isSpecTable ? 'Specifications' : 'Description'}</h2>
              <div
                className={isSpecTable
                  ? 'overflow-hidden rounded-xl border border-gray-200 text-sm [&_table]:w-full [&_tr]:border-b [&_tr]:border-gray-100 [&_tr:last-child]:border-0 [&_th]:w-2/5 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:align-top [&_th]:font-semibold [&_th]:text-gray-700 [&_td]:px-4 [&_td]:py-3 [&_td]:text-gray-900'
                  : 'prose prose-sm text-gray-600 max-w-none break-words'}
                dangerouslySetInnerHTML={{ __html: product.description.replace(/&nbsp;/g, ' ') }}
              />
            </section>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-gray-100">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">You may also like</h2>
              <p className="text-sm text-gray-500 mt-1">More from the Betopia Daily shop</p>
            </div>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-brand-bright-orange hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((p) => (
              <div key={p.id || p.slug} className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/product/${p.slug || p.id}`} className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
                  <img
                    src={p.first_image || '/placeholder.png'}
                    alt={p.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                  />
                </Link>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <Link href={`/product/${p.slug || p.id}`} className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] hover:text-brand-bright-orange">
                    {p.name}
                  </Link>
                  <div className="mt-2 mb-3"><Price product={p} size="sm" /></div>
                  <button
                    onClick={async () => { const r = await addItem(cartProduct(p), 1); if (r?.success) openCart(); }}
                    className="mt-auto w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-bright-orange hover:bg-brand-coral text-white text-xs font-bold py-2.5 transition-colors"
                  >
                    <ShoppingBag size={14} /> Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky action bar on phones */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          aria-label="Add to Bag"
          className="w-12 shrink-0 flex items-center justify-center rounded-xl border-2 border-brand-bright-orange text-brand-bright-orange disabled:border-gray-200 disabled:text-gray-400"
        >
          <ShoppingBag size={20} />
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-bright-orange text-white font-bold py-3 disabled:bg-gray-200 disabled:text-gray-400"
        >
          {outOfStock ? 'Out of stock' : <>Buy Now{current > 0 ? ` · ${money(current * quantity)}` : ''}</>}
        </button>
      </div>
    </div>
  );
}
