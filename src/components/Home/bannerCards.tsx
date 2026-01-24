import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./bannerCards.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from './ProductCard';

interface BannerCard {
  img: string;
  title?: string;
  text?: string;
  navigateUrl?: string;
}

interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
  parent_main_image?: string;
  productId?: number;
  productSlug?: string;
  navigateUrl?: string;
  variantCount?: number;
  variant_count?: number;
  colorCount?: number;
  color_count?: number;
}

interface BannerCardsData {
  heading?: string;
  bannerCards?: BannerCard[];
  slider1Title?: string;
  slider1ViewAllUrl?: string;
  slider1Products?: Product[];
  slider1Enabled?: boolean;
  slider2Title?: string;
  slider2ViewAllUrl?: string;
  slider2Products?: Product[];
  slider2Enabled?: boolean;
}

interface BannerCardsProps {
  data?: BannerCardsData | null;
  isLoading?: boolean;
}

// Default Banner Data
const defaultBannerCards: BannerCard[] = [
  { img: "/images/Home/bannerCards.webp" },
  { img: "/images/Home/bannerCards.webp" },
];

// Default Slider Product Data
const defaultProducts1: Product[] = [
  {
    img: "/images/Home/sofa1.jpg",
    title: "Elegant Sofa",
    desc: "Elegant wooden sofa with soft cushions & premium finish",
    rating: 4.5,
    reviews: 200,
    oldPrice: "₹15,999",
    newPrice: "₹12,999",
  },
  {
    img: "/images/Home/sofa2.jpg",
    title: "Modern Bed",
    desc: "Premium solid wood bed with textured fabric finish",
    rating: 4.2,
    reviews: 75,
    oldPrice: "₹18,999",
    newPrice: "₹13,999",
  },
  {
    img: "/images/Home/sofa3.jpg",
    title: "Comfort Chair",
    desc: "Modern wooden chair with ergonomic design for comfort",
    rating: 4.3,
    reviews: 110,
    oldPrice: "₹8,999",
    newPrice: "₹6,999",
  },
  {
    img: "/images/Home/sofa4.jpg",
    title: "Living Sofa",
    desc: "Classic styled sofa perfect for small living rooms",
    rating: 4.0,
    reviews: 95,
    oldPrice: "₹14,999",
    newPrice: "₹10,999",
  },
];

const defaultProducts2: Product[] = [
  {
    img: "/images/Home/sofa4.jpg",
    title: "Sheesham Bed",
    desc: "Solid Sheesham wood bed with classic finishing",
    rating: 4.4,
    reviews: 120,
    oldPrice: "₹16,999",
    newPrice: "₹12,499",
  },
  {
    img: "/images/Home/sofa3.jpg",
    title: "Luxury Sofa",
    desc: "Stylish sofa with modern upholstery for your living room",
    rating: 4.6,
    reviews: 180,
    oldPrice: "₹22,999",
    newPrice: "₹18,999",
  },
  {
    img: "/images/Home/sofa2.jpg",
    title: "Lounge Chair",
    desc: "Comfortable arm chair with cushion seating",
    rating: 4.1,
    reviews: 98,
    oldPrice: "₹9,999",
    newPrice: "₹7,499",
  },
  {
    img: "/images/Home/sofa1.jpg",
    title: "Dining Chair",
    desc: "Ergonomic dining chair for comfortable meal times",
    rating: 4.0,
    reviews: 60,
    oldPrice: "₹4,999",
    newPrice: "₹3,499",
  },
];

