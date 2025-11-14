import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

import Productdetails from "../components/Products_Details/productdetails";
import ProductInformation from "../components/Products_Details/productInformation";
import CustomerReview from "../components/Products_Details/customerReview";

import "../styles/Pages.css";
import SubNav from "../components/SubNav";
import CategoryTabs from "../components/CategoryTabs";
import AdBanner from "../components/ProductDetail/AdBanner";

// Import product data
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";
import Footer from "../components/Footer";
import { productAPI, authAPI } from "../services/api";
import { useApp } from "../context/AppContext";


const NewProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state } = useApp();
  const [product, setProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdBanner, setShowAdBanner] = useState(true);

  useEffect(() => {
    // Check user's advertising preference
    const checkAdvertisingPreference = async () => {
      if (!state.isAuthenticated) {
        setShowAdBanner(true); // Show by default for non-authenticated users
        return;
      }
      
      try {
        const response = await authAPI.getProfile();
        const profile = response.data.user || response.data;
        const userFromStorage = state.user || (() => {
          try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
          } catch {
            return null;
          }
        })();
        
        const mergedProfile = {
          ...userFromStorage,
          ...profile,
        };
        
        // Show banner only if advertising is enabled (default to true)
        setShowAdBanner(mergedProfile.advertising_enabled !== false);
      } catch (error) {
        console.error('Error checking advertising preference:', error);
        setShowAdBanner(true); // Default to showing banner
      }
    };
    
    checkAdvertisingPreference();
  }, [state.isAuthenticated, state.user]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch product details (includes recommendations)
        const productResponse = await productAPI.getProductDetail(slug);
        const productData = productResponse.data;
        setProduct(productData);
        
        // Transform recommendation data to match slider component format
        const transformProducts = (products: any[]) => {
          if (!products || products.length === 0) return [];
          return products.map(product => ({
            img: product.main_image || product.images?.[0]?.image || '',
            title: product.title,
            desc: product.short_description,
            rating: parseFloat(product.average_rating) || 0,
            reviews: product.review_count || 0,
            oldPrice: product.old_price ? `₹${product.old_price}` : '',
            newPrice: product.price ? `₹${product.price}` : '',
            slug: product.slug,
            id: product.id
          }));
        };
        
        // Use recommendations from product data if available, otherwise fetch separately
        let rawRecommendations = {
          buy_with: productData.buy_with_products || [],
          inspired_by: productData.inspired_products || [],
          frequently_viewed: productData.frequently_viewed_products || [],
          similar: productData.similar_products || [],
          recommended: productData.recommended_products || []
        };
        
        // If no recommendations in product data, try fetching from recommendations endpoint
        const hasRecommendations = rawRecommendations.buy_with.length > 0 || 
                                   rawRecommendations.inspired_by.length > 0 ||
                                   rawRecommendations.frequently_viewed.length > 0 ||
                                   rawRecommendations.similar.length > 0 ||
                                   rawRecommendations.recommended.length > 0;
        
        if (!hasRecommendations) {
          try {
            const recommendationsResponse = await productAPI.getProductRecommendations(slug);
            rawRecommendations = recommendationsResponse.data;
          } catch (recErr) {
            console.warn('Could not fetch recommendations:', recErr);
          }
        }
        
        const transformedRecommendations = {
          buy_with: rawRecommendations.buy_with ? transformProducts(rawRecommendations.buy_with) : [],
          inspired_by: rawRecommendations.inspired_by ? transformProducts(rawRecommendations.inspired_by) : [],
          frequently_viewed: rawRecommendations.frequently_viewed ? transformProducts(rawRecommendations.frequently_viewed) : [],
          similar: rawRecommendations.similar ? transformProducts(rawRecommendations.similar) : [],
          recommended: rawRecommendations.recommended ? transformProducts(rawRecommendations.recommended) : []
        };
        
        setRecommendations(transformedRecommendations);
        
      } catch (err: any) {
        console.error('Error fetching product data:', err);
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="page-content">
          <div id="navbar-changed">
            <SubNav />
            <CategoryTabs />
            {showAdBanner && (
              <div className="row mb-3">
                <div className="d-flex justify-content-center">
                  <AdBanner />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div className="page-content">
          <div id="navbar-changed">
            <SubNav />
            <CategoryTabs />
            {showAdBanner && (
              <div className="row mb-3">
                <div className="d-flex justify-content-center">
                  <AdBanner />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="alert alert-danger" role="alert">
            {error || 'Product not found'}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
     <Navbar />
      <div className="page-content">
        <div id="navbar-changed">
          <SubNav />
          <CategoryTabs />
          {showAdBanner && (
            <div className="row mb-3">
              <div className="d-flex justify-content-center">
                <AdBanner />
              </div>
            </div>
          )}
        </div>
        </div>
             
    
      <div className="productdetails_container">
        <Productdetails product={product} />
        
        {/* First Row - Buy with it */}
        {recommendations?.buy_with && recommendations.buy_with.length > 0 && (
          <Productdetails_Slider1 
            title="Buy with it"
            products={recommendations.buy_with}
          />
        )}
        
        {/* Second Row - Inspired by browsing history */}
        {recommendations?.inspired_by && recommendations.inspired_by.length > 0 && (
          <Productdetails_Slider1 
            title="Inspired by your browsing history"
            products={recommendations.inspired_by}
          />
        )}
         
        <ProductInformation product={product} />
        
        {/* Third Row - Frequently viewed */}
        {recommendations?.frequently_viewed && recommendations.frequently_viewed.length > 0 && (
          <Productdetails_Slider1 
            title="Customers frequently viewed | Popular products in the last 7 days"
            products={recommendations.frequently_viewed}
          />
        )}
        
        <CustomerReview product={product} />
        
        {/* Fourth Row - Similar products */}
        {recommendations?.similar && recommendations.similar.length > 0 && (
          <Productdetails_Slider1 
            title="Similar products"
            products={recommendations.similar}
          />
        )}
        
        {/* Fifth Row - Recommended for you */}
        {recommendations?.recommended && recommendations.recommended.length > 0 && (
          <Productdetails_Slider1 
            title="Recommended for you"
            products={recommendations.recommended}
          />
        )}
      </div>



<Footer />
    </div>
  );
};

export default NewProductDetails;


