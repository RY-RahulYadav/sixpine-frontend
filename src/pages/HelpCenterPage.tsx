import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Footer from '../components/Footer';
import HelpCenter from "../components/HelpCenter.jsx";

import "../styles/Pages.css"
import CategoryTabs from "../components/CategoryTabs.js";
import SubNav from "../components/SubNav.js";

const HelpCenterPage: React.FC = () => {

  return (
    <div>
       <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      </div>
      <div className="pressrelease_container">
      <HelpCenter />
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenterPage;

