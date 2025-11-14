import React from "react";
import Navbar from "../components/Navbar.js";  


import Global_Selling from "../components/global_selling.js";

import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";


const Global_SellingPage: React.FC = () => {

  return (
    <div>
     <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      </div>
      <div className="global_selling_container">
      <Global_Selling />
      

  </div>
      <Footer />

      
       
    </div>
  );
};

export default Global_SellingPage;


