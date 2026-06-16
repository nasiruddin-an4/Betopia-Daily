'use client';

import React from 'react';
import { Truck, ShieldCheck, CreditCard, Clock, Star } from 'lucide-react';

const FEATURES = [
  {
    icon: '📦',
    title: 'Payment AFTER Delivery !',
    desc: 'We will ONLY take payment AFTER You Approve The Products'
  },
  {
    icon: '💰',
    title: 'Daily Deals',
    desc: 'Items you love at prices that fit your budget'
  },
  {
    icon: '🚚',
    title: 'Delivery Service Inside Dhaka',
    desc: 'We Deliver Across Dhaka City and are planing to expand rapidly!'
  },
  {
    icon: '💳',
    title: 'Secure Payment',
    desc: 'All transactions are processed through secure payment options'
  },
  {
    icon: '⚡',
    title: 'Fast Delivery',
    desc: 'Delivery within 24 Hours !!'
  }
];

export default function ConfidenceBar() {
  return (
    <section className="py-12 border-t border-gray-100">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shop With Confidence</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-3 group">
            <div className="text-4xl mb-2 transition-transform group-hover:scale-125 duration-300">
              {f.icon}
            </div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">
              {f.title}
            </h3>
            <p className="text-[11px] font-medium text-gray-500 max-w-[160px] leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

