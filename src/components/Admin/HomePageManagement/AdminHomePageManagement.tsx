import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface HomePageContent {
  id: number;
  section_key: string;
  section_name: string;
  content: any;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  buttonText: string;
  backgroundColor: string;
  imageSrc: string;
}

interface SpecialDealBanner {
  badgeText: string;
  uptoText: string;
  discountText: string;
  instantDiscountText: string;
  buttonText: string;
  backgroundImage: string;
}

interface MattressBanner {
  badgeText: string;
  badgeIcon: string;
  title: string;
  subtitle: string;
  startingText: string;
  price: string;
  deliveryText: string;
  backgroundImage: string;
}

interface HeroSection2Item {
  id: number;
  imageUrl: string;
  text: string;
  altText?: string;
}

interface HeroSection2Section {
  id: number;
  title: string;
  linkText: string;
  linkUrl: string;
  items: HeroSection2Item[];
  isSpecial?: boolean;
}

interface HeroSection3CategoryItem {
  id: number;
  name: string;
  img: string;
}

interface HeroSection3SliderCard {
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
  categoryItems: HeroSection3CategoryItem[];
  sliderCards: HeroSection3SliderCard[];
}

interface FurnitureCategoryItem {
  id: number;
  title: string;
  category: string;
  img: string;
}

interface FurnitureSliderItem {
  id: number;
  title: string;
  img: string;
  url?: string;
}

interface FurnitureCategoriesData {
  sectionTitle: string;
  filterButtons: string[];
  categories: FurnitureCategoryItem[];
  sliderTitle: string;
  shortDescription: string;
  fullDescription: string;
  sliderItems: FurnitureSliderItem[];
}

interface FurnitureSectionProduct {
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
    products: FurnitureSectionProduct[];
  };
  topRated: {
    title: string;
    subtitle: string;
    products: FurnitureSectionProduct[];
  };
}

interface OfferProduct {
  imageUrl: string;
  navigateUrl: string;
}

interface FurnitureOfferSection {
  id: number;
  title: string;
  link: string;
  linkUrl?: string;
  products: OfferProduct[];
}

interface FurnitureOfferSectionsData {
  sections: FurnitureOfferSection[];
}

interface FeatureCardItem {
  icon: string;
  count: string;
  text: string;
}

interface FeatureCardData {
  featuresBar: FeatureCardItem[];
  saleTimerActive: boolean;
  countdownEndDate: string;
  offerText: string;
  discountText: string;
  infoBadges: Array<{
    icon: string;
    topText: string;
    bottomText: string;
  }>;
}

interface BannerCard {
  img: string;
  title?: string;
  text?: string;
}

