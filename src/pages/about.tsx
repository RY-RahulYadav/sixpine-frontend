import React from "react";
import Navbar from "../components/Navbar.jsx";  


import About from "../components/About";

import "../styles/Pages.css"
import Footer from "../components/Footer.js";
import CategoryTabs from "../components/CategoryTabs.js";
import SubNav from "../components/SubNav.js";
const AboutPage: React.FC = () => {

  return (
    <div>
      <Navbar />
       <div className="page-content">
        <SubNav />
        <CategoryTabs />
      

       
      </div>
   
      <div className="aboutpage_container">
      <About />
      
</div>
  
      <Footer/>

      
       
    </div>
  );
};

export default AboutPage;


