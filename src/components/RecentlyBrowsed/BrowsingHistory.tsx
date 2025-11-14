import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { productAPI } from '../../services/api';
import styles from './RecentlyBrowsed.module.css';

interface BrowsingHistoryItem {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
    short_description?: string;
    main_image: string;
    price: string;
    old_price?: string;
    average_rating: number;
    review_count: number;
    variant_count?: number;
    available_colors?: string[];
    category: {
      name: string;
      slug: string;
    };
  };
  last_viewed: string;
  view_count: number;
}

const BrowsingHistory = () => {
  const [historyItems, setHistoryItems] = useState<BrowsingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrowsingHistory();
  }, []);

  const fetchBrowsingHistory = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getBrowsingHistory(20);
      setHistoryItems(response.data.results || []);
    } catch (error) {
      console.error('Error fetching browsing history:', error);
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffTime = Math.abs(now.getTime() - date.getTime());
  //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //   
  //   if (diffDays === 0) {
  //     const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  //     if (diffHours === 0) {
  //       const diffMinutes = Math.floor(diffTime / (1000 * 60));
  //       return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
  //     }
  //     return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  //   } else if (diffDays === 1) {
  //     return 'Yesterday';
  //   } else if (diffDays < 7) {
  //     return `${diffDays} days ago`;
  //   } else {
  //     return date.toLocaleDateString();
  //   }
  // };

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all browsing history?')) {
      try {
        await productAPI.clearBrowsingHistory();
        setHistoryItems([]);
      } catch (error) {
        console.error('Error clearing browsing history:', error);
      }
    }
  };

  // const handleRemoveItem = async (productId: number) => {
  //   try {
  //     await productAPI.clearBrowsingHistory(productId);
  //     setHistoryItems(historyItems.filter(item => item.product.id !== productId));
  //   } catch (error) {
  //     console.error('Error removing item:', error);
  //   }
  // };

  const handleProductClick = (slug: string) => {
    navigate(`/products-details/${slug}`);
  };

  if (loading) {
    return (
      <div className={styles.browsingHistorySection}>
        <div className={styles.loading}>Loading browsing history...</div>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className={styles.browsingHistorySection}>
        <div className={styles.emptyState}>
          <h3>No Browsing History</h3>
          <p>Start browsing products to see your recently viewed items here.</p>
        </div>
      </div>
    );
  }

  const calculateDiscount = (oldPrice: string, newPrice: string) => {
    if (!oldPrice) return null;
    const old = parseFloat(oldPrice);
    const newP = parseFloat(newPrice);
    if (old <= newP) return null;
    const discount = Math.round(((old - newP) / old) * 100);
    return `${discount}% OFF`;
  };

  return (
    <div className={styles.browsingHistorySection}>
      <div className={styles.sectionHeaderWithClear}>
        <div className={styles.headerContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.highlightTitle}>Recently</span> Viewed
          </h2>
          <p className={styles.sectionSubtitle}>Your recently browsed products</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.clearButton}
            onClick={handleClearHistory}
          >
            Clear History
          </button>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {historyItems.map(item => {
          const rating = item.product.average_rating || 0;
          const discount = item.product.old_price 
            ? calculateDiscount(item.product.old_price, item.product.price)
            : null;
          
          return (
            <div 
              key={item.id} 
              className={styles.productCard}
              onClick={() => handleProductClick(item.product.slug)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.productImageContainer}>
                <img 
                  src={item.product.main_image || '/images/placeholder.jpg'} 
                  alt={item.product.title} 
                  className={styles.productImage}
                />
                <span className={styles.trendingTag}>Recently Viewed</span>
                {discount && (
                  <div className={styles.discountBadge}>{discount}</div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{item.product.title}</h3>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>{formatPrice(item.product.price)}</span>
                  <div className={styles.productRating}>
                    <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
                    <span className={styles.ratingIcon}>★</span>
                    <span className={styles.reviewCount}>({item.product.review_count})</span>
                  </div>
                </div>
                <div className={styles.productActionRow}>
                  <button 
                    className={styles.buyNowBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(item.product.slug);
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
    </div>
  );
};

export default BrowsingHistory;