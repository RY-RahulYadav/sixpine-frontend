import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./furnitureOfferSections.module.css";

interface OfferProduct {
  imageUrl: string;
  navigateUrl: string;
}

interface Section {
  id: number;
  title: string;
  link: string;
  linkUrl?: string;
  products: OfferProduct[] | string[];
}

interface FurnitureOfferSectionsProps {
  data?: { sections?: Section[] } | null;
  isLoading?: boolean;
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

const FurnitureOfferSections: React.FC<FurnitureOfferSectionsProps> = ({ data: propData, isLoading: _isLoading = false }) => {
  const navigate = useNavigate();
  const sliderRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Use passed data or defaults (no loading state blocking render)
  const sections = propData?.sections?.map((section: any) => ({
    ...section,
    products: section.products?.map((p: any) =>
      typeof p === 'string'
        ? { imageUrl: p, navigateUrl: '#' }
        : p
    ) || []
  })) || defaultSections;

  const scroll = (index: number, direction: 'left' | 'right') => {
    const slider = sliderRefs.current[index];
    if (slider) {
      const scrollAmount = 250;
      slider.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={styles.offercontainer}>
      {sections.map((section: Section, index: number) => (
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
                  const navigateUrl = typeof product === 'string' ? '' : product.navigateUrl;
                  return (
                    <div
                      key={i}
                      className={styles.card}
                      onClick={() => {
                        if (navigateUrl && navigateUrl.trim() && navigateUrl !== '#') {
                          navigate(navigateUrl);
                        }
                      }}
                      style={{ cursor: (navigateUrl && navigateUrl.trim() && navigateUrl !== '#') ? 'pointer' : 'default' }}
                    >
                      <img src={imageUrl} alt={`Product ${i + 1}`} />
                    </div>
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default FurnitureOfferSections;
