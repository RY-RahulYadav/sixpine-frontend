import styles from './BestDeals.module.css';

const DealsCategories = () => {
  // Mock data for deals categories
  const categories = [
    {
      id: 1,
      name: "Home Office",
      image: "/images/Home/studytable.jpg",
      discount: "Up to 55% OFF",
      itemCount: 128
    },
    {
      id: 2,
      name: "Living Room",
      image: "/images/Home/livingroom.jpg",
      discount: "Up to 60% OFF",
      itemCount: 193
    },
    {
      id: 3,
      name: "Bedroom",
      image: "/images/Home/furnishing.jpg",
      discount: "Up to 50% OFF",
      itemCount: 167
    },
    {
      id: 4,
      name: "Dining",
      image: "/images/Home/livingroom.jpg",
      discount: "Up to 45% OFF",
      itemCount: 94
    },
    {
      id: 5,
      name: "Lighting",
      image: "/images/Home/studytable.jpg",
      discount: "Up to 65% OFF",
      itemCount: 76
    },
    {
      id: 6,
      name: "Decor",
      image: "/images/Home/furnishing.jpg",
      discount: "Up to 40% OFF",
      itemCount: 215
    }
  ];

  return (
    <div className={styles.dealsCategoriesSection}>
      <h2 className={styles.sectionTitle}>
        Shop by <span className={styles.highlightText}>Category</span>
      </h2>
      <p className={styles.sectionSubtitle}>Explore amazing deals across popular categories</p>

      <div className={styles.categoryGrid}>
        {categories.map(category => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.categoryImageContainer}>
              <img src={category.image} alt={category.name} className={styles.categoryImage} />
              <div className={styles.categoryOverlay}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <div className={styles.categoryDiscount}>{category.discount}</div>
                <div className={styles.categoryCount}>{category.itemCount} items</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsCategories;