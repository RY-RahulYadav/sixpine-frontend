import React, { useRef, useState, useEffect } from "react";
import styles from "./productdetails_slider1.module.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";

// Product Interface
export interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
}

// Component Props Interface
interface ProductDetailsSliderProps {
  title: string;
  products: Product[];
}

const Crafted: React.FC<ProductDetailsSliderProps> = ({ title, products }) => {
  const slider1 = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hearts, setHearts] = useState(() => products.map(() => false));

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

  const toggleHeart = (idx: number) => {
    setHearts((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const renderProducts = (productList: Product[]) =>
    productList.map((p, idx) => (
      <div className={styles.craftedProductCard} key={idx}>
        <div className={styles.imageWrapper}>
          <img src={p.img} alt={p.title} className={styles.productImg1} />
          {/* ❤️ Heart Icon */}
          <FaHeart
            className={`${styles.heartIcon} ${
              hearts[idx] ? styles.heartActive : ""
            }`}
            onClick={() => toggleHeart(idx)}
          />
        </div>

        <h4 className={styles.productTitle}>{p.title}</h4>
        <p className={styles.productDesc}>{p.desc}</p>

        <div className={styles.productRating}>
          {"★".repeat(Math.floor(p.rating))}
          {"☆".repeat(5 - Math.floor(p.rating))}
          <span> ({p.reviews} reviews)</span>
        </div>

        <div className={styles.productPrices}>
          
          <span className={styles.newPrice}>{p.newPrice}</span>
          <span className={styles.oldPrice}>{p.oldPrice}</span>
        </div>

        <div className={styles.actionRow}>
          <button className={styles.buyBtn}>Buy Now</button>
          <div className={styles.productIcons}>
            <FaShoppingCart />
          </div>
        </div>
      </div>
    ));

  return (
    <div className={styles.craftedContainer}>
      <div className={styles.craftedSliderSection}>
        <h3 className={styles.sliderTitle}>{title}</h3>
        <div className={styles.sliderWrapper}>
          <button
            className={`${styles.sliderArrow} ${styles.left}`}
            onClick={() => scroll(slider1, "left")}
          >
            <FaChevronLeft />
          </button>
          <div className={styles.craftedSlider} ref={slider1}>
            {renderProducts(products)}
          </div>
          <button
            className={`${styles.sliderArrow} ${styles.right}`}
            onClick={() => scroll(slider1, "right")}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Crafted;
