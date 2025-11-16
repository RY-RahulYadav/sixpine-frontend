import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface FAQPageContent {
  id: number;
  section_key: string;
  section_name: string;
  content: any;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

interface FAQCategory {
  name: string;
  icon: string;
  count: number;
}

interface FAQItem {
  id: number;
  category: string;
  q: string;
  a: string;
}

interface FAQContent {
  header: {
    title: string;
    subtitle: string;
    lastUpdated: string;
  };
  categories: FAQCategory[];
  faqItems: FAQItem[];
}

const AdminFAQPageManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<FAQPageContent | null>(null);

  // Default FAQ content
  const defaultFAQContent: FAQContent = {
    header: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions about our furniture, ordering process, shipping, and more.',
      lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    },
    categories: [
      { name: 'Orders', icon: '📦', count: 5 },
      { name: 'Shipping', icon: '🚚', count: 4 },
      { name: 'Payments', icon: '💳', count: 3 },
    ],
    faqItems: [
      {
        id: 1,
        category: 'Orders',
        q: 'How do I place an order?',
        a: 'Browse products, add items to your cart, and proceed to checkout. During checkout you can review your order, enter shipping details and complete payment using the available payment options. You will receive a confirmation email once your order is placed successfully.'
      },
      {
        id: 2,
        category: 'Shipping',
        q: 'What are the shipping options and delivery times?',
        a: 'Shipping options vary by seller and product. At checkout you will see available shipping methods along with estimated delivery windows. Expedited shipping is available for many items. Standard delivery typically takes 5-7 business days, while express delivery is 2-3 business days.'
      },
      {
        id: 3,
        category: 'Returns',
        q: 'How do I return or exchange an item?',
        a: 'To return or exchange an item, go to Your Orders, select the order, and choose the return or exchange option. Follow the instructions and include any requested photos or details. If you need help, contact customer support. Returns are accepted within 30 days of delivery for most items.'
      },
      {
        id: 4,
        category: 'Orders',
        q: 'How can I track my order?',
        a: 'After your order ships you will receive a confirmation with tracking information. You can also check order status and tracking from Your Orders in your account. Real-time tracking updates are available 24/7 through our website and mobile app.'
      },
      {
        id: 5,
        category: 'Orders',
        q: 'How do I update my account information?',
        a: 'Go to Your Account to update your name, address, phone number, and payment methods. Keep your information current to avoid delivery issues. You can also manage your email preferences and communication settings from the account page.'
      },
      {
        id: 6,
        category: 'Payments',
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), UPI payments, net banking, and digital wallets. All transactions are secured with industry-standard encryption to protect your financial information.'
      },
      {
        id: 7,
        category: 'Shipping',
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free shipping on orders above ₹999. For orders below this amount, standard shipping charges apply based on your location and the weight of your items. Premium members enjoy free shipping on all orders.'
      },
      {
        id: 8,
        category: 'Returns',
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy on most items. Products must be in original condition with tags attached. Some items like personalized furniture or clearance items may not be eligible for returns. Please check the product page for specific return eligibility.'
      },
      {
        id: 9,
        category: 'Payments',
        q: 'Is it safe to use my credit card on your website?',
        a: 'Absolutely! We use SSL encryption and PCI DSS compliant payment gateways to ensure your payment information is completely secure. We never store your complete card details on our servers.'
      },
      {
        id: 10,
        category: 'Shipping',
        q: 'Can I change my delivery address after placing an order?',
        a: 'Yes, you can change your delivery address before the order is shipped. Please contact our customer support immediately with your order number and the new address. Once the order is dispatched, address changes may not be possible.'
      }
    ]
  };

  const [faqContent, setFAQContent] = useState<FAQContent>(defaultFAQContent);

  useEffect(() => {
    fetchFAQContent();
  }, []);

  const fetchFAQContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getFAQPageContent({ section_key: 'main' });
      const sectionsData = response.data.results || response.data || [];
      
      if (Array.isArray(sectionsData) && sectionsData.length > 0) {
        const mainSection = sectionsData.find((s: FAQPageContent) => s.section_key === 'main');
        if (mainSection && mainSection.content) {
          setEditingSection(mainSection);
          setFAQContent(mainSection.content);
        } else {
          setEditingSection(null);
          setFAQContent(defaultFAQContent);
        }
      } else if (sectionsData && sectionsData.content) {
        setEditingSection(sectionsData);
        setFAQContent(sectionsData.content);
      } else {
        setEditingSection(null);
        setFAQContent(defaultFAQContent);
      }
    } catch (err: any) {
      console.error('Error fetching FAQ content:', err);
      setError(err.response?.data?.error || 'Failed to load FAQ content');
      setFAQContent(defaultFAQContent);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const contentData = {
        section_key: 'main',
        section_name: 'FAQ Page Main Content',
        content: faqContent,
        is_active: true,
        order: 1
      };

      if (editingSection) {
        await adminAPI.patchFAQPageContent(editingSection.id, contentData);
        showToast('FAQ page updated successfully', 'success');
      } else {
        await adminAPI.createFAQPageContent(contentData);
        showToast('FAQ page created successfully', 'success');
      }
      
      await fetchFAQContent();
    } catch (err: any) {
      console.error('Error saving FAQ content:', err);
      showToast(err.response?.data?.error || 'Failed to save FAQ content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    const newCategory: FAQCategory = {
      name: '',
      icon: '📋',
      count: 0
    };
    setFAQContent({
      ...faqContent,
      categories: [...faqContent.categories, newCategory]
    });
  };

  const updateCategory = (index: number, field: keyof FAQCategory, value: string | number) => {
    const updatedCategories = [...faqContent.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    // Update count based on FAQ items
    if (field === 'name') {
      updatedCategories[index].count = faqContent.faqItems.filter(
        item => item.category === value
      ).length;
    }
    setFAQContent({ ...faqContent, categories: updatedCategories });
  };

  const removeCategory = (index: number) => {
    const categoryName = faqContent.categories[index].name;
    const updatedCategories = faqContent.categories.filter((_, i) => i !== index);
    // Remove FAQ items in this category
    const updatedFAQItems = faqContent.faqItems.filter(item => item.category !== categoryName);
    setFAQContent({
      ...faqContent,
      categories: updatedCategories,
      faqItems: updatedFAQItems
    });
  };

  const addFAQItem = () => {
    const newFAQItem: FAQItem = {
      id: Math.max(...faqContent.faqItems.map(item => item.id), 0) + 1,
      category: faqContent.categories[0]?.name || 'Orders',
      q: '',
      a: ''
    };
    setFAQContent({
      ...faqContent,
      faqItems: [...faqContent.faqItems, newFAQItem]
    });
    // Update category count
    const categoryIndex = faqContent.categories.findIndex(c => c.name === newFAQItem.category);
    if (categoryIndex !== -1) {
      updateCategory(categoryIndex, 'count', faqContent.categories[categoryIndex].count + 1);
    }
  };

  const updateFAQItem = (id: number, field: keyof FAQItem, value: string) => {
    const updatedFAQItems = faqContent.faqItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Update category count if category changed
        if (field === 'category' && item.category !== value) {
          const oldCategoryIndex = faqContent.categories.findIndex(c => c.name === item.category);
          const newCategoryIndex = faqContent.categories.findIndex(c => c.name === value);
          if (oldCategoryIndex !== -1) {
            updateCategory(oldCategoryIndex, 'count', faqContent.categories[oldCategoryIndex].count - 1);
          }
          if (newCategoryIndex !== -1) {
            updateCategory(newCategoryIndex, 'count', faqContent.categories[newCategoryIndex].count + 1);
          }
        }
        return updatedItem;
      }
      return item;
    });
    setFAQContent({ ...faqContent, faqItems: updatedFAQItems });
  };

  const removeFAQItem = (id: number) => {
    const item = faqContent.faqItems.find(f => f.id === id);
    if (item) {
      const categoryIndex = faqContent.categories.findIndex(c => c.name === item.category);
      if (categoryIndex !== -1) {
        updateCategory(categoryIndex, 'count', faqContent.categories[categoryIndex].count - 1);
      }
    }
    setFAQContent({
      ...faqContent,
      faqItems: faqContent.faqItems.filter(item => item.id !== id)
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading FAQ content...</p>
      </div>
    );
  }

  if (error && !faqContent) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon">
          <span className="material-symbols-outlined">error</span>
        </div>
        <h3 className="admin-empty-title">{error}</h3>
        <button onClick={fetchFAQContent} className="admin-modern-btn primary">
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
            <span className="material-symbols-outlined">help</span>
            FAQ Page Management
          </h1>
          <p className="admin-page-subtitle">
            Customize the FAQ page content including header, categories, and FAQ items.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-modern-btn primary"
        >
          <span className="material-symbols-outlined">{saving ? 'hourglass_empty' : 'save'}</span>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-content-grid">
        {/* Header Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <span className="material-symbols-outlined">title</span>
              Page Header
            </h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-group">
              <label>Page Title</label>
              <input
                type="text"
                value={faqContent.header.title}
                onChange={(e) => setFAQContent({
                  ...faqContent,
                  header: { ...faqContent.header, title: e.target.value }
                })}
                className="admin-input"
                placeholder="Frequently Asked Questions"
              />
            </div>
            <div className="admin-form-group">
              <label>Subtitle</label>
              <textarea
                value={faqContent.header.subtitle}
                onChange={(e) => setFAQContent({
                  ...faqContent,
                  header: { ...faqContent.header, subtitle: e.target.value }
                })}
                className="admin-input"
                rows={3}
                placeholder="Find answers to common questions..."
              />
            </div>
            <div className="admin-form-group">
              <label>Last Updated Date</label>
              <input
                type="text"
                value={faqContent.header.lastUpdated}
                onChange={(e) => setFAQContent({
                  ...faqContent,
                  header: { ...faqContent.header, lastUpdated: e.target.value }
                })}
                className="admin-input"
                placeholder="October 13, 2025"
              />
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <span className="material-symbols-outlined">category</span>
              FAQ Categories
            </h2>
            <button
              onClick={addCategory}
              className="admin-modern-btn secondary small"
            >
              <span className="material-symbols-outlined">add</span>
              Add Category
            </button>
          </div>
          <div className="admin-card-body">
            {faqContent.categories.map((category, index) => (
              <div key={index} className="admin-form-row" style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="admin-form-group" style={{ flex: '0 0 80px' }}>
                  <label>Icon</label>
                  <input
                    type="text"
                    value={category.icon}
                    onChange={(e) => updateCategory(index, 'icon', e.target.value)}
                    className="admin-input"
                    placeholder="📦"
                    maxLength={2}
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>Category Name</label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(index, 'name', e.target.value)}
                    className="admin-input"
                    placeholder="Orders"
                  />
                </div>
                <div className="admin-form-group" style={{ flex: '0 0 100px' }}>
                  <label>Count</label>
                  <input
                    type="number"
                    value={category.count}
                    readOnly
                    className="admin-input"
                  />
                </div>
                <button
                  onClick={() => removeCategory(index)}
                  className="admin-modern-btn danger small"
                  style={{ marginTop: '24px' }}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Items Section */}
        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <span className="material-symbols-outlined">quiz</span>
              FAQ Items
            </h2>
            <button
              onClick={addFAQItem}
              className="admin-modern-btn secondary small"
            >
              <span className="material-symbols-outlined">add</span>
              Add FAQ Item
            </button>
          </div>
          <div className="admin-card-body">
            {faqContent.faqItems.map((item) => (
              <div key={item.id} className="admin-form-section" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div className="admin-form-row" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label>Category</label>
                    <select
                      value={item.category}
                      onChange={(e) => updateFAQItem(item.id, 'category', e.target.value)}
                      className="admin-input"
                    >
                      {faqContent.categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => removeFAQItem(item.id)}
                    className="admin-modern-btn danger small"
                    style={{ marginTop: '24px' }}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                <div className="admin-form-group">
                  <label>Question</label>
                  <input
                    type="text"
                    value={item.q}
                    onChange={(e) => updateFAQItem(item.id, 'q', e.target.value)}
                    className="admin-input"
                    placeholder="How do I place an order?"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Answer</label>
                  <textarea
                    value={item.a}
                    onChange={(e) => updateFAQItem(item.id, 'a', e.target.value)}
                    className="admin-input"
                    rows={4}
                    placeholder="Browse products, add items to your cart..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFAQPageManagement;

