'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';

export default function Hero() {
  const [heroImages, setHeroImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch hero images from API
  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await api.getHeroImages();
        let images = [];

        if (res?.success && res.data) {
          // Handle array of hero objects with an `images` field
          if (Array.isArray(res.data)) {
            // Flatten: each item may have an `images` array or be an image itself
            res.data.forEach((item) => {
              if (item.images && Array.isArray(item.images)) {
                images.push(...item.images);
              } else if (item.image) {
                images.push(item);
              } else if (typeof item === 'string') {
                images.push({ image: item });
              }
            });
          } else if (res.data.images && Array.isArray(res.data.images)) {
            images = res.data.images;
          }
        } else if (Array.isArray(res)) {
          res.forEach((item) => {
            if (item.images && Array.isArray(item.images)) {
              images.push(...item.images);
            } else if (item.image) {
              images.push(item);
            }
          });
        }

        setHeroImages(images);
      } catch (err) {
        console.error('Failed to fetch hero images:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHero();
  }, []);

  // Auto-advance slides every 4 seconds
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(heroImages.length, 1));
  }, [heroImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(heroImages.length, 1)) % Math.max(heroImages.length, 1));
  }, [heroImages.length]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length, nextSlide]);

  // ── Fallback Banner (shown when no API images or loading) ──
  if (loading || heroImages.length === 0) {
    return (
      <section className="relative overflow-hidden -mt-10 -mx-[calc(50vw-50%)] bg-gray-100">
        <div className="w-full" style={{ height: 'clamp(300px, 55vw, 700px)' }}>
          <img
            src="/Banner-design-for-website.jpg"
            alt="Betopia Daily Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    );
  }


  // ── Image Slider Hero (when API images are available) ──
  const currentImage = heroImages[currentSlide];
  const imageUrl = currentImage?.image || currentImage?.url || currentImage;

  return (
    <section className="relative overflow-hidden -mt-10 -mx-[calc(50vw-50%)] bg-gray-900">
      <div className="relative w-full" style={{ height: 'clamp(300px, 55vw, 550px)' }}>
        {heroImages.map((slide, index) => {
          const src = slide?.image || slide?.url || slide;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img
                src={src}
                alt={slide?.title || `Hero Banner ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/1400x520/0d736a/white?text=Betopia'; }}
              />
              {/* Optional gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />

              {/* Slide caption if available */}
              {(slide?.title || slide?.subtitle || slide?.link) && (
                <div className="absolute bottom-8 left-8 md:left-16 z-20 max-w-lg">
                  {slide?.title && (
                    <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg mb-2">{slide.title}</h2>
                  )}
                  {slide?.subtitle && (
                    <p className="text-white/90 text-sm md:text-base font-medium drop-shadow mb-4">{slide.subtitle}</p>
                  )}
                  {slide?.link && (
                    <Link href={slide.link} className="inline-flex items-center gap-2 bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 font-bold px-5 py-2.5 rounded-lg transition-colors text-sm">
                      Shop Now <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Prev / Next Arrows */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all shadow-lg border border-white/20"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all shadow-lg border border-white/20"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
