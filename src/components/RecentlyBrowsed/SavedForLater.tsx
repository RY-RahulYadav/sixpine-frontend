import styles from './RecentlyBrowsed.module.css';

const SavedForLater = () => {
  // Mock data for saved items
  const savedItems = [
    {
      id: 1,
      name: "L-Shaped Office Desk",
      category: "Office Furniture",
      price: "₹12,999",
      originalPrice: "₹15,999",
      image: "/images/Home/studytable.jpg",
      savedAt: "2 days ago",
      rating: 4.6
    },
    {
      id: 2,
      name: "Tufted Fabric Sofa",
      category: "Living Room",
      price: "₹18,499",
      originalPrice: "₹22,999",
      image: "/images/Home/livingroom.jpg",
      savedAt: "5 days ago",
      rating: 4.8
    },
    {
      id: 3,
      name: "Premium Memory Foam Mattress",
      category: "Bedroom",
      price: "₹15,999",
      originalPrice: "₹19,999",
      image: "/images/Home/furnishing.jpg",
      savedAt: "1 week ago",
      rating: 4.9
    }
  ];

  return (
    <div className={styles.savedItemsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleContainer}>
          <h2 className={styles.sectionTitle}>Saved For Later</h2>
          <span className={styles.itemCount}>{savedItems.length} items</span>
        </div>
        
        <button className={styles.viewAllButton}>View All Saved Items</button>
      </div>
      
      <div className={styles.savedItemsGrid}>
        {savedItems.map(item => (
          <div key={item.id} className={styles.savedItem}>
            <div className={styles.savedImageContainer}>
              <img src={item.image} alt={item.name} className={styles.savedImage} />
              <span className={styles.savedTime}>Saved {item.savedAt}</span>
            </div>
            
            <div className={styles.savedDetails}>
              <div className={styles.itemCategory}>{item.category}</div>
              <h3 className={styles.itemName}>{item.name}</h3>
              
              <div className={styles.itemRating}>
                <span className={styles.ratingValue}>{item.rating}</span>
                <span className={styles.ratingIcon}>★</span>
              </div>
              
              <div className={styles.itemPricing}>
                <span className={styles.currentPrice}>{item.price}</span>
                <span className={styles.originalPrice}>{item.originalPrice}</span>
                <span className={styles.discount}>
                  {Math.round((1 - parseFloat(item.price.replace('₹', '').replace(',', '')) / 
                  parseFloat(item.originalPrice.replace('₹', '').replace(',', ''))) * 100)}% OFF
                </span>
              </div>
              
              <div className={styles.savedActions}>
                <button className={styles.moveToCartBtn}>Move to Cart</button>
                <button className={styles.removeBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedForLater;