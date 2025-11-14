import { useState, useEffect } from "react";
import styles from "./heroSection2.module.css";
import { homepageAPI } from '../../services/api';

interface SectionItem {
  id: number;
  imageUrl: string;
  text: string;
  altText?: string;
}

interface Section {
  id: number;
  title: string;
  linkText: string;
  linkUrl: string;
  items: SectionItem[];
  isSpecial?: boolean;
}

// Default data
const defaultSections: Section[] = [
  {
    id: 1,
    title: 'Pick up where you left off',
    linkText: 'See more',
    linkUrl: '#',
    items: [
      { id: 1, imageUrl: '/images/Home/sofa1.jpg', text: 'Sixpine Premium', altText: 'Sofa' },
      { id: 2, imageUrl: '/images/Home/sofa2.jpg', text: 'LEGACY OF COMFORT...', altText: 'Sofa' },
      { id: 3, imageUrl: '/images/Home/sofa3.jpg', text: 'LEGACY OF COMFORT...', altText: 'Sofa' },
      { id: 4, imageUrl: '/images/Home/sofa4.jpg', text: 'LEGACY OF COMFORT...', altText: 'Sofa' }
    ]
  },
  {
    id: 2,
    title: 'New home arrivals under $50',
    linkText: 'Shop the latest from Home',
    linkUrl: '#',
    isSpecial: true,
    items: [
      { id: 1, imageUrl: '/images/Home/Cookware1.jpg', text: 'Kitchen & Dining', altText: 'Cookware' },
      { id: 2, imageUrl: '/images/Home/Cans.jpg', text: 'Home Improvement', altText: 'Cans' },
      { id: 3, imageUrl: '/images/Home/Decor.jpg', text: 'Décor', altText: 'Decor' },
      { id: 4, imageUrl: '/images/Home/Pillow.jpg', text: 'Bedding & Bath', altText: 'Pillow' }
    ]
  },
  {
    id: 3,
    title: 'Up to 60% off | Furniture & mattresses',
    linkText: 'Explore all',
    linkUrl: '#',
    items: [
      { id: 1, imageUrl: '/images/Home/sofa4.jpg', text: 'Mattresses & more', altText: 'Mattress' },
      { id: 2, imageUrl: '/images/Home/sofa3.jpg', text: 'Office chairs & more', altText: 'Chair' },
      { id: 3, imageUrl: '/images/Home/sofa2.jpg', text: 'Sofas & more', altText: 'Sofa' },
      { id: 4, imageUrl: '/images/Home/sofa1.jpg', text: 'Bean bags & more', altText: 'Bean bag' }
    ]
  },
  {
    id: 4,
    title: 'More items to consider',
    linkText: 'See more',
    linkUrl: '#',
    isSpecial: true,
    items: [
      { id: 1, imageUrl: '/images/Home/1.webp', text: 'MosQuick® Stainless st...', altText: 'Clip1' },
      { id: 2, imageUrl: '/images/Home/2.webp', text: 'FDSHIP Stainless Stee...', altText: 'Clip2' },
      { id: 3, imageUrl: '/images/Home/3.webp', text: 'WEWEL® Premium Stai...', altText: 'Clip3' },
      { id: 4, imageUrl: '/images/Home/4.webp', text: 'Marita Heavy Duty Clot...', altText: 'Clip4' }
    ]
  }
];

const HomePage = () => {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('hero2');
        
        if (response.data && response.data.content && response.data.content.sections) {
          setSections(response.data.content.sections);
        }
      } catch (error) {
        console.error('Error fetching hero section 2 data:', error);
        // Keep default sections if API fails
        setSections(defaultSections);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.homepage}>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.homepage}>
      {sections.map((section) => (
        <div key={section.id} className={`${styles.card} ${section.isSpecial ? styles.special : ''}`}>
          <h3>{section.title}</h3>
          <div className={styles.grid}>
            {section.items.map((item) => (
              <div key={item.id} className={styles.item}>
                <img src={item.imageUrl} alt={item.altText || item.text} />
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <a href={section.linkUrl}>{section.linkText}</a>
        </div>
      ))}
    </div>
  );
};

export default HomePage;