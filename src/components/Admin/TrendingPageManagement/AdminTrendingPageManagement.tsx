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

interface TrendingProduct {
  id: number;
  name: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  tag: string;
  discount?: string;
  productId?: number;
  navigateUrl?: string;
  description?: string;
  variantCount?: number;
}

interface TrendingCategory {
  id: number;
  name: string;
  image: string;
  itemCount: number;
  trending: string;
  navigateUrl?: string;
}

interface TrendingAnalytic {
  id: number;
  name: string;
  percentage: number;
}

const AdminTrendingPageManagement: React.FC = () => {
  const [, setSections] = useState<HomePageContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('products');
  const [saving, setSaving] = useState<boolean>(false);

  // Trending Products Section
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [productsSectionTitle, setProductsSectionTitle] = useState('Trending Right Now');
  const [productsSectionSubtitle, setProductsSectionSubtitle] = useState('Discover what customers are loving this week');
  const [viewAllButtonText, setViewAllButtonText] = useState('View All Trending Products');
  const [editingProductsSection, setEditingProductsSection] = useState<HomePageContent | null>(null);
  
  // Product selection
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // Trending Categories Section
  const [categories, setCategories] = useState<TrendingCategory[]>([]);
  const [categoriesSectionTitle, setCategoriesSectionTitle] = useState('Popular Trending Categories');
  const [categoriesSectionSubtitle, setCategoriesSectionSubtitle] = useState('Explore trending categories shoppers are loving');
  const [editingCategoriesSection, setEditingCategoriesSection] = useState<HomePageContent | null>(null);

  // Trending Collections Section
  const [analytics, setAnalytics] = useState<TrendingAnalytic[]>([]);
  const [analyticsTitle, setAnalyticsTitle] = useState("What's Hot This Week");
  const [editingCollectionsSection, setEditingCollectionsSection] = useState<HomePageContent | null>(null);

  // Default values
  const defaultProducts: TrendingProduct[] = [
    {
      id: 1,
      name: 'Ergonomic Office Chair',
      price: '₹6,499',
      rating: 4.8,
      reviewCount: 1243,
      image: '/images/Home/studytable.jpg',
      tag: 'Most Viewed',
      discount: '15% OFF',
      navigateUrl: '#'
    },
    {
      id: 2,
      name: 'Minimal Bedside Table',
      price: '₹2,299',
      rating: 4.7,
      reviewCount: 856,
      image: '/images/Home/furnishing.jpg',
      tag: 'Bestseller',
      discount: '20% OFF',
      navigateUrl: '#'
    },
    {
      id: 3,
      name: 'Nordic Sofa Set',
      price: '₹32,999',
      rating: 4.9,
      reviewCount: 421,
      image: '/images/Home/livingroom.jpg',
      tag: 'Hot Item',
      discount: '10% OFF',
      navigateUrl: '#'
    },
    {
      id: 4,
      name: 'Luxury Memory Foam Mattress',
      price: '₹15,999',
      rating: 4.8,
      reviewCount: 753,
      image: '/images/Home/furnishing.jpg',
      tag: 'Fast Selling',
      discount: '25% OFF',
      navigateUrl: '#'
    }
  ];

  const defaultCategories: TrendingCategory[] = [
    {
      id: 1,
      name: 'Living Room',
      image: '/images/Home/livingroom.jpg',
      itemCount: 240,
      trending: '+15% this week',
      navigateUrl: '/products?category=living-room'
    },
    {
      id: 2,
      name: 'Bedroom',
      image: '/images/Home/furnishing.jpg',
      itemCount: 186,
      trending: '+12% this week',
      navigateUrl: '/products?category=bedroom'
    },
    {
      id: 3,
      name: 'Home Office',
      image: '/images/Home/studytable.jpg',
      itemCount: 154,
      trending: '+28% this week',
      navigateUrl: '/products?category=home-office'
    },
    {
      id: 4,
      name: 'Kitchen & Dining',
      image: '/images/Home/furnishing.jpg',
      itemCount: 205,
      trending: '+8% this week',
      navigateUrl: '/products?category=kitchen-dining'
    },
    {
      id: 5,
      name: 'Home Decor',
      image: '/images/Home/livingroom.jpg',
      itemCount: 310,
      trending: '+20% this week',
      navigateUrl: '/products?category=home-decor'
    },
    {
      id: 6,
      name: 'Outdoor Furniture',
      image: '/images/Home/studytable.jpg',
      itemCount: 128,
      trending: '+5% this week',
      navigateUrl: '/products?category=outdoor-furniture'
    }
  ];

  const defaultAnalytics: TrendingAnalytic[] = [
    { id: 1, name: 'Ergonomic Chairs', percentage: 92 },
    { id: 2, name: 'Modular Sofas', percentage: 86 },
    { id: 3, name: 'Minimalist Lamps', percentage: 78 },
    { id: 4, name: 'Smart Storage', percentage: 74 }
  ];

  useEffect(() => {
    fetchSections();
    fetchProductsForSections();
  }, []);

  const fetchProductsForSections = async () => {
    try {
      setLoadingProducts(true);
      const response = await adminAPI.getProducts({ page_size: 1000, is_active: true });
      const productsData = response.data.results || response.data || [];
      setAllProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getHomepageContent();
      const sectionsData = response.data.results || response.data || [];
      setSections(sectionsData);

      // Load trending products section
      const productsSection = sectionsData.find((s: HomePageContent) => s.section_key === 'trending-products');
      if (productsSection && productsSection.content) {
        setEditingProductsSection(productsSection);
        // Map products to include description and variantCount if missing
        const mappedProducts = (productsSection.content.products || defaultProducts).map((p: any) => ({
          ...p,
          description: p.description || p.short_description || '',
          variantCount: p.variantCount || p.variant_count || 0
        }));
        setProducts(mappedProducts);
        setProductsSectionTitle(productsSection.content.sectionTitle || 'Trending Right Now');
        setProductsSectionSubtitle(productsSection.content.sectionSubtitle || 'Discover what customers are loving this week');
        setViewAllButtonText(productsSection.content.viewAllButtonText || 'View All Trending Products');
      } else {
        setProducts(defaultProducts);
      }

      // Load trending categories section
      const categoriesSection = sectionsData.find((s: HomePageContent) => s.section_key === 'trending-categories');
      if (categoriesSection && categoriesSection.content) {
        setEditingCategoriesSection(categoriesSection);
        setCategories(categoriesSection.content.categories || defaultCategories);
        setCategoriesSectionTitle(categoriesSection.content.sectionTitle || 'Popular Trending Categories');
        setCategoriesSectionSubtitle(categoriesSection.content.sectionSubtitle || 'Explore trending categories shoppers are loving');
      } else {
        setCategories(defaultCategories);
      }

      // Load trending collections section
      const collectionsSection = sectionsData.find((s: HomePageContent) => s.section_key === 'trending-collections');
      if (collectionsSection && collectionsSection.content) {
        setEditingCollectionsSection(collectionsSection);
        setAnalytics(collectionsSection.content.analytics || defaultAnalytics);
        setAnalyticsTitle(collectionsSection.content.analyticsTitle || "What's Hot This Week");
      } else {
        setAnalytics(defaultAnalytics);
      }
    } catch (err: any) {
      console.error('Error fetching trending page content:', err);
      setError(err.response?.data?.error || 'Failed to load trending page content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProductsSection = async () => {
    try {
      setSaving(true);
      const productsData = {
        section_key: 'trending-products',
        section_name: 'Trending Products Section',
        content: {
          sectionTitle: productsSectionTitle,
          sectionSubtitle: productsSectionSubtitle,
          products: products,
          viewAllButtonText: viewAllButtonText,
          viewAllButtonUrl: '#'
        },
        is_active: true,
        order: 1
      };

      if (editingProductsSection) {
        await adminAPI.patchHomepageContent(editingProductsSection.id, productsData);
        showToast('Trending products section updated successfully', 'success');
      } else {
        await adminAPI.createHomepageContent(productsData);
        showToast('Trending products section created successfully', 'success');
      }
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving trending products section:', err);
      showToast(err.response?.data?.error || 'Failed to save trending products section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategoriesSection = async () => {
    try {
      setSaving(true);
      const categoriesData = {
        section_key: 'trending-categories',
        section_name: 'Trending Categories Section',
        content: {
          sectionTitle: categoriesSectionTitle,
          sectionSubtitle: categoriesSectionSubtitle,
          categories: categories
        },
        is_active: true,
        order: 2
      };

      if (editingCategoriesSection) {
        await adminAPI.patchHomepageContent(editingCategoriesSection.id, categoriesData);
        showToast('Trending categories section updated successfully', 'success');
      } else {
        await adminAPI.createHomepageContent(categoriesData);
        showToast('Trending categories section created successfully', 'success');
      }
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving trending categories section:', err);
      showToast(err.response?.data?.error || 'Failed to save trending categories section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCollectionsSection = async () => {
    try {
      setSaving(true);
      const collectionsData = {
        section_key: 'trending-collections',
        section_name: 'Trending Collections Section',
        content: {
          analyticsTitle: analyticsTitle,
          analytics: analytics
        },
        is_active: true,
        order: 3
      };

      if (editingCollectionsSection) {
        await adminAPI.patchHomepageContent(editingCollectionsSection.id, collectionsData);
        showToast('Trending collections section updated successfully', 'success');
      } else {
        await adminAPI.createHomepageContent(collectionsData);
        showToast('Trending collections section created successfully', 'success');
      }
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving trending collections section:', err);
      showToast(err.response?.data?.error || 'Failed to save trending collections section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProductToTrending = async (productId: number) => {
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
      
      // Calculate discount
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
      const variantCount = product.variants ? product.variants.filter((v: any) => v.is_active).length : 0;
      
      // Generate navigation URL from slug
      const navigateUrl = product.slug ? `/products-details/${product.slug}` : '#';
      
      const newProduct: TrendingProduct = {
        id: products.length + 1,
        name: product.title || 'Product Title',
        price: `₹${Math.round(currentPrice).toLocaleString('en-IN')}`,
        rating: averageRating || 4.0,
        reviewCount: reviewCount,
        image: productImage || '/images/Home/sofa1.jpg',
        tag: 'Trending',
        discount: discountPercent > 0 ? `${discountPercent}% OFF` : undefined,
        productId: product.id,
        navigateUrl: navigateUrl,
        description: product.short_description || '',
        variantCount: variantCount
      };
      
      setProducts([...products, newProduct]);
      showToast('Product added successfully', 'success');
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to load product details', 'error');
    }
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const addCategory = () => {
    const newCategory: TrendingCategory = {
      id: categories.length + 1,
      name: 'New Category',
      image: '/images/Home/sofa1.jpg',
      itemCount: 0,
      trending: '+0% this week',
      navigateUrl: '#'
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: keyof TrendingCategory, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const addAnalytic = () => {
    if (analytics.length >= 4) {
      showToast('Maximum 4 analytics items allowed', 'error');
      return;
    }
    const newAnalytic: TrendingAnalytic = {
      id: analytics.length + 1,
      name: 'New Item',
      percentage: 0
    };
    setAnalytics([...analytics, newAnalytic]);
  };

  const removeAnalytic = (index: number) => {
    setAnalytics(analytics.filter((_, i) => i !== index));
  };

  const updateAnalytic = (index: number, field: keyof TrendingAnalytic, value: any) => {
    const updated = [...analytics];
    updated[index] = { ...updated[index], [field]: value };
    setAnalytics(updated);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">Loading trending page content...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Trending Page Management</h1>
        <p>Customize all sections of the trending page</p>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products Section
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories Section
        </button>
        <button
          className={activeTab === 'collections' ? 'active' : ''}
          onClick={() => setActiveTab('collections')}
        >
          Collections Section
        </button>
      </div>

      <div className="admin-content">
        {/* Products Section Tab */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <h2>Trending Products Section</h2>
            
            <div className="admin-form-group">
              <label>Section Title</label>
              <input
                type="text"
                value={productsSectionTitle}
                onChange={(e) => setProductsSectionTitle(e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label>Section Subtitle</label>
              <input
                type="text"
                value={productsSectionSubtitle}
                onChange={(e) => setProductsSectionSubtitle(e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label>View All Button Text</label>
              <input
                type="text"
                value={viewAllButtonText}
                onChange={(e) => setViewAllButtonText(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Products</label>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Add Product from Product List</label>
                <select
                  className="admin-form-input"
                  value=""
                  onChange={(e) => {
                    const productId = parseInt(e.target.value);
                    if (productId) {
                      handleAddProductToTrending(productId);
                      e.target.value = '';
                    }
                  }}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)', width: '100%', maxWidth: '500px' }}
                  disabled={loadingProducts}
                >
                  <option value="">-- Select Product to Add --</option>
                  {loadingProducts ? (
                    <option disabled>Loading products...</option>
                  ) : (
                    allProducts
                      .filter((p: any) => !products.some((prod) => prod.productId === p.id))
                      .map((product: any) => (
                        <option key={product.id} value={product.id}>
                          {product.title} {product.slug ? `(${product.slug})` : ''}
                        </option>
                      ))
                  )}
                </select>
                <small style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '12px' }}>
                  Select a product from the list to automatically populate its details
                </small>
              </div>
              {products.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontStyle: 'italic', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  No products added. Select products using the dropdown above.
                </div>
              ) : (
                products.map((product, index) => (
                  <div key={index} className="admin-card" style={{ marginBottom: '15px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, marginBottom: '5px' }}>{product.name}</h4>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        <span style={{ marginRight: '15px' }}>Price: {product.price}</span>
                        <span style={{ marginRight: '15px' }}>Rating: {product.rating} ⭐</span>
                        <span style={{ marginRight: '15px' }}>Reviews: {product.reviewCount}</span>
                        {product.discount && <span>Discount: {product.discount}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeProduct(index)} className="admin-btn admin-btn-danger" style={{ marginLeft: '15px' }}>Remove</button>
                  </div>
                ))
              )}
            </div>

            <button onClick={handleSaveProductsSection} disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? 'Saving...' : 'Save Products Section'}
            </button>
          </div>
        )}

        {/* Categories Section Tab */}
        {activeTab === 'categories' && (
          <div className="admin-section">
            <h2>Trending Categories Section</h2>
            
            <div className="admin-form-group">
              <label>Section Title</label>
              <input
                type="text"
                value={categoriesSectionTitle}
                onChange={(e) => setCategoriesSectionTitle(e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label>Section Subtitle</label>
              <input
                type="text"
                value={categoriesSectionSubtitle}
                onChange={(e) => setCategoriesSectionSubtitle(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Categories</label>
              {categories.map((category, index) => (
                <div key={index} className="admin-card" style={{ marginBottom: '20px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3>Category {index + 1}</h3>
                    <button onClick={() => removeCategory(index)} className="admin-btn admin-btn-danger">Remove</button>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Item Count</label>
                      <input
                        type="number"
                        value={category.itemCount}
                        onChange={(e) => updateCategory(index, 'itemCount', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Trending Text</label>
                      <input
                        type="text"
                        value={category.trending}
                        onChange={(e) => updateCategory(index, 'trending', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Image URL</label>
                      <input
                        type="text"
                        value={category.image}
                        onChange={(e) => updateCategory(index, 'image', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Navigation URL</label>
                    <input
                      type="text"
                      value={category.navigateUrl || ''}
                      onChange={(e) => updateCategory(index, 'navigateUrl', e.target.value)}
                      placeholder="/products?category=category-name or custom URL"
                    />
                    <small style={{ color: 'var(--admin-text-light)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Enter full URL or leave empty for no link
                    </small>
                  </div>
                </div>
              ))}
              <button onClick={addCategory} className="admin-btn admin-btn-secondary">Add Category</button>
            </div>

            <button onClick={handleSaveCategoriesSection} disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? 'Saving...' : 'Save Categories Section'}
            </button>
          </div>
        )}

        {/* Collections Section Tab */}
        {activeTab === 'collections' && (
          <div className="admin-section">
            <h2>Trending Collections Section</h2>
            
            <div className="admin-form-group">
              <label>Analytics Title</label>
              <input
                type="text"
                value={analyticsTitle}
                onChange={(e) => setAnalyticsTitle(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Analytics Items</label>
              {analytics.map((analytic, index) => (
                <div key={index} className="admin-card" style={{ marginBottom: '20px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3>Item {index + 1}</h3>
                    <button onClick={() => removeAnalytic(index)} className="admin-btn admin-btn-danger">Remove</button>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={analytic.name}
                        onChange={(e) => updateAnalytic(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={analytic.percentage}
                        onChange={(e) => updateAnalytic(index, 'percentage', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addAnalytic} 
                className="admin-btn admin-btn-secondary"
                disabled={analytics.length >= 4}
                style={{ 
                  opacity: analytics.length >= 4 ? 0.5 : 1,
                  cursor: analytics.length >= 4 ? 'not-allowed' : 'pointer'
                }}
              >
                {analytics.length >= 4 ? 'Maximum 4 Items Reached' : 'Add Analytic'}
              </button>
              {analytics.length >= 4 && (
                <p style={{ 
                  marginTop: '8px', 
                  color: 'var(--admin-text-light)', 
                  fontSize: '13px',
                  fontStyle: 'italic'
                }}>
                  Maximum of 4 analytics items allowed
                </p>
              )}
            </div>

            <button onClick={handleSaveCollectionsSection} disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? 'Saving...' : 'Save Collections Section'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrendingPageManagement;

