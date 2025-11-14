import { useRef, useState, useEffect } from "react";
import styles from "./productdetails_slider2.module.css"; // Import CSS module
import { FaChevronLeft, FaChevronRight, FaHeart, FaShoppingCart } from "react-icons/fa";

// Product type definition
interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
}

// Slider Product Data
const products1: Product[] = [
  {
   img: "/images/Home/sofaproduct.jpg",
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
    img: "/images/Home/sofaproduct.jpg",
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

const products2 = [
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

const Crafted = () => {
  const slider1 = useRef<HTMLDivElement>(null);
  const slider2 = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 425); // Set breakpoint for mobile view
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: string) => {
    if (ref.current) {
      const scrollAmount = isMobile ? ref.current.offsetWidth : 300; // Scroll one card width on mobile, else 300px
      ref.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const renderProducts = (products: Product[]) =>
    products.map((p: Product, idx: number) => (
      <div className={styles.craftedProductCard} key={idx}>
        <img src={p.img} alt={p.title} className={styles.productImg1} />
        <h4 className={styles.productTitle}>{p.title}</h4>
        <p className={styles.productDesc}>{p.desc}</p>

        <div className={styles.productRating}>
          {"★".repeat(Math.floor(p.rating))}
          {"☆".repeat(5 - Math.floor(p.rating))}
          <span> ({p.reviews} reviews)</span>
        </div>

        <div className={styles.productPrices}>
          <span className={styles.oldPrice}>{p.oldPrice}</span>
          <span className={styles.newPrice}>{p.newPrice}</span>
        </div>

        {/* Button + Icons ek row me */}
        <div className={styles.actionRow}>
          <button className={styles.buyBtn}>Buy Now</button>
          <div className={styles.productIcons}>
            <FaHeart /> <FaShoppingCart />
          </div>
        </div>
      </div>
    ));

  return (
    <div className={styles.craftedContainer}>
      {/* <h3 className={styles.craftedHeading}>Crafted In India</h3> */}

      {/* Slider 1 */}
      <div className={styles.craftedSliderSection}>
        <h3 className={styles.sliderTitle}>
          Customers Frequently viewed | Popular products in the last 7 days
        </h3>
        <div className={styles.sliderWrapper}>
          <button
            className={`${styles.sliderArrow} ${styles.left}`}
            onClick={() => scroll(slider1, "left")}
          >
            <FaChevronLeft />
          </button>
          <div className={styles.craftedSlider} ref={slider1}>
            {renderProducts(products1)}
          </div>
          <button
            className={`${styles.sliderArrow} ${styles.right}`}
            onClick={() => scroll(slider1, "right")}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Slider 2 */}
      <div className={styles.craftedSliderSection}>
        <h3 className={styles.sliderTitle}>Inspired by your browsing history</h3>
        <div className={styles.sliderWrapper}>
          <button
            className={`${styles.sliderArrow} ${styles.left}`}
            onClick={() => scroll(slider2, "left")}
          >
            <FaChevronLeft />
          </button>
          <div className={styles.craftedSlider} ref={slider2}>
            {renderProducts(products2)}
          </div>
          <button
            className={`${styles.sliderArrow} ${styles.right}`}
            onClick={() => scroll(slider2, "right")}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Crafted;
