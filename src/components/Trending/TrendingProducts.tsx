import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { homepageAPI, wishlistAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Trending.module.css';
import cardStyles from '../Products_Details/productdetails_slider1.module.css';

interface TrendingProduct {
  id: number;
  name: string;
  description?: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  parent_main_image?: string;
  tag: string;
  discount?: string | null;
  navigateUrl?: string;
  variantCount?: number;
  colorCount?: number;
  color_count?: number;
}

const defaultProducts: TrendingProduct[] = [
  {
    id: 1,
    name: "Ergonomic Office Chair",
    description: "Comfortable ergonomic office chair with adjustable height and lumbar support",
    price: "₹6,499",
    rating: 4.8,
    reviewCount: 1243,
    image: "/images/Home/studytable.jpg",
    tag: "Most Viewed",
    discount: "15% OFF",
    navigateUrl: "#",
    variantCount: 3
  },
  {
    id: 2,
    name: "Minimal Bedside Table",
    description: "Sleek and modern bedside table with storage drawer",
    price: "₹2,299",
    rating: 4.7,
    reviewCount: 856,
    image: "/images/Home/furnishing.jpg",
    tag: "Bestseller",
    discount: "20% OFF",
    navigateUrl: "#",
    variantCount: 2
  },
  {
    id: 3,
    name: "Nordic Sofa Set",
    description: "Elegant Nordic style sofa set perfect for modern living rooms",
    price: "₹32,999",
    rating: 4.9,
    reviewCount: 421,
    image: "/images/Home/livingroom.jpg",
    tag: "Hot Item",
    discount: "10% OFF",
    navigateUrl: "#",
    variantCount: 4
  },
  {
    id: 4,
    name: "Luxury Memory Foam Mattress",
    description: "Premium memory foam mattress for ultimate comfort and support",
    price: "₹15,999",
    rating: 4.8,
    reviewCount: 753,
    image: "/images/Home/furnishing.jpg",
    tag: "Fast Selling",
    discount: "25% OFF",
    navigateUrl: "#",
    variantCount: 2
  }
];

const TrendingProducts = () => {
  const navigate = useNavigate();
  const { state, addToCart } = useApp();
  const { showError } = useNotification();
  const { colors: themeColors } = useTheme();
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>(defaultProducts);
  const [, setSectionTitle] = useState('Trending Right Now');
  const [sectionSubtitle, setSectionSubtitle] = useState('Discover what customers are loving this week');
  const [viewAllButtonText, setViewAllButtonText] = useState('View All Trending Products');
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState<number | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null);

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
              description: product.description || product.short_description || product.desc || '',
              price: product.price || '₹0',
              rating: product.rating || 4.0,
              reviewCount: product.reviewCount || product.reviews || 0,
              image: product.image || product.img || '/images/Home/sofa1.jpg',
              parent_main_image: product.parent_main_image || undefined,
              tag: product.tag || 'Trending',
              discount: product.discount || null,
              navigateUrl: product.navigateUrl || '#',
              variantCount: product.variantCount || product.variant_count || product.variants_count || 0,
              colorCount: product.colorCount || product.color_count || 0
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
              navigate(product.navigateUrl);
            }
          };

          const handleBuyNow = async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (state.isAuthenticated && product.id) {
              try {
                await addToCart(product.id, 1);
                navigate('/checkout');
              } catch (error: any) {
                console.error('Error adding to cart:', error);
                handleCardClick();
              }
            } else if (product.navigateUrl && product.navigateUrl !== '#') {
              navigate(product.navigateUrl);
            } else if (!state.isAuthenticated) {
              navigate('/login');
            }
          };

          const handleAddToCart = async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!state.isAuthenticated) {
              navigate('/login');
              return;
            }
            if (!product.id) {
              showError('Product ID is missing');
              return;
            }
            setCartLoading(product.id);
            try {
              await addToCart(product.id, 1);
            } catch (error: any) {
              console.error('Add to cart error:', error);
              showError(error.response?.data?.error || 'Failed to add to cart');
            } finally {
              setCartLoading(null);
            }
          };

          const handleWishlist = async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!state.isAuthenticated) {
              navigate('/login');
              return;
            }
            if (!product.id) {
              showError('Product ID is missing');
              return;
            }

            setWishlistLoading(product.id);
            try {
              const isInWishlist = wishlistItems.has(product.id);
              
              if (isInWishlist) {
                // Remove from wishlist
                const response = await wishlistAPI.getWishlist();
                const wishlistItem = response.data.results.find(
                  (item: any) => item.product?.id === product.id
                );
                if (wishlistItem) {
                  await wishlistAPI.removeFromWishlist(wishlistItem.id);
                  setWishlistItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(product.id);
                    return newSet;
                  });
                }
              } else {
                // Add to wishlist
                await wishlistAPI.addToWishlist(product.id);
                setWishlistItems(prev => new Set(prev).add(product.id));
              }
              
              window.dispatchEvent(new CustomEvent('wishlistUpdated'));
            } catch (error: any) {
              console.error('Wishlist error:', error);
              showError(error.response?.data?.error || error.message || 'Failed to update wishlist');
            } finally {
              setWishlistLoading(null);
            }
          };

          const isInWishlist = wishlistItems.has(product.id);
          const isCartLoadingForThis = cartLoading === product.id;
          const isWishlistLoadingForThis = wishlistLoading === product.id;
          const fullStars = Math.floor(product.rating);
          const emptyStars = 5 - Math.ceil(product.rating);
          
          return (
            <div 
              key={product.id} 
              className={cardStyles.craftedProductCard}
              onClick={handleCardClick}
              style={{ cursor: product.navigateUrl && product.navigateUrl !== '#' ? 'pointer' : 'default' }}
            >
              <div className={cardStyles.imageWrapper}>
                <img 
                  src={product.parent_main_image || product.image} 
                  alt={product.name} 
                  className={cardStyles.productImg1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                />
                <FaHeart
                  className={`${cardStyles.heartIcon} ${isInWishlist ? cardStyles.heartActive : ""}`}
                  onClick={handleWishlist}
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
                  handleCardClick();
                }}
              >
                {product.name}
              </h4>
              
              {product.description && (
                <p 
                  className={cardStyles.productDesc}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                >
                  {product.description}
                </p>
              )}
              
              <div className={cardStyles.productRating}>
                {"★".repeat(fullStars)}
                {"☆".repeat(emptyStars)}
                <span> ({product.reviewCount} reviews)</span>
                {(product.colorCount !== undefined || product.color_count !== undefined || product.variantCount !== undefined) && (product.colorCount || product.color_count || product.variantCount || 0) > 0 && (
                  <div className={cardStyles.colorSwatches} aria-hidden>
                    <span className={cardStyles.moreCount}>
                      {(product.colorCount || product.color_count || product.variantCount || 0)} color{((product.colorCount || product.color_count || product.variantCount || 0) !== 1) ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className={cardStyles.productPrices}>
                <span className={cardStyles.newPrice}>{product.price}</span>
              </div>

              <div className={cardStyles.actionRow}>
                <button 
                  className={cardStyles.buyBtn}
                  onClick={handleBuyNow}
                  disabled={isCartLoadingForThis}
                >
                  {isCartLoadingForThis ? 'Loading...' : 'Buy Now'}
                </button>
                <div className={cardStyles.productIcons}>
                  <FaHeart 
                    onClick={handleWishlist}
                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    style={{ 
                      color: isInWishlist ? themeColors.wishlist_icon_color : themeColors.wishlist_icon_inactive_color,
                      cursor: isWishlistLoadingForThis ? 'wait' : 'pointer',
                      opacity: isWishlistLoadingForThis ? 0.6 : 1
                    }}
                  />
                  <FaShoppingCart 
                    onClick={handleAddToCart}
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

      <div className={styles.viewAllContainer}>
        <button className={styles.viewAllButton}>{viewAllButtonText}</button>
      </div>
    </div>
  );
};

export default TrendingProducts;