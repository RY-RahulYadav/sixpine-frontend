import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';
import CategoryTabs from '../components/CategoryTabs';
import { productAPI } from '../services/api';
import '../styles/Pages.css';

// Import components for the Best Deals page
import DailyDeals from '../components/BestDeals/DailyDeals';
import DealsBanner from '../components/BestDeals/DealsBanner';

const BestDealsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealsData();
  }, []);

  const fetchDealsData = async () => {
    try {
      // You can replace this with actual API call when available
      await productAPI.getHomeData();
    } catch (error) {
      console.error('Fetch deals data error:', error);
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

      <div className="bestdeals_container py-10 px-10">
        {/* Best Deals Hero Section */}
                <DealsBanner />

        {/* Daily Deals Section */}
        <DailyDeals />

        {/* Deals Categories Section */}

    
      </div>
      
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default BestDealsPage;