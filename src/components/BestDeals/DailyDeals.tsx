import { useState, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import styles from './BestDeals.module.css';
import { homepageAPI } from '../../services/api';

interface DailyDeal {
  id: number;
  name: string;
  image: string;
  originalPrice: string;
  salePrice: string;
  discount: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  navigateUrl?: string;
}

const DailyDeals = () => {
  const [visibleCount, setVisibleCount] = useState(4);
  const [dailyDeals, setDailyDeals] = useState<DailyDeal[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Deals of the Day');
  const [loading, setLoading] = useState(true);

  // Default data for daily deals
  const defaultDeals: DailyDeal[] = [
    {
      id: 1,
      name: "Modern Coffee Table",
      image: "/images/Home/livingroom.jpg",
      originalPrice: "₹7,999",
      salePrice: "₹3,999",
      discount: "50%",
      rating: 4.6,
      reviewCount: 384,
      soldCount: 245,
      navigateUrl: '#'
    },
    {
      id: 2,
      name: "Ergonomic Office Chair",
      image: "/images/Home/studytable.jpg",
      originalPrice: "₹12,999",
      salePrice: "₹6,499",
      discount: "50%",
      rating: 4.8,
      reviewCount: 529,
      soldCount: 317,
      navigateUrl: '#'
    },
    {
      id: 3,
      name: "Wooden Bookshelf",
      image: "/images/Home/furnishing.jpg",
      originalPrice: "₹9,999",
      salePrice: "₹5,999",
      discount: "40%",
      rating: 4.7,
      reviewCount: 236,
      soldCount: 183,
      navigateUrl: '#'
    },
    {
      id: 4,
      name: "Modern Floor Lamp",
      image: "/images/Home/studytable.jpg",
      originalPrice: "₹4,999",
      salePrice: "₹2,499",
      discount: "50%",
      rating: 4.5,
      reviewCount: 153,
      soldCount: 97,
      navigateUrl: '#'
    },
    {
      id: 5,
      name: "Luxury Sofa Set",
      image: "/images/Home/livingroom.jpg",
      originalPrice: "₹24,999",
      salePrice: "₹14,999",
      discount: "40%",
      rating: 4.9,
      reviewCount: 642,
      soldCount: 423,
      navigateUrl: '#'
    },
    {
      id: 6,
      name: "Dining Table Set",
      image: "/images/Home/studytable.jpg",
      originalPrice: "₹18,999",
      salePrice: "₹10,999",
      discount: "42%",
      rating: 4.7,
      reviewCount: 318,
      soldCount: 256,
      navigateUrl: '#'
    },
    {
      id: 7,
      name: "Wall Mirror",
      image: "/images/Home/furnishing.jpg",
      originalPrice: "₹3,999",
      salePrice: "₹1,999",
      discount: "50%",
      rating: 4.4,
      reviewCount: 189,
      soldCount: 134,
      navigateUrl: '#'
    },
    {
      id: 8,
      name: "Bed with Storage",
      image: "/images/Home/livingroom.jpg",
      originalPrice: "₹29,999",
      salePrice: "₹17,999",
      discount: "40%",
      rating: 4.8,
      reviewCount: 457,
      soldCount: 298,
      navigateUrl: '#'
    }
  ];

  useEffect(() => {
    fetchDailyDealsData();
  }, []);

  const fetchDailyDealsData = async () => {
    try {
      const response = await homepageAPI.getHomepageContent('best-deals-daily');
      console.log('DailyDeals API Response:', response.data);
      
      // Check if admin data exists and is valid
      if (response.data && response.data.content) {
        const productsData = response.data.content.products;
        // Only use admin products if they exist and are valid
        if (productsData && Array.isArray(productsData) && productsData.length > 0) {
          console.log('Using admin daily deals data:', productsData);
          setDailyDeals(productsData);
        } else {
          console.log('Admin data exists but products array is empty or invalid, using defaults');
          // No valid products in admin data, use defaults
          setDailyDeals(defaultDeals);
        }
        // Update section title if provided
        if (response.data.content.sectionTitle) {
          setSectionTitle(response.data.content.sectionTitle);
        }
      } else {
        console.log('No admin daily deals content found, using defaults');
        // No admin data, use defaults
        setDailyDeals(defaultDeals);
      }
    } catch (error: any) {
      // If 404 or no data, use defaults (this is expected behavior)
      if (error.response?.status === 404) {
        console.log('No admin daily deals data found (404), using defaults');
      } else {
        console.error('Error fetching daily deals:', error);
      }
      // Use defaults when no admin data exists
      setDailyDeals(defaultDeals);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, dailyDeals.length));
  };

  const handleDealClick = (deal: DailyDeal) => {
    if (deal.navigateUrl && deal.navigateUrl !== '#') {
      window.location.href = deal.navigateUrl;
    }
  };

  if (loading) {
    return null;
  }

  const visibleDeals = dailyDeals.slice(0, visibleCount);
  const hasMore = visibleCount < dailyDeals.length;

  return (
    <div className={styles.dailyDealsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {sectionTitle === 'Deals of the Day' ? (
            <>
              <span className={styles.highlightText}>Deals</span> of the Day
            </>
          ) : (
            sectionTitle
          )}
        </h2>
      </div>

      <div className={styles.dealsGrid}>
        {visibleDeals.map(deal => (
          <div 
            key={deal.id} 
            className={styles.dealCard}
            onClick={() => handleDealClick(deal)}
            style={{ cursor: deal.navigateUrl && deal.navigateUrl !== '#' ? 'pointer' : 'default' }}
          >
            <div className={styles.dealImageContainer}>
              <img src={deal.image} alt={deal.name} className={styles.dealImage} />
              <span className={styles.discountTag}>-{deal.discount}</span>
              <div className={styles.dealOverlay}>
                <button className={styles.quickViewBtn}>Quick View</button>
              </div>
            </div>
            
            <div className={styles.dealInfo}>
              <h3 className={styles.dealName}>{deal.name}</h3>
              
              <div className={styles.dealPricing}>
                <span className={styles.salePrice}>{deal.salePrice}</span>
                <span className={styles.originalPrice}>{deal.originalPrice}</span>
              </div>
              
              <div className={styles.dealRating}>
                <div className={styles.stars}>
                  <span className={styles.ratingValue}>{deal.rating}</span>
                  <span className={styles.star}>★</span>
                </div>
                <span className={styles.reviewCount}>({deal.reviewCount})</span>
              </div>

              <div className={styles.dealProgress}>
                <div className={styles.progressLabel}>
                  <span>Already Sold: {deal.soldCount}</span>
                  <span>Available: {500 - deal.soldCount}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(deal.soldCount / 500) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className={styles.dealActions}>
                <button 
                  className={styles.buyNowBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDealClick(deal);
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
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyDeals;