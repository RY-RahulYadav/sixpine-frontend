import React from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';
import CategoryTabs from '../components/CategoryTabs';
import '../styles/Pages.css';
import '../styles/BulkOrderPage.css';

// Import new bulk order components
import BulkOrderHero from '../components/BulkOrder/BulkOrderHero';
import BulkOrderCategories from '../components/BulkOrder/BulkOrderCategories';
import BulkOrderProcess from '../components/BulkOrder/BulkOrderProcess';
import BulkOrderBenefits from '../components/BulkOrder/BulkOrderBenefits';
import BulkOrderForm from '../components/BulkOrder/BulkOrderForm';
// import BulkOrderFAQ from '../components/BulkOrder/BulkOrderFAQ';




const BulkOrderPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="bulkorder_container">
        {/* Hero Section with modern design */}
        <BulkOrderHero />

        {/* Industries We Serve */}
        <BulkOrderCategories />

        {/* 6-Step Order Process */}
        <BulkOrderProcess />
        <BulkOrderForm />
       
        {/* Benefits Section with Testimonials */}
        <BulkOrderBenefits />

        {/* Bulk Order Quote Form */}


        {/* FAQs Section */}
        {/* <BulkOrderFAQ /> */}
      

        
      </div>

      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default BulkOrderPage;