import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import '../styles/packagingFeedback.css';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";

import {

  recommendedProducts,
} from "../data/productSliderData";
const LeavePackagingFeedbackPage: React.FC = () => {
  const [showYesInfo, setShowYesInfo] = useState(false);
  const [showNoInfo, setShowNoInfo] = useState(false);

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="lpf-container">
        {/* Main Content */}
        <div className="lpf-content">
          <h1 className="lpf-title">Enter Your Packaging Feedback</h1>
          <p className="lpf-subtitle">About packaging and packaging programs for Sixpine.</p>

          {/* Sustainable Packaging Section */}
          <section className="lpf-section">
            <h2 className="lpf-section-title">Sixpine Smart & Sustainable Packaging Program</h2>
            <p className="lpf-text">
              At Sixpine, we are committed to providing the best packaging experience for our customers. We actively listen to customer feedback to discover new ways to reduce waste, minimize packaging, and use materials that are easier to recycle. Your feedback helps us use it in our fulfillment process under our Smart & Sustainable Packaging Program.
            </p>
            <p className="lpf-text">
              We gather insights through customer service, returns, and reviews to provide the best possible experience while minimizing excess packaging. One of the biggest challenges in e-commerce packaging is keeping it compact without compromising product safety. With your help, we can identify opportunities to reduce the amount of air or void-fill in our packaging, reduce waste across the supply chain, and ensure products reach customers safely and undamaged.
            </p>
          </section>

          {/* Damaged Delivery Section */}
          <section className="lpf-section">
            <h3 className="lpf-section-subtitle">Concerned About Damaged Delivery or Packaging Issues?</h3>
            <p className="lpf-text">
              While our goal is to minimize packaging and still guarantee safe delivery, we acknowledge that sometimes issues occur. If you received a damaged item, we'd love to hear and share your feedback. We use this information to evaluate both the manufacturer's packaging and the packaging methods we apply in our fulfillment centers. Based on these insights, we can continuously improve packaging, and in some cases, may temporarily stop selling an item until packaging improvements are made to ensure the best customer experience.
            </p>
          </section>

          {/* Question Section */}
          <div className="lpf-question-box">
            <p className="lpf-question">Was this information helpful?</p>
            <div className="lpf-button-group">
              <button 
                className="lpf-btn lpf-btn-yes"
                onClick={() => {
                  setShowYesInfo(!showYesInfo);
                  setShowNoInfo(false);
                }}
              >
                Yes
              </button>
              <button 
                className="lpf-btn lpf-btn-no"
                onClick={() => {
                  setShowNoInfo(!showNoInfo);
                  setShowYesInfo(false);
                }}
              >
                No
              </button>
            </div>
            {showYesInfo && (
              <div className="lpf-feedback-message">
                Thank you for your feedback!
              </div>
            )}
            {showNoInfo && (
              <div className="lpf-feedback-message">
                We're sorry to hear that. Please let us know how we can improve.
              </div>
            )}
          </div>

          {/* Footer Note */}
          <p className="lpf-footer-note">Page 1 of 12</p>
        </div>

        {/* Products Carousel Section */}
        <section className="lpf-products-section">
          
    <Productdetails_Slider1 
          title="Inspired by your browsing history"
          products={recommendedProducts}
        />
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

export default LeavePackagingFeedbackPage;
