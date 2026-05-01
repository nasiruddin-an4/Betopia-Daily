"use client";
import Hero from "./components/Hero";
import CategoryBento from "./components/CategoryBento";
import DailyDeals from "./components/DailyDeals";
import FeaturedOffers from "./components/FeaturedOffers";
import ConfidenceBar from "./components/ConfidenceBar";
import RecommendationCarousel from "./components/RecommendationCarousel";
import MoreToDiscover from "./components/MoreToDiscover";
import AboutSection from "./components/AboutSection";

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <Hero />

      {/* Shop by Category Bento Grid */}
      <CategoryBento />

      {/* Daily Deals Carousel */}
      <DailyDeals />

      {/* Featured Offers Section */}
      <FeaturedOffers />

      {/* Shop With Confidence Feature Bar */}
      <ConfidenceBar />

      {/* You Might Also Like Carousel */}
      <RecommendationCarousel />

      {/* NEW: More to Discover Grid */}
      <MoreToDiscover />

      {/* NEW: About Section */}
      <AboutSection />
    </div>
  );
}
