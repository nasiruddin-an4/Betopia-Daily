"use client";
import Hero from "./components/Hero";
import CategoryBento from "./components/CategoryBento";
import DailyDeals from "./components/DailyDeals";
import FeaturedOffers from "./components/FeaturedOffers";
import HotDealsCarousel from "./components/HotDealsCarousel";
import AllProducts from "./components/AllProducts";
import ConfidenceBar from "./components/ConfidenceBar";
import RecommendationCarousel from "./components/RecommendationCarousel";
import MoreToDiscover from "./components/MoreToDiscover";
import AboutSection from "./components/AboutSection";

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <Hero />

      {/* <FeaturedOffers /> */}

      {/* Shop by Category Bento Grid */}
      <CategoryBento />

      {/* Hot Deals Carousel */}
      <HotDealsCarousel />

      {/* All Products Grid */}
      <AllProducts />


      {/* Shop With Confidence Feature Bar */}
      <ConfidenceBar />


    </div>
  );
}
