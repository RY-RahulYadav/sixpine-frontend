import React from "react";
import Navbar from "../components/Navbar.jsx";  

import PurchaseProtection from "../components/PurchaseProtection";



import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";
const PurchaseProtectionPage: React.FC = () => {

  return (
    <div>
      <Navbar />
  <div className="page-content">
        <SubNav/>
        <CategoryTabs />

       
      </div>
     
      <div className="purchaseprotection_container">

      <PurchaseProtection/>
      </div>

  
      <Footer />

      
       
    </div>
  );
};

export default PurchaseProtectionPage;


