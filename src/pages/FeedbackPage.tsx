import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Feedback from "../components/feedback.jsx";

import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";


const FeedbackPage: React.FC = () => {

  return (
    <div>
      <Navbar />
      {/* <Navigationdown /> */}
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
      <div className="feedback_container">
      <Feedback />
      
</div>
  
      <Footer />

      
       
    </div>
  );
};

export default FeedbackPage;


