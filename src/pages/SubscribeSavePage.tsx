import React from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import '../styles/subscribeSave.css';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";

import {

  recommendedProducts,
} from "../data/productSliderData";
const SubscribeSavePage: React.FC = () => {




  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="ss-container">
        {/* Hero Section */}
        <div className="ss-hero-section">
          <div className="ss-hero-image">
            <img
              src="https://static.vecteezy.com/system/resources/thumbnails/014/488/242/small_2x/parcel-boxes-for-online-delivery-internet-ordering-concept-png.png"
              alt="Parcel boxes"
              className="ss-hero-svg-image"
            />
          </div>
          
          <div className="ss-hero-content">
            <h1 className="ss-title">Subscribe & Save</h1>
            <p className="ss-description">
              You do not have any active subscriptions. With Subscribe & Save, you can schedule auto-deliveries and never run out of your favourite items. You can also:
            </p>
            
            <ul className="ss-benefits-list">
              <li>Save up to 10% on your entire order</li>
              <li>Enjoy free shipping on each subscription</li>
              <li>Cancel anytime</li>
            </ul>

            <button className="ss-shop-btn">
              Shop the Subscribe & Save store
            </button>
          </div>
        </div>

    

        {/* Products Section */}
        <section className="ss-products-section">
          
         

             
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

export default SubscribeSavePage;
