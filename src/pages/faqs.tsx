import React from "react";
import Navbar from "../components/Navbar.jsx";
import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import CategoryTabs from "../components/CategoryTabs.js";
import SubNav from "../components/SubNav.js";
import FAQs from "../components/FAQs";

const FAQsPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="privacypage_container">
        <FAQs />
      </div>

      <Footer />
    </div>
  );
};

export default FAQsPage;
