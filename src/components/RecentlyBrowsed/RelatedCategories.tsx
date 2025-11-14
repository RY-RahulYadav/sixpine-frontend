import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import styles from './RecentlyBrowsed.module.css';

interface BrowsedCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  product_count: number;
  browsed_product_count: number;
}

const RelatedCategories = () => {
  const [categories, setCategories] = useState<BrowsedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrowsedCategories();
  }, []);

  const fetchBrowsedCategories = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getBrowsedCategories();
      setCategories(response.data.results || []);
    } catch (error) {
      console.error('Error fetching browsed categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (slug: string) => {
    // Navigate to products page with category filter auto-selected
    navigate(`/products?category=${slug}`);
  };

  if (loading) {
    return (
      <div className={styles.relatedCategoriesSection}>
        <div className={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={styles.relatedCategoriesSection}>
        <h2 className={styles.sectionTitle}>Categories You've Browsed</h2>
        <div className={styles.emptyState}>
          <p>Start browsing products to see categories here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.relatedCategoriesSection}>
      <h2 className={styles.sectionTitle}>Categories You've Browsed</h2>
      
      <div className={styles.categoriesGrid}>
        {categories.map(category => (
          <div 
            key={category.id} 
            className={styles.categoryCard}
            onClick={() => handleCategoryClick(category.slug)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.categoryImageContainer}>
              <img 
                src={category.image || '/images/placeholder.jpg'} 
                alt={category.name} 
                className={styles.categoryImage} 
              />
              <div className={styles.categoryOverlay}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <div className={styles.productCount}>
                  {category.product_count} products
                </div>
                <button 
                  className={styles.exploreBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(category.slug);
                  }}
                >
                  Explore
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedCategories;