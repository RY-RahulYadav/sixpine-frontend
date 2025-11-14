import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';
import CategoryTabs from '../components/CategoryTabs';
import { productAPI } from '../services/api';
import '../styles/Pages.css';

// Import components for the Trending page
import TrendingProducts from '../components/Trending/TrendingProducts.tsx';
import TrendingCategories from '../components/Trending/TrendingCategories.tsx';
import TrendingCollections from '../components/Trending/TrendingCollections.tsx';

const TrendingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      // You can replace this with actual API call when available
      await productAPI.getHomeData();
    } catch (error) {
      console.error('Fetch trending data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <div className="container my-5 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="trending_container">
        {/* Currently Trending Products */}
        <TrendingCategories />
        <TrendingCollections />
        <TrendingProducts />

        {/* Popular Categories */}

        {/* Trending Collections */}
      </div>
      
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default TrendingPage;