"use client";
import CategoryBento from "./components/CategoryBento";
import AllProducts from "./components/AllProducts";

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Shop by Category Bento Grid */}
      <CategoryBento />

      {/* All Products Grid */}
      <AllProducts />
    </div>
  );
}
