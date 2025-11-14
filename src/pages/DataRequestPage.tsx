import React from "react";
import Navbar from "../components/Navbar.jsx";  

import DataRequest from "../components/data-request.jsx";

import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";


const DataRequestPage: React.FC = () => {

  return (
    <div>
      <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
      <div className="datarequest_container">
      <DataRequest />
      
</div>
  
      <Footer />

      
       
    </div>
  );
};

export default DataRequestPage;


