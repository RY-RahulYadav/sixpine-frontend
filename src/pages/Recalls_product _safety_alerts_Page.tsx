  import React from "react";
import Navbar from "../components/Navbar.jsx";  


import Recalls_product from "../components/Recalls_product _safety_alerts.js";

import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import CategoryTabs from "../components/CategoryTabs.js";
import SubNav from "../components/SubNav.js";


const RecallsProductSafetyAlertsPage: React.FC = () => {

  return (
    <div>
      <Navbar />
<div className="page-content">
        <SubNav/>
        <CategoryTabs />

       
      </div>
     
      <div className="recalls_product_container">

   <Recalls_product/>
     
      </div>

  
      <Footer />

      
       
    </div>
  );
};

export default RecallsProductSafetyAlertsPage;


