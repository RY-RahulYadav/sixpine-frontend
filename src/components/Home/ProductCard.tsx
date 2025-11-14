import { FaHeart, FaShoppingCart } from "react-icons/fa";
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
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onBuyNow?: (e: React.MouseEvent) => void;
  onWishlist?: (e: React.MouseEvent) => void;
  onAddToCart?: (e: React.MouseEvent) => void;
}

const ProductCard = ({
  id,
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
  onImageError,
  onBuyNow,
  onWishlist,
  onAddToCart,
}: ProductCardProps) => {
  const handleProductClick = () => {
    if (productSlug) {
      window.location.href = `/products-details/${productSlug}`;
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(e);
    } else if (productSlug) {
      window.location.href = `/products-details/${productSlug}`;
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWishlist) {
      onWishlist(e);
    } else {
      console.log('Add to wishlist:', id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(e);
    } else {
      console.log('Add to cart:', id);
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
        {displayDesc}
      </p>
      
      <div className={styles.productRating}>
        {renderStars(rating)}
        <span> ({reviews} reviews)</span>
        <div className={styles.colorSwatches} aria-hidden>
          <span className={styles.moreCount}>+3 color</span>
        </div>
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
        >
          Buy Now
        </button>
        <div className={styles.productIcons}>
          <FaHeart 
            onClick={handleWishlist}
            title="Add to Wishlist"
          />
          <FaShoppingCart 
            onClick={handleAddToCart}
            title="Add to Cart"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

