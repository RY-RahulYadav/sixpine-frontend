import React from "react";
import Navbar from "../components/Navbar.jsx";  

import CloseYourSixpineAccount from "../components/CloseYourSixpineAccount.jsx";

import "../styles/Pages.css"; 
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";


const CloseYourSixpineAccountPage: React.FC = () => {

  return (
    <div>
      <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
      
      
      <div className="closeyoursixpineaccount_container">
      <CloseYourSixpineAccount />
      
</div>
  
      <Footer />

      
       
    </div>
  );
};

export default CloseYourSixpineAccountPage;


