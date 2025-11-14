import { useRef, useState, useEffect } from "react";
import styles from "./bannerCards.module.css"; // Import CSS module
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { homepageAPI } from '../../services/api';
import ProductCard from './ProductCard';

interface BannerCard {
  img: string;
  title?: string;
  text?: string;
}

interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
  productId?: number;
  productSlug?: string;
}

// Default Banner Data
const defaultBannerCards: BannerCard[] = [
  {
    img: "/images/Home/bannerCards.webp",
  },
  {
    img: "/images/Home/bannerCards.webp",
  },
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
  {
    img: "/images/Home/sofa1.jpg",
    title: "Designer Sofa",
    desc: "Sophisticated design with plush seating and durable frame",
    rating: 4.7,
    reviews: 250,
    oldPrice: "₹17,999",
    newPrice: "₹14,999",
  },
  {
    img: "/images/Home/sofa2.jpg",
    title: "Bedroom Set",
    desc: "Complete bedroom solution with bed and side tables",
    rating: 4.3,
    reviews: 150,
    oldPrice: "₹25,999",
    newPrice: "₹19,999",
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
  {
    img: "/images/Home/sofa4.jpg",
    title: "Coffee Table",
    desc: "Modern coffee table with storage space",
    rating: 4.5,
    reviews: 130,
    oldPrice: "₹7,999",
    newPrice: "₹5,999",
  },
  {
    img: "/images/Home/sofa3.jpg",
    title: "Study Desk",
    desc: "Compact study desk perfect for home office",
    rating: 4.2,
    reviews: 80,
    oldPrice: "₹6,999",
    newPrice: "₹4,999",
  },
];

const BannerCards = () => {
  const slider1 = useRef<HTMLDivElement>(null);
  const slider2 = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [heading, setHeading] = useState("Crafted In India");
  const [bannerCards, setBannerCards] = useState<BannerCard[]>(defaultBannerCards);
  const [slider1Title, setSlider1Title] = useState("Customers frequently viewed | Popular products in the last 7 days");
  const [slider1ViewAllUrl, setSlider1ViewAllUrl] = useState("#");
  const [slider1Products, setSlider1Products] = useState<Product[]>(defaultProducts1);
  const [slider2Title, setSlider2Title] = useState("Inspired by your browsing history");
  const [slider2ViewAllUrl, setSlider2ViewAllUrl] = useState("#");
  const [slider2Products, setSlider2Products] = useState<Product[]>(defaultProducts2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 425); // Set breakpoint for mobile view
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('banner-cards');
        
        if (response.data && response.data.content) {
          setHeading(response.data.content.heading || "Crafted In India");
          setBannerCards(response.data.content.bannerCards || defaultBannerCards);
          setSlider1Title(response.data.content.slider1Title || slider1Title);
          setSlider1ViewAllUrl(response.data.content.slider1ViewAllUrl || "#");
          setSlider1Products(response.data.content.slider1Products || defaultProducts1);
          setSlider2Title(response.data.content.slider2Title || slider2Title);
          setSlider2ViewAllUrl(response.data.content.slider2ViewAllUrl || "#");
          setSlider2Products(response.data.content.slider2Products || defaultProducts2);
        }
      } catch (error) {
        console.error('Error fetching banner cards data:', error);
        // Keep default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = isMobile ? ref.current.offsetWidth : 300; // Scroll one card width on mobile, else 300px
      ref.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const renderProducts = (products: Product[]) =>
    products.map((p, idx) => (
      <ProductCard
        key={idx}
        id={(p as any).id || idx}
        title={p.title}
        desc={p.desc}
        img={p.img}
        image={p.img}
        rating={p.rating}
        reviews={p.reviews}
        price={p.newPrice}
        oldPrice={p.oldPrice}
        newPrice={p.newPrice}
        productSlug={p.productSlug}
      />
    ));

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
    );
  }

  return (
    <div className={styles.craftedContainer}>
      {/* Banner Section */}
      <h3 className={styles.craftedHeading}>{heading}</h3>
      <div className={styles.craftedBanner}>
        {bannerCards.map((b, i) => (
          <div
            className={styles.bannerCard}
            style={{ backgroundImage: `url(${b.img})` }}
            key={i}
          >
            <div className={styles.bannerOverlay}>
              <h4>{b.title}</h4>
              <p>{b.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Slider 1 */}
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
            {renderProducts(slider1Products)}
          </div>
          <button className={`${styles.sliderArrow} ${styles.right}`} onClick={() => scroll(slider1, "right")}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Slider 2 */}
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
            {renderProducts(slider2Products)}
          </div>
          <button className={`${styles.sliderArrow} ${styles.right}`} onClick={() => scroll(slider2, "right")}>
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCards;