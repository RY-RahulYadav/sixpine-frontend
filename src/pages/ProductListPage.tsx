import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import { productAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
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
  color_count?: number; // Number of distinct colors for this product
}

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useApp();
  const navigate = useNavigate();
  const { showError } = useNotification();
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

  const [sortBy, setSortBy] = useState('relevance');
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

  // Function to update URL params based on current filter state
  const updateURLParams = () => {
    const newParams = new URLSearchParams();
    
    // Preserve search query if present
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      newParams.set('search', searchQuery);
    }
    
    // Add filters to URL
    if (selectedFilters.brand) {
      newParams.set('brand', selectedFilters.brand);
    }
    if (selectedFilters.category) {
      newParams.set('category', selectedFilters.category);
    }
    if (selectedFilters.subcategory) {
      newParams.set('subcategory', selectedFilters.subcategory);
    }
    if (selectedFilters.colors.length > 0) {
      newParams.set('colors', selectedFilters.colors.join(','));
    }
    if (selectedFilters.materials.length > 0) {
      newParams.set('materials', selectedFilters.materials.join(','));
    }
    if (selectedFilters.priceRange[0] > 135 || selectedFilters.priceRange[1] < 25000) {
      newParams.set('min_price', selectedFilters.priceRange[0].toString());
      newParams.set('max_price', selectedFilters.priceRange[1].toString());
    }
    if (selectedFilters.rating) {
      newParams.set('rating', selectedFilters.rating.toString());
    }
    if (selectedFilters.discount) {
      newParams.set('discount', selectedFilters.discount.toString());
    }
    if (sortBy && sortBy !== 'relevance') {
      newParams.set('sort', sortBy);
    }
    if (currentPage > 1) {
      newParams.set('page', currentPage.toString());
    }
    
    // Update URL without page reload
    setSearchParams(newParams, { replace: true });
  };

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters from URL params on mount
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const colorsParam = searchParams.get('colors');
    const materialsParam = searchParams.get('materials');
    const minPriceParam = searchParams.get('min_price');
    const maxPriceParam = searchParams.get('max_price');
    const ratingParam = searchParams.get('rating');
    const discountParam = searchParams.get('discount');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');
    
    const initialFilters: any = {
      brand: brandParam || '',
      category: categoryParam || '',
      subcategory: subcategoryParam || '',
      colors: colorsParam ? colorsParam.split(',') : [],
      materials: materialsParam ? materialsParam.split(',') : [],
      priceRange: [
        minPriceParam ? parseInt(minPriceParam) : 135,
        maxPriceParam ? parseInt(maxPriceParam) : 25000
      ],
      rating: ratingParam ? parseFloat(ratingParam) : null,
      discount: discountParam ? parseInt(discountParam) : null,
    };
    
    setSelectedFilters(initialFilters);
    
    if (sortParam) {
      // Map backend sort values to frontend values if needed
      let mappedSort = sortParam;
      if (sortParam === 'price_low_to_high') {
        mappedSort = 'price_low';
      } else if (sortParam === 'price_high_to_low') {
        mappedSort = 'price_high';
      }
      // Only set if it's a valid frontend sort value
      if (['relevance', 'price_low', 'price_high'].includes(mappedSort)) {
        setSortBy(mappedSort);
      }
    }
    
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    }
    
    // Fetch subcategories if category is in URL
    if (categoryParam) {
      fetchSubcategories(categoryParam);
    }
    
    setIsInitialized(true);
  }, []); // Only run on mount

  // Watch for URL parameter changes (category/subcategory) and update filters
  useEffect(() => {
    if (!isInitialized) return;
    
    const categoryParam = searchParams.get('category') || '';
    const subcategoryParam = searchParams.get('subcategory') || '';
    const currentCategory = selectedFilters.category || '';
    const currentSubcategory = selectedFilters.subcategory || '';
    
    // Only update if URL params differ from current filters
    if (categoryParam !== currentCategory || subcategoryParam !== currentSubcategory) {
      setSelectedFilters((prev) => ({
        ...prev,
        category: categoryParam,
        subcategory: subcategoryParam,
      }));
      
      // Fetch subcategories if category changed
      if (categoryParam && categoryParam !== currentCategory) {
        fetchSubcategories(categoryParam);
      } else if (!categoryParam) {
        setAvailableSubcategories([]);
      }
      
      // Reset to page 1 when category/subcategory changes
      setCurrentPage(1);
    }
  }, [searchParams, isInitialized]);

  // Update URL when filters, sort, or page changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialized) return;
    updateURLParams();
  }, [selectedFilters, sortBy, currentPage]);

  // Reset to page 1 when filters or sort changes (but not when page changes from URL)
  useEffect(() => {
    if (!isInitialized) return;
    // Only reset page when filters actually change, not on initial load
    setCurrentPage(1);
  }, [
    selectedFilters.brand, 
    selectedFilters.category, 
    selectedFilters.subcategory, 
    selectedFilters.colors.join(','), 
    selectedFilters.materials.join(','), 
    selectedFilters.priceRange[0], 
    selectedFilters.priceRange[1], 
    selectedFilters.rating, 
    selectedFilters.discount, 
    sortBy
  ]);

  // Fetch products when filters, search, sort, or page changes
  // Note: This will trigger when searchParams changes (including category/subcategory from URL)
  useEffect(() => {
    if (isInitialized) {
      fetchProducts();
    }
  }, [searchParams, sortBy, selectedFilters, currentPage, pageSize, isInitialized]);

  // Prevent body scroll when filters are open on mobile
  useEffect(() => {
    if (showFilters && window.innerWidth <= 991) {
      document.body.classList.add('filters-open');
    } else {
      document.body.classList.remove('filters-open');
    }
    
    return () => {
      document.body.classList.remove('filters-open');
    };
  }, [showFilters]);

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

      // Add category filter - prioritize URL params over state
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        params.category = categoryParam;
      } else if (selectedFilters.category) {
        params.category = selectedFilters.category;
      }

      // Add subcategory filter - prioritize URL params over state
      const subcategoryParam = searchParams.get('subcategory');
      if (subcategoryParam) {
        params.subcategory = subcategoryParam;
      } else if (selectedFilters.subcategory) {
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
        case 'relevance':
        default:
          params.sort = 'relevance';
          break;
      }

      // Add pagination parameters
      params.page = currentPage;
      params.page_size = pageSize;
      
      // Always expand variants to show all variants as separate items
      params.expand_variants = 'true';

      // Get products with expanded variants - backend returns each variant as a separate item
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

  // Helper function to get variant data - handles both expanded and non-expanded formats
  const getVariantData = (product: Product) => {
    // If variant is expanded (from backend), use the variant object directly
    if (product.variant) {
      return product.variant;
    }
    // Otherwise, try to get first variant from variants array
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return null;
  };

  const handleAddToCart = async (product: Product) => {
    try {
      // Use product_id if available (expanded variant), otherwise use id
      const productId = product.product_id ? Number(product.product_id) : Number(product.id);
      // Use variant_id if available (expanded variant), otherwise get from variant object
      const variantId = product.variant_id 
        ? Number(product.variant_id) 
        : (product.variant?.id ? Number(product.variant.id) : undefined);
      
      await addToCart(productId, 1, variantId);
      // Sidebar will open automatically via context
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
      showError(errorMsg);
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
      // Use product_id if available (expanded variant), otherwise use id
      const productId = product.product_id ? Number(product.product_id) : Number(product.id);
      // Use variant_id if available (expanded variant), otherwise get from variant object
      const variantId = product.variant_id 
        ? Number(product.variant_id) 
        : (product.variant?.id ? Number(product.variant.id) : undefined);
      
      // Add to cart then navigate to cart/checkout
      await addToCart(productId, 1, variantId);
      // Navigate user to cart page so they can checkout immediately
      navigate('/cart');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
      showError(errorMsg);
    }
  };

  const handleFilterChange = (filterType: string, value: any, shouldCloseOnMobile: boolean = true) => {
    console.log('Filter changed:', filterType, value);
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    
    // Close filter sidebar on mobile after filter change (except for price inputs)
    if (shouldCloseOnMobile && window.innerWidth <= 991 && showFilters) {
      setTimeout(() => {
        setShowFilters(false);
      }, 300); // Small delay to show the change before closing
    }
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
    
    // Close filter sidebar on mobile after category change
    if (window.innerWidth <= 991 && showFilters) {
      setTimeout(() => {
        setShowFilters(false);
      }, 300);
    }
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
                  </select>
                </div>
              </div>

              {/* Mobile Overlay for Filters */}
              {showFilters && (
                <div 
                  className={`filters-overlay ${showFilters ? 'show' : ''}`}
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                />
              )}

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
                        className="btn-close-filters"
                        onClick={() => setShowFilters(false)}
                        aria-label="Close filters"
                        title="Close filters"
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
                            onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, selectedFilters.priceRange[1]], false)}
                            onBlur={() => {
                              // Close sidebar on mobile when user finishes typing
                              if (window.innerWidth <= 991 && showFilters) {
                                setTimeout(() => {
                                  setShowFilters(false);
                                }, 300);
                              }
                            }}
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
                            onChange={(e) => handleFilterChange('priceRange', [selectedFilters.priceRange[0], parseInt(e.target.value) || 25000], false)}
                            onBlur={() => {
                              // Close sidebar on mobile when user finishes typing
                              if (window.innerWidth <= 991 && showFilters) {
                                setTimeout(() => {
                                  setShowFilters(false);
                                }, 300);
                              }
                            }}
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
                          onChange={(e) => handleFilterChange('priceRange', [selectedFilters.priceRange[0], parseInt(e.target.value)], false)}
                          onMouseUp={() => {
                            // Close sidebar on mobile when user releases slider
                            if (window.innerWidth <= 991 && showFilters) {
                              setTimeout(() => {
                                setShowFilters(false);
                              }, 300);
                            }
                          }}
                          onTouchEnd={() => {
                            // Close sidebar on mobile when user releases slider (touch devices)
                            if (window.innerWidth <= 991 && showFilters) {
                              setTimeout(() => {
                                setShowFilters(false);
                              }, 300);
                            }
                          }}
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
                          setCurrentPage(1);
                          // Clear URL params except search
                          const newParams = new URLSearchParams();
                          const searchQuery = searchParams.get('search');
                          if (searchQuery) {
                            newParams.set('search', searchQuery);
                          }
                          setSearchParams(newParams, { replace: true });
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Product Grid */}
                <div className="col-lg-9 ">
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
                          setCurrentPage(1);
                          // Clear URL params except search
                          const newParams = new URLSearchParams();
                          const searchQuery = searchParams.get('search');
                          if (searchQuery) {
                            newParams.set('search', searchQuery);
                          }
                          setSearchParams(newParams, { replace: true });
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                      {products.map((product) => {
                        // Get variant data - handles both expanded and non-expanded formats
                        const variantData = getVariantData(product);
                        
                        // For expanded variants, use variant-specific data
                        const displayImage = variantData?.image || product.main_image || '/placeholder-image.jpg';
                        const displayPrice = variantData?.price || product.price;
                        const displayOldPrice = variantData?.old_price || product.old_price;
                        const isOutOfStock = variantData ? !variantData.is_in_stock : false;
                        
                        // Use variant title if available, otherwise fallback to product title
                        const displayTitle = variantData?.title || product.product_title || product.title;

                        return (
                          <div key={product.id} className="product-card-modern">
                            <div className="product-image-wrapper">
                              {product.discount_percentage > 0 && (
                                <span className="discount-badge">
                                  {product.discount_percentage}% OFF
                                </span>
                              )}
                              <Link to={`/products-details/${product.slug}${product.variant_id ? `?variant=${product.variant_id}` : ''}`}>
                                <img
                                  src={displayImage}
                                  alt={displayTitle}
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
                                  to={`/products-details/${product.slug}${product.variant_id ? `?variant=${product.variant_id}` : ''}`} 
                                  className="product-link"
                                  style={{ flex: 1, minWidth: 0 }}
                                >
                                  <h3 className="product-name">
                                    {displayTitle.length > 100 ? displayTitle.substring(0, 90).trim() + '...' : displayTitle || ''}
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
                              
                              {/* Variant Information - Show variant details */}
                              {variantData && (
                                <div className="product-variant-info">
                                  <small className="text-muted" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {variantData.color && (
                                      <span>
                                        <strong>Color:</strong> {variantData.color.name}
                                        {variantData.color.hex_code && (
                                          <span 
                                            className="ms-1"
                                            style={{
                                              display: 'inline-block',
                                              width: '12px',
                                              height: '12px',
                                              backgroundColor: variantData.color.hex_code,
                                              border: '1px solid #ccc',
                                              borderRadius: '2px',
                                              verticalAlign: 'middle'
                                            }}
                                            title={variantData.color.name}
                                          />
                                        )}
                                      </span>
                                    )}
                                    {variantData.size && (
                                      <span><strong>Size:</strong> {variantData.size}</span>
                                    )}
                                    {variantData.pattern && (
                                      <span><strong>Pattern:</strong> {variantData.pattern}</span>
                                    )}
                                    {variantData.quality && (
                                      <span><strong>Quality:</strong> {variantData.quality}</span>
                                    )}
                                  </small>
                                </div>
                              )}
                              
                              <p className="product-description" style={{ whiteSpace: 'pre-line' }}>
                                {product.short_description && product.short_description.length > 100
                                  ? product.short_description.substring(0, 200).trim() + '...'
                                  : product.short_description}
                              </p>
                              
                              <div className="product-rating">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <div className="stars">
                                    {renderStars(product.average_rating)}
                                  </div>
                                  <span className="review-count">({product.review_count} reviews)</span>
                                  {/* More Variants Available Note - Right after reviews text */}
                                  {(product.color_count || product.variant_count) && (product.color_count || product.variant_count || 0) > 1 && (
                                    <small className="text-primary" style={{ 
                                      fontSize: '0.8em', 
                                      fontStyle: 'italic',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      marginLeft: '8px'
                                    }}>
                                      <i className="bi bi-info-circle" style={{ fontSize: '0.85em' }}></i>
                                      {(product.color_count || product.variant_count || 0) - 1} more color{((product.color_count || product.variant_count || 0) - 1) > 1 ? 's' : ''}
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
                    <div className="pagination-wrapper">
                      <div className="pagination-container">
                        {/* Page Size Selector */}
                        <div className="pagination-page-size">
                          <label className="pagination-label">Items per page:</label>
                          <select
                            className="pagination-select"
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                          >
                            <option value={12}>12</option>
                            <option value={20}>20</option>
                            <option value={40}>40</option>
                            <option value={60}>60</option>
                          </select>
                        </div>

                        {/* Page Info */}
                        <div className="pagination-info">
                          Page {currentPage} of {totalPages} ({totalProducts} total)
                        </div>

                        {/* Previous Button */}
                        <button
                          className={`pagination-btn pagination-btn-prev ${!hasPrevious ? 'disabled' : ''}`}
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!hasPrevious}
                        >
                          <i className="bi bi-chevron-left"></i> Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="pagination-numbers">
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
                                className={`pagination-btn pagination-btn-number ${currentPage === pageNum ? 'active' : ''}`}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          className={`pagination-btn pagination-btn-next ${!hasNext ? 'disabled' : ''}`}
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!hasNext}
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
                    <p>10-day return policy</p>
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
