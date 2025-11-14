import React from "react";
import Navbar from "../components/Navbar.jsx";  
import SixpineApp from "../components/SixpineApp.js";

import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";


const SixpineAppPage: React.FC = () => {

  return (
    <div>
      <Navbar />
      <div className="page-content">
        <SubNav/>
        <CategoryTabs />

       
      </div>
     
   
      <div className="sixpineapp_container">

      <SixpineApp/>
     
      </div>

  
      <Footer />

      
       
    </div>
  );
};

export default SixpineAppPage;


