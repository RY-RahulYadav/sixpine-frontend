import { useNavigate } from "react-router-dom";
import styles from "./heroSection2.module.css";

interface SectionItem {
  id: number;
  imageUrl: string;
  text: string;
  altText?: string;
  navigateUrl?: string;
}

interface Section {
  id: number;
  title: string;
  linkText: string;
  linkUrl: string;
  items: SectionItem[];
  isSpecial?: boolean;
}

interface HeroSection2Props {
  data?: { sections?: Section[] } | null;
  isLoading?: boolean;
}

// Default data for immediate render
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

const HeroSection2: React.FC<HeroSection2Props> = ({ data, isLoading: _isLoading = false }) => {
  const navigate = useNavigate();

  // Use passed data or defaults (no loading state blocking render)
  const sections = data?.sections || defaultSections;

  return (
    <div className={styles.homepage}>
      {sections.map((section) => (
        <div key={section.id} className={`${styles.card} ${section.isSpecial ? styles.special : ''}`}>
          <h3>{section.title}</h3>
          <div className={styles.grid}>
            {section.items.map((item) => (
              <div
                key={item.id}
                className={styles.item}
                onClick={() => {
                  const url = item.navigateUrl;
                  if (url && url.trim()) {
                    navigate(url);
                  }
                }}
                style={{ cursor: item.navigateUrl ? 'pointer' : 'default' }}
              >
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

export default HeroSection2;