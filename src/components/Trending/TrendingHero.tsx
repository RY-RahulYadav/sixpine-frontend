import React, { useState, useEffect } from 'react';
import styles from './Trending.module.css';
import { homepageAPI } from '../../services/api';

const defaultSlides = [
  {
    id: 1,
    title: "Trending Now",
    subtitle: "Bestsellers 2025",
    price: "₹ 1,999",
    buttonText: "SHOP NOW",
    backgroundColor: "#4A6FA5",
    imageSrc: "/images/Home/furnishing.jpg"
  },
  {
    id: 2,
    title: "Most Popular",
    subtitle: "Hot Items",
    price: "₹ 3,499",
    buttonText: "SHOP NOW",
    backgroundColor: "#6B4A8C",
    imageSrc: "/images/Home/studytable.jpg"
  },
  {
    id: 3,
    title: "Fan Favorites",
    subtitle: "Top Rated Collection",
    price: "₹ 5,999",
    buttonText: "SHOP NOW",
    backgroundColor: "#9E4A5A",
    imageSrc: "/images/Home/livingroom.jpg"
  }
];

const defaultStats = [
  {
    statNumber: '50K+',
    statLabel: 'Customers Loved These'
  },
  {
    statNumber: '4.8',
    statLabel: 'Average Rating'
  },
  {
    statNumber: '24hr',
    statLabel: 'Trending Updates'
  }
];

const TrendingHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const [trendingStats, setTrendingStats] = useState(defaultStats);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('trending-hero');
        
        if (response.data && response.data.content) {
          if (response.data.content.slides && Array.isArray(response.data.content.slides)) {
            setSlides(response.data.content.slides);
          }
          if (response.data.content.trendingStats && Array.isArray(response.data.content.trendingStats)) {
            setTrendingStats(response.data.content.trendingStats);
          }
        }
      } catch (error) {
        console.error('Error fetching trending hero data:', error);
        // Keep default slides if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`${styles.heroContainer} heroContainer`}>
      <div className={styles.heroWrapper}>
        <div
          className={styles.mainCarousel}
          style={{ backgroundColor: slides[currentSlide].backgroundColor }}
        >
          {/* Navigation Arrows */}
          <button className={`${styles.navArrow} ${styles.navArrowLeft}`} onClick={prevSlide}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button className={`${styles.navArrow} ${styles.navArrowRight}`} onClick={nextSlide}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Slide Content */}
          <div className={styles.slideContent}>
            {/* Text Content */}
            <div className={styles.slideText}>
              <p className={styles.slideSubtitle}>{slides[currentSlide].title}</p>
              <h1 className={styles.slideTitle}>{slides[currentSlide].subtitle}</h1>
              <div className={styles.priceSection}>
                <p className={styles.startingFrom}>Starting From</p>
                <div className={styles.priceContainer}>
                  <span className={styles.price}>{slides[currentSlide].price}</span>
                  <span className={styles.asterisk}>*</span>
                </div>
              </div>
              <button className={styles.buyNowBtn}>{slides[currentSlide].buttonText}</button>
            </div>

            {/* Product Image */}
            <div className={styles.productImage}>
              <div className={styles.imagePlaceholder}>
                <img
                  src={slides[currentSlide].imageSrc}
                  alt={slides[currentSlide].subtitle}
                  className={styles.productImg}
                />
              </div>
            </div>
          </div>

          {/* Brand Logo */}
          <div className={styles.brandLogo}>T&C Apply</div>

          {/* Slide Indicators */}
          <div className={styles.slideIndicators}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Trending Stats Banner */}
      <div className={styles.trendingStats}>
        {trendingStats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stat.statNumber}</span>
              <span className={styles.statLabel}>{stat.statLabel}</span>
            </div>
            {index < trendingStats.length - 1 && <div className={styles.statDivider}></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TrendingHero;