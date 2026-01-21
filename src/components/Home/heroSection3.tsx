import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./heroSection3.module.css";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface CategoryItem {
  id: number;
  name: string;
  img: string;
  navigateUrl?: string;
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
  navigateUrl?: string;
}

interface HeroSection3Data {
  title: string;
  subtitle: string;
  offerBadge: string;
  leftProductCard: {
    name: string;
    img: string;
    navigateUrl?: string;
  };
  categoryItems: CategoryItem[];
  sliderCards: SliderCard[];
}

interface HeroSection3Props {
  data?: Partial<HeroSection3Data> | null;
  isLoading?: boolean;
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

const HeroSection3: React.FC<HeroSection3Props> = ({ data: propData, isLoading: _isLoading = false }) => {
  const navigate = useNavigate();

  // Merge prop data with defaults
  const sectionData: HeroSection3Data = {
    title: propData?.title || defaultData.title,
    subtitle: propData?.subtitle || defaultData.subtitle,
    offerBadge: propData?.offerBadge || defaultData.offerBadge,
    leftProductCard: propData?.leftProductCard || defaultData.leftProductCard,
    categoryItems: (propData?.categoryItems && propData.categoryItems.length > 0)
      ? propData.categoryItems.slice(0, 8)
      : defaultData.categoryItems,
    sliderCards: propData?.sliderCards || defaultData.sliderCards
  };

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
  const displayItems = sectionData.categoryItems.slice(0, 8);

  return (
    <section className={styles.hero3Container}>
      <div className={styles.topSection}>
        <div className={styles.leftText}>
          <div className={styles.leftTextContent}>
            <h2>{sectionData.title}</h2>
            <p>{sectionData.subtitle}</p>
            <span className={styles.offer}>{sectionData.offerBadge}</span>
          </div>

          <div
            className={styles.leftProductCard}
            onClick={() => {
              const url = sectionData.leftProductCard.navigateUrl;
              if (url && url.trim()) {
                navigate(url);
              }
            }}
            style={{ cursor: sectionData.leftProductCard.navigateUrl ? 'pointer' : 'default' }}
          >
            <img
              src={sectionData.leftProductCard.img}
              alt={sectionData.leftProductCard.name}
              className={styles.leftProductImg}
            />
            <div className={styles.leftProductName}>{sectionData.leftProductCard.name}</div>
          </div>
        </div>

        <div className={styles.rightGrid}>
          {displayItems.map((card) => (
            <div
              key={card.id}
              className={styles.productCard}
              onClick={() => {
                const url = card.navigateUrl;
                if (url && url.trim()) {
                  navigate(url);
                }
              }}
              style={{ cursor: card.navigateUrl ? 'pointer' : 'default' }}
            >
              <img className={styles.productImg} src={card.img} alt={card.name} />
              <div className={styles.productName}>{card.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomSection}>
        <Slider {...settings} className={styles.slider}>
          {sectionData.sliderCards.map((s) => {
            const handleClick = () => {
              const url = s.navigateUrl || (s.productSlug ? `/products-details/${s.productSlug}` : null);
              if (url) {
                navigate(url);
              }
            };
            return (
              <div key={s.id} className={styles.slideWrapper} onClick={handleClick} style={{ cursor: (s.navigateUrl || s.productSlug) ? 'pointer' : 'default' }}>
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