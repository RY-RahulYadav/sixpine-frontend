import { useState, useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./furnitureSections.module.css";
import { homepageAPI } from '../../services/api';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  oldPrice: string;
  discount: string;
  rating: number;
  reviews: number;
  image: string;
  productId?: number;
  productSlug?: string;
}

interface FurnitureSectionsData {
  discover: {
    title: string;
    subtitle: string;
    products: Product[];
  };
  topRated: {
    title: string;
    subtitle: string;
    products: Product[];
  };
}

// Default data
const defaultData: FurnitureSectionsData = {
  discover: {
    title: "Discover what's new",
    subtitle: "Designed to refresh your everyday life",
    products: [
      {
        id: 1,
        title: "Samvaad 3 Seater Sofa with Cane Accents",
        subtitle: "(Cotton, Jade Ivory)",
        price: "₹49,989",
        oldPrice: "₹79,999",
        discount: "38% off",
        rating: 4,
        reviews: 14,
        image: "/images/Home/bed.jpg",
      },
      {
        id: 2,
        title: "Ayaan Sheesham Wood 3 Seater Sofa Cum Bed",
        subtitle: "with Cane Weaving & Premium Finish",
        price: "₹63,989",
        oldPrice: "₹90,845",
        discount: "29% off",
        rating: 5,
        reviews: 136,
        image: "/images/Home/bedroom.jpg",
      },
      {
        id: 3,
        title: "Grace Premium Solid Wood Shoe Cabinet",
        subtitle: "With Cane Detailing (Mango Finish)",
        price: "₹28,989",
        oldPrice: "₹46,935",
        discount: "37% off",
        rating: 4,
        reviews: 14,
        image: "/images/Home/sofa.jpg",
      },
      {
        id: 4,
        title: "Grace Premium Solid Wood Shoe Cabinet",
        subtitle: "With Cane Detailing (Mango Finish)",
        price: "₹28,989",
        oldPrice: "₹46,935",
        discount: "37% off",
        rating: 3,
        reviews: 14,
        image: "/images/Home/sofa.jpg",
      },
    ]
  },
  topRated: {
    title: "Top-Rated by Indian Homes",
    subtitle: "Crafted to complement Indian lifestyles",
    products: [
      {
        id: 9,
        title: "Lotus Premium Sheesham Wood King Size Bed",
        subtitle: "with Drawer Storage (Honey Finish)",
        price: "₹55,989",
        oldPrice: "₹82,000",
        discount: "31% off",
        rating: 5,
        reviews: 72,
        image: "/images/Home/bed.jpg",
      },
      {
        id: 10,
        title: "Valence 6 Seater Sheesham Wood Dining Set",
        subtitle: "(Teak Finish)",
        price: "₹85,989",
        oldPrice: "₹1,42,342",
        discount: "40% off",
        rating: 4,
        reviews: 47,
        image: "/images/Home/bed.jpg",
      },
      {
        id: 11,
        title: "Another Premium Sofa",
        subtitle: "Modern Style",
        price: "₹38,989",
        oldPrice: "₹60,000",
        discount: "36% off",
        rating: 3,
        reviews: 51,
        image: "/images/Home/bed.jpg",
      },
      {
        id: 12,
        title: "Samvaad 3 Seater Sofa with Cane Accents",
        subtitle: "(Cotton, Jade Ivory)",
        price: "₹49,989",
        oldPrice: "₹79,999",
        discount: "38% off",
        rating: 4,
        reviews: 14,
        image: "/images/Home/bed.jpg",
      },
    ]
  }
};


const Section = ({ title, subtitle, products, extraClass }: { 
  title: string; 
  subtitle: string; 
  products: Product[]; 
  extraClass?: string 
}) => {
  const [viewAll, setViewAll] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollAmount = () => {
    if (listRef.current) {
      // ProductCard uses craftedProductCard class from bannerCards.module.css
      const card = listRef.current.querySelector('[class*="craftedProductCard"]') as HTMLElement;
      if (card) {
        // Calculate card width + gap
        const cardWidth = card.offsetWidth;
        const gap = parseInt(window.getComputedStyle(listRef.current).getPropertyValue('gap')) || 20;
        return cardWidth + gap;
      }
    }
    return 300; // Fallback scroll amount
  };

  const scrollLeft = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    }
  };

  return (
    <div className={`${styles.section} ${extraClass || ""}`}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button
          className={styles.viewBtn}
          onClick={() => setViewAll(!viewAll)}
          aria-label={viewAll ? "Show Less" : "View All"}
        >
          <span className={styles.viewBtnText}>{viewAll ? "Show Less" : "View All"}</span>
          <span className={styles.viewBtnIcon}>
            <FaChevronRight />
          </span>
        </button>
      </div>

      <div className={styles.productWrapper}>
        {!viewAll && (
          <button className={styles.navBtn} onClick={scrollLeft}>
            <FaChevronLeft />
          </button>
        )}

        <div
          ref={listRef}
          className={`${styles.productList} ${
            viewAll ? styles.grid : styles.scroll
          }`}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              subtitle={p.subtitle}
              image={p.image}
              rating={p.rating}
              reviews={p.reviews}
              price={p.price}
              oldPrice={p.oldPrice}
              productSlug={p.productSlug}
              productId={p.productId}
            />
          ))}
        </div>

        {!viewAll && (
          <button className={styles.navBtn} onClick={scrollRight}>
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

const FurnitureSections = () => {
  const [data, setData] = useState<FurnitureSectionsData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('furniture-sections');
        
        if (response.data && response.data.content) {
          setData({
            discover: response.data.content.discover || defaultData.discover,
            topRated: response.data.content.topRated || defaultData.topRated
          });
        }
      } catch (error) {
        console.error('Error fetching furniture sections data:', error);
        // Keep default data if API fails
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
    );
  }

  // Use API data if available, otherwise use defaults
  const discoverProducts = data.discover.products.length > 0 ? data.discover.products : defaultData.discover.products;
  const topRatedProducts = data.topRated.products.length > 0 ? data.topRated.products : defaultData.topRated.products;

  return (
    <div className={styles.furnitureContainer}>
      <Section
        title={data.discover.title}
        subtitle={data.discover.subtitle}
        products={discoverProducts}
        extraClass={styles.discoverSection}
      />
      <div style={{ marginTop: "40px" }}>
      <Section
        title={data.topRated.title}
        subtitle={data.topRated.subtitle}
        products={topRatedProducts}
        extraClass={styles.discoverSection}
      /></div>
    </div>
  );
};

export default FurnitureSections;