'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ChevronDown } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getCartTotal, grand_total } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = Number(grand_total) || getCartTotal();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-indigo-500 shadow-inner rotate-3">
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Your cart is empty</h2>
        <p className="text-gray-500 font-medium mb-10 max-w-sm">Looks like you haven't added any fresh groceries to your cart yet.</p>
        <Link href="/">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 group">
            Start Shopping <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Shopping Cart Items */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-extrabold text-[#1c2135] tracking-tight">Shopping Bag</h1>
            <span className="text-[17px] font-bold text-[#1c2135]">{itemCount} Items</span>
          </div>

          {/* Desktop Table Headers */}
          <div className="hidden sm:grid grid-cols-12 gap-4 py-4 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-5">Product Details</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Total</div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-8 py-8">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Product Details */}
                <div className="col-span-5 flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#F4F5F9] rounded-xl flex items-center justify-center p-2 shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1c2135] text-[15px] mb-1 truncate leading-tight">{item.name}</h3>
                    <div className="text-[12px] font-semibold text-[#FE6A6B]">{item.unit || 'Piece'}</div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-3 flex items-center sm:justify-center mt-4 sm:mt-0">
                  <div className="flex items-center bg-[#F4F5F9] rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="w-8 text-center font-bold text-[#1c2135] text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Single Price */}
                <div className="col-span-2 text-left sm:text-center mt-2 sm:mt-0">
                  <span className="sm:hidden text-xs text-gray-400 uppercase tracking-wider font-bold mr-2">Price:</span>
                  <span className="font-bold text-[#1c2135] text-[15px]">৳{parseFloat(item.price || 0).toFixed(2)}</span>
                </div>

                {/* Total Price & Delete */}
                <div className="col-span-2 flex items-center justify-between sm:justify-center gap-4 mt-2 sm:mt-0">
                  <div>
                    <span className="sm:hidden text-xs text-gray-400 uppercase tracking-wider font-bold mr-2">Total:</span>
                    <span className="font-bold text-[#1c2135] text-[15px]">
                      ৳{parseFloat(item.quantity_wise_price || (item.price * item.quantity)).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-[#FE6A6B] transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors mt-4">
            <ArrowRight size={16} className="rotate-180" /> Continue Shopping
          </Link>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-[#F6F7FB] rounded-2xl p-8 sticky top-28 border border-gray-100">
            <h2 className="text-2xl font-extrabold text-[#1c2135] tracking-tight pb-6 border-b border-gray-200 mb-6">
              Order Summary
            </h2>

            <div className="flex justify-between items-center mb-8">
              <span className="text-[13px] font-bold text-[#1c2135] uppercase tracking-wide">Items {itemCount}</span>
              <span className="font-bold text-[#1c2135] text-[15px]">৳{subtotal.toFixed(2)}</span>
            </div>

            <div className="mb-8">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                Shipping
              </label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                  <option>Standard Delivery - ৳ 5.00</option>
                  <option>Express Delivery - ৳ 10.00</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <ChevronDown size={14} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="mb-8 pb-8 border-b border-gray-200">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your code"
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-400"
                />
              </div>
              <button className="mt-3 bg-[#FE6A6B] hover:bg-[#ff5556] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-lg transition-colors">
                Apply
              </button>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-[13px] font-bold text-[#1c2135] uppercase tracking-wide">Total Cost</span>
              <span className="text-2xl font-extrabold text-[#1c2135] tracking-tight">৳{(subtotal + 5).toFixed(2)}</span>
            </div>

            <button
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/checkout');
                } else {
                  router.push('/shop');
                  import('../../store/useSidebarStore').then(m => m.useSidebarStore.getState().openLoginModal());
                }
              }}
              className="w-full bg-[#735EE0] hover:bg-[#624ed6] text-white font-bold py-4 px-8 rounded-lg shadow-lg shadow-[#735EE0]/30 transition-all transform hover:-translate-y-0.5 active:scale-95 text-[15px] uppercase tracking-wider"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
