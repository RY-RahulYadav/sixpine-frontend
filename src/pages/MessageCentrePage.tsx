import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import '../styles/messageCentre.css';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";
import { recommendedProducts } from "../data/productSliderData";

const MessageCentrePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeSidebar, setActiveSidebar] = useState('inbox');

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="mc-container">
        {/* Breadcrumb */}
        <div className="mc-breadcrumb">
          <span className="mc-breadcrumb-link">Your Account</span>
          <span className="mc-breadcrumb-separator">&gt;</span>
          <span className="mc-breadcrumb-current">Message Centre</span>
        </div>

        <div className="mc-content-wrapper">
          {/* Sidebar */}
          <aside className="mc-sidebar">
            <nav className="mc-sidebar-nav">
              <button
                className={`mc-sidebar-item ${activeSidebar === 'inbox' ? 'active' : ''}`}
                onClick={() => setActiveSidebar('inbox')}
              >
                Inbox
              </button>
              <button
                className={`mc-sidebar-item ${activeSidebar === 'sent' ? 'active' : ''}`}
                onClick={() => setActiveSidebar('sent')}
              >
                Sent Messages
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="mc-main">
            {/* Tabs */}
            <div className="mc-tabs">
              <button
                className={`mc-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Messages
              </button>
              <button
                className={`mc-tab ${activeTab === 'buyer' ? 'active' : ''}`}
                onClick={() => setActiveTab('buyer')}
              >
                Buyer/Seller Messages
              </button>
            </div>

            {/* Messages Area */}
            <div className="mc-messages-area">
              <div className="mc-message-item">
                <div className="mc-message-header">
                  <p className="mc-message-text">
                    all messages of all customer should be shown here with date and time and should not delete
                  </p>
                  <span className="mc-message-date">7/6/2025, 10:48:5...</span>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="mc-pagination">
              <span className="mc-page-info">Page 1</span>
              <button className="mc-pagination-btn" disabled>Previous Page</button>
              <button className="mc-pagination-btn">Next Page</button>
            </div>
          </main>
        </div>

        {/* Page Counter */}
        <div className="mc-page-counter">
          Page 1 of 12
        </div>

        {/* Products Section */}
        <section className="mc-products-section">
          <Productdetails_Slider1 
            title="Customers Frequently viewed | Popular products in the last 7 days"
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

export default MessageCentrePage;
