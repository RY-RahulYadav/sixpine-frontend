import { useState, useEffect } from "react";
import styles from "./furnitureCategories.module.css";
import { homepageAPI } from '../../services/api';

interface CategoryItem {
  id: number;
  title: string;
  category: string;
  img: string;
}

interface SliderItem {
  id: number;
  title: string;
  img: string;
  url?: string;
}

interface FurnitureCategoriesData {
  sectionTitle: string;
  filterButtons: string[];
  categories: CategoryItem[];
  sliderTitle: string;
  shortDescription: string;
  fullDescription: string;
  sliderItems: SliderItem[];
}

// Default data
const defaultData: FurnitureCategoriesData = {
  sectionTitle: "Shop By Categories",
  filterButtons: ["All", "Living", "Bedroom", "Dining", "Mattress", "Decor", "Study"],
  categories: [
    { id: 1, title: "Sofas", category: "Living", img: "/images/Home/sofa1.jpg" },
    { id: 2, title: "Beds", category: "Bedroom", img: "/images/Home/bedroom.jpg" },
    { id: 3, title: "Dining", category: "Dining", img: "/images/Home/dining.jpg" },
    { id: 4, title: "Tv units", category: "Living", img: "/images/Home/tv.jpg" },
    { id: 5, title: "Coffee tables", category: "Living", img: "/images/Home/coffee.jpg" },
    { id: 6, title: "Cabinets", category: "Living", img: "/images/Home/cabinet.jpg" },
    { id: 7, title: "Mattresses", category: "Mattress", img: "/images/Home/mattress.jpg" },
    { id: 8, title: "Wardrobes", category: "Bedroom", img: "/images/Home/wardrobe.jpg" },
    { id: 9, title: "Sofa cum bed", category: "Bedroom", img: "/images/Home/sofacumbed.jpg" },
    { id: 10, title: "Bookshelves", category: "Decor", img: "/images/Home/bookshelf.jpg" },
    { id: 11, title: "All study tables", category: "Study", img: "/images/Home/studytable.jpg" },
    { id: 12, title: "Home furnishing", category: "Decor", img: "/images/Home/furnishing.jpg" }
  ],
  sliderTitle: "India's Finest Online Furniture Brand",
  shortDescription: "Buy Furniture Online from our extensive collection of wooden furniture units to give your home an elegant touch at affordable prices.",
  fullDescription: "Buy Furniture Online from our extensive collection of wooden furniture units to give your home an elegant touch at affordable prices. We offer a wide range of Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus deleniti dolor a aspernatur esse necessitatibus nihil blanditiis repellat ipsa ut praesentium qui, neque quidem soluta earum impedit eveniet corrupti fugit.",
    sliderItems: [
      { id: 1, title: "Living Room", img: "/images/Home/livingroom.jpg", url: "" },
      { id: 2, title: "Bedroom", img: "/images/Home/bedroom.jpg", url: "" },
      { id: 3, title: "Dining Room", img: "/images/Home/diningroom.jpg", url: "" },
      { id: 4, title: "Study", img: "/images/Home/studytable.jpg", url: "" },
      { id: 5, title: "Outdoor", img: "/images/Home/outdoor.jpg", url: "" },
      { id: 6, title: "Living Room", img: "/images/Home/livingroom.jpg", url: "" },
      { id: 7, title: "Bedroom", img: "/images/Home/bedroom.jpg", url: "" },
      { id: 8, title: "Dining Room", img: "/images/Home/diningroom.jpg", url: "" }
    ]
};

export default function FurnitureCategories() {
  const [data, setData] = useState<FurnitureCategoriesData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [startIndex, setStartIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('categories');
        
        if (response.data && response.data.content) {
          setData({
            sectionTitle: response.data.content.sectionTitle || defaultData.sectionTitle,
            filterButtons: response.data.content.filterButtons || defaultData.filterButtons,
            categories: response.data.content.categories || defaultData.categories,
            sliderTitle: response.data.content.sliderTitle || defaultData.sliderTitle,
            shortDescription: response.data.content.shortDescription || defaultData.shortDescription,
            fullDescription: response.data.content.fullDescription || defaultData.fullDescription,
            sliderItems: response.data.content.sliderItems || defaultData.sliderItems
          });
        }
      } catch (error) {
        console.error('Error fetching categories section data:', error);
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

  const filteredCategories =
    filter === "All"
      ? data.categories
      : data.categories.filter((item) => item.category === filter);

  const visibleCount = 5; // show 5 cards like screenshot

  const nextSlide = () => {
    if (startIndex + visibleCount < data.sliderItems.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <>
    <section className="category-section">
    <div className={styles.container}>
      {/* Section 1 - Categories */}
      <h2 className={styles.title}>{data.sectionTitle}</h2>
      <div className={styles.filterButtons}>
        {data.filterButtons.map((btn) => (
          <button
            key={btn}
            className={filter === btn ? styles.active : ""}
            onClick={() => setFilter(btn)}
          >
            {btn}
          </button>
        ))}
      </div>

      <div className={styles.gridContainer}>
        {filteredCategories.map((item) => (
          <div key={item.id} className={styles.card}>
            <img src={item.img} alt={item.title} />
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
    </section>
    <div className={styles.sliderSection}>
        <h2 className={styles.title2}>{data.sliderTitle}</h2>
         <p className={styles.subtitle2}>
        {showMore ? data.fullDescription : data.shortDescription}{" "}
        <span
          className={styles.moreLink}
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? " Show less" : "...more"}
        </span>
      </p>

        <div className={styles.sliderWrapper}>
          <button
            className={`${styles.navBtn} ${styles.left}`}
            onClick={prevSlide}
            disabled={startIndex === 0}
          >
            &#8249;
          </button>

          <div className={styles.sliderTrack}>
            {data.sliderItems
              .slice(startIndex, startIndex + visibleCount)
              .map((item) => {
                const handleSliderClick = () => {
                  if (item.url) {
                    window.location.href = item.url;
                  }
                };
                return (
                  <div 
                    key={item.id} 
                    className={styles.sliderCard}
                    onClick={handleSliderClick}
                    style={{ cursor: item.url ? 'pointer' : 'default' }}
                  >
                    <img src={item.img} alt={item.title} />
                    <p>{item.title}</p>
                  </div>
                );
              })}
          </div>

          <button
            className={`${styles.navBtn} ${styles.right}`}
            onClick={nextSlide}
            disabled={startIndex + visibleCount >= data.sliderItems.length}
          >
            &#8250;
          </button>
        </div>
      </div>
  </>);
}
