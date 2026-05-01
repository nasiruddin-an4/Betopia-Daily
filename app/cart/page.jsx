'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/useCartStore';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getCartTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-32 h-32 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-blue-500 shadow-inner rotate-3">
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Your cart is empty</h2>
        <p className="text-gray-500 font-medium mb-10 max-w-sm">Looks like you haven't added any fresh groceries to your cart yet.</p>
        <Link href="/">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 group">
            Start Shopping <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
          <ShoppingBag size={24} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="space-y-8">
          {items.map((item) => (
            <div key={item.product.product_id} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-gray-100 last:border-0 last:pb-0">
              {/* Product Image */}
              <div className="w-28 h-28 rounded-[1.5rem] overflow-hidden bg-gray-50 p-4 border border-gray-100 flex-shrink-0">
                <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain" />
              </div>
              
              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold tracking-widest text-blue-500 uppercase bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                  {item.product.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{item.product.name}</h3>
                <div className="text-gray-500 font-medium mb-3">৳ {item.product.unit_price} / {item.product.unit}</div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                    <button 
                      onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-600 hover:text-gray-900 hover:shadow-sm transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-600 hover:text-gray-900 hover:shadow-sm transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.product.product_id)}
                    className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="text-right sm:w-32 self-end sm:self-center mt-4 sm:mt-0">
                <div className="text-sm font-semibold text-gray-400 mb-1">Total</div>
                <div className="font-bold text-2xl text-gray-900">
                  ৳ {(item.product.unit_price * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Area */}
        <div className="mt-10 pt-10 border-t border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 -mx-8 md:-mx-10 -mb-8 md:-mb-10 p-8 md:p-10 rounded-b-[2.5rem]">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm w-max">
              <ShieldCheck size={18} className="text-green-500" />
              Secure internal salary credit available
            </div>
            <p className="text-sm text-gray-500 ml-1">Delivery exclusively to Betopia Headquarters.</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-6">
            <div className="flex items-end justify-between lg:justify-end gap-12 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Subtotal</span>
                <span className="text-xs text-gray-400">Taxes & delivery calculated next</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">৳ {subtotal.toLocaleString()}</span>
            </div>
            
            <Link href="/checkout" className="w-full">
              <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 active:scale-95 group text-lg">
                Proceed to Checkout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

