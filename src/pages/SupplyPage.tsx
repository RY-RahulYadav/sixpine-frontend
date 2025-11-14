import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Supply from "../components/Supply.js";

import "../styles/Pages.css"; 
import Footer from "../components/Footer";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";



const SupplyPage: React.FC = () => {

  return (
    <div>
      <Navbar />
<div className="page-content">
        <SubNav/>
        <CategoryTabs />

       
      </div>
      <div className="supply_container">

      <Supply/>
     
      </div>

  
      <Footer />

      
       
    </div>
  );
};

export default SupplyPage;


