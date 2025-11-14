import styles from './RecentlyBrowsed.module.css';

const RecommendedProducts = () => {
  // Mock data for recommended products
  const recommendedItems = [
    {
      id: 1,
      name: "Leather Office Chair",
      category: "Office Furniture",
      price: "₹8,299",
      image: "/images/Home/studytable.jpg",
      rating: 4.7,
      reviewCount: 243
    },
    {
      id: 2,
      name: "Glass Coffee Table",
      category: "Living Room",
      price: "₹4,599",
      image: "/images/Home/livingroom.jpg",
      rating: 4.5,
      reviewCount: 178
    },
    {
      id: 3,
      name: "King Size Bed Frame",
      category: "Bedroom",
      price: "₹14,999",
      image: "/images/Home/furnishing.jpg",
      rating: 4.8,
      reviewCount: 356
    },
    {
      id: 4,
      name: "Adjustable Desk Lamp",
      category: "Lighting",
      price: "₹1,499",
      image: "/images/Home/studytable.jpg",
      rating: 4.6,
      reviewCount: 129
    }
  ];

  return (
    <div className={styles.recommendedSection}>
      <h2 className={styles.sectionTitle}>Recommended Based on Your Browsing</h2>
      
      <div className={styles.recommendedGrid}>
        {recommendedItems.map(item => (
          <div key={item.id} className={styles.recommendedItem}>
            <div className={styles.itemImageContainer}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              <button className={styles.quickViewBtn}>Quick View</button>
            </div>
            <div className={styles.itemDetails}>
              <div className={styles.itemCategory}>{item.category}</div>
              <h3 className={styles.itemName}>{item.name}</h3>
              <div className={styles.itemRating}>
                <span className={styles.ratingValue}>{item.rating}</span>
                <span className={styles.ratingIcon}>★</span>
                <span className={styles.reviewCount}>({item.reviewCount})</span>
              </div>
              <div className={styles.itemPrice}>{item.price}</div>
              <button className={styles.addToCartBtn}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;