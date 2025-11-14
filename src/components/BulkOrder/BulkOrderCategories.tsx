import React, { useState, useEffect } from 'react';
import styles from './BulkOrderCategories.module.css';
import { bulkOrderPageAPI } from '../../services/api';

interface CategoryItem {
  id: number;
  title: string;
  description: string;
  image: string;
  items: string[];
}

const defaultCategories: CategoryItem[] = [
    {
      id: 1,
      title: 'Corporate Offices',
      description: 'Complete office furniture solutions for modern workspaces',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Desks & Workstations', 'Conference Tables', 'Office Chairs', 'Storage Solutions']
    },
    {
      id: 2,
      title: 'Hospitality',
      description: 'Elegant furniture for hotels, restaurants, and resorts',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Guest Room Furniture', 'Lobby Seating', 'Dining Sets', 'Outdoor Furniture']
    },
    {
      id: 3,
      title: 'Educational Institutions',
      description: 'Durable and functional furniture for schools and universities',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Classroom Furniture', 'Library Shelving', 'Auditorium Seating', 'Lab Tables']
    },
    {
      id: 4,
      title: 'Healthcare Facilities',
      description: 'Specialized furniture for hospitals and clinics',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Waiting Area Seating', 'Medical Cabinets', 'Patient Room Furniture', 'Staff Lounges']
    },
    {
      id: 5,
      title: 'Retail Spaces',
      description: 'Custom displays and fixtures for retail environments',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Display Units', 'Checkout Counters', 'Storage Racks', 'Seating Areas']
    },
    {
      id: 6,
      title: 'Residential Projects',
      description: 'Bulk orders for apartments, condos, and housing complexes',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Living Room Sets', 'Bedroom Furniture', 'Dining Sets', 'Kitchen Cabinets']
    }
  ];

const BulkOrderCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);
  const [sectionTitle, setSectionTitle] = useState<string>('Industries We Serve');
  const [sectionSubtitle, setSectionSubtitle] = useState<string>('Tailored furniture solutions for every business sector');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesContent = async () => {
      try {
        const response = await bulkOrderPageAPI.getBulkOrderPageContent('categories');
        if (response.data && response.data.content) {
          setCategories(response.data.content.categories || defaultCategories);
          setSectionTitle(response.data.content.title || 'Industries We Serve');
          setSectionSubtitle(response.data.content.subtitle || 'Tailored furniture solutions for every business sector');
        }
      } catch (error) {
        console.error('Error fetching categories content:', error);
        // Keep default content if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesContent();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
          <p className={styles.sectionSubtitle}>
            {sectionSubtitle}
          </p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <div key={index} className={styles.categoryCard}>
              <div className={styles.cardImage}>
                <img src={category.image} alt={category.title} />
                <div className={styles.cardOverlay}></div>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{category.title}</h3>
                <p className={styles.cardDescription}>{category.description}</p>
                <ul className={styles.itemsList}>
                  {category.items.map((item, idx) => (
                    <li key={idx}>
                      <span className={styles.checkIcon}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#quote-form" className={styles.cardButton}>
                  Request Quote
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BulkOrderCategories;
