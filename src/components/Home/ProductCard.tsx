import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { wishlistAPI } from "../../services/api";
import { useApp } from "../../context/AppContext";
import { useNotification } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import styles from "./bannerCards.module.css";

interface ProductCardProps {
  id: number;
  title: string;
  subtitle?: string;
  desc?: string;
  image: string;
  img?: string;
  rating: number;
  reviews: number;
  price: string;
  oldPrice?: string;
  newPrice?: string;
  productSlug?: string;
  productId?: number;
  navigateUrl?: string;
  variantCount?: number;
  colorCount?: number;
  color_count?: number;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onBuyNow?: (e: React.MouseEvent) => void;
  onWishlist?: (e: React.MouseEvent) => void;
  onAddToCart?: (e: React.MouseEvent) => void;
}

const ProductCard = ({
  id: _id,
  title,
  subtitle,
  desc,
  image,
  img,
  rating,
  reviews,
  price,
  oldPrice,
  newPrice,
  productSlug,
  productId,
  navigateUrl,
  variantCount,
  colorCount,
  color_count,
  onImageError,
  onBuyNow,
  onWishlist,
  onAddToCart,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { state, addToCart } = useApp();
  const { showError } = useNotification();
  const { colors: themeColors } = useTheme();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    if (state.isAuthenticated && productId) {
      checkWishlistStatus();
    }
  }, [state.isAuthenticated, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      if (response.data && response.data.results) {
        const wishlistItem = response.data.results.find(
          (item: any) => item.product?.id === productId
        );
        if (wishlistItem) {
          setIsInWishlist(true);
          setWishlistItemId(wishlistItem.id);
        }
      }
    } catch (error) {
      // Silently fail - user might not be authenticated
    }
  };

  const handleProductClick = () => {
    const url = navigateUrl || (productSlug ? `/products-details/${productSlug}` : null);
    if (url) {
      navigate(url);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(e);
      return;
    }
    
    // If user is authenticated and productId exists, add to cart and navigate to checkout
    if (state.isAuthenticated && productId) {
      try {
        await addToCart(productId, 1);
        navigate('/checkout');
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        // If add to cart fails, just navigate to product details
        if (productSlug) {
          navigate(`/products-details/${productSlug}`);
        } else if (navigateUrl) {
          navigate(navigateUrl);
        }
      }
    } else if (productSlug) {
      // Not authenticated or no productId, just navigate to product details
      navigate(`/products-details/${productSlug}`);
    } else if (navigateUrl) {
      navigate(navigateUrl);
    } else if (!state.isAuthenticated) {
      // Not authenticated, redirect to login
      navigate('/login');
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onWishlist) {
      onWishlist(e);
      return;
    }

    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!productId) {
      console.error('Product ID is required for wishlist');
      return;
    }

    setIsWishlistLoading(true);
    try {
      if (isInWishlist && wishlistItemId) {
        // Remove from wishlist
        await wishlistAPI.removeFromWishlist(wishlistItemId);
        setIsInWishlist(false);
        setWishlistItemId(null);
        // Trigger wishlist update event
        window.dispatchEvent(new Event('wishlistUpdated'));
      } else {
        // Add to wishlist
        const response = await wishlistAPI.addToWishlist(productId);
        if (response.data && response.data.data) {
          setIsInWishlist(true);
          setWishlistItemId(response.data.data.id);
          // Trigger wishlist update event
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update wishlist';
      showError(errorMsg);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onAddToCart) {
      onAddToCart(e);
      return;
    }

    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!productId) {
      console.error('Product ID is required for adding to cart');
      showError('Product ID is missing. Please try again.');
      return;
    }

    setIsCartLoading(true);
    try {
      await addToCart(productId, 1);
      // Cart sidebar will open automatically via AppContext
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
      showError(errorMsg);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onImageError) {
      onImageError(e);
    } else {
      const target = e.target as HTMLImageElement;
      target.src = '/images/placeholder-product.png';
      target.onerror = null;
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{ color: i <= rating ? '#f39c12' : '#e0e0e0' }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const imageSrc = image || img || '/images/placeholder-product.png';
  const displayPrice = newPrice || price;
  const displayDesc = desc || subtitle || '';

  // Format description to preserve line breaks
  const formatDescription = (text: string) => {
    if (!text) return '';
    // Preserve line breaks by splitting and joining with <br />
    return text.split('\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div 
      className={styles.craftedProductCard}
      style={{ cursor: productSlug ? 'pointer' : 'default' }}
    >
      <img 
        src={imageSrc} 
        alt={title} 
        className={styles.productImg1}
        onError={handleImageError}
        onClick={handleProductClick}
        style={{ cursor: productSlug ? 'pointer' : 'default' }}
      />
      <h4 
        className={styles.productTitle}
        onClick={handleProductClick}
        style={{ cursor: productSlug ? 'pointer' : 'default' }}
      >
        {title}
      </h4>
      <p 
        className={styles.productDesc}
        onClick={handleProductClick}
        style={{ cursor: productSlug ? 'pointer' : 'default' }}
      >
        {formatDescription(displayDesc)}
      </p>
      
      <div className={styles.productRating}>
        {renderStars(rating)}
        <span> ({reviews} reviews)</span>
        {(colorCount !== undefined || color_count !== undefined || variantCount !== undefined) && (colorCount || color_count || variantCount || 0) > 0 && (
          <div className={styles.colorSwatches} aria-hidden>
            <span className={styles.moreCount}>{(colorCount || color_count || variantCount || 0)} color{((colorCount || color_count || variantCount || 0) !== 1) ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      <div className={styles.productPrices}>
        {oldPrice && oldPrice !== '' && (
          <span className={styles.oldPrice}>{oldPrice}</span>
        )}
        <span className={styles.newPrice}>{displayPrice}</span>
      </div>

      <div className={styles.actionRow}>
        <button 
          className={styles.buyBtn}
          onClick={handleBuyNow}
          disabled={isCartLoading}
        >
          {isCartLoading ? 'Loading...' : 'Buy Now'}
        </button>
        <div className={styles.productIcons}>
          <FaHeart 
            onClick={handleWishlist}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            style={{ 
              color: isInWishlist ? themeColors.wishlist_icon_color : themeColors.wishlist_icon_inactive_color,
              cursor: isWishlistLoading ? 'wait' : 'pointer',
              opacity: isWishlistLoading ? 0.6 : 1
            }}
          />
          <FaShoppingCart 
            onClick={handleAddToCart}
            title="Add to Cart"
            style={{ 
              color: themeColors.cart_icon_color,
              cursor: isCartLoading ? 'wait' : 'pointer',
              opacity: isCartLoading ? 0.6 : 1
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

