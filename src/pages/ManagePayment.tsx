import React from "react";

import Navbar from "../components/Navbar";  


import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";
import {
  frequentlyViewedProducts,
  recommendedProducts,
} from "../data/productSliderData";

import "../styles/Pages.css"
import "../styles/CheckoutPage.css"
import Footer from "../components/Footer";
import CategoryTabs from "../components/CategoryTabs";
import SubNav from "../components/SubNav";
import ManagePaymentMethods from "../components/ManagePaymentMethods";
const ManagePaymentPage: React.FC = () => {

  return (
    <div>
      <Navbar />
       <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>
      <ManagePaymentMethods preference={null as any} onUpdateClick={() => {}} onDeleteCard={() => {}} />
          <div className="productdetails_container">
        
        {/* First Row - Customers frequently viewed */}
        <Productdetails_Slider1 
          title="Buy with it"
          products={frequentlyViewedProducts}
        />
   
         
      
        
        {/* Fourth Row - Recommended for you */}
        <Productdetails_Slider1 
          title="Inspired by your browsing history"
          products={recommendedProducts}
        />
      </div>
      <Footer />
    </div>
  );
};

export default ManagePaymentPage;


