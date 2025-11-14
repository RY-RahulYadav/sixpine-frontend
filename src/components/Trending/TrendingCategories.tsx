import { useState, useEffect } from 'react';
import styles from './Trending.module.css';
import { homepageAPI } from '../../services/api';

const defaultCategories = [
  {
    id: 1,
    name: "Living Room",
    image: "/images/Home/livingroom.jpg",
    itemCount: 240,
    trending: "+15% this week",
    navigateUrl: "/products?category=living-room"
  },
  {
    id: 2,
    name: "Bedroom",
    image: "/images/Home/furnishing.jpg",
    itemCount: 186,
    trending: "+12% this week",
    navigateUrl: "/products?category=bedroom"
  },
  {
    id: 3,
    name: "Home Office",
    image: "/images/Home/studytable.jpg",
    itemCount: 154,
    trending: "+28% this week",
    navigateUrl: "/products?category=home-office"
  },
  {
    id: 4,
    name: "Kitchen & Dining",
    image: "/images/Home/furnishing.jpg",
    itemCount: 205,
    trending: "+8% this week",
    navigateUrl: "/products?category=kitchen-dining"
  },
  {
    id: 5,
    name: "Home Decor",
    image: "/images/Home/livingroom.jpg",
    itemCount: 310,
    trending: "+20% this week",
    navigateUrl: "/products?category=home-decor"
  },
  {
    id: 6,
    name: "Outdoor Furniture",
    image: "/images/Home/studytable.jpg",
    itemCount: 128,
    trending: "+5% this week",
    navigateUrl: "/products?category=outdoor-furniture"
  }
];

const TrendingCategories = () => {
  const [categories, setCategories] = useState(defaultCategories);
  const [, setSectionTitle] = useState('Popular Trending Categories');
  const [sectionSubtitle, setSectionSubtitle] = useState('Explore trending categories shoppers are loving');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('trending-categories');
        
        if (response.data && response.data.content) {
          if (response.data.content.categories && Array.isArray(response.data.content.categories)) {
            // Map categories and ensure navigateUrl exists
            const mappedCategories = response.data.content.categories.map((cat: any) => ({
              ...cat,
              navigateUrl: cat.navigateUrl || cat.url || '#'
            }));
            setCategories(mappedCategories);
          }
          if (response.data.content.sectionTitle) {
            setSectionTitle(response.data.content.sectionTitle);
          }
          if (response.data.content.sectionSubtitle) {
            setSectionSubtitle(response.data.content.sectionSubtitle);
          }
        }
      } catch (error) {
        console.error('Error fetching trending categories data:', error);
        // Keep default categories if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesData();
  }, []);

  if (loading) {
    return (
      <div className={styles.trendingCategoriesSection}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.trendingCategoriesSection}>
      <h2 className={styles.sectionTitle}>
        Popular <span className={styles.highlightTitle}>Trending Categories</span>
      </h2>
      <p className={styles.sectionSubtitle}>{sectionSubtitle}</p>

      <div className={styles.categoriesGrid}>
        {categories.map(category => {
          const handleCategoryClick = () => {
            if (category.navigateUrl && category.navigateUrl !== '#') {
              window.location.href = category.navigateUrl;
            }
          };
          
          return (
            <div 
              key={category.id} 
              className={styles.categoryCard}
              onClick={handleCategoryClick}
              style={{ cursor: category.navigateUrl && category.navigateUrl !== '#' ? 'pointer' : 'default' }}
            >
              <div className={styles.categoryImageContainer}>
                <img src={category.image} alt={category.name} className={styles.categoryImage} />
                <div className={styles.categoryOverlay}>
                  <span className={styles.categoryName}>{category.name}</span>
                  <div className={styles.categoryMeta}>
                    <span className={styles.itemCount}>{category.itemCount} items</span>
                    <span className={styles.trendingIndicator}>{category.trending}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingCategories;