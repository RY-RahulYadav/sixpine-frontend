import { useState, useEffect } from 'react';
import styles from './Trending.module.css';
import { homepageAPI } from '../../services/api';

const defaultAnalytics = [
  {
    id: 1,
    name: 'Ergonomic Chairs',
    percentage: 92
  },
  {
    id: 2,
    name: 'Modular Sofas',
    percentage: 86
  },
  {
    id: 3,
    name: 'Minimalist Lamps',
    percentage: 78
  },
  {
    id: 4,
    name: 'Smart Storage',
    percentage: 74
  }
];

const TrendingCollections = () => {
  const [analytics, setAnalytics] = useState(defaultAnalytics);
  const [analyticsTitle, setAnalyticsTitle] = useState("What's Hot This Week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionsData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('trending-collections');
        
        if (response.data && response.data.content) {
          if (response.data.content.analytics && Array.isArray(response.data.content.analytics)) {
            setAnalytics(response.data.content.analytics);
          }
          if (response.data.content.analyticsTitle) {
            setAnalyticsTitle(response.data.content.analyticsTitle);
          }
        }
      } catch (error) {
        console.error('Error fetching trending collections data:', error);
        // Keep default analytics if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionsData();
  }, []);

  if (loading) {
    return (
      <div className={styles.trendingCollectionsSection}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.trendingCollectionsSection}>
      {/* Trending Analytics Banner */}
      <div className={styles.trendingAnalytics}>
        <h3 className={styles.analyticsTitle}>{analyticsTitle}</h3>
        
        <div className={styles.analyticGrid}>
          {analytics.map((item) => (
            <div key={item.id} className={styles.analyticItem}>
              <span className={styles.analyticName}>{item.name}</span>
              <div className={styles.analyticBar}>
                <div className={styles.analyticFill} style={{ width: `${item.percentage}%` }}></div>
              </div>
              <span className={styles.analyticValue}>{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingCollections;