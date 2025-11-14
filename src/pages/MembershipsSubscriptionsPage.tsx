import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import '../styles/membershipsSubscriptions.css';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";
import { recommendedProducts } from "../data/productSliderData";

const MembershipsSubscriptionsPage: React.FC = () => {
  const [viewFilter, setViewFilter] = useState('Current Subscriptions');
  const [sortBy, setSortBy] = useState('Featured');

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="msp-container">
        {/* Header */}
        <div className="msp-header">
          <div className="msp-breadcrumb">
            <span className="msp-breadcrumb-link">Your Memberships & Subscriptions</span>
            <span className="msp-breadcrumb-separator">›</span>
            <span className="msp-breadcrumb-current">Help</span>
          </div>
        </div>

        {/* Page Title */}
        <h1 className="msp-page-title">Your Memberships & Subscriptions</h1>

        {/* Filters Section */}
        <div className="msp-filters-section">
          <div className="msp-filter-group">
            <label className="msp-filter-label">View:</label>
            <select 
              className="msp-filter-select"
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value)}
            >
              <option value="Current Subscriptions">Current Subscriptions</option>
              <option value="All Subscriptions">All Subscriptions</option>
              <option value="Active">Active</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="msp-filter-group">
            <label className="msp-filter-label">Sort by:</label>
            <select 
              className="msp-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Featured">Featured</option>
              <option value="Date">Date</option>
              <option value="Price">Price</option>
              <option value="Name">Name</option>
            </select>
          </div>

          <div className="msp-search-group">
            <div className="msp-search-wrapper">
              <input 
                type="text" 
                placeholder="Search Your Subscriptions"
                className="msp-search-input"
              />
              <button className="msp-search-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* No Subscription Message */}
        <div className="msp-no-subscription">
          <p className="msp-no-subscription-text">No subscription found</p>
        </div>

        {/* Help Section */}
        <div className="msp-help-section">
          <h2 className="msp-help-title">
            Need help with your memberships and subscriptions? 
            <a href="#" className="msp-help-link"> Learn More.</a>
          </h2>
        </div>

        {/* Page Counter Top */}
        <div className="msp-page-counter">
          Pages 1 of 12
        </div>

        {/* Products Section */}
        <section className="msp-products-section">
          <Productdetails_Slider1 
            title="Customers Frequently viewed | Popular products in the last 7 days"
            products={recommendedProducts}
          />

          {/* Page Counter Middle */}
          <div className="msp-page-counter msp-page-counter-middle">
            Pages 1 of 12
          </div>

          <Productdetails_Slider1 
            title="Inspired by your browsing history"
            products={recommendedProducts}
          />
        </section>
      </div>

      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default MembershipsSubscriptionsPage;
