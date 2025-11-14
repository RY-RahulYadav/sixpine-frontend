import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import { productAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import '../styles/productList.css';
import '../styles/productListModern.css';
import '../styles/filterDropdowns.css';

interface Product {
  id: number | string;
  product_id?: number; // When variant is expanded
  variant_id?: number; // When variant is expanded
  title: string;
  short_description: string;
  main_image: string;
  price: number;
  old_price: number | null;
  average_rating: number;
  review_count: number;
  slug: string;
  is_on_sale: boolean;
  discount_percentage: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  brand: string;
  material?: {
    id: number;
    name: string;
  } | string | null;
  images?: Array<{
    id: number;
    image: string;
    alt_text: string;
  }>;
  variants?: Array<{
    id: number;
    color: {
      id: number;
      name: string;
      hex_code: string;
    };
    size: string;
    pattern: string;
    price: number;
    old_price: number;
    stock_quantity: number;
    is_in_stock: boolean;
  }>;
  variant?: {
    id: number;
    title?: string;
    color: {
      id: number;
      name: string;
      hex_code: string;
    };
    size: string;
    pattern: string;
    price?: number;
    old_price?: number;
    stock_quantity: number;
    is_in_stock: boolean;
    image?: string;
    images?: Array<{
      id: number;
      image: string;
      alt_text: string;
      sort_order: number;
    }>;
  };
  variant_title?: string;
  product_title?: string;
  available_colors?: string[];
  variant_count?: number; // Number of variants for this product
}

const ProductListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState({
    brand: '' as string,
    category: '' as string,
    subcategory: '' as string,
    colors: [] as string[],
    materials: [] as string[],
    priceRange: [135, 25000],
    rating: null as number | null,
    discount: null as number | null,
  });
  
  const [brands, setBrands] = useState<any[]>([]);
  
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as any[],
    subcategories: [] as any[],
    colors: [] as any[],
    materials: [] as any[],
    priceRange: { min_price: 135, max_price: 25000 },
    discounts: [] as any[],
  });
  
  const [availableSubcategories, setAvailableSubcategories] = useState([] as any[]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [sortBy, setSortBy] = useState('featured');
  // Only list/tile view is supported now — default to 'list'
  const [viewMode] = useState<'grid' | 'list'>('list');

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await productAPI.getBrands();
        setBrands(response.data || []);
      } catch (error) {
        console.error('Fetch brands error:', error);
      }
    };
    fetchBrands();
  }, []);

  // Fetch filter options when component mounts or brand changes
  useEffect(() => {
    fetchFilterOptions();
  }, [selectedFilters.brand]);

  // Sync URL category param to selectedFilters when component mounts or category param changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== selectedFilters.category) {
      setSelectedFilters((prev) => ({
        ...prev,
        category: categoryParam,
        subcategory: '', // Reset subcategory when category changes from URL
      }));
      // Fetch subcategories for the selected category
      if (categoryParam) {
        fetchSubcategories(categoryParam);
      }
    }
  }, [searchParams]);

  // Reset to page 1 when filters, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams, sortBy, selectedFilters]);

  // Fetch products when filters, search, sort, or page changes
  useEffect(() => {
    fetchProducts();
  }, [searchParams, sortBy, selectedFilters, currentPage, pageSize]);

  const fetchFilterOptions = async () => {
    try {
      const params: any = {};
      if (selectedFilters.brand) {
        params.vendor = selectedFilters.brand;
      }
      const response = await productAPI.getFilterOptions(params);
      const data = response.data || {};
      
      // Update price range if vendor-specific options are returned
      if (data.priceRange) {
        setFilterOptions({
          ...data,
          priceRange: {
            min_price: data.priceRange.min_price || 135,
            max_price: data.priceRange.max_price || 25000
          }
        });
        // Update selected price range to match vendor's range
        setSelectedFilters(prev => ({
          ...prev,
          priceRange: [data.priceRange.min_price || 135, data.priceRange.max_price || 25000]
        }));
      } else {
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Fetch filter options error:', error);
    }
  };

  const fetchSubcategories = async (categorySlug: string) => {
    try {
      if (categorySlug) {
        setLoadingSubcategories(true);
        const response = await productAPI.getSubcategories(categorySlug);
        setAvailableSubcategories(response.data.results || response.data || []);
      } else {
        setAvailableSubcategories([]);
      }
    } catch (error) {
      console.error('Fetch subcategories error:', error);
      setAvailableSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      // Add search query if present
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
        params.q = searchQuery;
      }

      // Add category filter if present
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        params.category = categoryParam;
      }

      // Add category filter
      if (selectedFilters.category) {
        params.category = selectedFilters.category;
      }

      // Add subcategory filter
      if (selectedFilters.subcategory) {
        params.subcategory = selectedFilters.subcategory;
      }

      // Add color filter
      if (selectedFilters.colors.length > 0) {
        params.color = selectedFilters.colors.join(',');
      }

      // Add material filter
      if (selectedFilters.materials.length > 0) {
        params.material = selectedFilters.materials.join(',');
      }

      // Add price range filter
      if (selectedFilters.priceRange[0] > 135) { // Use default min price instead of filterOptions
        params.min_price = selectedFilters.priceRange[0];
      }
      
      if (selectedFilters.priceRange[1] < 25000) { // Use default max price instead of filterOptions
        params.max_price = selectedFilters.priceRange[1];
      }

      // Add rating filter
      if (selectedFilters.rating) {
        params.min_rating = selectedFilters.rating;
      }

      // Add discount filter (minimum discount percentage)
      if (selectedFilters.discount) {
        params.min_discount = selectedFilters.discount;
      }

      // Add vendor filter
      if (selectedFilters.brand) {
        params.vendor = selectedFilters.brand;
      }

      // Add sorting
      switch (sortBy) {
        case 'price_low':
          params.sort = 'price_low_to_high';
          break;
        case 'price_high':
          params.sort = 'price_high_to_low';
          break;
        case 'newest':
          params.sort = 'newest';
          break;
        case 'rating':
          params.sort = 'rating';
          break;
        case 'popularity':
          params.sort = 'popularity';
          break;
        case 'relevance':
        default:
          params.sort = 'relevance';
          break;
      }

      // Add pagination parameters
      params.page = currentPage;
      params.page_size = pageSize;

      // Get products without expanding variants - backend returns all products with variants included
      // Backend now handles prioritizing products from user's interest categories
      console.log('Fetching products with params:', params);
      const response = await productAPI.getProducts(params);
      let productsList = response.data.results || response.data;
      
      setProducts(productsList);
      // Update total count and pagination info
      if (response.data.count !== undefined) {
        setTotalProducts(response.data.count);
        setTotalPages(Math.ceil(response.data.count / pageSize));
      } else {
        setTotalProducts(Array.isArray(productsList) ? productsList.length : 0);
        setTotalPages(1);
      }
      
      // Update pagination navigation
      setHasNext(!!response.data.next);
      setHasPrevious(!!response.data.previous);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get first variant or null
  const getFirstVariant = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return null;
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const productId = Number(product.id);
      // Use first variant if product has variants, otherwise no variant
      const firstVariant = getFirstVariant(product);
      const variantId = firstVariant?.id || undefined;
      
      await addToCart(productId, 1, variantId);
      // Sidebar will open automatically via context
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
      alert(errorMsg);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleBuyNow = async (product: Product) => {
    try {
      const productId = Number(product.id);
      // Use first variant if product has variants, otherwise no variant
      const firstVariant = getFirstVariant(product);
      const variantId = firstVariant?.id || undefined;
      
      // Add to cart then navigate to cart/checkout
      await addToCart(productId, 1, variantId);
      // Navigate user to cart page so they can checkout immediately
      navigate('/cart');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
      alert(errorMsg);
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    console.log('Filter changed:', filterType, value);
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleCategoryChange = (categorySlug: string) => {
    console.log('Category changed:', categorySlug);
    setSelectedFilters((prev) => ({
      ...prev,
      category: categorySlug,
      subcategory: '', // Reset subcategory when category changes
    }));
    
    // Fetch subcategories for the selected category
    fetchSubcategories(categorySlug);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <div className="container my-5 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <div id="navbar-changed">
          <SubNav />
          <CategoryTabs />

       

          <div className="product-list-modern-container">
            <div className="container-fluid">
              {/* Top Bar with Filters Toggle and View Options */}
              <div className="top-action-bar">
                <div className="left-actions">
                  <button 
                    className="btn-filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className="bi bi-funnel"></i>
                    <span>Filters</span>
                  </button>
                  <span className="results-count">{totalProducts || products.length} Products</span>
                </div>
                
                <div className="right-actions">
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Customer Rating</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              </div>

              <div className="row">
                {/* Left Sidebar - Advanced Filters */}
                <div className={`col-lg-3 col-md-4 filters-sidebar-modern ${showFilters ? 'show' : ''}`}>
                  <div className="filters-wrapper">
                    <div className="filters-header">
                      <h5>
                        <i className="bi bi-sliders me-2"></i>
                        Advanced Filters
                      </h5>
                      <button 
                        className="btn-close-filters d-md-none"
                        onClick={() => setShowFilters(false)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    {/* Brand Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-shop me-2"></i>
                        Brand
                      </h6>
                      <div className="select-with-icon">
                        <select
                          className="form-select filter-select"
                          value={selectedFilters.brand}
                          onChange={(e) => {
                            handleFilterChange('brand', e.target.value);
                            // Reset other filters when brand changes
                            setSelectedFilters(prev => ({
                              ...prev,
                              brand: e.target.value,
                              category: '',
                              subcategory: '',
                              colors: [],
                              materials: [],
                            }));
                          }}
                        >
                          <option value="">All Brands</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.brand_name || brand.business_name || `Brand ${brand.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-tag me-2"></i>
                        Category
                      </h6>
                        <div className="select-with-icon">
                          <select
                            className="form-select filter-select"
                            value={selectedFilters.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                          >
                            <option value="">Select Category</option>
                            {filterOptions.categories && filterOptions.categories.map((category) => (
                              <option key={category.id} value={category.slug}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                    </div>

                    {/* Subcategory Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-tags me-2"></i>
                        Subcategory
                      </h6>
                      <div className="select-with-icon">
                        <select
                          className="form-select filter-select"
                          value={selectedFilters.subcategory}
                          onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                          disabled={!selectedFilters.category || loadingSubcategories}
                        >
                          <option value="">
                            {loadingSubcategories ? 'Loading...' : 'Select Subcategory'}
                          </option>
                          {availableSubcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.slug}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-currency-rupee me-2"></i>
                        Price Range
                      </h6>
                      <div className="price-inputs">
                        <div className="price-input-group">
                          <label>Min</label>
                          <input
                            type="number"
                            className="price-input"
                            placeholder="₹135"
                            value={selectedFilters.priceRange[0]}
                            onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, selectedFilters.priceRange[1]])}
                          />
                        </div>
                        <span className="price-separator">to</span>
                        <div className="price-input-group">
                          <label>Max</label>
                          <input
                            type="number"
                            className="price-input"
                            placeholder="₹25,000"
                            value={selectedFilters.priceRange[1]}
                            onChange={(e) => handleFilterChange('priceRange', [selectedFilters.priceRange[0], parseInt(e.target.value) || 25000])}
                          />
                        </div>
                      </div>
                      <div className="price-range-slider">
                        <input
                          type="range"
                          min="135"
                          max="25000"
                          step="100"
                          value={selectedFilters.priceRange[1]}
                          onChange={(e) => handleFilterChange('priceRange', [selectedFilters.priceRange[0], parseInt(e.target.value)])}
                          className="range-slider"
                        />
                      </div>
                      <div className="price-presets">
                        <button onClick={() => handleFilterChange('priceRange', [135, 5000])}>Under ₹5,000</button>
                        <button onClick={() => handleFilterChange('priceRange', [5000, 15000])}>₹5,000 - ₹15,000</button>
                        <button onClick={() => handleFilterChange('priceRange', [15000, 25000])}>Above ₹15,000</button>
                      </div>
                    </div>

                    {/* Color Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-palette me-2"></i>
                        Color
                      </h6>
                      <div className="filter-options">
                        {filterOptions.colors && filterOptions.colors.map((color) => (
                          <label key={color.id} className="filter-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedFilters.colors.includes(color.name)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...selectedFilters.colors, color.name]
                                  : selectedFilters.colors.filter(c => c !== color.name);
                                handleFilterChange('colors', updated);
                              }}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {color.hex_code && (
                                <div 
                                  style={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    backgroundColor: color.hex_code, 
                                    border: '1px solid #ccc',
                                    borderRadius: '2px'
                                  }}
                                />
                              )}
                              {color.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Material Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-tree me-2"></i>
                        Material
                      </h6>
                      <div className="filter-options">
                        {filterOptions.materials && filterOptions.materials.map((material) => (
                          <label key={material.id} className="filter-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedFilters.materials.includes(material.name)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...selectedFilters.materials, material.name]
                                  : selectedFilters.materials.filter(m => m !== material.name);
                                handleFilterChange('materials', updated);
                              }}
                            />
                            <span>{material.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-star me-2"></i>
                        Customer Rating
                      </h6>
                      <div className="rating-options">
                        {[4, 3, 2].map((rating) => (
                          <label key={rating} className="rating-option">
                            <input
                              type="radio"
                              name="rating"
                              checked={selectedFilters.rating === rating}
                              onChange={() => handleFilterChange('rating', rating)}
                            />
                            <span className="rating-stars">
                              {[...Array(rating)].map((_, i) => (
                                <i key={i} className="bi bi-star-fill"></i>
                              ))}
                              <span className="ms-1">& above</span>
                            </span>
                          </label>
                        ))}
                        <label className="rating-option">
                          <input
                            type="radio"
                            name="rating"
                            checked={selectedFilters.rating === null}
                            onChange={() => handleFilterChange('rating', null)}
                          />
                          <span>All Ratings</span>
                        </label>
                      </div>
                    </div>

                      {/* Discount Filter */}
                      <div className="filter-section">
                        <h6 className="filter-title">
                          <i className="bi bi-tag me-2"></i>
                          Discount
                        </h6>
                        <div className="discount-options">
                          {((filterOptions.discounts && filterOptions.discounts.length) ? filterOptions.discounts : []).map((opt: any) => {
                            const pct = typeof opt === 'number' ? opt : opt.percentage;
                            const label = typeof opt === 'number' ? `${opt}%` : (opt.label || `${pct}%`);
                            return (
                              <label key={pct} className="rating-option">
                                <input
                                  type="radio"
                                  name="discount"
                                  checked={selectedFilters.discount === pct}
                                  onChange={() => handleFilterChange('discount', pct)}
                                />
                                <span className="ms-2">{label} & above</span>
                              </label>
                            );
                          })}
                          <label className="rating-option">
                            <input
                              type="radio"
                              name="discount"
                              checked={selectedFilters.discount === null}
                              onChange={() => handleFilterChange('discount', null)}
                            />
                            <span className="ms-2">All Discounts</span>
                          </label>
                        </div>
                      </div>

                    {/* Clear Filters */}
                    <div className="filter-actions">
                      <button 
                        className="btn-clear-filters"
                        onClick={() => {
                          setSelectedFilters({
                            brand: '',
                            category: '',
                            subcategory: '',
                            colors: [],
                            materials: [],
                            priceRange: [135, 25000],
                            rating: null,
                            discount: null,
                          });
                          setAvailableSubcategories([]);
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Product Grid */}
                <div className="col-lg-9 col-md-8">
                  {products.length === 0 ? (
                    <div className="no-products-found">
                      <div className="no-products-icon">
                        <i className="bi bi-inbox"></i>
                      </div>
                      <h4>No products found</h4>
                      <p>Try adjusting your search or filters to find what you're looking for</p>
                      <button 
                        className="btn-reset"
                        onClick={() => {
                          setSelectedFilters({
                            brand: '',
                            category: '',
                            subcategory: '',
                            colors: [],
                            materials: [],
                            priceRange: [135, 25000],
                            rating: null,
                            discount: null,
                          });
                          setAvailableSubcategories([]);
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                      {products.map((product) => {
                        // Get first variant for display
                        const firstVariant = getFirstVariant(product);
                        const displayImage = product.main_image || '/placeholder-image.jpg';
                        const displayPrice = firstVariant?.price || product.price;
                        const displayOldPrice = firstVariant?.old_price || product.old_price;
                        const isOutOfStock = firstVariant ? !firstVariant.is_in_stock : false;

                        return (
                          <div key={product.id} className="product-card-modern">
                            <div className="product-image-wrapper">
                              {product.discount_percentage > 0 && (
                                <span className="discount-badge">
                                  {product.discount_percentage}% OFF
                                </span>
                              )}
                              <Link to={`/products-details/${product.slug}`}>
                                <img
                                  src={displayImage}
                                  alt={product.title}
                                  className="product-image"
                                />
                              </Link>
                              <button 
                                className="btn-wishlist"
                                title="Add to Wishlist"
                              >
                                <i className="bi bi-heart"></i>
                              </button>
                            </div>
                            
                            <div className="product-info">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                <Link 
                                  to={`/products-details/${product.slug}`} 
                                  className="product-link"
                                  style={{ flex: 1, minWidth: 0 }}
                                >
                                  <h3 className="product-name">
                                    {product.title}
                                  </h3>
                                </Link>
                                {/* Out of Stock Indicator - Right side of title */}
                                {isOutOfStock && (
                                  <span className="badge bg-danger" style={{ 
                                    fontSize: '0.75em', 
                                    padding: '4px 8px',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                  }}>
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                              
                              {/* Variant Information - Show first variant details */}
                              {firstVariant && (
                                <div className="product-variant-info">
                                  <small className="text-muted d-flex flex-wrap gap-2 align-items-center">
                                    {firstVariant.color && (
                                      <span>
                                        <strong>Color:</strong> {firstVariant.color.name}
                                        {firstVariant.color.hex_code && (
                                          <span 
                                            className="ms-1"
                                            style={{
                                              display: 'inline-block',
                                              width: '12px',
                                              height: '12px',
                                              backgroundColor: firstVariant.color.hex_code,
                                              border: '1px solid #ccc',
                                              borderRadius: '2px',
                                              verticalAlign: 'middle'
                                            }}
                                            title={firstVariant.color.name}
                                          />
                                        )}
                                      </span>
                                    )}
                                    {firstVariant.size && (
                                      <span><strong>Size:</strong> {firstVariant.size}</span>
                                    )}
                                    {firstVariant.pattern && (
                                      <span><strong>Pattern:</strong> {firstVariant.pattern}</span>
                                    )}
                                  </small>
                                </div>
                              )}
                              
                              <p className="product-description">
                                {product.short_description}
                              </p>
                              
                              <div className="product-rating">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <div className="stars">
                                    {renderStars(product.average_rating)}
                                  </div>
                                  <span className="review-count">({product.review_count} reviews)</span>
                                  {/* More Variants Available Note - Right after reviews text */}
                                  {product.variant_count && product.variant_count > 1 && (
                                    <small className="text-primary" style={{ 
                                      fontSize: '0.8em', 
                                      fontStyle: 'italic',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      marginLeft: '8px'
                                    }}>
                                      <i className="bi bi-info-circle" style={{ fontSize: '0.85em' }}></i>
                                      {product.variant_count - 1} more variant{product.variant_count - 1 > 1 ? 's' : ''}
                                    </small>
                                  )}
                                </div>
                              </div>

                              <div className="product-pricing">
                                <div className="price-info">
                                  <span className="current-price">₹{displayPrice.toLocaleString()}</span>
                                  {displayOldPrice && displayOldPrice > displayPrice && (
                                    <>
                                      <span className="original-price">₹{displayOldPrice.toLocaleString()}</span>
                                      <span className="save-amount">Save ₹{(displayOldPrice - displayPrice).toLocaleString()}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="product-action-row">
                                <button
                                  className="btn-add-to-cart btn-buy-now"
                                  onClick={() => handleBuyNow(product)}
                                  disabled={loading || isOutOfStock}
                                >
                                  Buy Now
                                </button>

                                <button
                                  className="btn-cart-icon"
                                  onClick={() => handleAddToCart(product)}
                                  title="Add to cart"
                                  disabled={loading || isOutOfStock}
                                >
                                  <i className="bi bi-cart-plus"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Pagination Component */}
                  {totalPages > 0 && (
                    <div className="pagination-wrapper" style={{ marginTop: '40px', marginBottom: '20px' }}>
                      <div className="pagination-container" style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}>
                        {/* Page Size Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '20px' }}>
                          <label style={{ fontSize: '14px', color: '#666' }}>Items per page:</label>
                          <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #ddd',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value={12}>12</option>
                            <option value={20}>20</option>
                            <option value={40}>40</option>
                            <option value={60}>60</option>
                          </select>
                        </div>

                        {/* Page Info */}
                        <div style={{ fontSize: '14px', color: '#666', marginRight: '20px' }}>
                          Page {currentPage} of {totalPages} ({totalProducts} total)
                        </div>

                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!hasPrevious}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            backgroundColor: hasPrevious ? '#fff' : '#f5f5f5',
                            color: hasPrevious ? '#333' : '#999',
                            cursor: hasPrevious ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (hasPrevious) {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (hasPrevious) {
                              e.currentTarget.style.backgroundColor = '#fff';
                            }
                          }}
                        >
                          <i className="bi bi-chevron-left"></i> Previous
                        </button>

                        {/* Page Numbers */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  border: currentPage === pageNum ? '2px solid var(--sixpine-primary)' : '1px solid #ddd',
                                  backgroundColor: currentPage === pageNum ? 'var(--sixpine-primary)' : '#fff',
                                  color: currentPage === pageNum ? '#fff' : '#333',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: currentPage === pageNum ? '600' : '400',
                                  transition: 'all 0.2s',
                                  minWidth: '40px'
                                }}
                                onMouseEnter={(e) => {
                                  if (currentPage !== pageNum) {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (currentPage !== pageNum) {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                  }
                                }}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!hasNext}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            backgroundColor: hasNext ? '#fff' : '#f5f5f5',
                            color: hasNext ? '#333' : '#999',
                            cursor: hasNext ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (hasNext) {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (hasNext) {
                              e.currentTarget.style.backgroundColor = '#fff';
                            }
                          }}
                        >
                          Next <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Section - Similar to Home Page */}
          <div className="plp-info-section">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-3 col-6">
                  <div className="info-card">
                    <i className="bi bi-truck"></i>
                    <h6>Free Delivery</h6>
                    <p>On orders above ₹5,000</p>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="info-card">
                    <i className="bi bi-shield-check"></i>
                    <h6>Quality Assured</h6>
                    <p>Premium materials used</p>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="info-card">
                    <i className="bi bi-arrow-return-left"></i>
                    <h6>Easy Returns</h6>
                    <p>7-day return policy</p>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="info-card">
                    <i className="bi bi-headset"></i>
                    <h6>24/7 Support</h6>
                    <p>Customer care available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default ProductListPage;
