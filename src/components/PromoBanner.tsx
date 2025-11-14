import styles from './Banner.module.css';

interface BannerProps {
  type?: 'exclusive' | 'clearance';
  code?: string;
  backgroundImage?: string;
  discountText?: string;
}

const PromoBanner: React.FC<BannerProps> = ({
  type = 'exclusive',
  code = 'SIXPINE20',
  backgroundImage,
  discountText = 'Up to 40% OFF'
}) => {
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        <div className={styles.bannerTextContent}>
          {type === 'exclusive' ? (
            <>
              <div className={styles.exclusiveOffer}>EXCLUSIVE OFFER</div>
              <h2 className={styles.bannerTitle}>
                <span className={styles.titleStart}>Get </span>
                <span className={styles.highlightedText}>20% EXTRA OFF</span>
                <span className={styles.titleEnd}> on your first purchase</span>
              </h2>
              <div className={styles.codeContainer}>
                <span className={styles.codeText}>Use code</span>
                <span className={styles.promoCode}>{code}</span>
                <span className={styles.codeText}> at checkout</span>
              </div>
              <button className={styles.shopNowButton}>SHOP NOW</button>
              <div className={styles.termsText}>*Terms & conditions apply</div>
            </>
          ) : (
            <>
              <div className={styles.clearanceSale}>Clearance Sale</div>
              <h2 className={styles.categoryTitle}>Living Room Furniture</h2>
              <div className={styles.discountBadge}>{discountText}</div>
              <div className={styles.priceContainer}>
                <span className={styles.originalPrice}>₹65,999</span>
                <span className={styles.salePrice}>₹31,999</span>
              </div>
              <button className={styles.buyNowButton}>BUY NOW</button>
            </>
          )}
        </div>
      </div>
      <div className={styles.bannerImageContainer}>
        <img 
          src={backgroundImage || "/images/Home/livingroom.jpg"} 
          alt="Promotion" 
          className={styles.bannerImage}
        />
      </div>
    </div>
  );
};

export default PromoBanner;