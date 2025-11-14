import React from "react";
import Navbar from "../components/Navbar.jsx";  
import EmailSubscriptions from "../components/EmailSubscriptions";
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1.jsx";
import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import {
  frequentlyViewedProducts,
} from "../data/productSliderData";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";

const EmailSubscriptionsPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      </div>
      <div className="emailsubscriptions_container">
        <EmailSubscriptions />
        <div style={{ 
          maxWidth: '100%', 
          margin: '40px auto 0',
          padding: '0 15px'
        }}>
          <div style={{
            textAlign: 'right',
            fontSize: '12px',
            color: '#565959',
            marginBottom: '20px',
            paddingTop: '10px',
            borderTop: '1px solid #e7e7e7'
          }}>
          </div>
        </div>
        <Productdetails_Slider1  
          title="Customers frequently viewed | Popular products in the last 7 days"
          products={frequentlyViewedProducts}
        />
      </div>
      <Footer />
    </div>
  );
};

export default EmailSubscriptionsPage;


