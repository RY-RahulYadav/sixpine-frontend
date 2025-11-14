import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Advertise from "../components/Advertise.jsx";

import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";

const AdvertisePage: React.FC = () => {

  return (
    <div>
      <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
          <div className="advertisepage_container">
      <Advertise />
      
</div>
  
      <Footer />

      
       
    </div>
  );
};

export default AdvertisePage;


