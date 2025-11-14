import { useState, useEffect } from 'react';
import styles from './BestDeals.module.css';
import { homepageAPI } from '../../services/api';

interface Banner {
  id: number;
  label: string;
  heading: string;
  accentText: string;
  description: string;
  promoCode: string;
  image: string;
  buttonText: string;
  navigateUrl?: string;
}

const DealsBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Default banner data
  const defaultBanners: Banner[] = [
    {
      id: 1,
      label: 'EXCLUSIVE OFFER',
      heading: 'Get 20% EXTRA OFF on your first purchase',
      accentText: '20% EXTRA OFF',
      description: 'Use code SIXPINE20 at checkout',
      promoCode: 'SIXPINE20',
      image: '/images/Home/livingroom.jpg',
      buttonText: 'SHOP NOW',
      navigateUrl: '#'
    },
    {
      id: 2,
      label: 'MEGA SALE',
      heading: 'Up to 50% OFF on Furniture',
      accentText: '50% OFF',
      description: 'Limited time offer on selected items',
      promoCode: 'MEGA50',
      image: '/images/Home/studytable.jpg',
      buttonText: 'GRAB DEALS',
      navigateUrl: '#'
    },
    {
      id: 3,
      label: 'SPECIAL DEAL',
      heading: 'Buy 2 Get 1 FREE on Home Decor',
      accentText: 'Buy 2 Get 1 FREE',
      description: 'Use code B2G1FREE at checkout',
      promoCode: 'B2G1FREE',
      image: '/images/Home/furnishing.jpg',
      buttonText: 'EXPLORE NOW',
      navigateUrl: '#'
    }
  ];

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      const response = await homepageAPI.getHomepageContent('best-deals-banner');
      console.log('DealsBanner API Response:', response.data);
      
      // Check if admin data exists and is valid
      if (response.data && response.data.content) {
        const bannersData = response.data.content.banners;
        if (bannersData && Array.isArray(bannersData) && bannersData.length > 0) {
          console.log('Using admin banner data:', bannersData);
          // Use admin data
          setBanners(bannersData);
        } else {
          console.log('Admin data exists but banners array is empty or invalid, using defaults');
          // No valid banners in admin data, use defaults
          setBanners(defaultBanners);
        }
      } else {
        console.log('No admin banner content found, using defaults');
        // No admin data, use defaults
        setBanners(defaultBanners);
      }
    } catch (error: any) {
      // If 404 or no data, use defaults (this is expected behavior)
      if (error.response?.status === 404) {
        console.log('No admin banner data found (404), using defaults');
      } else {
        console.error('Error fetching deals banner:', error);
      }
      // Use defaults when no admin data exists
      setBanners(defaultBanners);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play carousel every 2 seconds
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrevSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.navigateUrl && banner.navigateUrl !== '#') {
      window.location.href = banner.navigateUrl;
    }
  };

  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentSlide];

  return (
    <div className={styles.dealsBannerSection}>
      <div className={styles.bannerContainer}>
        <div className={styles.bannerContent}>
          <span className={styles.bannerLabel}>{currentBanner.label}</span>
          <h2 className={styles.bannerHeading}>
            {currentBanner.heading.split(currentBanner.accentText)[0]}
            <span className={styles.accentText}>{currentBanner.accentText}</span>
            {currentBanner.heading.split(currentBanner.accentText)[1]}
          </h2>
          <p className={styles.bannerDescription}>
            {currentBanner.description.split(currentBanner.promoCode)[0]}
            <span className={styles.promoCode}>{currentBanner.promoCode}</span>
            {currentBanner.description.split(currentBanner.promoCode)[1]}
          </p>
          <div className={styles.bannerCta}>
            <button 
              className={styles.shopNowButton}
              onClick={() => handleBannerClick(currentBanner)}
            >
              {currentBanner.buttonText}
            </button>
            <div className={styles.termsText}>*Terms & conditions apply</div>
          </div>
        </div>
        
        <div className={styles.bannerImageContainer}>
          <img 
            src={currentBanner.image} 
            alt={currentBanner.label} 
            className={styles.bannerImage}
          />
        </div>

        {/* Navigation Arrows */}
        <button 
          className={`${styles.bannerNavArrow} ${styles.bannerNavArrowLeft}`}
          onClick={handlePrevSlide}
          aria-label="Previous banner"
        >
          ‹
        </button>
        <button 
          className={`${styles.bannerNavArrow} ${styles.bannerNavArrowRight}`}
          onClick={handleNextSlide}
          aria-label="Next banner"
        >
          ›
        </button>

        {/* Slide Indicators */}
        <div className={styles.bannerIndicators}>
          {banners.map((_, index) => (
            <button
              key={index}
              className={`${styles.bannerIndicator} ${index === currentSlide ? styles.bannerIndicatorActive : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealsBanner;