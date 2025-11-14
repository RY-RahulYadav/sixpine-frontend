
import { useState, useEffect } from "react";
import styles from "./FurnitureInfoSection.module.css";
import { homepageAPI } from '../../services/api';

interface FurnitureInfoContent {
  mainHeading: string;
  introParagraphs: string[];
  materialsSection: {
    heading: string;
    intro: string;
    materials: Array<{ title: string; description: string }>;
  };
  shopByRoomSection: {
    heading: string;
    intro: string;
    rooms: Array<{ title: string; description: string }>;
  };
  exploreMoreSection: {
    heading: string;
    intro: string;
    items: Array<{ title: string; description: string }>;
  };
  upholsterySection: {
    heading: string;
    intro: string;
    options: Array<{ title: string; description: string }>;
  };
  buyingTipsSection: {
    heading: string;
    intro: string;
    tips: Array<{ title: string; description: string }>;
  };
  careTipsSection: {
    heading: string;
    tips: string[];
  };
  whyChooseSection: {
    heading: string;
    items: Array<{ title: string; description: string }>;
  };
  experienceStoresSection: {
    heading: string;
    intro: string;
  };
  ctaSection: {
    heading: string;
    paragraphs: string[];
    highlightText: string;
  };
}

const defaultContent: FurnitureInfoContent = {
  mainHeading: "Buy Furniture Online at Sixpine – India's One-Stop Furniture & Home Décor Destination",
  introParagraphs: [
    "A home is where comfort lives, and furniture brings that comfort to life. Whether you're setting up a new space or giving your interiors a refreshing makeover, Sixpine offers everything you need under one roof. From elegant wooden furniture to modern décor, our collection is designed to complement every style of living.",
    "At Sixpine, we provide a vast assortment of ready-made and customizable furniture online in India. Since 2024, we've been serving customers with high-quality pieces like sofas, dining tables, wardrobes, beds, and much more—crafted from premium materials. Alongside furniture, our exclusive home décor range features wall art, planters, photo frames, tableware, glassware, and kitchen organizers. Whether you prefer minimalistic, classic, or bold designs, Sixpine makes it easy to find furniture that blends seamlessly with your lifestyle.",
  ],
  materialsSection: {
    heading: "Discover Furniture Materials at Sixpine",
    intro: "Every home is unique, and so are the materials that bring furniture to life. Sixpine offers furniture crafted in a variety of premium woods and materials, each with its own charm:",
    materials: [
      { title: "Sheesham Wood", description: "Rich-toned, dense, and durable, perfect for bedrooms and living rooms." },
      { title: "Mango Wood", description: "Strong yet light in color, with striking natural grain patterns." },
      { title: "Teak Wood", description: "Highly durable and moisture-resistant, ideal for both indoor and outdoor spaces." },
      { title: "Engineered Wood", description: "Affordable, sleek, and versatile for budget-friendly home makeovers." },
      { title: "Ash Wood", description: "Light-colored with a smooth finish, blending natural warmth with modern design." },
    ],
  },
  shopByRoomSection: {
    heading: "Shop by Room – Furniture for Every Corner of Your Home",
    intro: "At Sixpine, we curate furniture that doesn't just serve functionality but also transforms your space into a reflection of your style.",
    rooms: [
      { title: "Living Room", description: "Sofas, recliners, center tables, lounge chairs, rocking chairs, TV units, and sofa-cum-beds." },
      { title: "Bedroom", description: "Beds with storage, wardrobes, dressing tables, bunk beds, mattresses, and cushions." },
      { title: "Dining Room", description: "Dining tables, chairs, crockery units, folding dining sets, and sideboards." },
      { title: "Study Room", description: "Compact study tables, ergonomic chairs, foldable desks, and bookshelves." },
      { title: "Kids' Room", description: "Playful and vibrant beds, wardrobes, and study tables." },
      { title: "Office Furniture", description: "Ergonomic office chairs, workstations, executive tables, and office sofas." },
      { title: "Outdoor Spaces", description: "Swing chairs, garden tables, planters, and pet houses." },
      { title: "Entryway & Foyer", description: "Shoe racks, benches, and console tables to make the best first impression." },
      { title: "Restaurant Furniture", description: "Hotel chairs, bar stools, trolleys, and tables for commercial needs." },
    ],
  },
  exploreMoreSection: {
    heading: "Explore More at Sixpine – Beyond Furniture",
    intro: "Our vision is to make every home complete, which is why Sixpine also offers:",
    items: [
      { title: "Home Décor", description: "Wall mirrors, lamps, photo frames, carpets, and indoor plants to elevate your interiors." },
      { title: "Home Furnishings", description: "Cushions, curtains, and premium fabrics for a cozy vibe." },
      { title: "Lamps & Lights", description: "Chandeliers, table lamps, pendant lights, and designer indoor lighting." },
      { title: "Outdoor Furniture", description: "Durable and stylish options for balconies, patios, and gardens." },
      { title: "Mattresses", description: "High-quality latex, orthopedic, and foldable mattresses for restful sleep." },
      { title: "Modular Kitchen", description: "Functional, space-saving modular designs for modern Indian homes." },
    ],
  },
  upholsterySection: {
    heading: "Upholstery Options at Sixpine",
    intro: "Choosing the right fabric adds character and comfort to your furniture. At Sixpine, you'll find:",
    options: [
      { title: "Cotton", description: "Durable, eco-friendly, and easy to maintain." },
      { title: "Velvet", description: "Luxurious, plush, and perfect for elegant living rooms." },
      { title: "Leatherette", description: "Stylish, practical, and affordable alternative to leather." },
    ],
  },
  buyingTipsSection: {
    heading: "Things to Consider Before Buying Furniture Online",
    intro: "Buying furniture online can be seamless if you keep a few things in mind:",
    tips: [
      { title: "Material", description: "Understand durability and finish." },
      { title: "Design", description: "Pick what matches your décor style." },
      { title: "Color", description: "Ensure it complements your interiors." },
      { title: "Size", description: "Measure your space and check dimensions for easy fit." },
      { title: "Price", description: "Balance between affordability and quality." },
      { title: "Reviews", description: "Learn from customer experiences." },
      { title: "Warranty", description: "Check coverage details." },
      { title: "Payment Security", description: "Shop from a trusted platform like Sixpine." },
    ],
  },
  careTipsSection: {
    heading: "Furniture Care Tips",
    tips: [
      "Dust regularly with a soft cloth or vacuum brush.",
      "Clean monthly using mild water-vinegar spray and wipe dry.",
      "Use felt pads under furniture legs to prevent scratches.",
      "Call for professional inspection for long-term maintenance.",
    ],
  },
  whyChooseSection: {
    heading: "Why Choose Sixpine Furniture?",
    items: [
      { title: "Durability & Functionality", description: "Built for years of use." },
      { title: "Comfort & Style", description: "Designed to match every lifestyle." },
      { title: "Low Maintenance", description: "Easy to care for, saving long-term costs." },
      { title: "Cost-Effective Investment", description: "Premium designs at fair prices." },
    ],
  },
  experienceStoresSection: {
    heading: "Sixpine Experience Stores – PAN India Presence",
    intro: "Sixpine has over 100+ experience stores across India, with many more opening soon. Visit us in person to explore the diversity of our collections, or shop online for convenience. Wherever you are, Sixpine is always nearby when you search for the best furniture shop near me.",
  },
  ctaSection: {
    heading: "Shop Affordable, Premium Furniture at Sixpine",
    paragraphs: [
      "Buying furniture is no longer a compromise between price and quality. At Sixpine, we believe in offering both—premium designs at affordable prices. From living room to bedroom, from office to outdoors, every product is thoughtfully designed to bring joy and comfort to your home.",
    ],
    highlightText: "✨ Discover Sixpine today – where quality meets affordability, and every home finds its perfect fit.",
  },
};

