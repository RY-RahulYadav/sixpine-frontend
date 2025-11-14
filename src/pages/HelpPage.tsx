import React from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import HelpHeader from '../components/Help/HelpHeader';
import HelpCategories from '../components/Help/HelpCategories';

import SupportResources from '../components/Help/SupportResources';
import '../styles/Pages.css';

const HelpPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
        
        <HelpHeader />
        <HelpCategories />
        <SupportResources />
      </div>
      
      <div className="footer-wrapper">
        <Footer />
      </div>
      <BackToTop />
    </>
  );
};

export default HelpPage;