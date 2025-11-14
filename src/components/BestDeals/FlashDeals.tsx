import { useState, useEffect } from 'react';
import styles from './BestDeals.module.css';

const FlashDeals = () => {
  // Mock data for flash deals
  const flashDeals = [
    {
      id: 1,
      name: "Modern TV Unit",
      image: "/images/Home/livingroom.jpg",
      originalPrice: "₹14,999",
      salePrice: "₹8,999",
      discount: "40%",
      timeLeft: 14400, // 4 hours in seconds
      availability: 85, // percentage
    },
    {
      id: 2,
      name: "Designer Sofa Set",
      image: "/images/Home/furnishing.jpg",
      originalPrice: "₹45,999",
      salePrice: "₹29,999",
      discount: "35%",
      timeLeft: 7200, // 2 hours in seconds
      availability: 25, // percentage
    },
    {
      id: 3,
      name: "Luxury Dining Table",
      image: "/images/Home/studytable.jpg",
      originalPrice: "₹32,999",
      salePrice: "₹19,799",
      discount: "40%",
      timeLeft: 10800, // 3 hours in seconds
      availability: 60, // percentage
    }
  ];

  const [deals, setDeals] = useState(flashDeals);

  useEffect(() => {
    // Countdown timer logic
    const interval = setInterval(() => {
      setDeals(prevDeals => 
        prevDeals.map(deal => ({
          ...deal,
          timeLeft: deal.timeLeft > 0 ? deal.timeLeft - 1 : 0
        }))
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Format time left as HH:MM:SS
  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.flashDealsSection}>
      <div className={styles.flashHeader}>
        <div className={styles.flashTitle}>
          <span className={styles.flashIcon}>⚡</span>
          <h2 className={styles.sectionTitle}>Flash Deals</h2>
        </div>
        <button className={styles.viewAllButton}>See All</button>
      </div>
      
      <div className={styles.flashCardsContainer}>
        {deals.map(deal => (
          <div key={deal.id} className={styles.flashCard}>
            <div className={styles.flashImageContainer}>
              <img src={deal.image} alt={deal.name} className={styles.flashImage} />
              <div className={styles.flashDiscount}>-{deal.discount}</div>
            </div>
            
            <div className={styles.flashContent}>
              <h3 className={styles.flashName}>{deal.name}</h3>
              
              <div className={styles.flashPricing}>
                <span className={styles.flashSalePrice}>{deal.salePrice}</span>
                <span className={styles.flashOriginalPrice}>{deal.originalPrice}</span>
              </div>
              
              <div className={styles.flashAvailability}>
                <div className={styles.availabilityText}>
                  <span>Availability</span>
                  <span>{deal.availability}%</span>
                </div>
                <div className={styles.availabilityBar}>
                  <div 
                    className={styles.availabilityFill} 
                    style={{ width: `${deal.availability}%` }}
                  ></div>
                </div>
              </div>
              
              <div className={styles.flashTimer}>
                <div className={styles.timerIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.timerText}>
                  {formatTimeLeft(deal.timeLeft)}
                </div>
              </div>
              
              <button className={styles.flashButton}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashDeals;