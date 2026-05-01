'use client';

import React from 'react';

export default function AboutSection() {
  return (
    <section className="py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Text Content */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
            Make Life Easier with Betopia Daily
          </h2>
          
          <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
            <p>
              Say goodbye to long waits and crowded supermarkets—Betopia Daily brings high-quality groceries and household products straight to your door. With unbeatable prices, you can save both time and money while enjoying a seamless shopping experience.
            </p>
            
            <p>
              At Betopia Daily, our mission is to transform shopping into something convenient, efficient, and enjoyable. We understand that your time is valuable, which is why our eCommerce platform offers thousands of products, from packaged foods to cleaning essentials, all in one place. Whether you need to stock up on everyday items or find something specific for your home, Betopia Daily has you covered.
            </p>
            
            <p>
              Why shop the traditional way when Betopia Daily offers everything you need in just a few clicks? We're confident that once you experience the ease and reliability of Betopia Daily, you won't look back.
            </p>
            
            <p className="font-bold text-gray-900">
              Start shopping with Betopia Daily today and discover a new level of convenience!
            </p>
          </div>
        </div>

        {/* Image Content */}
        <div className="lg:col-span-5">
           <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200 aspect-[4/3] group">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt="Shopping Convenience" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
           </div>
        </div>
      </div>
    </section>
  );
}

