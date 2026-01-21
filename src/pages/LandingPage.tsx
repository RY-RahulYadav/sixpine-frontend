import React, { Suspense, lazy, useMemo } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';
import HeroSection from "../components/Home/heroSection";
import PromotionalBanner from "../components/Home/PromotionalBanner";
import CategoryTabs from '../components/CategoryTabs';
import useHomepageData from '../hooks/useHomepageData';
import "../styles/Pages.css";
import "../styles/HomeSections.css";

// Lazy load below-the-fold components for faster initial render
const HeroSection2 = lazy(() => import("../components/Home/heroSection2"));
const HeroSection3 = lazy(() => import("../components/Home/heroSection3"));
const FurnitureCategories = lazy(() => import("../components/Home/furnitureCategories"));
const FurnitureSections = lazy(() => import("../components/Home/furnitureSections"));
const FurnitureOfferSection = lazy(() => import("../components/Home/furnitureOfferSections"));
const FeatureCard = lazy(() => import("../components/Home/FeatureCard"));
const BannerCards = lazy(() => import("../components/Home/bannerCards"));
const FurnitureInfoSection = lazy(() => import("../components/Home/FurnitureInfoSection"));

// Lightweight loading placeholder for lazy components
const SectionPlaceholder: React.FC<{ height?: string }> = ({ height = '200px' }) => (
  <div style={{
    minHeight: height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }}>
    <style>
      {`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}
    </style>
  </div>
);

const LandingPage: React.FC = () => {
  // Use the optimized hook that batches all API calls
  const { data, navbarCategories, isLoading } = useHomepageData();

  // Memoize data to prevent unnecessary re-renders
  const heroData = useMemo(() => data?.hero || null, [data?.hero]);
  const promotionalData = useMemo(() => data?.promotionalBanner || null, [data?.promotionalBanner]);
  const hero2Data = useMemo(() => data?.hero2 || null, [data?.hero2]);
  const hero3Data = useMemo(() => data?.hero3 || null, [data?.hero3]);
  const categoriesData = useMemo(() => data?.categories || null, [data?.categories]);
  const furnitureSectionsData = useMemo(() => data?.furnitureSections || null, [data?.furnitureSections]);
  const furnitureOfferData = useMemo(() => data?.furnitureOfferSections || null, [data?.furnitureOfferSections]);
  const featureCardData = useMemo(() => data?.featureCard || null, [data?.featureCard]);
  const bannerCardsData = useMemo(() => data?.bannerCards || null, [data?.bannerCards]);
  const furnitureInfoData = useMemo(() => data?.furnitureInfoSection || null, [data?.furnitureInfoSection]);

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs preloadedCategories={navbarCategories} />
      </div>

      <div className="homepage_container">
        {/* Above-the-fold content - render immediately with defaults */}
        <HeroSection data={heroData} isLoading={isLoading} />
        <PromotionalBanner data={promotionalData} isLoading={isLoading} />

        {/* Below-the-fold content - lazy loaded with suspense */}
        <Suspense fallback={<SectionPlaceholder height="400px" />}>
          <HeroSection2 data={hero2Data} isLoading={isLoading} />
        </Suspense>

        <Suspense fallback={<SectionPlaceholder height="500px" />}>
          <HeroSection3 data={hero3Data} isLoading={isLoading} />
        </Suspense>

        <Suspense fallback={<SectionPlaceholder height="400px" />}>
          <FurnitureCategories data={categoriesData} isLoading={isLoading} />
        </Suspense>

        <Suspense fallback={<SectionPlaceholder height="500px" />}>
          <FurnitureSections data={furnitureSectionsData} isLoading={isLoading} />
        </Suspense>

        <Suspense fallback={<SectionPlaceholder height="400px" />}>
          <FurnitureOfferSection data={furnitureOfferData} isLoading={isLoading} />
        </Suspense>

        <Suspense fallback={<SectionPlaceholder height="200px" />}>
          <FeatureCard data={featureCardData} isLoading={isLoading} />
        </Suspense>

        <Suspense fallback={<SectionPlaceholder height="500px" />}>
          <BannerCards data={bannerCardsData} isLoading={isLoading} />
        </Suspense>

        <Suspense fallback={<SectionPlaceholder height="300px" />}>
          <FurnitureInfoSection data={furnitureInfoData} isLoading={isLoading} />
        </Suspense>
      </div>

      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