const BannerCards: React.FC<BannerCardsProps> = ({ data: propData, isLoading: _isLoading = false }) => {
  const navigate = useNavigate();
  const slider1 = useRef<HTMLDivElement>(null);
  const slider2 = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Use passed data or defaults (no loading state blocking render)
  const heading = propData?.heading || "Crafted In India";
  const bannerCards = propData?.bannerCards || defaultBannerCards;
  const slider1Title = propData?.slider1Title || "Customers frequently viewed | Popular products in the last 7 days";
  const slider1ViewAllUrl = propData?.slider1ViewAllUrl || "#";
  const slider1Products = propData?.slider1Products || defaultProducts1;
  const slider1Enabled = propData?.slider1Enabled !== undefined ? propData.slider1Enabled : true;
  const slider2Title = propData?.slider2Title || "Inspired by your browsing history";
  const slider2ViewAllUrl = propData?.slider2ViewAllUrl || "#";
  const slider2Products = propData?.slider2Products || defaultProducts2;
  const slider2Enabled = propData?.slider2Enabled !== undefined ? propData.slider2Enabled : true;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 425);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = isMobile ? ref.current.offsetWidth : 300;
      ref.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const renderProducts = (products: Product[], sliderIndex: number = 0) =>
    products.map((p, idx) => (
      <ProductCard
        key={`slider-${sliderIndex}-${(p as any).id || p.productId || idx}`}
        id={(p as any).id || idx}
        title={p.title}
        desc={p.desc}
        img={p.img}
        image={p.img}
        parentMainImage={p.parent_main_image}
        rating={p.rating}
        reviews={p.reviews}
        price={p.newPrice}
        oldPrice={p.oldPrice}
        newPrice={p.newPrice}
        productSlug={p.productSlug}
        productId={p.productId}
        navigateUrl={(p as any).navigateUrl}
        variantCount={p.variantCount || p.variant_count}
        colorCount={p.colorCount || p.color_count}
      />
    ));

  // Don't render anything if both sliders are disabled
  if (!slider1Enabled && !slider2Enabled) {
    return null;
  }

  return (
    <div className={styles.craftedContainer}>
      {/* Banner Section */}
      <h3 className={styles.craftedHeading}>{heading}</h3>
      <div className={styles.craftedBanner}>
        {bannerCards.map((b, i) => (
          <div
            className={styles.bannerCard}
            key={i}
            onClick={() => {
              const url = b.navigateUrl;
              if (url && url.trim()) {
                navigate(url);
              }
            }}
            style={{ cursor: b.navigateUrl ? 'pointer' : 'default' }}
          >
            <img
              src={b.img}
              alt={b.title || `Banner ${i + 1}`}
              className={styles.bannerImg}
            />
            {(b.title || b.text) && (
              <div className={styles.bannerOverlay}>
                <h4>{b.title}</h4>
                <p>{b.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Slider 1 - Only render if enabled */}
      {slider1Enabled && (
        <div className={styles.craftedSliderSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sliderTitle}>{slider1Title}</h3>
            <a href={slider1ViewAllUrl} className={styles.viewAllBtn}>
              View All <FaChevronRight />
            </a>
          </div>
          <div className={styles.sliderWrapper}>
            <button className={`${styles.sliderArrow} ${styles.left}`} onClick={() => scroll(slider1, "left")}>
              <FaChevronLeft />
            </button>
            <div className={styles.craftedSlider} ref={slider1}>
              {renderProducts(slider1Products, 1)}
            </div>
            <button className={`${styles.sliderArrow} ${styles.right}`} onClick={() => scroll(slider1, "right")}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Slider 2 - Only render if enabled */}
      {slider2Enabled && (
        <div className={styles.craftedSliderSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sliderTitle}>{slider2Title}</h3>
            <a href={slider2ViewAllUrl} className={styles.viewAllBtn}>
              View All <FaChevronRight />
            </a>
          </div>
          <div className={styles.sliderWrapper}>
            <button className={`${styles.sliderArrow} ${styles.left}`} onClick={() => scroll(slider2, "left")}>
              <FaChevronLeft />
            </button>
            <div className={styles.craftedSlider} ref={slider2}>
              {renderProducts(slider2Products, 2)}
            </div>
            <button className={`${styles.sliderArrow} ${styles.right}`} onClick={() => scroll(slider2, "right")}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerCards;