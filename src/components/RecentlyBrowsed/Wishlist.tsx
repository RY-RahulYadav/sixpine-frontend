import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { wishlistAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './RecentlyBrowsed.module.css';
import cardStyles from '../Products_Details/productdetails_slider1.module.css';

interface WishlistItem {
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
    color_count?: number;
    colorCount?: number;
    available_colors?: string[];
    category: {
      name: string;
      slug: string;
    };
  };
  added_at: string;
  updated_at: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const { state, addToCart } = useApp();
  const { showError } = useNotification();

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [state.isAuthenticated]);

  // Listen for wishlist updates from other components
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (state.isAuthenticated) {
        fetchWishlist();
      }
    };
    
    const handleBrowsingHistoryUpdate = () => {
      if (state.isAuthenticated) {
        fetchWishlist();
      }
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('browsingHistoryUpdated', handleBrowsingHistoryUpdate);
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('browsingHistoryUpdated', handleBrowsingHistoryUpdate);
    };
  }, [state.isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      console.log('Wishlist response:', response.data); // Debug log
      if (response.data && response.data.results) {
        setWishlistItems(response.data.results);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where API returns array directly
        setWishlistItems(response.data);
      } else {
        setWishlistItems([]);
      }
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      console.error('Error response:', error.response?.data); // Debug log
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const handleRemoveFromWishlist = async (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await wishlistAPI.removeFromWishlist(itemId);
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      // Trigger wishlist update event for other components
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showError('Failed to remove item from wishlist');
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/products-details/${slug}`);
  };

  if (!state.isAuthenticated) {
    return (
      <div className={styles.browsingHistorySection}>
        <div className={styles.emptyState}>
          <h3>Please Login</h3>
          <p>Login to view your wishlist items.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.browsingHistorySection}>
        <div className={styles.loading}>Loading wishlist...</div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className={styles.browsingHistorySection}>
        <div className={styles.emptyState}>
          <h3>Your Wishlist is Empty</h3>
          <p>Start adding products to your wishlist to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.browsingHistorySection}>
      <div className={styles.sectionHeaderWithClear}>
        <div className={styles.headerContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.highlightTitle}>My</span> Wishlist
          </h2>
          <p className={styles.sectionSubtitle}>Products you've saved for later</p>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {wishlistItems.map(item => {
          const rating = item.product.average_rating || 0;
          const fullStars = Math.floor(rating);
          const emptyStars = 5 - Math.ceil(rating);
          const isCartLoadingForThis = cartLoading === item.product.id;
          const colorCount = item.product.color_count || item.product.colorCount || item.product.variant_count || 0;
          const description = item.product.short_description || '';
          
          return (
            <div 
              key={item.id} 
              className={cardStyles.craftedProductCard}
              onClick={() => handleProductClick(item.product.slug)}
              style={{ cursor: 'pointer' }}
            >
              <div className={cardStyles.imageWrapper}>
                <img 
                  src={item.product.main_image || '/images/placeholder.jpg'} 
                  alt={item.product.title} 
                  className={cardStyles.productImg1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(item.product.slug);
                  }}
                />
                <FaHeart
                  className={`${cardStyles.heartIcon} ${cardStyles.heartActive}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromWishlist(item.id, e);
                  }}
                  style={{ 
                    cursor: 'pointer'
                  }}
                  title="Remove from Wishlist"
                />
              </div>

              <h4 
                className={cardStyles.productTitle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(item.product.slug);
                }}
              >
                {item.product.title}
              </h4>
              
              {description && (
                <p 
                  className={cardStyles.productDesc}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(item.product.slug);
                  }}
                >
                  {description}
                </p>
              )}
              
              <div className={cardStyles.productRating}>
                {"★".repeat(fullStars)}
                {"☆".repeat(emptyStars)}
                <span> ({item.product.review_count} reviews)</span>
                {colorCount > 0 && (
                  <div className={cardStyles.colorSwatches} aria-hidden>
                    <span className={cardStyles.moreCount}>
                      {colorCount} color{colorCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className={cardStyles.productPrices}>
                <span className={cardStyles.newPrice}>{formatPrice(item.product.price)}</span>
                {item.product.old_price && (
                  <span className={cardStyles.oldPrice}>{formatPrice(item.product.old_price)}</span>
                )}
              </div>

              <div className={cardStyles.actionRow}>
                <button 
                  className={cardStyles.buyBtn}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (state.isAuthenticated && item.product.id) {
                      try {
                        await addToCart(item.product.id, 1);
                        navigate('/checkout');
                      } catch (error: any) {
                        console.error('Error adding to cart:', error);
                        handleProductClick(item.product.slug);
                      }
                    } else {
                      handleProductClick(item.product.slug);
                    }
                  }}
                  disabled={isCartLoadingForThis}
                >
                  {isCartLoadingForThis ? 'Loading...' : 'Buy Now'}
                </button>
                <div className={cardStyles.productIcons}>
                  <FaHeart 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(item.id, e);
                    }}
                    title="Remove from Wishlist"
                    style={{ 
                      color: themeColors.wishlist_icon_color,
                      cursor: 'pointer'
                    }}
                  />
                  <FaShoppingCart 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!state.isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      if (!item.product.id) {
                        showError('Product ID is missing');
                        return;
                      }
                      setCartLoading(item.product.id);
                      try {
                        await addToCart(item.product.id, 1);
                      } catch (error: any) {
                        console.error('Add to cart error:', error);
                        showError(error.response?.data?.error || 'Failed to add to cart');
                      } finally {
                        setCartLoading(null);
                      }
                    }}
                    style={{ 
                      color: themeColors.cart_icon_color,
                      cursor: isCartLoadingForThis ? 'wait' : 'pointer',
                      opacity: isCartLoadingForThis ? 0.6 : 1
                    }}
                    title="Add to Cart"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;

