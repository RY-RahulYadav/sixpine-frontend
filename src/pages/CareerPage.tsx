import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Career from "../components/career.jsx";

import "../styles/Pages.css"
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";

const CareerPage: React.FC = () => {

  return (
    <div>
      <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
  
         <div className="career_container">
      <Career />
      
</div>
  
      <Footer />

      
       
    </div>
  );
};

export default CareerPage;


