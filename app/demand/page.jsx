'use client';

import React from 'react';
import { MOCK_PRODUCTS } from '../../lib/data';
import { getDemandWindow, formatDeliveryDate, calculateDeliveryDate } from '../../lib/utils';
import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DemandPage() {
  const demandProducts = MOCK_PRODUCTS.filter(p => p.is_demand_based);
  const window = getDemandWindow();
  const nextDelivery = calculateDeliveryDate();

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-600">
          <Calendar size={180} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-6">
            <Clock size={16} /> Order Cutoff: 5:30 PM Daily
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Demand Schedule</h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Perishable items like fresh meat and certain vegetables are managed via demand scheduling. 
            Check the upcoming windows below to ensure timely office delivery.
          </p>
        </div>
      </div>

      {/* 6-Day Window Visualization */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {window.map((day, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-[2rem] border transition-all ${
              day.isClosed 
                ? 'bg-gray-50 border-gray-200 opacity-60' 
                : 'bg-white border-blue-100 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{day.day}</div>
            <div className="text-2xl font-bold text-gray-900 mb-4">{day.formatted}</div>
            {day.isClosed ? (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded">CLOSED</span>
            ) : (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase">Open</span>
            )}
          </div>
        ))}
      </div>

      {/* Current Delivery Forecast */}
      <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-600/30">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Next Possible Delivery</h3>
            <p className="text-blue-100 font-medium">{formatDeliveryDate(nextDelivery)}</p>
          </div>
        </div>
        <Link href="/shop">
          <button className="bg-white text-blue-600 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-2 group">
            Order Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>

      {/* Demand Products List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 px-2">Demand-Based Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demandProducts.map((product) => (
            <div key={product.product_id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:border-blue-200 transition-colors">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl p-4 shrink-0">
                <img src={product.image_url} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-max px-3 py-1 rounded-full">
                  <CheckCircle2 size={12} /> {product.demand_days}-Day Demand Cycle
                </div>
              </div>
              <Link href="/shop" className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <ArrowRight size={20} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

