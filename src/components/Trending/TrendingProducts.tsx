import { useState, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import styles from './Trending.module.css';
import { homepageAPI } from '../../services/api';

const defaultProducts = [
  {
    id: 1,
    name: "Ergonomic Office Chair",
    price: "₹6,499",
    rating: 4.8,
    reviewCount: 1243,
    image: "/images/Home/studytable.jpg",
    tag: "Most Viewed",
    discount: "15% OFF",
    navigateUrl: "#"
  },
  {
    id: 2,
    name: "Minimal Bedside Table",
    price: "₹2,299",
    rating: 4.7,
    reviewCount: 856,
    image: "/images/Home/furnishing.jpg",
    tag: "Bestseller",
    discount: "20% OFF",
    navigateUrl: "#"
  },
  {
    id: 3,
    name: "Nordic Sofa Set",
    price: "₹32,999",
    rating: 4.9,
    reviewCount: 421,
    image: "/images/Home/livingroom.jpg",
    tag: "Hot Item",
    discount: "10% OFF",
    navigateUrl: "#"
  },
  {
    id: 4,
    name: "Luxury Memory Foam Mattress",
    price: "₹15,999",
    rating: 4.8,
    reviewCount: 753,
    image: "/images/Home/furnishing.jpg",
    tag: "Fast Selling",
    discount: "25% OFF",
    navigateUrl: "#"
  }
];

const TrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState(defaultProducts);
  const [, setSectionTitle] = useState('Trending Right Now');
  const [sectionSubtitle, setSectionSubtitle] = useState('Discover what customers are loving this week');
  const [viewAllButtonText, setViewAllButtonText] = useState('View All Trending Products');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('trending-products');
        
        if (response.data && response.data.content) {
          if (response.data.content.products && Array.isArray(response.data.content.products)) {
            // Map API products to component format
            const mappedProducts = response.data.content.products.map((product: any) => ({
              id: product.id || product.productId || 0,
              name: product.name || product.title || '',
              price: product.price || '₹0',
              rating: product.rating || 4.0,
              reviewCount: product.reviewCount || product.reviews || 0,
              image: product.image || product.img || '/images/Home/sofa1.jpg',
              tag: product.tag || 'Trending',
              discount: product.discount || null,
              navigateUrl: product.navigateUrl || '#'
            }));
            setTrendingProducts(mappedProducts.length > 0 ? mappedProducts : defaultProducts);
          }
          if (response.data.content.sectionTitle) {
            setSectionTitle(response.data.content.sectionTitle);
          }
          if (response.data.content.sectionSubtitle) {
            setSectionSubtitle(response.data.content.sectionSubtitle);
          }
          if (response.data.content.viewAllButtonText) {
            setViewAllButtonText(response.data.content.viewAllButtonText);
          }
        }
      } catch (error) {
        console.error('Error fetching trending products data:', error);
        // Keep default products if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, []);

  if (loading) {
    return (
      <div className={styles.trendingProductsSection}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.trendingProductsSection}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.highlightTitle}>Trending</span> Right Now
      </h2>
      <p className={styles.sectionSubtitle}>{sectionSubtitle}</p>

      <div className={styles.productsGrid}>
        {trendingProducts.map(product => {
          const handleCardClick = () => {
            if (product.navigateUrl && product.navigateUrl !== '#') {
              window.location.href = product.navigateUrl;
            }
          };
          
          return (
            <div 
              key={product.id} 
              className={styles.productCard}
              onClick={handleCardClick}
              style={{ cursor: product.navigateUrl && product.navigateUrl !== '#' ? 'pointer' : 'default' }}
            >
              <div className={styles.productImageContainer}>
                <img src={product.image} alt={product.name} className={styles.productImage} />
                <span className={styles.trendingTag}>{product.tag}</span>
                <div className={styles.discountBadge}>{product.discount}</div>
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>{product.price}</span>
                  <div className={styles.productRating}>
                    <span className={styles.ratingValue}>{product.rating}</span>
                    <span className={styles.ratingIcon}>★</span>
                    <span className={styles.reviewCount}>({product.reviewCount})</span>
                  </div>
                </div>
                <div className={styles.productActionRow}>
                  <button 
                    className={styles.buyNowBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick();
                    }}
                  >
                    Buy Now
                  </button>
                  <button 
                    className={styles.cartIconBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add to cart logic
                    }}
                    title="Add to Cart"
                  >
                    <FaShoppingCart />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.viewAllContainer}>
        <button className={styles.viewAllButton}>{viewAllButtonText}</button>
      </div>
    </div>
  );
};

export default TrendingProducts;