interface BannerProduct {
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

interface BannerCardsData {
  heading: string;
  bannerCards: BannerCard[];
  slider1Title: string;
  slider1ViewAllUrl?: string;
  slider1Products: BannerProduct[];
  slider2Title: string;
  slider2ViewAllUrl?: string;
  slider2Products: BannerProduct[];
}

interface FurnitureInfoContent {
  mainHeading: string;
  introParagraphs: string[];
  materialsSection: {
    heading: string;
    intro: string;
    materials: Array<{
      title: string;
      description: string;
    }>;
  };
  shopByRoomSection: {
    heading: string;
    intro: string;
    rooms: Array<{
      title: string;
      description: string;
    }>;
  };
  exploreMoreSection: {
    heading: string;
    intro: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  upholsterySection: {
    heading: string;
    intro: string;
    options: Array<{
      title: string;
      description: string;
    }>;
  };
  buyingTipsSection: {
    heading: string;
    intro: string;
    tips: Array<{
      title: string;
      description: string;
    }>;
  };
  careTipsSection: {
    heading: string;
    tips: string[];
  };
  whyChooseSection: {
    heading: string;
    items: Array<{
      title: string;
      description: string;
    }>;
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

const AdminHomePageManagement: React.FC = () => {
  const [, setSections] = useState<HomePageContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [editingSection, setEditingSection] = useState<HomePageContent | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Default hero slides
  const defaultHeroSlides: HeroSlide[] = [
    {
      id: 1,
      title: 'Be the Perfect Host',
      subtitle: 'Coffee Table',
      price: '₹ 2,499',
      buttonText: 'BUY NOW',
      backgroundColor: '#C4A484',
      imageSrc: '/images/Home/studytable.jpg'
    },
    {
      id: 2,
      title: 'Comfort Redefined',
      subtitle: 'Sofa Collection',
      price: '₹ 15,999',
      buttonText: 'BUY NOW',
      backgroundColor: '#8B7355',
      imageSrc: '/images/Home/furnishing.jpg'
    },
    {
      id: 3,
      title: 'Sleep in Style',
      subtitle: 'Bedroom Sets',
      price: '₹ 25,999',
      buttonText: 'BUY NOW',
      backgroundColor: '#A68B5B',
      imageSrc: '/images/Home/livingroom.jpg'
    }
  ];

  // Default right side banners
  const defaultSpecialDealBanner: SpecialDealBanner = {
    badgeText: 'SPECIAL DEAL',
    uptoText: 'UPTO',
    discountText: '₹5000 OFF',
    instantDiscountText: 'INSTANT DISCOUNT',
    buttonText: 'BUY NOW',
    backgroundImage: ''
  };

  const defaultMattressBanner: MattressBanner = {
    badgeText: 'Ships in 2 Days',
    badgeIcon: 'truck',
    title: 'MATTRESS',
    subtitle: 'That Turns Sleep into Therapy',
    startingText: 'Starting From',
    price: '₹9,999',
    deliveryText: 'FREE Delivery Available',
    backgroundImage: ''
  };

  const defaultBottomBanner = {
    imageUrl: 'https://ii1.pepperfry.com/assets/a08eed1c-bbbd-4e8b-b381-07df5fbfe959.jpg',
    altText: 'Sixpine Banner'
  };

  // Hero section form data - initialize with defaults
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [specialDealBanner, setSpecialDealBanner] = useState<SpecialDealBanner>(defaultSpecialDealBanner);
  const [mattressBanner, setMattressBanner] = useState<MattressBanner>(defaultMattressBanner);
  const [bottomBanner, setBottomBanner] = useState(defaultBottomBanner);

  // Default HeroSection2 data
  const defaultHeroSection2: HeroSection2Section[] = [
    {
      id: 1,
      title: 'Pick up where you left off',
      linkText: 'See more',
      linkUrl: '#',
      items: [
        { id: 1, imageUrl: '/images/Home/sofa1.jpg', text: 'Sixpine Premium', altText: 'Sofa' },
        { id: 2, imageUrl: '/images/Home/sofa2.jpg', text: 'LEGACY OF COMFORT...', altText: 'Sofa' },
        { id: 3, imageUrl: '/images/Home/sofa3.jpg', text: 'LEGACY OF COMFORT...', altText: 'Sofa' },
        { id: 4, imageUrl: '/images/Home/sofa4.jpg', text: 'LEGACY OF COMFORT...', altText: 'Sofa' }
      ]
    },
    {
      id: 2,
      title: 'New home arrivals under $50',
      linkText: 'Shop the latest from Home',
      linkUrl: '#',
      isSpecial: true,
      items: [
        { id: 1, imageUrl: '/images/Home/Cookware1.jpg', text: 'Kitchen & Dining', altText: 'Cookware' },
        { id: 2, imageUrl: '/images/Home/Cans.jpg', text: 'Home Improvement', altText: 'Cans' },
        { id: 3, imageUrl: '/images/Home/Decor.jpg', text: 'Décor', altText: 'Decor' },
        { id: 4, imageUrl: '/images/Home/Pillow.jpg', text: 'Bedding & Bath', altText: 'Pillow' }
      ]
    },
    {
      id: 3,
      title: 'Up to 60% off | Furniture & mattresses',
      linkText: 'Explore all',
      linkUrl: '#',
      items: [
        { id: 1, imageUrl: '/images/Home/sofa4.jpg', text: 'Mattresses & more', altText: 'Mattress' },
        { id: 2, imageUrl: '/images/Home/sofa3.jpg', text: 'Office chairs & more', altText: 'Chair' },
        { id: 3, imageUrl: '/images/Home/sofa2.jpg', text: 'Sofas & more', altText: 'Sofa' },
        { id: 4, imageUrl: '/images/Home/sofa1.jpg', text: 'Bean bags & more', altText: 'Bean bag' }
      ]
    },
    {
      id: 4,
      title: 'More items to consider',
      linkText: 'See more',
      linkUrl: '#',
      isSpecial: true,
      items: [
        { id: 1, imageUrl: '/images/Home/1.webp', text: 'MosQuick® Stainless st...', altText: 'Clip1' },
        { id: 2, imageUrl: '/images/Home/2.webp', text: 'FDSHIP Stainless Stee...', altText: 'Clip2' },
        { id: 3, imageUrl: '/images/Home/3.webp', text: 'WEWEL® Premium Stai...', altText: 'Clip3' },
        { id: 4, imageUrl: '/images/Home/4.webp', text: 'Marita Heavy Duty Clot...', altText: 'Clip4' }
      ]
    }
  ];

  const [heroSection2Data, setHeroSection2Data] = useState<HeroSection2Section[]>(defaultHeroSection2);
  const [editingHeroSection2, setEditingHeroSection2] = useState<HomePageContent | null>(null);

  // Default HeroSection3 data - exactly 8 category items
  const defaultHeroSection3: HeroSection3Data = {
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

  const [heroSection3Data, setHeroSection3Data] = useState<HeroSection3Data>(defaultHeroSection3);
  const [editingHeroSection3, setEditingHeroSection3] = useState<HomePageContent | null>(null);

  // Default Furniture Categories data
  const defaultFurnitureCategories: FurnitureCategoriesData = {
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

  const [furnitureCategoriesData, setFurnitureCategoriesData] = useState<FurnitureCategoriesData>(defaultFurnitureCategories);
  const [editingFurnitureCategories, setEditingFurnitureCategories] = useState<HomePageContent | null>(null);

  // Default Furniture Sections data
  const defaultFurnitureSections: FurnitureSectionsData = {
    discover: {
      title: "Discover what's new",
      subtitle: "Designed to refresh your everyday life",
      products: []
    },
    topRated: {
      title: "Top-Rated by Indian Homes",
      subtitle: "Crafted to complement Indian lifestyles",
      products: []
    }
  };

  const [furnitureSectionsData, setFurnitureSectionsData] = useState<FurnitureSectionsData>(defaultFurnitureSections);
  const [editingFurnitureSections, setEditingFurnitureSections] = useState<HomePageContent | null>(null);

  // Default Furniture Offer Sections data - exactly 3 sections
  const defaultFurnitureOfferSections: FurnitureOfferSectionsData = {
    sections: [
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
    ]
  };

  const [furnitureOfferSectionsData, setFurnitureOfferSectionsData] = useState<FurnitureOfferSectionsData>(defaultFurnitureOfferSections);
  const [editingFurnitureOfferSections, setEditingFurnitureOfferSections] = useState<HomePageContent | null>(null);

  // Default Feature Card data - fixed number of features and badges
  const defaultFeatureCardData: FeatureCardData = {
    featuresBar: [
      { icon: "Store", count: "100+", text: "Experience Stores Across<br/>India" },
      { icon: "Truck", count: "350+", text: "Delivery Centers<br/>Across India" },
      { icon: "ThumbsUp", count: "10 Lakh +", text: "Satisfied Customers" },
      { icon: "BadgeDollarSign", count: "Lowest Price", text: "Guarantee" },
      { icon: "Shield", count: "36 Months*", text: "Warranty" },
    ],
    saleTimerActive: true,
    countdownEndDate: "2025-10-01T23:59:59",
    offerText: "Visit Your Nearest Store & Get Extra UPTO",
    discountText: "₹ 25,000 INSTANT DISCOUNT",
    infoBadges: [
      { icon: "Users", topText: "20 Lakh+", bottomText: "Customers" },
      { icon: "Package", topText: "Free", bottomText: "Delivery" },
      { icon: "CheckCircle", topText: "Best", bottomText: "Warranty*" },
      { icon: "Building2", topText: "15 Lakh sq. ft.", bottomText: "Mfg. Unit" },
    ],
  };

  const [featureCardData, setFeatureCardData] = useState<FeatureCardData>(defaultFeatureCardData);
  const [editingFeatureCard, setEditingFeatureCard] = useState<HomePageContent | null>(null);

  // Default Banner Cards data
  const defaultBannerCardsData: BannerCardsData = {
    heading: "Crafted In India",
    bannerCards: [
      { img: "/images/Home/bannerCards.webp" },
      { img: "/images/Home/bannerCards.webp" },
    ],
    slider1Title: "Customers frequently viewed | Popular products in the last 7 days",
    slider1ViewAllUrl: "#",
    slider1Products: [
      
    ],
    slider2Title: "Inspired by your browsing history",
    slider2ViewAllUrl: "#",
    slider2Products: [
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
    ],
  };

  const [bannerCardsData, setBannerCardsData] = useState<BannerCardsData>(defaultBannerCardsData);
  const [editingBannerCards, setEditingBannerCards] = useState<HomePageContent | null>(null);

  // Default Furniture Info Section data
  const defaultFurnitureInfoContent: FurnitureInfoContent = {
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

  const [furnitureInfoContent, setFurnitureInfoContent] = useState<FurnitureInfoContent>(defaultFurnitureInfoContent);
  const [editingFurnitureInfo, setEditingFurnitureInfo] = useState<HomePageContent | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  useEffect(() => {
    fetchSections();
    fetchProductsForSections();
  }, []);

  const fetchProductsForSections = async () => {
    try {
      setLoadingProducts(true);
      const response = await adminAPI.getProducts({ page_size: 1000, is_active: true });
      const productsData = response.data.results || response.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getHomepageContent();
      const sectionsData = response.data.results || response.data || [];
      setSections(sectionsData);
      
      // Load hero section if it exists
      const heroSection = sectionsData.find((s: HomePageContent) => s.section_key === 'hero');
      if (heroSection && heroSection.content) {
        setEditingSection(heroSection);
        
        // Load slides
        if (heroSection.content.slides && Array.isArray(heroSection.content.slides) && heroSection.content.slides.length > 0) {
          setHeroSlides(heroSection.content.slides);
        } else {
          setHeroSlides(defaultHeroSlides);
        }
        
        // Load special deal banner
        if (heroSection.content.specialDealBanner) {
          setSpecialDealBanner({
            ...defaultSpecialDealBanner,
            ...heroSection.content.specialDealBanner
          });
        } else {
          setSpecialDealBanner(defaultSpecialDealBanner);
        }
        
        // Load mattress banner
        if (heroSection.content.mattressBanner) {
          setMattressBanner({
            ...defaultMattressBanner,
            ...heroSection.content.mattressBanner
          });
        } else {
          setMattressBanner(defaultMattressBanner);
        }
        
        // Load bottom banner
        if (heroSection.content.bottomBanner) {
          setBottomBanner({
            ...defaultBottomBanner,
            ...heroSection.content.bottomBanner
          });
        } else {
          setBottomBanner(defaultBottomBanner);
        }
      } else {
        // No data exists - use defaults
        setEditingSection(null);
        setHeroSlides(defaultHeroSlides);
        setSpecialDealBanner(defaultSpecialDealBanner);
        setMattressBanner(defaultMattressBanner);
        setBottomBanner(defaultBottomBanner);
      }
      
      // Load HeroSection2 if it exists
      const heroSection2 = sectionsData.find((s: HomePageContent) => s.section_key === 'hero2');
      if (heroSection2 && heroSection2.content && heroSection2.content.sections) {
        setEditingHeroSection2(heroSection2);
        if (Array.isArray(heroSection2.content.sections) && heroSection2.content.sections.length > 0) {
          setHeroSection2Data(heroSection2.content.sections);
        } else {
          setHeroSection2Data(defaultHeroSection2);
        }
      } else {
        setEditingHeroSection2(null);
        setHeroSection2Data(defaultHeroSection2);
      }

      // Load HeroSection3 if it exists
      const heroSection3 = sectionsData.find((s: HomePageContent) => s.section_key === 'hero3');
      if (heroSection3 && heroSection3.content) {
        setEditingHeroSection3(heroSection3);
        const categoryItems = heroSection3.content.categoryItems || [];
        // Ensure exactly 8 items
        const finalItems = categoryItems.length === 8 
          ? categoryItems 
          : categoryItems.length < 8
          ? [...categoryItems, ...defaultHeroSection3.categoryItems.slice(categoryItems.length, 8)]
          : categoryItems.slice(0, 8);
        
        setHeroSection3Data({
          title: heroSection3.content.title || defaultHeroSection3.title,
          subtitle: heroSection3.content.subtitle || defaultHeroSection3.subtitle,
          offerBadge: heroSection3.content.offerBadge || defaultHeroSection3.offerBadge,
          leftProductCard: heroSection3.content.leftProductCard || defaultHeroSection3.leftProductCard,
          categoryItems: finalItems.slice(0, 8), // Enforce exactly 8
          sliderCards: heroSection3.content.sliderCards || defaultHeroSection3.sliderCards
        });
      } else {
        setEditingHeroSection3(null);
        setHeroSection3Data(defaultHeroSection3);
      }

      // Load Furniture Categories if it exists
      const furnitureCategories = sectionsData.find((s: HomePageContent) => s.section_key === 'categories');
      if (furnitureCategories && furnitureCategories.content) {
        setEditingFurnitureCategories(furnitureCategories);
        setFurnitureCategoriesData({
          sectionTitle: furnitureCategories.content.sectionTitle || defaultFurnitureCategories.sectionTitle,
          filterButtons: furnitureCategories.content.filterButtons || defaultFurnitureCategories.filterButtons,
          categories: furnitureCategories.content.categories || defaultFurnitureCategories.categories,
          sliderTitle: furnitureCategories.content.sliderTitle || defaultFurnitureCategories.sliderTitle,
          shortDescription: furnitureCategories.content.shortDescription || defaultFurnitureCategories.shortDescription,
          fullDescription: furnitureCategories.content.fullDescription || defaultFurnitureCategories.fullDescription,
          sliderItems: furnitureCategories.content.sliderItems || defaultFurnitureCategories.sliderItems
        });
      } else {
        setEditingFurnitureCategories(null);
        setFurnitureCategoriesData(defaultFurnitureCategories);
      }

      // Load Furniture Sections if it exists
      const furnitureSections = sectionsData.find((s: HomePageContent) => s.section_key === 'furniture-sections');
      if (furnitureSections && furnitureSections.content) {
        setEditingFurnitureSections(furnitureSections);
        setFurnitureSectionsData({
          discover: furnitureSections.content.discover || defaultFurnitureSections.discover,
          topRated: furnitureSections.content.topRated || defaultFurnitureSections.topRated
        });
      } else {
        setEditingFurnitureSections(null);
        setFurnitureSectionsData(defaultFurnitureSections);
      }

      // Load Furniture Offer Sections if it exists
      const furnitureOfferSections = sectionsData.find((s: HomePageContent) => s.section_key === 'furniture-offer-sections');
      if (furnitureOfferSections && furnitureOfferSections.content) {
        setEditingFurnitureOfferSections(furnitureOfferSections);
        // Migrate old string[] format to OfferProduct[] format if needed
        const sections = furnitureOfferSections.content.sections || [];
        const migratedSections = sections.map((section: any) => ({
          ...section,
          products: section.products?.map((p: any) => 
            typeof p === 'string' 
              ? { imageUrl: p, navigateUrl: '#' }
              : p
          ) || []
        }));
        // Ensure exactly 3 sections
        const finalSections = migratedSections.length >= 3 
          ? migratedSections.slice(0, 3)
          : [...migratedSections, ...defaultFurnitureOfferSections.sections.slice(migratedSections.length, 3)];
        setFurnitureOfferSectionsData({ sections: finalSections });
      } else {
        setEditingFurnitureOfferSections(null);
        setFurnitureOfferSectionsData(defaultFurnitureOfferSections);
      }

      // Load Feature Card if it exists
      const featureCard = sectionsData.find((s: HomePageContent) => s.section_key === 'feature-card');
      if (featureCard && featureCard.content) {
        setEditingFeatureCard(featureCard);
        setFeatureCardData({
          featuresBar: featureCard.content.featuresBar || defaultFeatureCardData.featuresBar,
          saleTimerActive: featureCard.content.saleTimerActive !== undefined ? featureCard.content.saleTimerActive : defaultFeatureCardData.saleTimerActive,
          countdownEndDate: featureCard.content.countdownEndDate || defaultFeatureCardData.countdownEndDate,
          offerText: featureCard.content.offerText || defaultFeatureCardData.offerText,
          discountText: featureCard.content.discountText || defaultFeatureCardData.discountText,
          infoBadges: featureCard.content.infoBadges || defaultFeatureCardData.infoBadges
        });
      } else {
        setEditingFeatureCard(null);
        setFeatureCardData(defaultFeatureCardData);
      }

      // Load Banner Cards if it exists
      const bannerCards = sectionsData.find((s: HomePageContent) => s.section_key === 'banner-cards');
      if (bannerCards && bannerCards.content) {
        setEditingBannerCards(bannerCards);
        // Ensure exactly 2 banners
        const banners = bannerCards.content.bannerCards || defaultBannerCardsData.bannerCards;
        const finalBanners = banners.length >= 2 
          ? banners.slice(0, 2)
          : [...banners, ...defaultBannerCardsData.bannerCards.slice(banners.length, 2)];
        setBannerCardsData({
          heading: bannerCards.content.heading || defaultBannerCardsData.heading,
          bannerCards: finalBanners,
          slider1Title: bannerCards.content.slider1Title || defaultBannerCardsData.slider1Title,
          slider1ViewAllUrl: bannerCards.content.slider1ViewAllUrl || defaultBannerCardsData.slider1ViewAllUrl,
          slider1Products: bannerCards.content.slider1Products || defaultBannerCardsData.slider1Products,
          slider2Title: bannerCards.content.slider2Title || defaultBannerCardsData.slider2Title,
          slider2ViewAllUrl: bannerCards.content.slider2ViewAllUrl || defaultBannerCardsData.slider2ViewAllUrl,
          slider2Products: bannerCards.content.slider2Products || defaultBannerCardsData.slider2Products
        });
      } else {
        setEditingBannerCards(null);
        setBannerCardsData(defaultBannerCardsData);
      }

      // Load Furniture Info Section if it exists
      const furnitureInfo = sectionsData.find((s: HomePageContent) => s.section_key === 'furniture-info-section');
      if (furnitureInfo && furnitureInfo.content) {
        setEditingFurnitureInfo(furnitureInfo);
        setFurnitureInfoContent({
          mainHeading: furnitureInfo.content.mainHeading || defaultFurnitureInfoContent.mainHeading,
          introParagraphs: furnitureInfo.content.introParagraphs || defaultFurnitureInfoContent.introParagraphs,
          materialsSection: furnitureInfo.content.materialsSection || defaultFurnitureInfoContent.materialsSection,
          shopByRoomSection: furnitureInfo.content.shopByRoomSection || defaultFurnitureInfoContent.shopByRoomSection,
          exploreMoreSection: furnitureInfo.content.exploreMoreSection || defaultFurnitureInfoContent.exploreMoreSection,
          upholsterySection: furnitureInfo.content.upholsterySection || defaultFurnitureInfoContent.upholsterySection,
          buyingTipsSection: furnitureInfo.content.buyingTipsSection || defaultFurnitureInfoContent.buyingTipsSection,
          careTipsSection: furnitureInfo.content.careTipsSection || defaultFurnitureInfoContent.careTipsSection,
          whyChooseSection: furnitureInfo.content.whyChooseSection || defaultFurnitureInfoContent.whyChooseSection,
          experienceStoresSection: furnitureInfo.content.experienceStoresSection || defaultFurnitureInfoContent.experienceStoresSection,
          ctaSection: furnitureInfo.content.ctaSection || defaultFurnitureInfoContent.ctaSection
        });
      } else {
        setEditingFurnitureInfo(null);
        setFurnitureInfoContent(defaultFurnitureInfoContent);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching homepage content:', err);
      setError(err.response?.data?.error || 'Failed to load homepage content');
      // On error, keep defaults
      setHeroSlides(defaultHeroSlides);
      setHeroSection2Data(defaultHeroSection2);
      setHeroSection3Data(defaultHeroSection3);
      setFurnitureCategoriesData(defaultFurnitureCategories);
      setFurnitureSectionsData(defaultFurnitureSections);
      setFurnitureOfferSectionsData(defaultFurnitureOfferSections);
      setFeatureCardData(defaultFeatureCardData);
      setBannerCardsData(defaultBannerCardsData);
      setFurnitureInfoContent(defaultFurnitureInfoContent);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeroSection = async () => {
    try {
      setSaving(true);
      
      const heroData = {
        section_key: 'hero',
        section_name: 'Hero Section',
        content: {
          slides: heroSlides,
          specialDealBanner: specialDealBanner,
          mattressBanner: mattressBanner,
          bottomBanner: bottomBanner
        },
        is_active: true,
        order: 1
      };

      if (editingSection) {
        // Update existing
        await adminAPI.patchHomepageContent(editingSection.id, heroData);
        showToast('Hero section updated successfully', 'success');
      } else {
        // Create new
        await adminAPI.createHomepageContent(heroData);
        showToast('Hero section created successfully', 'success');
      }
      
      // Refresh sections to get updated data
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving hero section:', err);
      showToast(err.response?.data?.error || 'Failed to save hero section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHeroSection2 = async () => {
    try {
      setSaving(true);
      
      const hero2Data = {
        section_key: 'hero2',
        section_name: 'Hero Section 2',
        content: {
          sections: heroSection2Data
        },
        is_active: true,
        order: 2
      };

      if (editingHeroSection2) {
        // Update existing
        await adminAPI.patchHomepageContent(editingHeroSection2.id, hero2Data);
        showToast('Hero Section 2 updated successfully', 'success');
      } else {
        // Create new
        await adminAPI.createHomepageContent(hero2Data);
        showToast('Hero Section 2 created successfully', 'success');
      }
      
      // Refresh sections to get updated data
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving hero section 2:', err);
      showToast(err.response?.data?.error || 'Failed to save hero section 2', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    const updatedSlides = [...heroSlides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: value
    };
    setHeroSlides(updatedSlides);
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: heroSlides.length + 1,
      title: 'New Slide Title',
      subtitle: 'New Slide Subtitle',
      price: '₹ 0',
      buttonText: 'BUY NOW',
      backgroundColor: '#C4A484',
      imageSrc: ''
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const handleRemoveSlide = (index: number) => {
    if (heroSlides.length > 1) {
      const updatedSlides = heroSlides.filter((_, i) => i !== index);
      setHeroSlides(updatedSlides);
    } else {
      showToast('At least one slide is required', 'error');
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const updatedSlides = [...heroSlides];
    if (direction === 'up' && index > 0) {
      [updatedSlides[index], updatedSlides[index - 1]] = [updatedSlides[index - 1], updatedSlides[index]];
    } else if (direction === 'down' && index < updatedSlides.length - 1) {
      [updatedSlides[index], updatedSlides[index + 1]] = [updatedSlides[index + 1], updatedSlides[index]];
    }
    setHeroSlides(updatedSlides);
  };

  // HeroSection2 handlers
  const handleSection2Change = (sectionIndex: number, field: keyof HeroSection2Section, value: any) => {
    const updatedSections = [...heroSection2Data];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      [field]: value
    };
    setHeroSection2Data(updatedSections);
  };

  const handleSection2ItemChange = (sectionIndex: number, itemIndex: number, field: keyof HeroSection2Item, value: string) => {
    const updatedSections = [...heroSection2Data];
    updatedSections[sectionIndex].items[itemIndex] = {
      ...updatedSections[sectionIndex].items[itemIndex],
      [field]: value
    };
    setHeroSection2Data(updatedSections);
  };

  const handleAddSection2 = () => {
    const newSection: HeroSection2Section = {
      id: heroSection2Data.length + 1,
      title: 'New Section',
      linkText: 'See more',
      linkUrl: '#',
      items: [
        { id: 1, imageUrl: '', text: 'Item 1', altText: '' }
      ]
    };
    setHeroSection2Data([...heroSection2Data, newSection]);
  };

  const handleRemoveSection2 = (index: number) => {
    if (heroSection2Data.length > 1) {
      const updatedSections = heroSection2Data.filter((_, i) => i !== index);
      setHeroSection2Data(updatedSections);
    } else {
      showToast('At least one section is required', 'error');
    }
  };

  const handleMoveSection2 = (index: number, direction: 'up' | 'down') => {
    const updatedSections = [...heroSection2Data];
    if (direction === 'up' && index > 0) {
      [updatedSections[index], updatedSections[index - 1]] = [updatedSections[index - 1], updatedSections[index]];
    } else if (direction === 'down' && index < updatedSections.length - 1) {
      [updatedSections[index], updatedSections[index + 1]] = [updatedSections[index + 1], updatedSections[index]];
    }
    setHeroSection2Data(updatedSections);
  };

  const handleAddSection2Item = (sectionIndex: number) => {
    const updatedSections = [...heroSection2Data];
    const newItem: HeroSection2Item = {
      id: updatedSections[sectionIndex].items.length + 1,
      imageUrl: '',
      text: 'New Item',
      altText: ''
    };
    updatedSections[sectionIndex].items.push(newItem);
    setHeroSection2Data(updatedSections);
  };

  const handleRemoveSection2Item = (sectionIndex: number, itemIndex: number) => {
    const updatedSections = [...heroSection2Data];
    if (updatedSections[sectionIndex].items.length > 1) {
      updatedSections[sectionIndex].items = updatedSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
      setHeroSection2Data(updatedSections);
    } else {
      showToast('At least one item is required per section', 'error');
    }
  };

  // HeroSection3 handlers
  const handleHeroSection3Change = (field: keyof HeroSection3Data, value: any) => {
    setHeroSection3Data({
      ...heroSection3Data,
      [field]: value
    });
  };

  const handleCategoryItemChange = (index: number, field: keyof HeroSection3CategoryItem, value: string) => {
    const updatedItems = [...heroSection3Data.categoryItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    // Ensure exactly 8 items - no more, no less
    const finalItems = updatedItems.slice(0, 8);
    setHeroSection3Data({
      ...heroSection3Data,
      categoryItems: finalItems
    });
  };

  const handleSliderCardChange = (index: number, field: keyof HeroSection3SliderCard, value: string | number) => {
    const updatedCards = [...heroSection3Data.sliderCards];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value
    };
    setHeroSection3Data({
      ...heroSection3Data,
      sliderCards: updatedCards
    });
  };


  const handleAddSliderCard = () => {
    const newCard: HeroSection3SliderCard = {
      id: heroSection3Data.sliderCards.length + 1,
      tag: 'UPTO 0% OFF',
      title: 'New Product',
      desc: 'Product Description',
      price: '₹0',
      img: ''
    };
    setHeroSection3Data({
      ...heroSection3Data,
      sliderCards: [...heroSection3Data.sliderCards, newCard]
    });
  };

  const handleRemoveSliderCard = (index: number) => {
    if (heroSection3Data.sliderCards.length > 1) {
      const updatedCards = heroSection3Data.sliderCards.filter((_, i) => i !== index);
      setHeroSection3Data({
        ...heroSection3Data,
        sliderCards: updatedCards
      });
    } else {
      showToast('At least one slider card is required', 'error');
    }
  };

  const handleSaveHeroSection3 = async () => {
    try {
      setSaving(true);
      
      // Ensure exactly 8 category items before saving
      const categoryItems = heroSection3Data.categoryItems.slice(0, 8);
      
      const hero3Data = {
        section_key: 'hero3',
        section_name: 'Hero Section 3 - Beautify Section',
        content: {
          title: heroSection3Data.title,
          subtitle: heroSection3Data.subtitle,
          offerBadge: heroSection3Data.offerBadge,
          leftProductCard: heroSection3Data.leftProductCard,
          categoryItems: categoryItems, // Exactly 8 items
          sliderCards: heroSection3Data.sliderCards
        },
        is_active: true,
        order: 3
      };

      if (editingHeroSection3) {
        // Update existing
        await adminAPI.patchHomepageContent(editingHeroSection3.id, hero3Data);
        showToast('Hero Section 3 updated successfully', 'success');
      } else {
        // Create new
        await adminAPI.createHomepageContent(hero3Data);
        showToast('Hero Section 3 created successfully', 'success');
      }
      
      // Refresh sections to get updated data
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving hero section 3:', err);
      showToast(err.response?.data?.error || 'Failed to save hero section 3', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Furniture Categories handlers
  const handleFurnitureCategoriesChange = (field: keyof FurnitureCategoriesData, value: any) => {
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      [field]: value
    });
  };

  const handleCategoryItemChangeFC = (index: number, field: keyof FurnitureCategoryItem, value: string) => {
    const updatedItems = [...furnitureCategoriesData.categories];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      categories: updatedItems
    });
  };

  const handleSliderItemChange = (index: number, field: keyof FurnitureSliderItem, value: string) => {
    const updatedItems = [...furnitureCategoriesData.sliderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      sliderItems: updatedItems
    });
  };

  const handleAddCategory = () => {
    const newCategory: FurnitureCategoryItem = {
      id: furnitureCategoriesData.categories.length + 1,
      title: 'New Category',
      category: 'All',
      img: ''
    };
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      categories: [...furnitureCategoriesData.categories, newCategory]
    });
  };

  const handleRemoveCategory = (index: number) => {
    const updatedCategories = furnitureCategoriesData.categories.filter((_, i) => i !== index);
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      categories: updatedCategories
    });
  };

  const handleAddSliderItem = () => {
    const newItem: FurnitureSliderItem = {
      id: furnitureCategoriesData.sliderItems.length + 1,
      title: 'New Item',
      img: '',
      url: ''
    };
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      sliderItems: [...furnitureCategoriesData.sliderItems, newItem]
    });
  };

  const handleRemoveSliderItem = (index: number) => {
    const updatedItems = furnitureCategoriesData.sliderItems.filter((_, i) => i !== index);
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      sliderItems: updatedItems
    });
  };

  // Furniture Sections handlers
  const handleFurnitureSectionsChange = (section: 'discover' | 'topRated', field: 'title' | 'subtitle', value: string) => {
    setFurnitureSectionsData({
      ...furnitureSectionsData,
      [section]: {
        ...furnitureSectionsData[section],
        [field]: value
      }
    });
  };

  const handleAddProduct = async (section: 'discover' | 'topRated', productId: number) => {
    try {
      // Fetch product details
      const response = await adminAPI.getProduct(productId);
      const product = response.data;
      
      // Get first active variant for price calculation
      const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants.find((v: any) => v.is_active) || product.variants[0]
        : null;
      
      // Use product-level price if available, otherwise use variant price
      const currentPrice = product.price 
        ? parseFloat(product.price) 
        : (firstVariant && firstVariant.price ? parseFloat(firstVariant.price) : 0);
      
      // Use product-level old_price if available, otherwise use variant old_price
      const originalPrice = product.old_price 
        ? parseFloat(product.old_price) 
        : (firstVariant && firstVariant.old_price ? parseFloat(firstVariant.old_price) : currentPrice);
      
      // Calculate discount - use product discount_percentage if available, otherwise calculate
      let discountPercent = product.discount_percentage || 0;
      if (!discountPercent && originalPrice > currentPrice) {
        discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      }
      
      // Get image - prefer variant image, then product main_image, then first product image
      let productImage = '';
      if (firstVariant && firstVariant.image) {
        productImage = firstVariant.image;
      } else if (product.main_image) {
        productImage = product.main_image;
      } else if (product.images && product.images.length > 0) {
        productImage = product.images[0].image || product.images[0].url || '';
      }
      
      // Get actual review count and rating from product
      const reviewCount = product.review_count || 0;
      const averageRating = product.average_rating || 0;
      
      const newProduct: FurnitureSectionProduct = {
        id: furnitureSectionsData[section].products.length + 1,
        title: product.title || 'Product Title',
        subtitle: product.short_description || product.description || '',
        price: `₹${currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        oldPrice: originalPrice > currentPrice ? `₹${originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '',
        discount: discountPercent > 0 ? `${discountPercent}% off` : '',
        rating: averageRating,
        reviews: reviewCount,
        image: productImage,
        productId: product.id,
        productSlug: product.slug
      };
      
      setFurnitureSectionsData({
        ...furnitureSectionsData,
        [section]: {
          ...furnitureSectionsData[section],
          products: [...furnitureSectionsData[section].products, newProduct]
        }
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to load product details', 'error');
    }
  };

  const handleRemoveProduct = (section: 'discover' | 'topRated', index: number) => {
    const updatedProducts = furnitureSectionsData[section].products.filter((_, i) => i !== index);
    setFurnitureSectionsData({
      ...furnitureSectionsData,
      [section]: {
        ...furnitureSectionsData[section],
        products: updatedProducts
      }
    });
  };

  const handleMoveProduct = (section: 'discover' | 'topRated', index: number, direction: 'up' | 'down') => {
    const updatedProducts = [...furnitureSectionsData[section].products];
    if (direction === 'up' && index > 0) {
      [updatedProducts[index], updatedProducts[index - 1]] = [updatedProducts[index - 1], updatedProducts[index]];
    } else if (direction === 'down' && index < updatedProducts.length - 1) {
      [updatedProducts[index], updatedProducts[index + 1]] = [updatedProducts[index + 1], updatedProducts[index]];
    }
    setFurnitureSectionsData({
      ...furnitureSectionsData,
      [section]: {
        ...furnitureSectionsData[section],
        products: updatedProducts
      }
    });
  };

  const handleSaveFurnitureSections = async () => {
    try {
      setSaving(true);
      
      const sectionsData = {
        section_key: 'furniture-sections',
        section_name: 'Furniture Sections - Discover & Top Rated',
        content: {
          discover: furnitureSectionsData.discover,
          topRated: furnitureSectionsData.topRated
        },
        is_active: true,
        order: 5
      };

      if (editingFurnitureSections) {
        // Update existing
        await adminAPI.patchHomepageContent(editingFurnitureSections.id, sectionsData);
        showToast('Furniture sections updated successfully', 'success');
      } else {
        // Create new
        await adminAPI.createHomepageContent(sectionsData);
        showToast('Furniture sections created successfully', 'success');
      }
      
      // Refresh sections to get updated data
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving furniture sections:', err);
      showToast(err.response?.data?.error || 'Failed to save furniture sections', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFurnitureOfferSections = async () => {
    try {
      setSaving(true);
      
      const offerSectionsData = {
        section_key: 'furniture-offer-sections',
        section_name: 'Furniture Offer Sections',
        content: {
          sections: furnitureOfferSectionsData.sections
        },
        is_active: true,
        order: 6
      };

      if (editingFurnitureOfferSections) {
        await adminAPI.patchHomepageContent(editingFurnitureOfferSections.id, offerSectionsData);
        showToast('Furniture offer sections updated successfully', 'success');
      } else {
        await adminAPI.createHomepageContent(offerSectionsData);
        showToast('Furniture offer sections created successfully', 'success');
      }
      
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving furniture offer sections:', err);
      showToast(err.response?.data?.error || 'Failed to save furniture offer sections', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatureCard = async () => {
    try {
      setSaving(true);
      
      const featureCardDataSave = {
        section_key: 'feature-card',
        section_name: 'Feature Card & CTA',
        content: {
          featuresBar: featureCardData.featuresBar,
          countdownEndDate: featureCardData.countdownEndDate,
          offerText: featureCardData.offerText,
          discountText: featureCardData.discountText,
          infoBadges: featureCardData.infoBadges
        },
        is_active: true,
        order: 7
      };

      if (editingFeatureCard) {
        await adminAPI.patchHomepageContent(editingFeatureCard.id, featureCardDataSave);
        showToast('Feature card updated successfully', 'success');
      } else {
        await adminAPI.createHomepageContent(featureCardDataSave);
        showToast('Feature card created successfully', 'success');
      }
      
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving feature card:', err);
      showToast(err.response?.data?.error || 'Failed to save feature card', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBannerCards = async () => {
    try {
      setSaving(true);
      
      const bannerCardsDataSave = {
        section_key: 'banner-cards',
        section_name: 'Banner Cards & Product Sliders',
        content: {
          heading: bannerCardsData.heading,
          bannerCards: bannerCardsData.bannerCards,
          slider1Title: bannerCardsData.slider1Title,
          slider1ViewAllUrl: bannerCardsData.slider1ViewAllUrl,
          slider1Products: bannerCardsData.slider1Products,
          slider2Title: bannerCardsData.slider2Title,
          slider2ViewAllUrl: bannerCardsData.slider2ViewAllUrl,
          slider2Products: bannerCardsData.slider2Products
        },
        is_active: true,
        order: 8
      };

      if (editingBannerCards) {
        await adminAPI.patchHomepageContent(editingBannerCards.id, bannerCardsDataSave);
        showToast('Banner cards updated successfully', 'success');
      } else {
        await adminAPI.createHomepageContent(bannerCardsDataSave);
        showToast('Banner cards created successfully', 'success');
      }
      
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving banner cards:', err);
      showToast(err.response?.data?.error || 'Failed to save banner cards', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFurnitureInfo = async () => {
    try {
      setSaving(true);
      
      const furnitureInfoDataSave = {
        section_key: 'furniture-info-section',
        section_name: 'Furniture Info Section',
        content: furnitureInfoContent,
        is_active: true,
        order: 9
      };

      if (editingFurnitureInfo) {
        await adminAPI.patchHomepageContent(editingFurnitureInfo.id, furnitureInfoDataSave);
        showToast('Furniture info section updated successfully', 'success');
      } else {
        await adminAPI.createHomepageContent(furnitureInfoDataSave);
        showToast('Furniture info section created successfully', 'success');
      }
      
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving furniture info section:', err);
      showToast(err.response?.data?.error || 'Failed to save furniture info section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProductToSlider = async (slider: 'slider1' | 'slider2', productId: number) => {
    try {
      const response = await adminAPI.getProduct(productId);
      const product = response.data;
      
      const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants.find((v: any) => v.is_active) || product.variants[0]
        : null;
      
      const currentPrice = product.price 
        ? parseFloat(product.price) 
        : (firstVariant && firstVariant.price ? parseFloat(firstVariant.price) : 0);
      
      const originalPrice = product.old_price 
        ? parseFloat(product.old_price) 
        : (firstVariant && firstVariant.old_price ? parseFloat(firstVariant.old_price) : currentPrice);
      
      let discountPercent = product.discount_percentage || 0;
      if (!discountPercent && originalPrice > currentPrice) {
        discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      }
      
      let productImage = '';
      if (firstVariant && firstVariant.image) {
        productImage = firstVariant.image;
      } else if (product.main_image) {
        productImage = product.main_image;
      } else if (product.images && product.images.length > 0) {
        productImage = product.images[0].image || product.images[0].url || '';
      }
      
      const reviewCount = product.review_count || 0;
      const averageRating = product.average_rating || 0;
      
      const newProduct: BannerProduct = {
        img: productImage,
        title: product.title || 'Product Title',
        desc: product.short_description || product.description || '',
        rating: averageRating,
        reviews: reviewCount,
        oldPrice: originalPrice > currentPrice ? `₹${originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        newPrice: `₹${currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        productId: product.id,
        productSlug: product.slug
      };
      
      if (slider === 'slider1') {
        setBannerCardsData({
          ...bannerCardsData,
          slider1Products: [...bannerCardsData.slider1Products, newProduct]
        });
      } else {
        setBannerCardsData({
          ...bannerCardsData,
          slider2Products: [...bannerCardsData.slider2Products, newProduct]
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to load product details', 'error');
    }
  };

  const handleAddFilterButton = () => {
    const newButton = 'New Filter';
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      filterButtons: [...furnitureCategoriesData.filterButtons, newButton]
    });
  };

  const handleRemoveFilterButton = (index: number) => {
    if (furnitureCategoriesData.filterButtons.length > 1) {
      const updatedButtons = furnitureCategoriesData.filterButtons.filter((_, i) => i !== index);
      setFurnitureCategoriesData({
        ...furnitureCategoriesData,
        filterButtons: updatedButtons
      });
    } else {
      showToast('At least one filter button is required', 'error');
    }
  };

  const handleUpdateFilterButton = (index: number, value: string) => {
    const updatedButtons = [...furnitureCategoriesData.filterButtons];
    updatedButtons[index] = value;
    setFurnitureCategoriesData({
      ...furnitureCategoriesData,
      filterButtons: updatedButtons
    });
  };

  const handleSaveFurnitureCategories = async () => {
    try {
      setSaving(true);
      
      const categoriesData = {
        section_key: 'categories',
        section_name: 'Shop By Categories',
        content: {
          sectionTitle: furnitureCategoriesData.sectionTitle,
          filterButtons: furnitureCategoriesData.filterButtons,
          categories: furnitureCategoriesData.categories,
          sliderTitle: furnitureCategoriesData.sliderTitle,
          shortDescription: furnitureCategoriesData.shortDescription,
          fullDescription: furnitureCategoriesData.fullDescription,
          sliderItems: furnitureCategoriesData.sliderItems
        },
        is_active: true,
        order: 4
      };

      if (editingFurnitureCategories) {
        // Update existing
        await adminAPI.patchHomepageContent(editingFurnitureCategories.id, categoriesData);
        showToast('Categories section updated successfully', 'success');
      } else {
        // Create new
        await adminAPI.createHomepageContent(categoriesData);
        showToast('Categories section created successfully', 'success');
      }
      
      // Refresh sections to get updated data
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving categories section:', err);
      showToast(err.response?.data?.error || 'Failed to save categories section', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p className="admin-loading-text">Loading homepage content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon">
          <span className="material-symbols-outlined">error</span>
        </div>
        <h3 className="admin-empty-title">{error}</h3>
        <button onClick={fetchSections} className="admin-modern-btn primary">
          <span className="material-symbols-outlined">refresh</span>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <h1 className="admin-page-title">
          <span className="material-symbols-outlined">home</span>
          Home Page Management
        </h1>
          <p className="admin-page-subtitle">
            Customize all sections of your home page. Sections are listed in the order they appear on the homepage.
          </p>
        </div>
        <div style={{ 
          padding: 'var(--spacing-md)', 
          backgroundColor: 'var(--admin-bg-light)', 
          borderRadius: '8px',
          border: '1px solid var(--admin-border)',
          fontSize: '14px',
          color: 'var(--admin-text-secondary)'
        }}>
          <strong style={{ color: 'var(--admin-text)', display: 'block', marginBottom: '8px' }}>
            Homepage Section Order:
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <button
              onClick={() => setActiveTab('hero')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'hero' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'hero' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'hero' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'hero' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              1. Hero
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveTab('hero2')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'hero2' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'hero2' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'hero2' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'hero2' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              2. Hero 2
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveTab('hero3')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'hero3' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'hero3' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'hero3' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'hero3' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              3. Hero 3
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveTab('categories')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'categories' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'categories' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'categories' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'categories' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              4. Categories
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveTab('furniture-sections')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'furniture-sections' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'furniture-sections' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'furniture-sections' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'furniture-sections' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              5. Discover & Top Rated
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveTab('furniture-offer-sections')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'furniture-offer-sections' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'furniture-offer-sections' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'furniture-offer-sections' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'furniture-offer-sections' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              6. Offer Sections
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveTab('feature-card')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'feature-card' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'feature-card' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'feature-card' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'feature-card' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              7. Features & CTA
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveTab('banner-cards')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'banner-cards' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'banner-cards' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'banner-cards' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'banner-cards' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              8. Banner Cards
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveTab('furniture-info-section')}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === 'furniture-info-section' ? 'var(--admin-primary)' : 'transparent',
                color: activeTab === 'furniture-info-section' ? 'white' : 'var(--admin-primary)',
                border: `1px solid ${activeTab === 'furniture-info-section' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'furniture-info-section' ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              9. Info Section
            </button>
          </div>
        </div>
      </div>


      <div className="admin-content-card">
        {activeTab === 'hero' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>1</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Hero Section - Main Carousel & Banners
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize the main hero carousel slides, special deal banner, mattress banner, and bottom banner
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Hero Section Slides</h2>
              <div className="admin-section-actions">
                <button
                  onClick={handleAddSlide}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Slide
                </button>
                <button
                  onClick={handleSaveHeroSection}
                  className="admin-modern-btn primary"
                  disabled={saving}
                  type="button"
                >
                  <span className="material-symbols-outlined">save</span>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="hero-slides-editor">
              {heroSlides.map((slide, index) => (
                <div key={index} className="hero-slide-editor-card">
                  <div className="hero-slide-header">
                    <h3 className="hero-slide-number">Slide {index + 1}</h3>
                    <div className="hero-slide-actions">
                      <button
                        onClick={() => handleMoveSlide(index, 'up')}
                        disabled={index === 0}
                        className="admin-icon-btn"
                        title="Move Up"
                        type="button"
                      >
                        <span className="material-symbols-outlined">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => handleMoveSlide(index, 'down')}
                        disabled={index === heroSlides.length - 1}
                        className="admin-icon-btn"
                        title="Move Down"
                        type="button"
                      >
                        <span className="material-symbols-outlined">arrow_downward</span>
                      </button>
                      <button
                        onClick={() => handleRemoveSlide(index)}
                        disabled={heroSlides.length === 1}
                        className="admin-icon-btn danger"
                        title="Remove Slide"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="hero-slide-form">
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={slide.title}
                          onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                          placeholder="Enter slide title"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Subtitle</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={slide.subtitle}
                          onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)}
                          placeholder="Enter slide subtitle"
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Price</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={slide.price}
                          onChange={(e) => handleSlideChange(index, 'price', e.target.value)}
                          placeholder="₹ 0"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Button Text</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={slide.buttonText}
                          onChange={(e) => handleSlideChange(index, 'buttonText', e.target.value)}
                          placeholder="BUY NOW"
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Background Color</label>
                        <div className="color-input-group">
                          <input
                            type="color"
                            className="admin-color-input"
                            value={slide.backgroundColor}
                            onChange={(e) => handleSlideChange(index, 'backgroundColor', e.target.value)}
                          />
                          <input
                            type="text"
                            className="admin-form-input"
                            value={slide.backgroundColor}
                            onChange={(e) => handleSlideChange(index, 'backgroundColor', e.target.value)}
                            placeholder="#C4A484"
                          />
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Image URL</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={slide.imageSrc}
                          onChange={(e) => handleSlideChange(index, 'imageSrc', e.target.value)}
                          placeholder="/images/Home/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side Banners Editor */}
            <div className="banners-section-editor">
              <h2 className="admin-section-title" style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
                Right Side Banners
              </h2>

              {/* Special Deal Banner */}
              <div className="banner-editor-card">
                <div className="banner-editor-header">
                  <h3 className="banner-editor-title">Special Deal Banner</h3>
                </div>
                <div className="banner-editor-form">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Badge Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={specialDealBanner.badgeText}
                        onChange={(e) => setSpecialDealBanner({ ...specialDealBanner, badgeText: e.target.value })}
                        placeholder="SPECIAL DEAL"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Upto Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={specialDealBanner.uptoText}
                        onChange={(e) => setSpecialDealBanner({ ...specialDealBanner, uptoText: e.target.value })}
                        placeholder="UPTO"
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Discount Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={specialDealBanner.discountText}
                        onChange={(e) => setSpecialDealBanner({ ...specialDealBanner, discountText: e.target.value })}
                        placeholder="₹5000 OFF"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Instant Discount Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={specialDealBanner.instantDiscountText}
                        onChange={(e) => setSpecialDealBanner({ ...specialDealBanner, instantDiscountText: e.target.value })}
                        placeholder="INSTANT DISCOUNT"
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Button Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={specialDealBanner.buttonText}
                        onChange={(e) => setSpecialDealBanner({ ...specialDealBanner, buttonText: e.target.value })}
                        placeholder="BUY NOW"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Background Image URL</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={specialDealBanner.backgroundImage}
                        onChange={(e) => setSpecialDealBanner({ ...specialDealBanner, backgroundImage: e.target.value })}
                        placeholder="/images/banner/bedroom.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mattress Banner */}
              <div className="banner-editor-card">
                <div className="banner-editor-header">
                  <h3 className="banner-editor-title">Mattress Banner</h3>
                </div>
                <div className="banner-editor-form">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Badge Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={mattressBanner.badgeText}
                        onChange={(e) => setMattressBanner({ ...mattressBanner, badgeText: e.target.value })}
                        placeholder="Ships in 2 Days"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Title</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={mattressBanner.title}
                        onChange={(e) => setMattressBanner({ ...mattressBanner, title: e.target.value })}
                        placeholder="MATTRESS"
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Subtitle</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={mattressBanner.subtitle}
                        onChange={(e) => setMattressBanner({ ...mattressBanner, subtitle: e.target.value })}
                        placeholder="That Turns Sleep into Therapy"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Starting Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={mattressBanner.startingText}
                        onChange={(e) => setMattressBanner({ ...mattressBanner, startingText: e.target.value })}
                        placeholder="Starting From"
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Price</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={mattressBanner.price}
                        onChange={(e) => setMattressBanner({ ...mattressBanner, price: e.target.value })}
                        placeholder="₹9,999"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Delivery Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={mattressBanner.deliveryText}
                        onChange={(e) => setMattressBanner({ ...mattressBanner, deliveryText: e.target.value })}
                        placeholder="FREE Delivery Available"
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Background Image URL</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={mattressBanner.backgroundImage}
                        onChange={(e) => setMattressBanner({ ...mattressBanner, backgroundImage: e.target.value })}
                        placeholder="/images/banner/mattress.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Banner Editor */}
              <div className="banner-editor-card">
                <div className="banner-editor-header">
                  <h3 className="banner-editor-title">Bottom Banner (Below Slider)</h3>
                </div>
                <div className="banner-editor-form">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Banner Image URL</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={bottomBanner.imageUrl}
                        onChange={(e) => setBottomBanner({ ...bottomBanner, imageUrl: e.target.value })}
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Alt Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={bottomBanner.altText}
                        onChange={(e) => setBottomBanner({ ...bottomBanner, altText: e.target.value })}
                        placeholder="Banner Description"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero2' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>2</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Hero Section 2 - Product Grid Sections
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize product grid sections like "Pick up where you left off" and "New home arrivals"
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Hero Section 2 - Grid Sections</h2>
              <div className="admin-section-actions">
                <button
                  onClick={handleSaveHeroSection2}
                  className="admin-modern-btn primary"
                  disabled={saving}
                  type="button"
                >
                  <span className="material-symbols-outlined">save</span>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="hero-slides-editor">
              {heroSection2Data.map((section, sectionIndex) => (
                <div key={section.id} className="hero-slide-editor-card">
                  <div className="hero-slide-header">
                    <h3 className="hero-slide-number">Section {sectionIndex + 1}</h3>
                    <div className="hero-slide-actions">
                      <button
                        onClick={() => handleMoveSection2(sectionIndex, 'up')}
                        disabled={sectionIndex === 0}
                        className="admin-icon-btn"
                        title="Move Up"
                        type="button"
                      >
                        <span className="material-symbols-outlined">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => handleMoveSection2(sectionIndex, 'down')}
                        disabled={sectionIndex === heroSection2Data.length - 1}
                        className="admin-icon-btn"
                        title="Move Down"
                        type="button"
                      >
                        <span className="material-symbols-outlined">arrow_downward</span>
                      </button>
                      <button
                        onClick={() => handleRemoveSection2(sectionIndex)}
                        disabled={heroSection2Data.length === 1}
                        className="admin-icon-btn danger"
                        title="Remove Section"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="hero-slide-form">
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Section Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={section.title}
                          onChange={(e) => handleSection2Change(sectionIndex, 'title', e.target.value)}
                          placeholder="Section Title"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Link Text</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={section.linkText}
                          onChange={(e) => handleSection2Change(sectionIndex, 'linkText', e.target.value)}
                          placeholder="See more"
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Link URL</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={section.linkUrl}
                          onChange={(e) => handleSection2Change(sectionIndex, 'linkUrl', e.target.value)}
                          placeholder="#"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">
                          <input
                            type="checkbox"
                            checked={section.isSpecial || false}
                            onChange={(e) => handleSection2Change(sectionIndex, 'isSpecial', e.target.checked)}
                            style={{ marginRight: '8px' }}
                          />
                          Special Style (Different background)
                        </label>
                      </div>
                    </div>

                    <div className="admin-section-header" style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                      <h4 className="admin-section-title" style={{ fontSize: '16px' }}>Grid Items</h4>
                      <button
                        onClick={() => handleAddSection2Item(sectionIndex)}
                        className="admin-modern-btn secondary"
                        type="button"
                      >
                        <span className="material-symbols-outlined">add</span>
                        Add Item
                      </button>
                    </div>

                    <div className="hero-slides-editor" style={{ marginTop: 'var(--spacing-md)' }}>
                      {section.items.map((item, itemIndex) => (
                        <div key={item.id} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                          <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 className="banner-editor-title" style={{ fontSize: '14px', margin: 0 }}>Item {itemIndex + 1}</h4>
                            <button
                              onClick={() => handleRemoveSection2Item(sectionIndex, itemIndex)}
                              disabled={section.items.length === 1}
                              className="admin-icon-btn danger"
                              title="Remove Item"
                              type="button"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                          <div className="banner-editor-form">
                            <div className="admin-form-row">
                              <div className="admin-form-group">
                                <label className="admin-form-label">Image URL</label>
                                <input
                                  type="text"
                                  className="admin-form-input"
                                  value={item.imageUrl}
                                  onChange={(e) => handleSection2ItemChange(sectionIndex, itemIndex, 'imageUrl', e.target.value)}
                                  placeholder="/images/Home/image.jpg"
                                />
                              </div>
                              <div className="admin-form-group">
                                <label className="admin-form-label">Text Label</label>
                                <input
                                  type="text"
                                  className="admin-form-input"
                                  value={item.text}
                                  onChange={(e) => handleSection2ItemChange(sectionIndex, itemIndex, 'text', e.target.value)}
                                  placeholder="Item Text"
                                />
                              </div>
                            </div>
                            <div className="admin-form-row">
                              <div className="admin-form-group">
                                <label className="admin-form-label">Alt Text (Optional)</label>
                                <input
                                  type="text"
                                  className="admin-form-input"
                                  value={item.altText || ''}
                                  onChange={(e) => handleSection2ItemChange(sectionIndex, itemIndex, 'altText', e.target.value)}
                                  placeholder="Image description"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 'var(--spacing-xl)' }}>
                <button
                  onClick={handleAddSection2}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add New Section
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero3' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>3</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Hero Section 3 - Categories & Product Slider
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize category cards and product slider with tags, titles, descriptions, and prices
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Hero Section 3 - Beautify Every Corner</h2>
              <div className="admin-section-actions">
                <button
                  onClick={handleSaveHeroSection3}
                  className="admin-modern-btn primary"
                  disabled={saving}
                  type="button"
                >
                  <span className="material-symbols-outlined">save</span>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Section Title, Subtitle, and Offer Badge */}
            <div className="banner-editor-card">
              <div className="banner-editor-header">
                <h3 className="banner-editor-title">Section Header</h3>
              </div>
              <div className="banner-editor-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={heroSection3Data.title}
                      onChange={(e) => handleHeroSection3Change('title', e.target.value)}
                      placeholder="Beautify Every Corner with Elegance"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Subtitle</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={heroSection3Data.subtitle}
                      onChange={(e) => handleHeroSection3Change('subtitle', e.target.value)}
                      placeholder="Explore timeless pieces for every nook and space"
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Offer Badge</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={heroSection3Data.offerBadge}
                      onChange={(e) => handleHeroSection3Change('offerBadge', e.target.value)}
                      placeholder="UPTO 60% OFF"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Left Product Card */}
            <div className="banner-editor-card">
              <div className="banner-editor-header">
                <h3 className="banner-editor-title">Left Product Card</h3>
              </div>
              <div className="banner-editor-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Product Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={heroSection3Data.leftProductCard.name}
                      onChange={(e) => handleHeroSection3Change('leftProductCard', { ...heroSection3Data.leftProductCard, name: e.target.value })}
                      placeholder="Light Show"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Image URL</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={heroSection3Data.leftProductCard.img}
                      onChange={(e) => handleHeroSection3Change('leftProductCard', { ...heroSection3Data.leftProductCard, img: e.target.value })}
                      placeholder="/images/Home/FloorLamps.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Items - Exactly 8 */}
            <div className="banner-editor-card">
              <div className="banner-editor-header">
                <h3 className="banner-editor-title">Category Items (Exactly 8 Items - Fixed)</h3>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>You must have exactly 8 items</span>
              </div>
              <div className="banner-editor-form">
                {heroSection3Data.categoryItems.map((item, index) => (
                  <div key={item.id} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)' }}>
                    <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="banner-editor-title" style={{ fontSize: '14px', margin: 0 }}>Item {index + 1} of 8</h4>
                    </div>
                    <div className="banner-editor-form">
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Category Name</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={item.name}
                            onChange={(e) => handleCategoryItemChange(index, 'name', e.target.value)}
                            placeholder="Category Name"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Image URL</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={item.img}
                            onChange={(e) => handleCategoryItemChange(index, 'img', e.target.value)}
                            placeholder="/images/Home/image.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Cards */}
            <div className="banner-editor-card">
              <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="banner-editor-title">Product Slider Cards</h3>
                <button
                  onClick={handleAddSliderCard}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Card
                </button>
              </div>
              <div className="banner-editor-form">
                {heroSection3Data.sliderCards.map((card, index) => (
                  <div key={card.id} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)' }}>
                    <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="banner-editor-title" style={{ fontSize: '14px', margin: 0 }}>Card {index + 1}</h4>
                      <button
                        onClick={() => handleRemoveSliderCard(index)}
                        disabled={heroSection3Data.sliderCards.length === 1}
                        className="admin-icon-btn danger"
                        title="Remove Card"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    <div className="banner-editor-form">
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Tag</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={card.tag}
                            onChange={(e) => handleSliderCardChange(index, 'tag', e.target.value)}
                            placeholder="UPTO 45% OFF"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Title</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={card.title}
                            onChange={(e) => handleSliderCardChange(index, 'title', e.target.value)}
                            placeholder="TV UNIT"
                          />
                        </div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Description</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={card.desc}
                            onChange={(e) => handleSliderCardChange(index, 'desc', e.target.value)}
                            placeholder="Built to Hold the Drama"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Price</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={card.price}
                            onChange={(e) => handleSliderCardChange(index, 'price', e.target.value)}
                            placeholder="₹1,699"
                          />
                        </div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Image URL</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={card.img}
                            onChange={(e) => handleSliderCardChange(index, 'img', e.target.value)}
                            placeholder="/images/Home/sofa1.jpg"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Product Slug (Optional - for navigation)</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={card.productSlug || ''}
                            onChange={(e) => handleSliderCardChange(index, 'productSlug', e.target.value)}
                            placeholder="product-slug"
                          />
                          <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                            {card.productSlug ? `Will navigate to: /products-details/${card.productSlug}` : 'Leave empty if no product link'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>4</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Shop By Categories - Category Filters & Items
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize category filters, category items with images, and slider items
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Shop By Categories Section</h2>
              <div className="admin-section-actions">
                <button
                  onClick={handleSaveFurnitureCategories}
                  className="admin-modern-btn primary"
                  disabled={saving}
                  type="button"
                >
                  <span className="material-symbols-outlined">save</span>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Section Title */}
            <div className="banner-editor-card">
              <div className="banner-editor-header">
                <h3 className="banner-editor-title">Section Header</h3>
              </div>
              <div className="banner-editor-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Section Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={furnitureCategoriesData.sectionTitle}
                      onChange={(e) => handleFurnitureCategoriesChange('sectionTitle', e.target.value)}
                      placeholder="Shop By Categories"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="banner-editor-card">
              <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="banner-editor-title">Filter Buttons</h3>
                <button
                  onClick={handleAddFilterButton}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Filter
                </button>
              </div>
              <div className="banner-editor-form">
                {furnitureCategoriesData.filterButtons.map((btn, index) => (
                  <div key={index} className="admin-form-row" style={{ alignItems: 'center', gap: '10px' }}>
                    <div className="admin-form-group" style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={btn}
                        onChange={(e) => handleUpdateFilterButton(index, e.target.value)}
                        placeholder="Filter Button Name"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveFilterButton(index)}
                      disabled={furnitureCategoriesData.filterButtons.length === 1}
                      className="admin-icon-btn danger"
                      title="Remove Filter"
                      type="button"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Items */}
            <div className="banner-editor-card">
              <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="banner-editor-title">Category Items</h3>
                <button
                  onClick={handleAddCategory}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Category
                </button>
              </div>
              <div className="banner-editor-form">
                {furnitureCategoriesData.categories.map((item, index) => (
                  <div key={item.id} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)' }}>
                    <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="banner-editor-title" style={{ fontSize: '14px', margin: 0 }}>Category {index + 1}</h4>
                      <button
                        onClick={() => handleRemoveCategory(index)}
                        className="admin-icon-btn danger"
                        title="Remove Category"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    <div className="banner-editor-form">
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Title</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={item.title}
                            onChange={(e) => handleCategoryItemChangeFC(index, 'title', e.target.value)}
                            placeholder="Category Title"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Category (Filter)</label>
                          <select
                            className="admin-form-input"
                            value={item.category}
                            onChange={(e) => handleCategoryItemChangeFC(index, 'category', e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)' }}
                          >
                            {furnitureCategoriesData.filterButtons.map((btn) => (
                              <option key={btn} value={btn}>{btn}</option>
                            ))}
                          </select>
                          <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                            Select filter button - item will appear when this filter is selected
                          </span>
                        </div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Image URL</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={item.img}
                            onChange={(e) => handleCategoryItemChangeFC(index, 'img', e.target.value)}
                            placeholder="/images/Home/image.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Section */}
            <div className="banner-editor-card">
              <div className="banner-editor-header">
                <h3 className="banner-editor-title">Slider Section</h3>
              </div>
              <div className="banner-editor-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Slider Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={furnitureCategoriesData.sliderTitle}
                      onChange={(e) => handleFurnitureCategoriesChange('sliderTitle', e.target.value)}
                      placeholder="India's Finest Online Furniture Brand"
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Short Description</label>
                    <textarea
                      className="admin-form-input"
                      value={furnitureCategoriesData.shortDescription}
                      onChange={(e) => handleFurnitureCategoriesChange('shortDescription', e.target.value)}
                      placeholder="Short description text..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Full Description</label>
                    <textarea
                      className="admin-form-input"
                      value={furnitureCategoriesData.fullDescription}
                      onChange={(e) => handleFurnitureCategoriesChange('fullDescription', e.target.value)}
                      placeholder="Full description text (shown when 'more' is clicked)..."
                      rows={5}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Items */}
            <div className="banner-editor-card">
              <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="banner-editor-title">Slider Items</h3>
                <button
                  onClick={handleAddSliderItem}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Item
                </button>
              </div>
              <div className="banner-editor-form">
                {furnitureCategoriesData.sliderItems.map((item, index) => (
                  <div key={item.id} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)' }}>
                    <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="banner-editor-title" style={{ fontSize: '14px', margin: 0 }}>Slider Item {index + 1}</h4>
                      <button
                        onClick={() => handleRemoveSliderItem(index)}
                        className="admin-icon-btn danger"
                        title="Remove Item"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    <div className="banner-editor-form">
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Title</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={item.title}
                            onChange={(e) => handleSliderItemChange(index, 'title', e.target.value)}
                            placeholder="Living Room"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Image URL</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={item.img}
                            onChange={(e) => handleSliderItemChange(index, 'img', e.target.value)}
                            placeholder="/images/Home/livingroom.jpg"
                          />
                        </div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Navigation URL (Optional)</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={item.url || ''}
                            onChange={(e) => handleSliderItemChange(index, 'url', e.target.value)}
                            placeholder="/category/living-room or /products?category=bedroom"
                          />
                          <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                            {item.url ? `Will navigate to: ${item.url}` : 'Leave empty if no navigation'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'furniture-sections' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>5</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Discover & Top Rated - Product Showcase Sections
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize product sections like "Discover What's New", "Trending Now", "Top-Rated by Indian Homes", etc.
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Furniture Sections - Discover & Top Rated</h2>
              <div className="admin-section-actions">
                <button
                  onClick={handleSaveFurnitureSections}
                  className="admin-modern-btn primary"
                  disabled={saving}
                  type="button"
                >
                  <span className="material-symbols-outlined">save</span>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Discover Section */}
            <div className="banner-editor-card">
              <div className="banner-editor-header">
                <h3 className="banner-editor-title">Discover What's New Section</h3>
              </div>
              <div className="banner-editor-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Section Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={furnitureSectionsData.discover.title}
                      onChange={(e) => handleFurnitureSectionsChange('discover', 'title', e.target.value)}
                      placeholder="Discover what's new"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Section Subtitle</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={furnitureSectionsData.discover.subtitle}
                      onChange={(e) => handleFurnitureSectionsChange('discover', 'subtitle', e.target.value)}
                      placeholder="Designed to refresh your everyday life"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Discover Products */}
            <div className="banner-editor-card">
              <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="banner-editor-title">Discover Products {furnitureSectionsData.discover.products.length === 0 && '(Using Default Data)'}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    className="admin-form-input"
                    value=""
                    onChange={(e) => {
                      const productId = parseInt(e.target.value);
                      if (productId) {
                        handleAddProduct('discover', productId);
                        e.target.value = '';
                      }
                    }}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)' }}
                    disabled={loadingProducts}
                  >
                    <option value="">-- Select Product to Add --</option>
                    {loadingProducts ? (
                      <option disabled>Loading products...</option>
                    ) : (
                      products
                        .filter((p: any) => !furnitureSectionsData.discover.products.some((dp) => dp.productId === p.id))
                        .map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.title} {product.slug ? `(${product.slug})` : ''}
                          </option>
                        ))
                    )}
                  </select>
                </div>
              </div>
              <div className="banner-editor-form">
                {furnitureSectionsData.discover.products.length === 0 ? (
                  <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                    No products added. Default data will be displayed. Add products using the dropdown above.
                  </div>
                ) : (
                  furnitureSectionsData.discover.products.map((product, index) => (
                    <div key={product.id} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)', padding: 'var(--spacing-md)' }}>
                      <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--admin-text)' }}>{product.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => handleMoveProduct('discover', index, 'up')}
                            disabled={index === 0}
                            className="admin-icon-btn"
                            title="Move Up"
                            type="button"
                          >
                            <span className="material-symbols-outlined">arrow_upward</span>
                          </button>
                          <button
                            onClick={() => handleMoveProduct('discover', index, 'down')}
                            disabled={index === furnitureSectionsData.discover.products.length - 1}
                            className="admin-icon-btn"
                            title="Move Down"
                            type="button"
                          >
                            <span className="material-symbols-outlined">arrow_downward</span>
                          </button>
                          <button
                            onClick={() => handleRemoveProduct('discover', index)}
                            className="admin-icon-btn danger"
                            title="Remove Product"
                            type="button"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Rated Section */}
            <div className="banner-editor-card" style={{ marginTop: 'var(--spacing-xl)' }}>
              <div className="banner-editor-header">
                <h3 className="banner-editor-title">Top-Rated by Indian Homes Section</h3>
              </div>
              <div className="banner-editor-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Section Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={furnitureSectionsData.topRated.title}
                      onChange={(e) => handleFurnitureSectionsChange('topRated', 'title', e.target.value)}
                      placeholder="Top-Rated by Indian Homes"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Section Subtitle</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={furnitureSectionsData.topRated.subtitle}
                      onChange={(e) => handleFurnitureSectionsChange('topRated', 'subtitle', e.target.value)}
                      placeholder="Crafted to complement Indian lifestyles"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Rated Products */}
            <div className="banner-editor-card">
              <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="banner-editor-title">Top Rated Products {furnitureSectionsData.topRated.products.length === 0 && '(Using Default Data)'}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    className="admin-form-input"
                    value=""
                    onChange={(e) => {
                      const productId = parseInt(e.target.value);
                      if (productId) {
                        handleAddProduct('topRated', productId);
                        e.target.value = '';
                      }
                    }}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)' }}
                    disabled={loadingProducts}
                  >
                    <option value="">-- Select Product to Add --</option>
                    {loadingProducts ? (
                      <option disabled>Loading products...</option>
                    ) : (
                      products
                        .filter((p: any) => !furnitureSectionsData.topRated.products.some((dp) => dp.productId === p.id))
                        .map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.title} {product.slug ? `(${product.slug})` : ''}
                          </option>
                        ))
                    )}
                  </select>
                </div>
              </div>
              <div className="banner-editor-form">
                {furnitureSectionsData.topRated.products.length === 0 ? (
                  <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                    No products added. Default data will be displayed. Add products using the dropdown above.
                  </div>
                ) : (
                  furnitureSectionsData.topRated.products.map((product, index) => (
                    <div key={product.id} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)', padding: 'var(--spacing-md)' }}>
                      <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--admin-text)' }}>{product.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => handleMoveProduct('topRated', index, 'up')}
                            disabled={index === 0}
                            className="admin-icon-btn"
                            title="Move Up"
                            type="button"
                          >
                            <span className="material-symbols-outlined">arrow_upward</span>
                          </button>
                          <button
                            onClick={() => handleMoveProduct('topRated', index, 'down')}
                            disabled={index === furnitureSectionsData.topRated.products.length - 1}
                            className="admin-icon-btn"
                            title="Move Down"
                            type="button"
                          >
                            <span className="material-symbols-outlined">arrow_downward</span>
                          </button>
                          <button
                            onClick={() => handleRemoveProduct('topRated', index)}
                            className="admin-icon-btn danger"
                            title="Remove Product"
                            type="button"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Furniture Offer Sections Tab */}
        {activeTab === 'furniture-offer-sections' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>6</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Offer Sections - Product Offer Carousels
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize 3 offer sections with titles, links, and product images with navigation URLs (Fixed: 3 sections only)
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Furniture Offer Sections</h2>
              <button
                onClick={handleSaveFurnitureOfferSections}
                className="admin-modern-btn primary"
                disabled={saving}
                type="button"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="banner-editor-form">
              {furnitureOfferSectionsData.sections.slice(0, 3).map((section, sectionIndex) => (
                <div key={section.id} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <div className="banner-editor-header">
                    <h3 className="banner-editor-title">Section {sectionIndex + 1}</h3>
                  </div>
                  <div className="banner-editor-form">
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Section Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={section.title}
                          onChange={(e) => {
                            const updated = [...furnitureOfferSectionsData.sections];
                            updated[sectionIndex].title = e.target.value;
                            setFurnitureOfferSectionsData({ sections: updated });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Link Text</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={section.link}
                          onChange={(e) => {
                            const updated = [...furnitureOfferSectionsData.sections];
                            updated[sectionIndex].link = e.target.value;
                            setFurnitureOfferSectionsData({ sections: updated });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Link URL</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={section.linkUrl || ''}
                          onChange={(e) => {
                            const updated = [...furnitureOfferSectionsData.sections];
                            updated[sectionIndex].linkUrl = e.target.value;
                            setFurnitureOfferSectionsData({ sections: updated });
                          }}
                        />
                      </div>
                    </div>
                    <div className="banner-editor-header" style={{ marginTop: 'var(--spacing-md)' }}>
                      <h4 className="banner-editor-title" style={{ fontSize: '16px' }}>Products</h4>
                      <button
                        onClick={() => {
                          const updated = [...furnitureOfferSectionsData.sections];
                          updated[sectionIndex].products.push({ imageUrl: '', navigateUrl: '#' });
                          setFurnitureOfferSectionsData({ sections: updated });
                        }}
                        className="admin-modern-btn secondary"
                        type="button"
                      >
                        <span className="material-symbols-outlined">add</span>
                        Add Product
                      </button>
                    </div>
                    {section.products.map((product, productIndex) => (
                      <div key={productIndex} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)', padding: 'var(--spacing-md)' }}>
                        <div className="admin-form-row">
                          <div className="admin-form-group" style={{ flex: 1 }}>
                            <label className="admin-form-label">Image URL</label>
                            <input
                              type="text"
                              className="admin-form-input"
                              value={product.imageUrl}
                              onChange={(e) => {
                                const updated = [...furnitureOfferSectionsData.sections];
                                updated[sectionIndex].products[productIndex].imageUrl = e.target.value;
                                setFurnitureOfferSectionsData({ sections: updated });
                              }}
                              placeholder="/images/Home/sofa.jpg"
                            />
                          </div>
                          <div className="admin-form-group" style={{ flex: 1 }}>
                            <label className="admin-form-label">Navigate URL</label>
                            <input
                              type="text"
                              className="admin-form-input"
                              value={product.navigateUrl}
                              onChange={(e) => {
                                const updated = [...furnitureOfferSectionsData.sections];
                                updated[sectionIndex].products[productIndex].navigateUrl = e.target.value;
                                setFurnitureOfferSectionsData({ sections: updated });
                              }}
                              placeholder="#"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const updated = [...furnitureOfferSectionsData.sections];
                              updated[sectionIndex].products = updated[sectionIndex].products.filter((_, i) => i !== productIndex);
                              setFurnitureOfferSectionsData({ sections: updated });
                            }}
                            className="admin-icon-btn danger"
                            type="button"
                            title="Remove Product"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Card Tab */}
        {activeTab === 'feature-card' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>7</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Features & CTA - Stats, Timer & Offers
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize features bar (5 items), sale timer (toggle on/off), offer text, and info badges (4 items)
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Feature Card & CTA</h2>
              <button
                onClick={handleSaveFeatureCard}
                className="admin-modern-btn primary"
                disabled={saving}
                type="button"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="banner-editor-form">
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Features Bar</h3>
                {featureCardData.featuresBar.map((feature, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Icon (lucide-react icon name)</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={feature.icon}
                          onChange={(e) => {
                            const updated = [...featureCardData.featuresBar];
                            updated[index].icon = e.target.value;
                            setFeatureCardData({ ...featureCardData, featuresBar: updated });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Count/Text</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={feature.count}
                          onChange={(e) => {
                            const updated = [...featureCardData.featuresBar];
                            updated[index].count = e.target.value;
                            setFeatureCardData({ ...featureCardData, featuresBar: updated });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={feature.text.replace(/<br\/>/g, '\n')}
                          onChange={(e) => {
                            const updated = [...featureCardData.featuresBar];
                            updated[index].text = e.target.value.replace(/\n/g, '<br/>');
                            setFeatureCardData({ ...featureCardData, featuresBar: updated });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Sale Timer</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={featureCardData.saleTimerActive}
                      onChange={(e) => setFeatureCardData({ ...featureCardData, saleTimerActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Sale Timer Active</span>
                  </label>
                </div>
                {featureCardData.saleTimerActive && (
                  <div className="admin-form-group" style={{ marginTop: 'var(--spacing-md)' }}>
                    <label className="admin-form-label">End Date (ISO format)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={featureCardData.countdownEndDate}
                      onChange={(e) => setFeatureCardData({ ...featureCardData, countdownEndDate: e.target.value })}
                      placeholder="2025-10-01T23:59:59"
                    />
                  </div>
                )}
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Store Offer</h3>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Offer Text</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={featureCardData.offerText}
                      onChange={(e) => setFeatureCardData({ ...featureCardData, offerText: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Discount Text</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={featureCardData.discountText}
                      onChange={(e) => setFeatureCardData({ ...featureCardData, discountText: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Info Badges</h3>
                {featureCardData.infoBadges.map((badge, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Icon</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={badge.icon}
                          onChange={(e) => {
                            const updated = [...featureCardData.infoBadges];
                            updated[index].icon = e.target.value;
                            setFeatureCardData({ ...featureCardData, infoBadges: updated });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Top Text</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={badge.topText}
                          onChange={(e) => {
                            const updated = [...featureCardData.infoBadges];
                            updated[index].topText = e.target.value;
                            setFeatureCardData({ ...featureCardData, infoBadges: updated });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Bottom Text</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={badge.bottomText}
                          onChange={(e) => {
                            const updated = [...featureCardData.infoBadges];
                            updated[index].bottomText = e.target.value;
                            setFeatureCardData({ ...featureCardData, infoBadges: updated });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Banner Cards Tab */}
        {activeTab === 'banner-cards' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>8</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Banner Cards - Banners & Product Sliders
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize section heading, banner images (Fixed: 2 banners only), and product sliders
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Banner Cards & Product Sliders</h2>
              <button
                onClick={handleSaveBannerCards}
                className="admin-modern-btn primary"
                disabled={saving}
                type="button"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="banner-editor-form">
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Section Heading</h3>
                <div className="admin-form-group">
                  <input
                    type="text"
                    className="admin-form-input"
                    value={bannerCardsData.heading}
                    onChange={(e) => setBannerCardsData({ ...bannerCardsData, heading: e.target.value })}
                  />
                </div>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Banner Cards (2 banners only)</h3>
                {bannerCardsData.bannerCards.slice(0, 2).map((banner, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Banner {index + 1} - Image URL</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={banner.img}
                        onChange={(e) => {
                          const updated = [...bannerCardsData.bannerCards];
                          updated[index].img = e.target.value;
                          setBannerCardsData({ ...bannerCardsData, bannerCards: updated });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Slider 1</h3>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={bannerCardsData.slider1Title}
                      onChange={(e) => setBannerCardsData({ ...bannerCardsData, slider1Title: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">View All URL</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={bannerCardsData.slider1ViewAllUrl || ''}
                      onChange={(e) => setBannerCardsData({ ...bannerCardsData, slider1ViewAllUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>Products</h4>
                  <select
                    className="admin-form-input"
                    value=""
                    onChange={(e) => {
                      const productId = parseInt(e.target.value);
                      if (productId) {
                        handleAddProductToSlider('slider1', productId);
                        e.target.value = '';
                      }
                    }}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)' }}
                    disabled={loadingProducts}
                  >
                    <option value="">-- Select Product to Add --</option>
                    {loadingProducts ? (
                      <option disabled>Loading products...</option>
                    ) : (
                      products
                        .filter((p: any) => !bannerCardsData.slider1Products.some((dp) => dp.productId === p.id))
                        .map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.title} {product.slug ? `(${product.slug})` : ''}
                          </option>
                        ))
                    )}
                  </select>
                </div>
                {bannerCardsData.slider1Products.map((product, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)', padding: 'var(--spacing-md)' }}>
                    <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{product.title}</span>
                      <button
                        onClick={() => {
                          const updated = bannerCardsData.slider1Products.filter((_, i) => i !== index);
                          setBannerCardsData({ ...bannerCardsData, slider1Products: updated });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Slider 2</h3>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={bannerCardsData.slider2Title}
                      onChange={(e) => setBannerCardsData({ ...bannerCardsData, slider2Title: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">View All URL</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={bannerCardsData.slider2ViewAllUrl || ''}
                      onChange={(e) => setBannerCardsData({ ...bannerCardsData, slider2ViewAllUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>Products</h4>
                  <select
                    className="admin-form-input"
                    value=""
                    onChange={(e) => {
                      const productId = parseInt(e.target.value);
                      if (productId) {
                        handleAddProductToSlider('slider2', productId);
                        e.target.value = '';
                      }
                    }}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)' }}
                    disabled={loadingProducts}
                  >
                    <option value="">-- Select Product to Add --</option>
                    {loadingProducts ? (
                      <option disabled>Loading products...</option>
                    ) : (
                      products
                        .filter((p: any) => !bannerCardsData.slider2Products.some((dp) => dp.productId === p.id))
                        .map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.title} {product.slug ? `(${product.slug})` : ''}
                          </option>
                        ))
                    )}
                  </select>
                </div>
                {bannerCardsData.slider2Products.map((product, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)', border: '1px solid var(--admin-border)', padding: 'var(--spacing-md)' }}>
                    <div className="banner-editor-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{product.title}</span>
                      <button
                        onClick={() => {
                          const updated = bannerCardsData.slider2Products.filter((_, i) => i !== index);
                          setBannerCardsData({ ...bannerCardsData, slider2Products: updated });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Furniture Info Section Tab */}
        {activeTab === 'furniture-info-section' && (
          <div className="hero-section-editor">
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--admin-bg-light)',
              borderBottom: '2px solid var(--admin-primary)',
              marginBottom: 'var(--spacing-lg)',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{
                  backgroundColor: 'var(--admin-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>9</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--admin-text)' }}>
                    Info Section - Content & Information
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                    Customize all content sections: Materials, Shop by Room, Explore More, Upholstery, Buying Tips, Care Tips, Why Choose, Experience Stores, and CTA sections
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Furniture Info Section</h2>
              <button
                onClick={handleSaveFurnitureInfo}
                className="admin-modern-btn primary"
                disabled={saving}
                type="button"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="banner-editor-form">
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Main Heading</h3>
                <div className="admin-form-group">
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.mainHeading}
                    onChange={(e) => setFurnitureInfoContent({ ...furnitureInfoContent, mainHeading: e.target.value })}
                  />
                </div>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Intro Paragraphs</h3>
                {furnitureInfoContent.introParagraphs.map((para, index) => (
                  <div key={index} className="admin-form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <textarea
                      className="admin-form-input"
                      rows={3}
                      value={para}
                      onChange={(e) => {
                        const updated = [...furnitureInfoContent.introParagraphs];
                        updated[index] = e.target.value;
                        setFurnitureInfoContent({ ...furnitureInfoContent, introParagraphs: updated });
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      introParagraphs: [...furnitureInfoContent.introParagraphs, '']
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Paragraph
                </button>
              </div>
              {/* Add more sections for Materials, Shop by Room, etc. - keeping it concise for now */}
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Materials Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.materialsSection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      materialsSection: { ...furnitureInfoContent.materialsSection, heading: e.target.value }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Intro</label>
                  <textarea
                    className="admin-form-input"
                    rows={2}
                    value={furnitureInfoContent.materialsSection.intro}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      materialsSection: { ...furnitureInfoContent.materialsSection, intro: e.target.value }
                    })}
                  />
                </div>
                {furnitureInfoContent.materialsSection.materials.map((material, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={material.title}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.materialsSection.materials];
                            updated[index].title = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              materialsSection: { ...furnitureInfoContent.materialsSection, materials: updated }
                            });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={material.description}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.materialsSection.materials];
                            updated[index].description = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              materialsSection: { ...furnitureInfoContent.materialsSection, materials: updated }
                            });
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = furnitureInfoContent.materialsSection.materials.filter((_, i) => i !== index);
                          setFurnitureInfoContent({
                            ...furnitureInfoContent,
                            materialsSection: { ...furnitureInfoContent.materialsSection, materials: updated }
                          });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      materialsSection: {
                        ...furnitureInfoContent.materialsSection,
                        materials: [...furnitureInfoContent.materialsSection.materials, { title: '', description: '' }]
                      }
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Material
                </button>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Shop by Room Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.shopByRoomSection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      shopByRoomSection: { ...furnitureInfoContent.shopByRoomSection, heading: e.target.value }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Intro</label>
                  <textarea
                    className="admin-form-input"
                    rows={2}
                    value={furnitureInfoContent.shopByRoomSection.intro}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      shopByRoomSection: { ...furnitureInfoContent.shopByRoomSection, intro: e.target.value }
                    })}
                  />
                </div>
                {furnitureInfoContent.shopByRoomSection.rooms.map((room, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={room.title}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.shopByRoomSection.rooms];
                            updated[index].title = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              shopByRoomSection: { ...furnitureInfoContent.shopByRoomSection, rooms: updated }
                            });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={room.description}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.shopByRoomSection.rooms];
                            updated[index].description = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              shopByRoomSection: { ...furnitureInfoContent.shopByRoomSection, rooms: updated }
                            });
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = furnitureInfoContent.shopByRoomSection.rooms.filter((_, i) => i !== index);
                          setFurnitureInfoContent({
                            ...furnitureInfoContent,
                            shopByRoomSection: { ...furnitureInfoContent.shopByRoomSection, rooms: updated }
                          });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      shopByRoomSection: {
                        ...furnitureInfoContent.shopByRoomSection,
                        rooms: [...furnitureInfoContent.shopByRoomSection.rooms, { title: '', description: '' }]
                      }
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Room
                </button>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Explore More Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.exploreMoreSection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      exploreMoreSection: { ...furnitureInfoContent.exploreMoreSection, heading: e.target.value }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Intro</label>
                  <textarea
                    className="admin-form-input"
                    rows={2}
                    value={furnitureInfoContent.exploreMoreSection.intro}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      exploreMoreSection: { ...furnitureInfoContent.exploreMoreSection, intro: e.target.value }
                    })}
                  />
                </div>
                {furnitureInfoContent.exploreMoreSection.items.map((item, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.exploreMoreSection.items];
                            updated[index].title = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              exploreMoreSection: { ...furnitureInfoContent.exploreMoreSection, items: updated }
                            });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.exploreMoreSection.items];
                            updated[index].description = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              exploreMoreSection: { ...furnitureInfoContent.exploreMoreSection, items: updated }
                            });
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = furnitureInfoContent.exploreMoreSection.items.filter((_, i) => i !== index);
                          setFurnitureInfoContent({
                            ...furnitureInfoContent,
                            exploreMoreSection: { ...furnitureInfoContent.exploreMoreSection, items: updated }
                          });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      exploreMoreSection: {
                        ...furnitureInfoContent.exploreMoreSection,
                        items: [...furnitureInfoContent.exploreMoreSection.items, { title: '', description: '' }]
                      }
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Item
                </button>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Upholstery Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.upholsterySection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      upholsterySection: { ...furnitureInfoContent.upholsterySection, heading: e.target.value }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Intro</label>
                  <textarea
                    className="admin-form-input"
                    rows={2}
                    value={furnitureInfoContent.upholsterySection.intro}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      upholsterySection: { ...furnitureInfoContent.upholsterySection, intro: e.target.value }
                    })}
                  />
                </div>
                {furnitureInfoContent.upholsterySection.options.map((option, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={option.title}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.upholsterySection.options];
                            updated[index].title = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              upholsterySection: { ...furnitureInfoContent.upholsterySection, options: updated }
                            });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={option.description}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.upholsterySection.options];
                            updated[index].description = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              upholsterySection: { ...furnitureInfoContent.upholsterySection, options: updated }
                            });
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = furnitureInfoContent.upholsterySection.options.filter((_, i) => i !== index);
                          setFurnitureInfoContent({
                            ...furnitureInfoContent,
                            upholsterySection: { ...furnitureInfoContent.upholsterySection, options: updated }
                          });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      upholsterySection: {
                        ...furnitureInfoContent.upholsterySection,
                        options: [...furnitureInfoContent.upholsterySection.options, { title: '', description: '' }]
                      }
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Option
                </button>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Buying Tips Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.buyingTipsSection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      buyingTipsSection: { ...furnitureInfoContent.buyingTipsSection, heading: e.target.value }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Intro</label>
                  <textarea
                    className="admin-form-input"
                    rows={2}
                    value={furnitureInfoContent.buyingTipsSection.intro}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      buyingTipsSection: { ...furnitureInfoContent.buyingTipsSection, intro: e.target.value }
                    })}
                  />
                </div>
                {furnitureInfoContent.buyingTipsSection.tips.map((tip, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={tip.title}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.buyingTipsSection.tips];
                            updated[index].title = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              buyingTipsSection: { ...furnitureInfoContent.buyingTipsSection, tips: updated }
                            });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={tip.description}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.buyingTipsSection.tips];
                            updated[index].description = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              buyingTipsSection: { ...furnitureInfoContent.buyingTipsSection, tips: updated }
                            });
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = furnitureInfoContent.buyingTipsSection.tips.filter((_, i) => i !== index);
                          setFurnitureInfoContent({
                            ...furnitureInfoContent,
                            buyingTipsSection: { ...furnitureInfoContent.buyingTipsSection, tips: updated }
                          });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      buyingTipsSection: {
                        ...furnitureInfoContent.buyingTipsSection,
                        tips: [...furnitureInfoContent.buyingTipsSection.tips, { title: '', description: '' }]
                      }
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Tip
                </button>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Care Tips Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.careTipsSection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      careTipsSection: { ...furnitureInfoContent.careTipsSection, heading: e.target.value }
                    })}
                  />
                </div>
                {furnitureInfoContent.careTipsSection.tips.map((tip, index) => (
                  <div key={index} className="admin-form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <textarea
                        className="admin-form-input"
                        rows={2}
                        value={tip}
                        onChange={(e) => {
                          const updated = [...furnitureInfoContent.careTipsSection.tips];
                          updated[index] = e.target.value;
                          setFurnitureInfoContent({
                            ...furnitureInfoContent,
                            careTipsSection: { ...furnitureInfoContent.careTipsSection, tips: updated }
                          });
                        }}
                      />
                      <button
                        onClick={() => {
                          const updated = furnitureInfoContent.careTipsSection.tips.filter((_, i) => i !== index);
                          setFurnitureInfoContent({
                            ...furnitureInfoContent,
                            careTipsSection: { ...furnitureInfoContent.careTipsSection, tips: updated }
                          });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      careTipsSection: {
                        ...furnitureInfoContent.careTipsSection,
                        tips: [...furnitureInfoContent.careTipsSection.tips, '']
                      }
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Care Tip
                </button>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Why Choose Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.whyChooseSection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      whyChooseSection: { ...furnitureInfoContent.whyChooseSection, heading: e.target.value }
                    })}
                  />
                </div>
                {furnitureInfoContent.whyChooseSection.items.map((item, index) => (
                  <div key={index} className="banner-editor-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Title</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.whyChooseSection.items];
                            updated[index].title = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              whyChooseSection: { ...furnitureInfoContent.whyChooseSection, items: updated }
                            });
                          }}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...furnitureInfoContent.whyChooseSection.items];
                            updated[index].description = e.target.value;
                            setFurnitureInfoContent({
                              ...furnitureInfoContent,
                              whyChooseSection: { ...furnitureInfoContent.whyChooseSection, items: updated }
                            });
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = furnitureInfoContent.whyChooseSection.items.filter((_, i) => i !== index);
                          setFurnitureInfoContent({
                            ...furnitureInfoContent,
                            whyChooseSection: { ...furnitureInfoContent.whyChooseSection, items: updated }
                          });
                        }}
                        className="admin-icon-btn danger"
                        type="button"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      whyChooseSection: {
                        ...furnitureInfoContent.whyChooseSection,
                        items: [...furnitureInfoContent.whyChooseSection.items, { title: '', description: '' }]
                      }
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Item
                </button>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">Experience Stores Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.experienceStoresSection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      experienceStoresSection: { ...furnitureInfoContent.experienceStoresSection, heading: e.target.value }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Intro</label>
                  <textarea
                    className="admin-form-input"
                    rows={3}
                    value={furnitureInfoContent.experienceStoresSection.intro}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      experienceStoresSection: { ...furnitureInfoContent.experienceStoresSection, intro: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="banner-editor-card">
                <h3 className="banner-editor-title">CTA Section</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={furnitureInfoContent.ctaSection.heading}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      ctaSection: { ...furnitureInfoContent.ctaSection, heading: e.target.value }
                    })}
                  />
                </div>
                {furnitureInfoContent.ctaSection.paragraphs.map((para, index) => (
                  <div key={index} className="admin-form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <label className="admin-form-label">Paragraph {index + 1}</label>
                    <textarea
                      className="admin-form-input"
                      rows={3}
                      value={para}
                      onChange={(e) => {
                        const updated = [...furnitureInfoContent.ctaSection.paragraphs];
                        updated[index] = e.target.value;
                        setFurnitureInfoContent({
                          ...furnitureInfoContent,
                          ctaSection: { ...furnitureInfoContent.ctaSection, paragraphs: updated }
                        });
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      ctaSection: {
                        ...furnitureInfoContent.ctaSection,
                        paragraphs: [...furnitureInfoContent.ctaSection.paragraphs, '']
                      }
                    });
                  }}
                  className="admin-modern-btn secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Paragraph
                </button>
                <div className="admin-form-group" style={{ marginTop: 'var(--spacing-md)' }}>
                  <label className="admin-form-label">Highlight Text</label>
                  <textarea
                    className="admin-form-input"
                    rows={2}
                    value={furnitureInfoContent.ctaSection.highlightText}
                    onChange={(e) => setFurnitureInfoContent({
                      ...furnitureInfoContent,
                      ctaSection: { ...furnitureInfoContent.ctaSection, highlightText: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomePageManagement;
