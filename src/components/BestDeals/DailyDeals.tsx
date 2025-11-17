import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { homepageAPI, wishlistAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import styles from './BestDeals.module.css';
import cardStyles from '../Products_Details/productdetails_slider1.module.css';

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
  productId?: number;
  description?: string;
  variantCount?: number;
}

const DailyDeals = () => {
  const navigate = useNavigate();
  const { state, addToCart } = useApp();
  const { showError } = useNotification();
  const [visibleCount, setVisibleCount] = useState(4);
  const [dailyDeals, setDailyDeals] = useState<DailyDeal[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Deals of the Day');
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState<number | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null);

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
    if (state.isAuthenticated) {
      checkWishlistStatus();
    }
  }, [state.isAuthenticated]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      if (response.data && response.data.results) {
        const wishlistIds = new Set<number>(
          response.data.results
            .map((item: any) => item.product?.id)
            .filter((id: any): id is number => typeof id === 'number' && !isNaN(id))
        );
        setWishlistItems(wishlistIds);
      }
    } catch (error) {
      // Silently fail - user might not be authenticated
    }
  };

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
          // Map products to ensure description and variantCount are included
          const mappedProducts = productsData.map((deal: any) => ({
            ...deal,
            description: deal.description || deal.short_description || '',
            variantCount: deal.variantCount || deal.variant_count || 0
          }));
          setDailyDeals(mappedProducts);
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
      navigate(deal.navigateUrl);
    }
  };

  const handleBuyNow = async (deal: DailyDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    const productId = deal.productId || deal.id;
    if (state.isAuthenticated && productId) {
      try {
        await addToCart(productId, 1);
        navigate('/checkout');
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        handleDealClick(deal);
      }
    } else if (deal.navigateUrl && deal.navigateUrl !== '#') {
      navigate(deal.navigateUrl);
    } else if (!state.isAuthenticated) {
      navigate('/login');
    }
  };

  const handleAddToCart = async (deal: DailyDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    const productId = deal.productId || deal.id;
    if (!productId) {
      showError('Product ID is missing');
      return;
    }
    setCartLoading(productId);
    try {
      await addToCart(productId, 1);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      showError(error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setCartLoading(null);
    }
  };

  const handleWishlist = async (e: React.MouseEvent, deal: DailyDeal) => {
    e.stopPropagation();
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    const productId = deal.productId || deal.id;
    if (!productId) {
      showError('Product ID is missing');
      return;
    }

    setWishlistLoading(productId);
    try {
      const isInWishlist = wishlistItems.has(productId);
      
      if (isInWishlist) {
        // Remove from wishlist
        const response = await wishlistAPI.getWishlist();
        const wishlistItem = response.data.results.find(
          (item: any) => item.product?.id === productId
        );
        if (wishlistItem) {
          await wishlistAPI.removeFromWishlist(wishlistItem.id);
          setWishlistItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      } else {
        // Add to wishlist
        await wishlistAPI.addToWishlist(productId);
        setWishlistItems(prev => new Set(prev).add(productId));
      }
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error: any) {
      console.error('Wishlist error:', error);
      showError(error.response?.data?.error || error.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(null);
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
        {visibleDeals.map(deal => {
          const productId = deal.productId || deal.id;
          const isInWishlist = wishlistItems.has(productId);
          const isCartLoadingForThis = cartLoading === productId;
          const isWishlistLoadingForThis = wishlistLoading === productId;
          const fullStars = Math.floor(deal.rating);
          const emptyStars = 5 - Math.ceil(deal.rating);

          return (
            <div 
              key={deal.id} 
              className={cardStyles.craftedProductCard}
              onClick={() => handleDealClick(deal)}
              style={{ cursor: deal.navigateUrl && deal.navigateUrl !== '#' ? 'pointer' : 'default' }}
            >
              <div className={cardStyles.imageWrapper}>
                <img 
                  src={deal.image} 
                  alt={deal.name} 
                  className={cardStyles.productImg1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDealClick(deal);
                  }}
                />
                <FaHeart
                  className={`${cardStyles.heartIcon} ${isInWishlist ? cardStyles.heartActive : ""}`}
                  onClick={(e) => handleWishlist(e, deal)}
                  style={{ 
                    cursor: isWishlistLoadingForThis ? 'wait' : 'pointer',
                    opacity: isWishlistLoadingForThis ? 0.6 : 1
                  }}
                />
              </div>

              <h4 
                className={cardStyles.productTitle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDealClick(deal);
                }}
              >
                {deal.name}
              </h4>
              
              {deal.description && (
                <p 
                  className={cardStyles.productDesc}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDealClick(deal);
                  }}
                >
                  {deal.description}
                </p>
              )}
              
              <div className={cardStyles.productRating}>
                {"★".repeat(fullStars)}
                {"☆".repeat(emptyStars)}
                <span> ({deal.reviewCount} reviews)</span>
                {deal.variantCount !== undefined && deal.variantCount > 0 && (
                  <div className={cardStyles.colorSwatches} aria-hidden>
                    <span className={cardStyles.moreCount}>
                      {deal.variantCount} variant{deal.variantCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className={cardStyles.productPrices}>
                <span className={cardStyles.newPrice}>{deal.salePrice}</span>
                {deal.originalPrice && (
                  <span className={cardStyles.oldPrice}>{deal.originalPrice}</span>
                )}
              </div>

              <div className={cardStyles.actionRow}>
                <button 
                  className={cardStyles.buyBtn}
                  onClick={(e) => handleBuyNow(deal, e)}
                  disabled={isCartLoadingForThis}
                >
                  {isCartLoadingForThis ? 'Loading...' : 'Buy Now'}
                </button>
                <div className={cardStyles.productIcons}>
                  <FaHeart 
                    onClick={(e) => handleWishlist(e, deal)}
                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    style={{ 
                      color: isInWishlist ? '#ff6f00' : '#999',
                      cursor: isWishlistLoadingForThis ? 'wait' : 'pointer',
                      opacity: isWishlistLoadingForThis ? 0.6 : 1
                    }}
                  />
                  <FaShoppingCart 
                    onClick={(e) => handleAddToCart(deal, e)}
                    style={{ 
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