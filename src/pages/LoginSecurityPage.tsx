import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";  
import Loginsecurity from "../components/loginsecurity";
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1.jsx";
import "../styles/Pages.css";
import { homepageAPI } from '../services/api';
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";

// Product interface matching the slider component
interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
}

const LoginSecurityPage: React.FC = () => {
  const [frequentlyViewedProducts, setFrequentlyViewedProducts] = useState<Product[]>([]);
  const [inspiredProducts, setInspiredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const response = await homepageAPI.getHomepageContent('banner-cards');
      const content = response.data.content || response.data;
      
      // Transform slider1Products (frequently viewed)
      if (content.slider1Products && Array.isArray(content.slider1Products)) {
        const transformedFrequentlyViewed = content.slider1Products.map((product: any) => ({
          img: product.img || product.image || product.main_image || '/images/placeholder.jpg',
          title: product.title || product.name || '',
          desc: product.desc || product.short_description || product.description || '',
          rating: product.rating || product.average_rating || 4.5,
          reviews: product.reviews || product.review_count || 0,
          oldPrice: product.oldPrice || (product.old_price ? `₹${parseInt(String(product.old_price)).toLocaleString()}` : ''),
          newPrice: product.newPrice || product.price || '',
        }));
        setFrequentlyViewedProducts(transformedFrequentlyViewed);
      }
      
      // Transform slider2Products (inspired by browsing history)
      if (content.slider2Products && Array.isArray(content.slider2Products)) {
        const transformedInspired = content.slider2Products.map((product: any) => ({
          img: product.img || product.image || product.main_image || '/images/placeholder.jpg',
          title: product.title || product.name || '',
          desc: product.desc || product.short_description || product.description || '',
          rating: product.rating || product.average_rating || 4.5,
          reviews: product.reviews || product.review_count || 0,
          oldPrice: product.oldPrice || (product.old_price ? `₹${parseInt(String(product.old_price)).toLocaleString()}` : ''),
          newPrice: product.newPrice || product.price || '',
        }));
        setInspiredProducts(transformedInspired);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setFrequentlyViewedProducts([]);
      setInspiredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      </div>
      
      <div className="loginsecurity_container">
      <Loginsecurity />

        {/* First Row - Customers frequently viewed */}
        {!loading && frequentlyViewedProducts.length > 0 && (
          <Productdetails_Slider1 
            title="Customers frequently viewed | Popular products in the last 7 days"
            products={frequentlyViewedProducts}
          />
        )}

        {/* Second Row - Inspired by your browsing history */}
        {!loading && inspiredProducts.length > 0 && (
          <Productdetails_Slider1 
            title="Inspired by your browsing history"
            products={inspiredProducts}
          />
        )}
      </div>
  
      <Footer />
    </div>
  );
};

export default LoginSecurityPage;


