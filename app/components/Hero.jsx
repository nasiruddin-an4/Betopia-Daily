'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const SLIDES = [
  { id: 1, image: "/CategoryImg/10010.jpg" },
  { id: 2, image: "/CategoryImg/10011.jpg" },
  { id: 3, image: "/CategoryImg/c8.jpg" },
];

export default function Hero() {
  // Infinite Loop Implementation: [Last, First, Second, Third, First]
  const extendedSlides = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];
  const [current, setCurrent] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const handleTransitionEnd = () => {
    if (current === 0) {
      setIsTransitioning(false);
      setCurrent(SLIDES.length);
    } else if (current === SLIDES.length + 1) {
      setIsTransitioning(false);
      setCurrent(1);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      // Small timeout to allow the browser to process the state change before re-enabling transition
      const timeout = setTimeout(() => setIsTransitioning(true), 20);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  const next = useCallback(() => {
    if (!isTransitioning) return;
    setCurrent((prev) => prev + 1);
  }, [isTransitioning]);

  const prev = () => {
    if (!isTransitioning) return;
    setCurrent((prev) => prev - 1);
  };

  // Autoplay
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, isPaused]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
      {/* Left Carousel Column (2/3) */}
      <div
        className="lg:col-span-8 relative rounded-3xl overflow-hidden group h-[300px] md:h-[450px] shadow-sm border border-gray-100 bg-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex h-full"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(-${current * 100}%)`,
            transition: isTransitioning ? 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
        >
          {extendedSlides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className="min-w-full h-full relative">
              <img src={slide.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" alt="" />

              {/* Visible Shop Button at Bottom-Left */}
              <div className="absolute inset-0 p-6 md:p-10 flex items-end justify-start z-20">
                <Link
                  href="/shop"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-md transition-all shadow-2xl shadow-red-600/40 active:scale-95 flex items-center gap-3 transform hover:scale-105 uppercase tracking-widest border border-white/20 backdrop-blur-sm text-[13px]"
                >
                  SHOP NOW
                  <ShoppingBag size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-900 shadow-xl hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-30 transform hover:scale-110"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <button
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-900 shadow-xl hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-30 transform hover:scale-110"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i + 1)}
              className={`h-2.5 rounded-full transition-all duration-500 ${(current === 0 ? SLIDES.length : current === SLIDES.length + 1 ? 1 : current) === i + 1
                ? 'w-10 bg-red-600 shadow-lg shadow-red-600/50'
                : 'w-2.5 bg-white/50 hover:bg-white'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Right Static Column (1/3) */}
      <div className="lg:col-span-4 grid grid-cols-1 gap-4">
        <div className="relative rounded-3xl overflow-hidden group shadow-sm">
          <img src="/CategoryImg/DiscoverImg1.webp" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" alt="" />
          <div className="relative p-6 h-full flex items-end justify-start z-10">
            <Link href="/shop" className="bg-white text-red-600 font-bold px-6 py-2 rounded-md text-xs hover:bg-red-50 transition-all uppercase tracking-widest shadow-2xl shadow-black/20 transform hover:scale-110">
              SHOP NOW
            </Link>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden group shadow-sm">
          <img src="/CategoryImg/DiscoverImg3.webp" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" alt="" />
          <div className="relative p-6 h-full flex items-end justify-start z-10">
            <Link href="/shop" className="bg-yellow-400 text-gray-900 font-bold px-8 py-2 rounded-md text-xs hover:bg-yellow-300 transition-all uppercase tracking-widest shadow-2xl shadow-black/20 transform hover:scale-110">
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
