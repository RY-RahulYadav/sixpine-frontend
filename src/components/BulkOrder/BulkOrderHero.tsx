import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './BulkOrderHero.module.css';
import { bulkOrderPageAPI } from '../../services/api';

interface HeroContent {
  brandBadge: string;
  eyebrow: string;
  headline: string;
  highlightText: string;
  subheadline: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  heroImage: string;
  floatingCard: {
    icon: string;
    title: string;
    subtitle: string;
  };
}

const defaultHeroContent: HeroContent = {
  brandBadge: 'Sixpine',
  eyebrow: 'BULK PURCHASING PROGRAM',
  headline: 'Furnish Your Business with',
  highlightText: 'Premium Quality',
  subheadline: 'Special pricing, dedicated support, and customized solutions for corporate, hospitality, and large-scale residential projects. Transform your space with Sixpine\'s bulk furniture solutions.',
  stats: [
    { value: '50%', label: 'Average Savings' },
    { value: '500+', label: 'Projects Completed' },
    { value: '24/7', label: 'Support Available' }
  ],
  primaryButtonText: 'Get a Quote',
  primaryButtonLink: '#quote-form',
  secondaryButtonText: 'Contact Sales Team',
  secondaryButtonLink: '/contact',
  heroImage: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
  floatingCard: {
    icon: '✓',
    title: 'Premium Quality',
    subtitle: 'Guaranteed'
  }
};

const BulkOrderHero: React.FC = () => {
  const [heroContent, setHeroContent] = useState<HeroContent>(defaultHeroContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await bulkOrderPageAPI.getBulkOrderPageContent('hero');
        if (response.data && response.data.content) {
          setHeroContent(response.data.content);
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
        // Keep default content if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroOverlay}></div>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.brandBadge}>
              <span>{heroContent.brandBadge}</span>
            </div>
            <h5 className={styles.eyebrow}>{heroContent.eyebrow}</h5>
            <h1 className={styles.headline}>
              {heroContent.headline} <span className={styles.highlight}>{heroContent.highlightText}</span>
            </h1>
            <p className={styles.subheadline}>
              {heroContent.subheadline}
            </p>
            <div className={styles.heroStats}>
              {heroContent.stats.map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
            <div className={styles.ctaButtons}>
              <a href={heroContent.primaryButtonLink} className={styles.btnPrimary}>{heroContent.primaryButtonText}</a>
              <Link to={heroContent.secondaryButtonLink} className={styles.btnSecondary}>{heroContent.secondaryButtonText}</Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img 
              src={heroContent.heroImage} 
              alt="Bulk Furniture Orders" 
              className={styles.mainImage}
            />
            <div className={styles.floatingCard}>
              <div className={styles.cardIcon}>{heroContent.floatingCard.icon}</div>
              <div className={styles.cardContent}>
                <h4>{heroContent.floatingCard.title}</h4>
                <p>{heroContent.floatingCard.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkOrderHero;
