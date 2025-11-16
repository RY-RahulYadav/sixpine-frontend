import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { wishlistAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import styles from './RecentlyBrowsed.module.css';

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
            <span className={styles.highlightTitle}>My</span> Wishlist
          </h2>
          <p className={styles.sectionSubtitle}>Products you've saved for later</p>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {wishlistItems.map(item => {
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
                <span className={styles.trendingTag}>Wishlist</span>
                {discount && (
                  <div className={styles.discountBadge}>{discount}</div>
                )}
                <button
                  className={styles.wishlistRemoveBtn}
                  onClick={(e) => handleRemoveFromWishlist(item.id, e)}
                  title="Remove from Wishlist"
                >
                  <FaHeart style={{ color: '#ff6f00' }} />
                </button>
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
                    disabled={cartLoading === item.product.id}
                  >
                    {cartLoading === item.product.id ? 'Loading...' : 'Buy Now'}
                  </button>
                  <button 
                    className={styles.cartIconBtn}
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
                    title="Add to Cart"
                    disabled={cartLoading === item.product.id}
                    style={{ 
                      cursor: cartLoading === item.product.id ? 'wait' : 'pointer',
                      opacity: cartLoading === item.product.id ? 0.6 : 1
                    }}
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

export default Wishlist;

