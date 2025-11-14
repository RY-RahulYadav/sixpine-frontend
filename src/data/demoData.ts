// Demo data with images from https://webdori.in/sixpine/

export interface Product {
  image: string;
  title: string;
  description: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
}

export interface DealItem {
  image: string;
  title: string;
  description: string;
}

// Keep Shopping Products
export const keepShoppingProducts = {
  card1: [
    'https://webdori.in/sixpine/assets/img/products/1.jpg',
    'https://webdori.in/sixpine/assets/img/products/2.jpg',
    'https://webdori.in/sixpine/assets/img/products/3.jpg',
    'https://webdori.in/sixpine/assets/img/products/4.jpg'
  ],
  card2: [
    'https://webdori.in/sixpine/assets/img/products/5.jpg',
    'https://webdori.in/sixpine/assets/img/products/6.jpg',
    'https://webdori.in/sixpine/assets/img/products/7.jpg',
    'https://webdori.in/sixpine/assets/img/products/8.jpg'
  ],
  card3: [
    'https://webdori.in/sixpine/assets/img/products/9.jpg',
    'https://webdori.in/sixpine/assets/img/products/10.jpg',
    'https://webdori.in/sixpine/assets/img/products/11.jpg',
    'https://webdori.in/sixpine/assets/img/products/12.jpg'
  ],
  card4: [
    'https://webdori.in/sixpine/assets/img/products/4.jpg',
    'https://webdori.in/sixpine/assets/img/products/3.jpg',
    'https://webdori.in/sixpine/assets/img/products/2.jpg',
    'https://webdori.in/sixpine/assets/img/products/1.jpg'
  ]
};

// Home Deals Items
export const homeDeals: DealItem[] = [
  {
    image: 'https://webdori.in/sixpine/assets/img/home-deals/1.avif',
    title: 'Flower Bouquet',
    description: 'Beautiful bouquet to brighten your home.'
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/home-deals/2.avif',
    title: 'Wallpaper',
    description: 'Trendy wallpapers to revamp your walls.'
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/home-deals/3.avif',
    title: 'Bouquet Set',
    description: 'Elegant bouquet collection for occasions.'
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/home-deals/4.avif',
    title: 'Home Decor Bouquet',
    description: 'Perfect design for home decoration.'
  }
];

// Furniture Deals Items
export const furnitureDeals: DealItem[] = [
  {
    image: 'https://webdori.in/sixpine/assets/img/furniure/1.webp',
    title: 'Luxury Sofa',
    description: 'Stylish sofa for modern living rooms.'
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniure/2.webp',
    title: 'Armchair',
    description: 'Comfortable armchair for daily use.'
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniure/3.webp',
    title: 'Coffee Table',
    description: 'Modern table with elegant design.'
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniure/4.webp',
    title: 'Desk Lamp',
    description: 'Designer lamp for cozy workspaces.'
  }
];

// Featured Products
export const featuredProducts: Product[] = [
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/bed.jpg',
    title: 'Bed',
    description: 'Comfortable wooden bed perfect for your bedroom setup with modern design.',
    rating: 3.5,
    reviews: 120,
    price: 1299.99,
    oldPrice: 1390.99
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/sofa.jpg',
    title: 'Sofa',
    description: 'Elegant 3-seater sofa with soft cushions and premium upholstery for comfort.',
    rating: 3,
    reviews: 90,
    price: 1299.99,
    oldPrice: 1390.99
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/bed-sheet.jpg',
    title: 'Bed Sheet',
    description: 'High-quality cotton bed sheet with breathable fabric for comfortable sleep.',
    rating: 2.5,
    reviews: 75,
    price: 1299.99,
    oldPrice: 1390.99
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/chair.jpg',
    title: 'Chair',
    description: 'Stylish wooden chair with ergonomic design suitable for study or office.',
    rating: 4,
    reviews: 110,
    price: 1299.99,
    oldPrice: 1390.99
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/sofa2.jpg',
    title: 'Home Sofa',
    description: 'Compact home sofa perfect for small living rooms with stylish look.',
    rating: 2.5,
    reviews: 60,
    price: 1299.99,
    oldPrice: 1390.99
  }
];

// New Arrivals (same as featured for now, but can be customized)
export const newArrivals: Product[] = [
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/bed.jpg',
    title: 'Bed',
    description: 'Comfortable wooden bed perfect for your bedroom setup with modern design.',
    rating: 3.5,
    reviews: 120,
    price: 1299.99,
    oldPrice: 1390.99
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/sofa.jpg',
    title: 'Sofa',
    description: 'Elegant 3-seater sofa with soft cushions and premium upholstery for comfort.',
    rating: 3,
    reviews: 90,
    price: 1299.99,
    oldPrice: 1390.99
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/bed-sheet.jpg',
    title: 'Bed Sheet',
    description: 'High-quality cotton bed sheet with breathable fabric for comfortable sleep.',
    rating: 2.5,
    reviews: 75,
    price: 1299.99,
    oldPrice: 1390.99
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/chair.jpg',
    title: 'Chair',
    description: 'Stylish wooden chair with ergonomic design suitable for study or office.',
    rating: 4,
    reviews: 110,
    price: 1299.99,
    oldPrice: 1390.99
  },
  {
    image: 'https://webdori.in/sixpine/assets/img/furniture-products/sofa2.jpg',
    title: 'Home Sofa',
    description: 'Compact home sofa perfect for small living rooms with stylish look.',
    rating: 2.5,
    reviews: 60,
    price: 1299.99,
    oldPrice: 1390.99
  }
];

// Hero Slider Images
export const heroImages = [
  {
    image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
    alt: 'Hero 1'
  },
  {
    image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
    alt: 'Hero 2'
  }
];

// Banner Image
export const bannerImage = 'https://webdori.in/sixpine/assets/img/banner/SONY.png';