const FurnitureInfoSection = () => {
  const [content, setContent] = useState<FurnitureInfoContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('furniture-info-section');
        
        if (response.data && response.data.content) {
          setContent(response.data.content);
        }
      } catch (error) {
        console.error('Error fetching furniture info section data:', error);
        // Keep default data if API fails
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

  return (
    <div className={styles.infoContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.mainHeading}>
          {content.mainHeading}
        </h1>
        {content.introParagraphs.map((para, index) => (
          <p key={index} className={styles.introPara}>
            {para}
          </p>
        ))}
      </section>

      {/* Materials Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{content.materialsSection.heading}</h2>
        <p className={styles.sectionIntro}>
          {content.materialsSection.intro}
        </p>
        <div className={styles.gridContainer}>
          {content.materialsSection.materials.map((material, index) => (
            <div key={index} className={styles.card}>
              <h3>{material.title}</h3>
              <p>{material.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Room */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{content.shopByRoomSection.heading}</h2>
        <p className={styles.sectionIntro}>
          {content.shopByRoomSection.intro}
        </p>
        <div className={styles.roomGrid}>
          {content.shopByRoomSection.rooms.map((room, index) => (
            <div key={index} className={styles.roomCard}>
              <h3>{room.title}</h3>
              <p>{room.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Explore More */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{content.exploreMoreSection.heading}</h2>
        <p className={styles.sectionIntro}>
          {content.exploreMoreSection.intro}
        </p>
        <ul className={styles.featureList}>
          {content.exploreMoreSection.items.map((item, index) => (
            <li key={index}><strong>{item.title}</strong> – {item.description}</li>
          ))}
        </ul>
      </section>

      {/* Upholstery Options */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{content.upholsterySection.heading}</h2>
        <p className={styles.sectionIntro}>
          {content.upholsterySection.intro}
        </p>
        <div className={styles.upholsteryGrid}>
          {content.upholsterySection.options.map((option, index) => (
            <div key={index} className={styles.upholsteryCard}>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buying Tips */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{content.buyingTipsSection.heading}</h2>
        <p className={styles.sectionIntro}>
          {content.buyingTipsSection.intro}
        </p>
        <ul className={styles.tipsList}>
          {content.buyingTipsSection.tips.map((tip, index) => (
            <li key={index}><strong>{tip.title}</strong> – {tip.description}</li>
          ))}
        </ul>
      </section>

      {/* Care Tips */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{content.careTipsSection.heading}</h2>
        <ul className={styles.careTips}>
          {content.careTipsSection.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>

      {/* Why Choose Sixpine */}
      <section className={styles.whySection}>
        <h2 className={styles.sectionHeading}>{content.whyChooseSection.heading}</h2>
        <div className={styles.whyGrid}>
          {content.whyChooseSection.items.map((item, index) => (
            <div key={index} className={styles.whyCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Stores */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{content.experienceStoresSection.heading}</h2>
        <p className={styles.sectionIntro}>
          {content.experienceStoresSection.intro}
        </p>
      </section>

      {/* Closing CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.sectionHeading}>{content.ctaSection.heading}</h2>
        {content.ctaSection.paragraphs.map((para, index) => (
          <p key={index} className={styles.ctaPara}>
            {para}
          </p>
        ))}
        <p className={styles.ctaHighlight}>
          {content.ctaSection.highlightText}
        </p>
      </section>
    </div>
  );
};

export default FurnitureInfoSection;
