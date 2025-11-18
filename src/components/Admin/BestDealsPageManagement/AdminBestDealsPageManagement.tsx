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

interface DealsBanner {
  id: number;
  label: string;
  heading: string;
  accentText: string;
  description: string;
  promoCode: string;
  image: string;
  buttonText: string;
  navigateUrl?: string;
}

interface DailyDeal {
  id: number;
  name: string;
  image: string;
  originalPrice: string;
  salePrice: string;
  discount: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  navigateUrl?: string;
  productId?: number;
  description?: string;
  variantCount?: number;
}

const AdminBestDealsPageManagement: React.FC = () => {
  const [, setSections] = useState<HomePageContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('banner');
  const [saving, setSaving] = useState<boolean>(false);

  // Deals Banner Section
  const [banners, setBanners] = useState<DealsBanner[]>([]);
  const [editingBannerSection, setEditingBannerSection] = useState<HomePageContent | null>(null);

  // Daily Deals Section
  const [dailyDeals, setDailyDeals] = useState<DailyDeal[]>([]);
  const [dailyDealsSectionTitle, setDailyDealsSectionTitle] = useState('Deals of the Day');
  const [editingDailyDealsSection, setEditingDailyDealsSection] = useState<HomePageContent | null>(null);
  
  // Product selection
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // Default values
  const defaultBanners: DealsBanner[] = [
    {
      id: 1,
      label: 'EXCLUSIVE OFFER',
      heading: 'Get 20% EXTRA OFF on your first purchase',
      accentText: '20% EXTRA OFF',
      description: 'Use code SIXPINE20 at checkout',
      promoCode: 'SIXPINE20',
      image: '/images/Home/livingroom.jpg',
      buttonText: 'SHOP NOW',
      navigateUrl: '#'
    },
    {
      id: 2,
      label: 'MEGA SALE',
      heading: 'Up to 50% OFF on Furniture',
      accentText: '50% OFF',
      description: 'Limited time offer on selected items',
      promoCode: 'MEGA50',
      image: '/images/Home/studytable.jpg',
      buttonText: 'GRAB DEALS',
      navigateUrl: '#'
    },
    {
      id: 3,
      label: 'SPECIAL DEAL',
      heading: 'Buy 2 Get 1 FREE on Home Decor',
      accentText: 'Buy 2 Get 1 FREE',
      description: 'Use code B2G1FREE at checkout',
      promoCode: 'B2G1FREE',
      image: '/images/Home/furnishing.jpg',
      buttonText: 'EXPLORE NOW',
      navigateUrl: '#'
    }
  ];

  const defaultDailyDeals: DailyDeal[] = [
    {
      id: 1,
      name: 'Modern Coffee Table',
      image: '/images/Home/livingroom.jpg',
      originalPrice: '₹7,999',
      salePrice: '₹3,999',
      discount: '50%',
      rating: 4.6,
      reviewCount: 384,
      soldCount: 245,
      navigateUrl: '#'
    },
    {
      id: 2,
      name: 'Ergonomic Office Chair',
      image: '/images/Home/studytable.jpg',
      originalPrice: '₹12,999',
      salePrice: '₹6,499',
      discount: '50%',
      rating: 4.8,
      reviewCount: 529,
      soldCount: 317,
      navigateUrl: '#'
    },
    {
      id: 3,
      name: 'Wooden Bookshelf',
      image: '/images/Home/furnishing.jpg',
      originalPrice: '₹9,999',
      salePrice: '₹5,999',
      discount: '40%',
      rating: 4.7,
      reviewCount: 236,
      soldCount: 183,
      navigateUrl: '#'
    },
    {
      id: 4,
      name: 'Modern Floor Lamp',
      image: '/images/Home/studytable.jpg',
      originalPrice: '₹4,999',
      salePrice: '₹2,499',
      discount: '50%',
      rating: 4.5,
      reviewCount: 153,
      soldCount: 97,
      navigateUrl: '#'
    }
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
      setError(null);
      const response = await adminAPI.getHomepageContent();
      const sectionsData = response.data.results || response.data || [];
      setSections(sectionsData);

      // Load deals banner section
      const bannerSection = sectionsData.find((s: HomePageContent) => s.section_key === 'best-deals-banner');
      if (bannerSection && bannerSection.content) {
        setEditingBannerSection(bannerSection);
        setBanners(bannerSection.content.banners || defaultBanners);
      } else {
        setBanners(defaultBanners);
      }

      // Load daily deals section
      const dailyDealsSection = sectionsData.find((s: HomePageContent) => s.section_key === 'best-deals-daily');
      if (dailyDealsSection && dailyDealsSection.content) {
        setEditingDailyDealsSection(dailyDealsSection);
        setDailyDeals(dailyDealsSection.content.products || defaultDailyDeals);
        setDailyDealsSectionTitle(dailyDealsSection.content.sectionTitle || 'Deals of the Day');
      } else {
        setDailyDeals(defaultDailyDeals);
      }
    } catch (err: any) {
      console.error('Error fetching best deals page content:', err);
      setError(err.response?.data?.error || 'Failed to load best deals page content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBannerSection = async () => {
    try {
      setSaving(true);
      const bannerData = {
        section_key: 'best-deals-banner',
        section_name: 'Best Deals Banner Section',
        content: {
          banners: banners
        },
        is_active: true,
        order: 1
      };

      console.log('Saving banner data:', bannerData);

      let response;
      if (editingBannerSection) {
        response = await adminAPI.patchHomepageContent(editingBannerSection.id, bannerData);
        console.log('Banner section updated, response:', response.data);
        showToast('Deals banner section updated successfully', 'success');
      } else {
        response = await adminAPI.createHomepageContent(bannerData);
        console.log('Banner section created, response:', response.data);
        showToast('Deals banner section created successfully', 'success');
      }
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving deals banner section:', err);
      console.error('Error details:', err.response?.data);
      showToast(err.response?.data?.error || 'Failed to save deals banner section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDailyDealsSection = async () => {
    try {
      setSaving(true);
      const dailyDealsData = {
        section_key: 'best-deals-daily',
        section_name: 'Daily Deals Section',
        content: {
          sectionTitle: dailyDealsSectionTitle,
          products: dailyDeals
        },
        is_active: true,
        order: 2
      };

      console.log('Saving daily deals data:', dailyDealsData);

      let response;
      if (editingDailyDealsSection) {
        response = await adminAPI.patchHomepageContent(editingDailyDealsSection.id, dailyDealsData);
        console.log('Daily deals section updated, response:', response.data);
        showToast('Daily deals section updated successfully', 'success');
      } else {
        response = await adminAPI.createHomepageContent(dailyDealsData);
        console.log('Daily deals section created, response:', response.data);
        showToast('Daily deals section created successfully', 'success');
      }
      await fetchSections();
    } catch (err: any) {
      console.error('Error saving daily deals section:', err);
      console.error('Error details:', err.response?.data);
      showToast(err.response?.data?.error || 'Failed to save daily deals section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addBanner = () => {
    const newBanner: DealsBanner = {
      id: banners.length + 1,
      label: 'NEW OFFER',
      heading: 'Enter your heading here',
      accentText: 'ACCENT TEXT',
      description: 'Enter description here',
      promoCode: 'CODE',
      image: '/images/Home/livingroom.jpg',
      buttonText: 'SHOP NOW',
      navigateUrl: '#'
    };
    setBanners([...banners, newBanner]);
  };

  const removeBanner = (index: number) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const updateBanner = (index: number, field: keyof DealsBanner, value: any) => {
    const updated = [...banners];
    updated[index] = { ...updated[index], [field]: value };
    setBanners(updated);
  };

  const handleAddProductToDeals = async (productId: number) => {
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
      
      const newDeal: DailyDeal = {
        id: dailyDeals.length + 1,
        name: product.title || 'Product Title',
        image: productImage || '/images/Home/livingroom.jpg',
        originalPrice: originalPrice > currentPrice ? `₹${Math.round(originalPrice).toLocaleString('en-IN')}` : `₹${Math.round(currentPrice).toLocaleString('en-IN')}`,
        salePrice: `₹${Math.round(currentPrice).toLocaleString('en-IN')}`,
        discount: discountPercent > 0 ? `${discountPercent}%` : '0%',
        rating: averageRating || 4.0,
        reviewCount: reviewCount,
        soldCount: 0, // Default sold count
        navigateUrl: navigateUrl,
        productId: product.id,
        description: product.short_description || '',
        variantCount: variantCount
      };
      
      setDailyDeals([...dailyDeals, newDeal]);
      showToast('Product added successfully', 'success');
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to load product details', 'error');
    }
  };

  const removeDailyDeal = (index: number) => {
    setDailyDeals(dailyDeals.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">Loading best deals page content...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Best Deals Page Management</h1>
        <p>Customize all sections of the best deals page</p>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'banner' ? 'active' : ''}
          onClick={() => setActiveTab('banner')}
        >
          Banner Section
        </button>
        <button
          className={activeTab === 'daily' ? 'active' : ''}
          onClick={() => setActiveTab('daily')}
        >
          Daily Deals Section
        </button>
      </div>

      <div className="admin-content">
        {/* Banner Section Tab */}
        {activeTab === 'banner' && (
          <div className="admin-section">
            <h2>Deals Banner Section</h2>
            
            <div className="admin-form-group">
              <label>Banners</label>
              {banners.map((banner, index) => (
                <div key={index} className="admin-card" style={{ marginBottom: '20px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3>Banner {index + 1}</h3>
                    <button onClick={() => removeBanner(index)} className="admin-btn admin-btn-danger">Remove</button>
                  </div>
                  <div className="admin-form-group">
                    <label>Label</label>
                    <input
                      type="text"
                      value={banner.label}
                      onChange={(e) => updateBanner(index, 'label', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Heading</label>
                    <input
                      type="text"
                      value={banner.heading}
                      onChange={(e) => updateBanner(index, 'heading', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Accent Text</label>
                    <input
                      type="text"
                      value={banner.accentText}
                      onChange={(e) => updateBanner(index, 'accentText', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={banner.description}
                      onChange={(e) => updateBanner(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Promo Code</label>
                      <input
                        type="text"
                        value={banner.promoCode}
                        onChange={(e) => updateBanner(index, 'promoCode', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={banner.buttonText}
                        onChange={(e) => updateBanner(index, 'buttonText', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Image URL</label>
                    <input
                      type="text"
                      value={banner.image}
                      onChange={(e) => updateBanner(index, 'image', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Navigation URL</label>
                    <input
                      type="text"
                      value={banner.navigateUrl || ''}
                      onChange={(e) => updateBanner(index, 'navigateUrl', e.target.value)}
                      placeholder="/products or custom URL"
                    />
                    <small style={{ color: 'var(--admin-text-light)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Enter full URL or leave empty for no link
                    </small>
                  </div>
                </div>
              ))}
              <button onClick={addBanner} className="admin-btn admin-btn-secondary">Add Banner</button>
            </div>

            <button onClick={handleSaveBannerSection} disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? 'Saving...' : 'Save Banner Section'}
            </button>
          </div>
        )}

        {/* Daily Deals Section Tab */}
        {activeTab === 'daily' && (
          <div className="admin-section">
            <h2>Daily Deals Section</h2>
            
            <div className="admin-form-group">
              <label>Section Title</label>
              <input
                type="text"
                value={dailyDealsSectionTitle}
                onChange={(e) => setDailyDealsSectionTitle(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Deals</label>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Add Product from Product List</label>
                <select
                  className="admin-form-input"
                  value=""
                  onChange={(e) => {
                    const productId = parseInt(e.target.value);
                    if (productId) {
                      handleAddProductToDeals(productId);
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
                    products
                      .filter((p: any) => !dailyDeals.some((deal) => deal.productId === p.id))
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
              {dailyDeals.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontStyle: 'italic', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  No products added. Select products using the dropdown above.
                </div>
              ) : (
                dailyDeals.map((deal, index) => (
                  <div key={index} className="admin-card" style={{ marginBottom: '15px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, marginBottom: '5px' }}>{deal.name}</h4>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        <span style={{ marginRight: '15px' }}>Price: {deal.salePrice}</span>
                        {deal.originalPrice !== deal.salePrice && (
                          <span style={{ marginRight: '15px', textDecoration: 'line-through' }}>{deal.originalPrice}</span>
                        )}
                        <span style={{ marginRight: '15px' }}>Rating: {deal.rating} ⭐</span>
                        <span>Reviews: {deal.reviewCount}</span>
                      </div>
                    </div>
                    <button onClick={() => removeDailyDeal(index)} className="admin-btn admin-btn-danger" style={{ marginLeft: '15px' }}>Remove</button>
                  </div>
                ))
              )}
            </div>

            <button onClick={handleSaveDailyDealsSection} disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? 'Saving...' : 'Save Daily Deals Section'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBestDealsPageManagement;

