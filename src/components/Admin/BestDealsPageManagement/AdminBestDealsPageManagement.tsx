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
  }, []);

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

  const addDailyDeal = () => {
    const newDeal: DailyDeal = {
      id: dailyDeals.length + 1,
      name: 'New Deal',
      image: '/images/Home/livingroom.jpg',
      originalPrice: '₹0',
      salePrice: '₹0',
      discount: '0%',
      rating: 4.0,
      reviewCount: 0,
      soldCount: 0,
      navigateUrl: '#'
    };
    setDailyDeals([...dailyDeals, newDeal]);
  };

  const removeDailyDeal = (index: number) => {
    setDailyDeals(dailyDeals.filter((_, i) => i !== index));
  };

  const updateDailyDeal = (index: number, field: keyof DailyDeal, value: any) => {
    const updated = [...dailyDeals];
    updated[index] = { ...updated[index], [field]: value };
    setDailyDeals(updated);
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
              {dailyDeals.map((deal, index) => (
                <div key={index} className="admin-card" style={{ marginBottom: '20px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3>Deal {index + 1}</h3>
                    <button onClick={() => removeDailyDeal(index)} className="admin-btn admin-btn-danger">Remove</button>
                  </div>
                  <div className="admin-form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={deal.name}
                      onChange={(e) => updateDailyDeal(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Original Price</label>
                      <input
                        type="text"
                        value={deal.originalPrice}
                        onChange={(e) => updateDailyDeal(index, 'originalPrice', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Sale Price</label>
                      <input
                        type="text"
                        value={deal.salePrice}
                        onChange={(e) => updateDailyDeal(index, 'salePrice', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Discount</label>
                      <input
                        type="text"
                        value={deal.discount}
                        onChange={(e) => updateDailyDeal(index, 'discount', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        value={deal.rating}
                        onChange={(e) => updateDailyDeal(index, 'rating', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Review Count</label>
                      <input
                        type="number"
                        value={deal.reviewCount}
                        onChange={(e) => updateDailyDeal(index, 'reviewCount', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Sold Count</label>
                      <input
                        type="number"
                        value={deal.soldCount}
                        onChange={(e) => updateDailyDeal(index, 'soldCount', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Image URL</label>
                    <input
                      type="text"
                      value={deal.image}
                      onChange={(e) => updateDailyDeal(index, 'image', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Navigation URL</label>
                    <input
                      type="text"
                      value={deal.navigateUrl || ''}
                      onChange={(e) => updateDailyDeal(index, 'navigateUrl', e.target.value)}
                      placeholder="/products-details/product-slug or custom URL"
                    />
                    <small style={{ color: 'var(--admin-text-light)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Enter full URL (e.g., /products-details/product-slug) or leave empty for no link
                    </small>
                  </div>
                </div>
              ))}
              <button onClick={addDailyDeal} className="admin-btn admin-btn-secondary">Add Deal</button>
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

