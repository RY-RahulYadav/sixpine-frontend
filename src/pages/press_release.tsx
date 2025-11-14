import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Footer from '../components/Footer';
import PressRelease from "../components/PressRelease.jsx";

import "../styles/Pages.css"
import CategoryTabs from "../components/CategoryTabs.js";
import SubNav from "../components/SubNav.js";

const PressReleasePage  : React.FC = () => {

  return (
    <div>
       <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
      <div className="pressrelease_container">
      <PressRelease />
      

      </div>
      <Footer />

      
       
    </div>
  );
};

export default PressReleasePage;


