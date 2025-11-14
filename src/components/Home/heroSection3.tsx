import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./heroSection3.module.css";
import { homepageAPI } from '../../services/api';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface CategoryItem {
  id: number;
  name: string;
  img: string;
}

interface SliderCard {
  id: number;
  tag: string;
  title: string;
  desc: string;
  price: string;
  img: string;
  productSlug?: string;
  productId?: number;
}

interface HeroSection3Data {
  title: string;
  subtitle: string;
  offerBadge: string;
  leftProductCard: {
    name: string;
    img: string;
  };
  categoryItems: CategoryItem[];
  sliderCards: SliderCard[];
}

// Default data - exactly 8 category items
const defaultData: HeroSection3Data = {
  title: "Beautify Every Corner with Elegance",
  subtitle: "Explore timeless pieces for every nook and space",
  offerBadge: "UPTO 60% OFF",
  leftProductCard: {
    name: "Light Show",
    img: "/images/Home/FloorLamps.jpg"
  },
  categoryItems: [
    { id: 1, name: "Floor Lamps", img: "/images/Home/FloorLamps.jpg" },
    { id: 2, name: "Hanging Lights", img: "/images/Home/HangingLights.jpg" },
    { id: 3, name: "Home Temple", img: "/images/Home/HomeTemple.webp" },
    { id: 4, name: "Serving Trays", img: "/images/Home/ServingTrays.jpg" },
    { id: 5, name: "Wall Decor", img: "/images/Home/Decor.jpg" },
    { id: 6, name: "Kitchen Racks", img: "/images/Home/Cookware.jpg" },
    { id: 7, name: "Chopping Board", img: "/images/Home/ServingTrays.jpg" },
    { id: 8, name: "Artificial Plants", img: "/images/Home/FloorLamps.jpg" }
  ],
  sliderCards: [
    {
      id: 1,
      tag: "UPTO 45% OFF",
      title: "TV UNIT",
      desc: "Built to Hold the Drama",
      price: "₹1,699",
      img: "/images/Home/sofa1.jpg",
    },
    {
      id: 2,
      tag: "UPTO 50% OFF",
      title: "OFFICE CHAIR",
      desc: "Built to Hold the Drama",
      price: "₹3,989",
      img: "/images/Home/sofa4.jpg",
    },
    {
      id: 3,
      tag: "UPTO 40% OFF",
      title: "HOME TEMPLE",
      desc: "Built to Hold the Drama",
      price: "₹3,000",
      img: "/images/Home/sofa2.jpg",
    }
  ]
};

const HeroSection3 = () => {
  const [data, setData] = useState<HeroSection3Data>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('hero3');
        
        if (response.data && response.data.content) {
          // Ensure exactly 8 category items
          const categoryItems = response.data.content.categoryItems || [];
          if (categoryItems.length !== 8) {
            // If not 8, use defaults or pad/trim to 8
            if (categoryItems.length < 8) {
              const defaultItems = [...defaultData.categoryItems];
              const merged = [...categoryItems, ...defaultItems.slice(categoryItems.length, 8)];
              categoryItems.splice(0, categoryItems.length, ...merged.slice(0, 8));
            } else {
              categoryItems.splice(8);
            }
          }
          
          setData({
            title: response.data.content.title || defaultData.title,
            subtitle: response.data.content.subtitle || defaultData.subtitle,
            offerBadge: response.data.content.offerBadge || defaultData.offerBadge,
            leftProductCard: response.data.content.leftProductCard || defaultData.leftProductCard,
            categoryItems: categoryItems.slice(0, 8), // Ensure exactly 8
            sliderCards: response.data.content.sliderCards || defaultData.sliderCards
          });
        }
      } catch (error) {
        console.error('Error fetching hero section 3 data:', error);
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
      <section className={styles.hero3Container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </section>
    );
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  // Ensure exactly 8 items for display
  const displayItems = data.categoryItems.slice(0, 8);

  return (
    <section className={styles.hero3Container}>
      <div className={styles.topSection}>
        <div className={styles.leftText}>
          <div className={styles.leftTextContent}>
            <h2>{data.title}</h2>
            <p>{data.subtitle}</p>
            <span className={styles.offer}>{data.offerBadge}</span>
          </div>

          <div className={styles.leftProductCard}>
            <img
              src={data.leftProductCard.img}
              alt={data.leftProductCard.name}
              className={styles.leftProductImg}
            />
            <div className={styles.leftProductName}>{data.leftProductCard.name}</div>
          </div>
        </div>

        <div className={styles.rightGrid}>
          {displayItems.map((card) => (
            <div key={card.id} className={styles.productCard}>
              <img className={styles.productImg} src={card.img} alt={card.name} />
              <div className={styles.productName}>{card.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomSection}>
        <Slider {...settings} className={styles.slider}>
          {data.sliderCards.map((s) => {
            const handleClick = () => {
              if (s.productSlug) {
                window.location.href = `/products-details/${s.productSlug}`;
              }
            };
            return (
              <div key={s.id} className={styles.slideWrapper} onClick={handleClick} style={{ cursor: s.productSlug ? 'pointer' : 'default' }}>
                <div className={styles.sliderCard}>
                  <div className={styles.cardContent}>
                    <div className={styles.discountTag}>{s.tag}</div>
                    <h3>{s.title}</h3>
                    <p className={styles.desc}>{s.desc}</p>
                    <div className={styles.price}>
                      Starting From <strong>{s.price}</strong>
                    </div>
                    <div className={styles.delivery}>FREE Delivery Available</div>
                  </div>
                  <div className={styles.cardImage}>
                    <img src={s.img} alt={s.title} />
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
};

type ArrowProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const NextArrow = ({ onClick }: ArrowProps) => (
  <button
    type="button"
    className={`${styles.arrow} ${styles.next}`}
    onClick={onClick}
    aria-label="Next"
  >
    <FaChevronRight />
  </button>
);
const PrevArrow = ({ onClick }: ArrowProps) => (
  <button
    type="button"
    className={`${styles.arrow} ${styles.prev}`}
    onClick={onClick}
    aria-label="Prev"
  >
    <FaChevronLeft />
  </button>
);

export default HeroSection3;