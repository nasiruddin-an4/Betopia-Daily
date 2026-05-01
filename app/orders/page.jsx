'use client';

import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { Package, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const { orders } = useOrderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
          <Package size={24} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
            <Package size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">No orders yet</h2>
          <p className="text-gray-500 font-medium mb-8 max-w-sm">You haven't placed any orders yet. Start exploring our fresh catalog!</p>
          <Link href="/">
             <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1">
               Browse Products
             </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              
              {/* Order Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-xl text-gray-900">{order.order_number}</span>
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-3 py-1 rounded-md shadow-sm">
                      <Clock size={14} /> {order.status}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    Placed on <span className="text-gray-700 font-semibold">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span> at {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <div className="text-left md:text-right bg-white p-4 rounded-xl border border-gray-200 shadow-sm md:border-none md:bg-transparent md:p-0 md:shadow-none">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</div>
                  <div className="font-bold text-3xl text-gray-900 mb-2">৳ {order.total_amount.toLocaleString()}</div>
                  <div className="inline-block text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                    Paid via {order.payment_method}
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="p-6 md:p-8">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Items Ordered</h4>
                <div className="flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex-shrink-0 flex items-center gap-4 bg-white border border-gray-100 p-3 pr-6 rounded-2xl shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden p-2">
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 truncate max-w-[150px] mb-1">{item.product.name}</div>
                        <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-max">Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                     <CheckCircle2 size={18} className="text-green-500" />
                     Order sent to Betopia HQ delivery queue
                   </div>
                   <button className="w-full sm:w-auto bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 text-sm font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                     View Invoice <ChevronRight size={16} />
                   </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

