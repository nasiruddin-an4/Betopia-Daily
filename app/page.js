"use client";
import CategoryBento from "./components/CategoryBento";
import HotDealsCarousel from "./components/HotDealsCarousel";
import AllProducts from "./components/AllProducts";

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Shop by Category Bento Grid */}
      <CategoryBento />

      {/* Hot Deals Carousel */}
      <HotDealsCarousel />

      {/* All Products Grid */}
      <AllProducts />
    </div>
  );
}
