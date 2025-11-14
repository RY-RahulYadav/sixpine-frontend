import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./furnitureOfferSections.module.css";
import { homepageAPI } from '../../services/api';

interface OfferProduct {
  imageUrl: string;
  navigateUrl: string;
}

interface Section {
  id: number;
  title: string;
  link: string;
  linkUrl?: string;
  products: OfferProduct[] | string[]; // Support both old and new format
}

const defaultSections: Section[] = [
  {
    id: 1,
    title: "Up to 60% Off | Furniture crafted for every corner",
    link: "See all offers",
    linkUrl: "#",
    products: [
      { imageUrl: "/images/Home/sofa.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/bed.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/bedroom.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/chair.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa2.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa3.jpg", navigateUrl: "#" },
    ],
  },
  {
    id: 2,
    title: "Sofa for living room",
    link: "See more",
    linkUrl: "#",
    products: [
      { imageUrl: "/images/Home/sofa1.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa2.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa3.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa4.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/bed.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/chair.jpg", navigateUrl: "#" },
    ],
  },
  {
    id: 3,
    title: "Related to items you've viewed",
    link: "See more",
    linkUrl: "#",
    products: [
      { imageUrl: "/images/Home/sofa1.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa2.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa3.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/sofa4.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/bed.jpg", navigateUrl: "#" },
      { imageUrl: "/images/Home/chair.jpg", navigateUrl: "#" },
    ],
  },
];

const FurnitureOfferSections = () => {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [loading, setLoading] = useState(true);
  const sliderRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('furniture-offer-sections');
        
        if (response.data && response.data.content && response.data.content.sections) {
          // Migrate old format (string[]) to new format (OfferProduct[])
          const migratedSections = response.data.content.sections.map((section: any) => ({
            ...section,
            products: section.products?.map((p: any) => 
              typeof p === 'string' 
                ? { imageUrl: p, navigateUrl: '#' }
                : p
            ) || []
          }));
          setSections(migratedSections);
        }
      } catch (error) {
        console.error('Error fetching furniture offer sections data:', error);
        // Keep default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scroll = (index: number, direction: 'left' | 'right') => {
    const slider = sliderRefs.current[index];
    if (slider) {
      const scrollAmount = 250; // scroll by 1 card width
      slider.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
    );
  }

  return (
    <div className={styles.offercontainer}>
      {sections.map((section, index) => (
        <div key={section.id} className={styles.section}>



          <div className={styles.sectionBox}>
            
          {/* Header */}
          <div className={styles.sectionHeader}>
            <h2>{section.title}</h2>
            <a href={section.linkUrl || "#"}>{section.link}</a>
          </div>

          {/* Slider Wrapper */}
          <div className={styles.sliderWrapper}>
            {/* Left Button */}
            <button
              className={`${styles.navBtn} ${styles.leftBtn}`}
              onClick={() => scroll(index, "left")}
            >
              <FaChevronLeft />
            </button>

            {/* Scrollable Product List */}
            <div
              className={styles.slider}
              ref={(el) => { sliderRefs.current[index] = el; }}
            >
              {section.products.map((product: OfferProduct | string, i: number) => {
                const imageUrl = typeof product === 'string' ? product : product.imageUrl;
                const navigateUrl = typeof product === 'string' ? '#' : product.navigateUrl;
                return (
                  <a 
                    key={i} 
                    href={navigateUrl}
                    className={styles.card}
                    onClick={(e) => {
                      if (navigateUrl === '#' || !navigateUrl) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <img src={imageUrl} alt={`Product ${i + 1}`} />
                  </a>
                );
              })}
            </div>

            {/* Right Button */}
            <button
              className={`${styles.navBtn} ${styles.rightBtn}`}
              onClick={() => scroll(index, "right")}
            >
              <FaChevronRight />
            </button>
          </div>



          </div>   {/* End of sectionBox  */}
        </div>



      ))}
    </div>
  );
};

export default FurnitureOfferSections;
