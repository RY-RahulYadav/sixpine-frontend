import { useState, useEffect } from 'react';
import styles from './BestDeals.module.css';

const BestDealsHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 2,
    hours: 8,
    minutes: 45,
    seconds: 30
  });

  // Mock data for hero deals
  const deals = [
    {
      id: 1,
      title: "Mega Savings Week",
      subtitle: "Home Office Essentials",
      discount: "Up to 60% OFF",
      originalPrice: "₹15,999",
      salePrice: "₹7,999",
      buttonText: "SHOP NOW",
      backgroundColor: "#FF5722",
      imageSrc: "/images/Home/studytable.jpg"
    },
    {
      id: 2,
      title: "Limited Time Offer",
      subtitle: "Bedroom Collections",
      discount: "Up to 50% OFF",
      originalPrice: "₹24,999",
      salePrice: "₹12,499",
      buttonText: "GRAB DEAL",
      backgroundColor: "#4CAF50",
      imageSrc: "/images/Home/furnishing.jpg"
    },
    {
      id: 3,
      title: "Clearance Sale",
      subtitle: "Living Room Furniture",
      discount: "Up to 40% OFF",
      originalPrice: "₹35,999",
      salePrice: "₹21,599",
      buttonText: "BUY NOW",
      backgroundColor: "#2196F3",
      imageSrc: "/images/Home/livingroom.jpg"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % deals.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + deals.length) % deals.length);
  };

  useEffect(() => {
    // Auto-slide carousel
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Countdown timer logic
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 2, hours: 8, minutes: 45, seconds: 30 }; // Reset timer when it reaches zero
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.heroContainer}>
      <div className={styles.dealCountdown}>
        <div className={styles.countdownTitle}>Deal Ends In:</div>
        <div className={styles.countdownTimers}>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{timeRemaining.days}</span>
            <span className={styles.timeLabel}>Days</span>
          </div>
          <div className={styles.timeSeparator}>:</div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{timeRemaining.hours.toString().padStart(2, '0')}</span>
            <span className={styles.timeLabel}>Hours</span>
          </div>
          <div className={styles.timeSeparator}>:</div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{timeRemaining.minutes.toString().padStart(2, '0')}</span>
            <span className={styles.timeLabel}>Mins</span>
          </div>
          <div className={styles.timeSeparator}>:</div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{timeRemaining.seconds.toString().padStart(2, '0')}</span>
            <span className={styles.timeLabel}>Secs</span>
          </div>
        </div>
      </div>

      <div 
        className={styles.mainCarousel}
        style={{ backgroundColor: deals[currentSlide].backgroundColor }}
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
          {/* Deal Text Content */}
          <div className={styles.dealText}>
            <div className={styles.dealLabel}>{deals[currentSlide].title}</div>
            <h1 className={styles.dealTitle}>{deals[currentSlide].subtitle}</h1>
            <div className={styles.discountBadge}>{deals[currentSlide].discount}</div>
            <div className={styles.priceSection}>
              <span className={styles.originalPrice}>{deals[currentSlide].originalPrice}</span>
              <span className={styles.salePrice}>{deals[currentSlide].salePrice}</span>
            </div>
            <button className={styles.dealButton}>{deals[currentSlide].buttonText}</button>
          </div>

          {/* Deal Product Image */}
          <div className={styles.dealImage}>
            <img
              src={deals[currentSlide].imageSrc}
              alt={deals[currentSlide].subtitle}
              className={styles.productImg}
            />
          </div>
        </div>

        {/* Slide Indicators */}
        <div className={styles.slideIndicators}>
          {deals.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Deal Stats Banner */}
      <div className={styles.dealStats}>
        <div className={styles.dealStat}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.statText}>
            <div className={styles.statTitle}>Free Shipping</div>
            <div className={styles.statSubtitle}>On orders over ₹1000</div>
          </div>
        </div>

        <div className={styles.dealStatDivider}></div>

        <div className={styles.dealStat}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.statText}>
            <div className={styles.statTitle}>Limited Time</div>
            <div className={styles.statSubtitle}>New deals every day</div>
          </div>
        </div>

        <div className={styles.dealStatDivider}></div>

        <div className={styles.dealStat}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H16.5C17.1667 7 18.5 6.2 18.5 4C18.5 1.8 16.6667 2 16 2C15.3333 2 14 2 14 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H7.5C6.83333 7 5.5 6.2 5.5 4C5.5 1.8 7.33333 2 8 2C8.66667 2 10 2 10 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.statText}>
            <div className={styles.statTitle}>Exclusive Gifts</div>
            <div className={styles.statSubtitle}>With selected items</div>
          </div>
        </div>

        <div className={styles.dealStatDivider}></div>

        <div className={styles.dealStat}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.statText}>
            <div className={styles.statTitle}>Save for Later</div>
            <div className={styles.statSubtitle}>Bookmark your favorites</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestDealsHero;