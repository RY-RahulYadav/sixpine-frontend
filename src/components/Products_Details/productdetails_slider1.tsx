import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { wishlistAPI } from "../../services/api";
import styles from "./productdetails_slider1.module.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";

// Product Interface
export interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
  id?: number;
  productId?: number;
  slug?: string;
  productSlug?: string;  // Alternative field name for slug
  variantCount?: number;
  variants_count?: number;
}

// Component Props Interface
interface ProductDetailsSliderProps {
  title: string;
  products: Product[];
}

const Crafted: React.FC<ProductDetailsSliderProps> = ({ title, products }) => {
  const navigate = useNavigate();
  const { state, addToCart } = useApp();
  const slider1 = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hearts, setHearts] = useState(() => products.map(() => false));
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());
  const [cartLoading, setCartLoading] = useState<number | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 425);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check wishlist status for all products
  useEffect(() => {
    if (state.isAuthenticated) {
      checkWishlistStatus();
    }
  }, [state.isAuthenticated, products]);

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

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = isMobile ? ref.current.offsetWidth : 300;
      ref.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleProductClick = (product: Product) => {
    // Always use slug for navigation - never use ID
    const slug = product.slug || product.productSlug;
    if (slug) {
      navigate(`/products-details/${slug}`);
    } else {
      console.warn('Product slug not available for navigation:', product);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const productId = product.id || product.productId;
    const slug = product.slug || product.productSlug;
    
    if (state.isAuthenticated && productId) {
      setCartLoading(productId);
      try {
        await addToCart(productId, 1);
        navigate('/checkout');
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        // Always use slug for navigation
        if (slug) {
          navigate(`/products-details/${slug}`);
        }
      } finally {
        setCartLoading(null);
      }
    } else if (slug) {
      // Always use slug for navigation
      navigate(`/products-details/${slug}`);
    } else if (!state.isAuthenticated) {
      navigate('/login');
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const productId = product.id || product.productId;
    
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!productId) {
      alert('Product ID is missing. Please try again.');
      return;
    }

    setCartLoading(productId);
    try {
      await addToCart(productId, 1);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
      alert(errorMsg);
    } finally {
      setCartLoading(null);
    }
  };

  const handleWishlist = async (e: React.MouseEvent, product: Product, idx: number) => {
    e.stopPropagation();
    const productId = product.id || product.productId;
    
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!productId) {
      alert('Product ID is missing. Please try again.');
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
          setHearts(prev => {
            const copy = [...prev];
            copy[idx] = false;
            return copy;
          });
        }
      } else {
        // Add to wishlist
        await wishlistAPI.addToWishlist(productId);
        setWishlistItems(prev => new Set(prev).add(productId));
        setHearts(prev => {
          const copy = [...prev];
          copy[idx] = true;
          return copy;
        });
      }
      
      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error: any) {
      console.error('Wishlist error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update wishlist';
      alert(errorMsg);
    } finally {
      setWishlistLoading(null);
    }
  };

  const renderProducts = (productList: Product[]) =>
    productList.map((p, idx) => {
      const productId = p.id || p.productId;
      const isInWishlist = productId ? wishlistItems.has(productId) : hearts[idx];
      const isCartLoadingForThis = cartLoading === productId;
      const isWishlistLoadingForThis = wishlistLoading === productId;
      const hasNavigation = !!(p.slug || productId);

      return (
        <div 
          className={styles.craftedProductCard} 
          key={idx}
          style={{ cursor: hasNavigation ? 'pointer' : 'default' }}
          onClick={() => handleProductClick(p)}
        >
          <div className={styles.imageWrapper}>
            <img 
              src={p.img} 
              alt={p.title} 
              className={styles.productImg1}
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(p);
              }}
              style={{ cursor: hasNavigation ? 'pointer' : 'default' }}
            />
            {/* ❤️ Heart Icon */}
            <FaHeart
              className={`${styles.heartIcon} ${
                isInWishlist ? styles.heartActive : ""
              }`}
              onClick={(e) => handleWishlist(e, p, idx)}
              style={{ 
                cursor: isWishlistLoadingForThis ? 'wait' : 'pointer',
                opacity: isWishlistLoadingForThis ? 0.6 : 1
              }}
            />
          </div>

          <h4 
            className={styles.productTitle}
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(p);
            }}
            style={{ cursor: hasNavigation ? 'pointer' : 'default' }}
          >
            {p.title}
          </h4>
          <p 
            className={styles.productDesc}
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(p);
            }}
            style={{ cursor: hasNavigation ? 'pointer' : 'default' }}
          >
            {p.desc}
          </p>

          <div className={styles.productRating}>
            {"★".repeat(Math.floor(p.rating))}
            {"☆".repeat(5 - Math.floor(p.rating))}
            <span> ({p.reviews} reviews)</span>
            {(p.variantCount !== undefined || p.variants_count !== undefined) && (
              <div className={styles.colorSwatches} aria-hidden>
                <span className={styles.moreCount}>
                  {(p.variantCount || p.variants_count || 0)} variant{(p.variantCount || p.variants_count || 0) !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className={styles.productPrices}>
            <span className={styles.newPrice}>{p.newPrice}</span>
            {p.oldPrice && p.oldPrice !== '' && (
              <span className={styles.oldPrice}>{p.oldPrice}</span>
            )}
          </div>

          <div className={styles.actionRow}>
            <button 
              className={styles.buyBtn}
              onClick={(e) => handleBuyNow(e, p)}
              disabled={isCartLoadingForThis}
            >
              {isCartLoadingForThis ? 'Loading...' : 'Buy Now'}
            </button>
            <div className={styles.productIcons}>
              <FaShoppingCart 
                onClick={(e) => handleAddToCart(e, p)}
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
    });

  return (
    <div className={styles.craftedContainer}>
      <div className={styles.craftedSliderSection}>
        <h3 className={styles.sliderTitle}>{title}</h3>
        <div className={styles.sliderWrapper}>
          <button
            className={`${styles.sliderArrow} ${styles.left}`}
            onClick={() => scroll(slider1, "left")}
          >
            <FaChevronLeft />
          </button>
          <div className={styles.craftedSlider} ref={slider1}>
            {renderProducts(products)}
          </div>
          <button
            className={`${styles.sliderArrow} ${styles.right}`}
            onClick={() => scroll(slider1, "right")}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Crafted;
