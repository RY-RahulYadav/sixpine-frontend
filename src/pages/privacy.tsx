import React from "react";
import Navbar from "../components/Navbar.jsx";
import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import CategoryTabs from "../components/CategoryTabs.js";
import SubNav from "../components/SubNav.js";
import PrivacyPolicy from "../components/Privacy";

const PrivacyPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>
   
      <div className="privacypage_container">
        <PrivacyPolicy />
      </div>
  
      <Footer />
    </div>
  );
};

export default PrivacyPage;
