import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';
import CategoryTabs from '../components/CategoryTabs';
import { productAPI } from '../services/api';
import '../styles/Pages.css';

// Import components for Recently Browsed page
import BrowsingHistory from '../components/RecentlyBrowsed/BrowsingHistory';
import RelatedCategories from '../components/RecentlyBrowsed/RelatedCategories.tsx';

const RecentlyBrowsedPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      // Fetch browsing history and categories
      await Promise.all([
        productAPI.getBrowsingHistory(),
        productAPI.getBrowsedCategories()
      ]);
    } catch (error) {
      console.error('Fetch history data error:', error);
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

      <div className="recentlybrowsed_container">
        {/* Recently Viewed Products */}
        <RelatedCategories />
        <BrowsingHistory />

        {/* Products Related to Browsing History */}
        {/* <RecommendedProducts /> */}

        {/* Related Categories */}

        {/* Saved For Later */}
        {/* <SavedForLater /> */}
      </div>
      
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default RecentlyBrowsedPage;
