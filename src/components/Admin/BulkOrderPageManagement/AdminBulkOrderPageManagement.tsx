import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface BulkOrderPageContent {
  id: number;
  section_key: string;
  section_name: string;
  content: any;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

interface HeroContent {
  brandBadge: string;
  eyebrow: string;
  headline: string;
  highlightText: string;
  subheadline: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  heroImage: string;
  floatingCard: {
    icon: string;
    title: string;
    subtitle: string;
  };
}

interface CategoryItem {
  id: number;
  title: string;
  description: string;
  image: string;
  items: string[];
}

interface ProcessStep {
  id: number;
  number: string;
  title: string;
  description: string;
}

interface Benefit {
  id: number;
  title: string;
  description: string;
}

interface Testimonial {
  id: number;
  quote: string;
  authorName: string;
  authorPosition: string;
  authorInitials: string;
}

const AdminBulkOrderPageManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [sections, setSections] = useState<BulkOrderPageContent[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  // Default Hero Section
  const defaultHeroContent: HeroContent = {
    brandBadge: 'Sixpine',
    eyebrow: 'BULK PURCHASING PROGRAM',
    headline: 'Furnish Your Business with',
    highlightText: 'Premium Quality',
    subheadline: 'Special pricing, dedicated support, and customized solutions for corporate, hospitality, and large-scale residential projects. Transform your space with Sixpine\'s bulk furniture solutions.',
    stats: [
      { value: '50%', label: 'Average Savings' },
      { value: '500+', label: 'Projects Completed' },
      { value: '24/7', label: 'Support Available' }
    ],
    primaryButtonText: 'Get a Quote',
    primaryButtonLink: '#quote-form',
    secondaryButtonText: 'Contact Sales Team',
    secondaryButtonLink: '/contact',
    heroImage: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
    floatingCard: {
      icon: '✓',
      title: 'Premium Quality',
      subtitle: 'Guaranteed'
    }
  };

  // Default Categories
  const defaultCategories: CategoryItem[] = [
    {
      id: 1,
      title: 'Corporate Offices',
      description: 'Complete office furniture solutions for modern workspaces',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Desks & Workstations', 'Conference Tables', 'Office Chairs', 'Storage Solutions']
    },
    {
      id: 2,
      title: 'Hospitality',
      description: 'Elegant furniture for hotels, restaurants, and resorts',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Guest Room Furniture', 'Lobby Seating', 'Dining Sets', 'Outdoor Furniture']
    },
    {
      id: 3,
      title: 'Educational Institutions',
      description: 'Durable and functional furniture for schools and universities',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Classroom Furniture', 'Library Shelving', 'Auditorium Seating', 'Lab Tables']
    },
    {
      id: 4,
      title: 'Healthcare Facilities',
      description: 'Specialized furniture for hospitals and clinics',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Waiting Area Seating', 'Medical Cabinets', 'Patient Room Furniture', 'Staff Lounges']
    },
    {
      id: 5,
      title: 'Retail Spaces',
      description: 'Custom displays and fixtures for retail environments',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Display Units', 'Checkout Counters', 'Storage Racks', 'Seating Areas']
    },
    {
      id: 6,
      title: 'Residential Projects',
      description: 'Bulk orders for apartments, condos, and housing complexes',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Living Room Sets', 'Bedroom Furniture', 'Dining Sets', 'Kitchen Cabinets']
    }
  ];

  // Default Process Steps
  const defaultProcessSteps: ProcessStep[] = [
    {
      id: 1,
      number: '01',
      title: 'Submit Your Requirements',
      description: 'Fill out our bulk order form with your specific furniture needs, quantities, and project timeline.'
    },
    {
      id: 2,
      number: '02',
      title: 'Receive Custom Quote',
      description: 'Our team analyzes your requirements and provides a detailed quote with volume discounts within 24-48 hours.'
    },
    {
      id: 3,
      number: '03',
      title: 'Consultation & Customization',
      description: 'Work with our specialists to refine your order, select materials, colors, and finalize specifications.'
    },
    {
      id: 4,
      number: '04',
      title: 'Production & Quality Check',
      description: 'Your furniture is manufactured with premium materials and undergoes rigorous quality inspections.'
    },
    {
      id: 5,
      number: '05',
      title: 'Delivery & Installation',
      description: 'Scheduled delivery to your location with professional installation services included.'
    },
    {
      id: 6,
      number: '06',
      title: 'Ongoing Support',
      description: 'Dedicated account manager provides continued support, warranties, and maintenance services.'
    }
  ];

  // Default Benefits
  const defaultBenefits: Benefit[] = [
    {
      id: 1,
      title: 'Volume Discounts',
      description: 'Special pricing with progressive discounts based on order quantity.'
    },
    {
      id: 2,
      title: 'Quality Guarantee',
      description: 'All bulk orders undergo enhanced quality assurance inspections.'
    },
    {
      id: 3,
      title: 'Flexible Scheduling',
      description: 'Plan deliveries according to your project timeline and needs.'
    }
  ];

  // Default Testimonials
  const defaultTestimonials: Testimonial[] = [
    {
      id: 1,
      quote: 'The bulk order process was seamless, and the dedicated support team was exceptional in handling our corporate office setup requirements.',
      authorName: 'Ankit Bhatia',
      authorPosition: 'Facilities Manager, TechCorp India',
      authorInitials: 'AB'
    },
    {
      id: 2,
      quote: 'We furnished our entire hotel chain with Sixpine furniture. The quality, delivery timeline, and installation service exceeded our expectations.',
      authorName: 'Priya Patel',
      authorPosition: 'Procurement Director, Luxe Hotels',
      authorInitials: 'PP'
    }
  ];

  const [heroContent, setHeroContent] = useState<HeroContent>(defaultHeroContent);
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(defaultProcessSteps);
  const [benefits, setBenefits] = useState<Benefit[]>(defaultBenefits);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [sectionTitle, setSectionTitle] = useState<string>('Industries We Serve');
  const [sectionSubtitle, setSectionSubtitle] = useState<string>('Tailored furniture solutions for every business sector');
  const [processTitle, setProcessTitle] = useState<string>('Our Simple 6-Step Process');
  const [processSubtitle, setProcessSubtitle] = useState<string>('From initial quote to final installation, we make bulk ordering seamless');
  const [benefitsTitle, setBenefitsTitle] = useState<string>('Why Choose Our Bulk Order Service');
  const [benefitsDescription, setBenefitsDescription] = useState<string>('Experience these exclusive advantages when you place bulk orders with Sixpine');
  const [testimonialsTitle, setTestimonialsTitle] = useState<string>('What Our Corporate Clients Say');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBulkOrderPageContent();
      const fetchedSections = Array.isArray(response.data) ? response.data : response.data.results || [];
      setSections(fetchedSections);

      // Load existing content
      fetchedSections.forEach((section: BulkOrderPageContent) => {
        if (section.section_key === 'hero' && section.content) {
          setHeroContent(section.content);
        } else if (section.section_key === 'categories' && section.content) {
          setCategories(section.content.categories || defaultCategories);
          setSectionTitle(section.content.title || 'Industries We Serve');
          setSectionSubtitle(section.content.subtitle || 'Tailored furniture solutions for every business sector');
        } else if (section.section_key === 'process' && section.content) {
          setProcessSteps(section.content.steps || defaultProcessSteps);
          setProcessTitle(section.content.title || 'Our Simple 6-Step Process');
          setProcessSubtitle(section.content.subtitle || 'From initial quote to final installation, we make bulk ordering seamless');
        } else if (section.section_key === 'benefits' && section.content) {
          setBenefits(section.content.benefits || defaultBenefits);
          setTestimonials(section.content.testimonials || defaultTestimonials);
          setBenefitsTitle(section.content.title || 'Why Choose Our Bulk Order Service');
          setBenefitsDescription(section.content.description || 'Experience these exclusive advantages when you place bulk orders with Sixpine');
          setTestimonialsTitle(section.content.testimonialsTitle || 'What Our Corporate Clients Say');
        }
      });

      setError(null);
    } catch (err: any) {
      console.error('Error fetching bulk order page content:', err);
      setError(err.response?.data?.error || 'Failed to load bulk order page content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHero = async () => {
    try {
      setSaving(true);
      const heroData = {
        section_key: 'hero',
        section_name: 'Hero Section',
        content: heroContent,
        is_active: true,
        order: 1
      };

      const existingSection = sections.find((s: BulkOrderPageContent) => s.section_key === 'hero');
      if (existingSection) {
        await adminAPI.patchBulkOrderPageContent(existingSection.id, heroData);
        showToast('Hero section updated successfully', 'success');
      } else {
        await adminAPI.createBulkOrderPageContent(heroData);
        showToast('Hero section created successfully', 'success');
      }

      await fetchSections();
    } catch (err: any) {
      console.error('Error saving hero section:', err);
      showToast(err.response?.data?.error || 'Failed to save hero section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategories = async () => {
    try {
      setSaving(true);
      const categoriesData = {
        section_key: 'categories',
        section_name: 'Categories Section',
        content: {
          title: sectionTitle,
          subtitle: sectionSubtitle,
          categories: categories
        },
        is_active: true,
        order: 2
      };

      const existingSection = sections.find(s => s.section_key === 'categories');
      if (existingSection) {
        await adminAPI.patchBulkOrderPageContent(existingSection.id, categoriesData);
        showToast('Categories section updated successfully', 'success');
      } else {
        await adminAPI.createBulkOrderPageContent(categoriesData);
        showToast('Categories section created successfully', 'success');
      }

      await fetchSections();
    } catch (err: any) {
      console.error('Error saving categories section:', err);
      showToast(err.response?.data?.error || 'Failed to save categories section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProcess = async () => {
    try {
      setSaving(true);
      const processData = {
        section_key: 'process',
        section_name: 'Process Section',
        content: {
          title: processTitle,
          subtitle: processSubtitle,
          steps: processSteps
        },
        is_active: true,
        order: 3
      };

      const existingSection = sections.find(s => s.section_key === 'process');
      if (existingSection) {
        await adminAPI.patchBulkOrderPageContent(existingSection.id, processData);
        showToast('Process section updated successfully', 'success');
      } else {
        await adminAPI.createBulkOrderPageContent(processData);
        showToast('Process section created successfully', 'success');
      }

      await fetchSections();
    } catch (err: any) {
      console.error('Error saving process section:', err);
      showToast(err.response?.data?.error || 'Failed to save process section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBenefits = async () => {
    try {
      setSaving(true);
      const benefitsData = {
        section_key: 'benefits',
        section_name: 'Benefits Section',
        content: {
          title: benefitsTitle,
          description: benefitsDescription,
          testimonialsTitle: testimonialsTitle,
          benefits: benefits,
          testimonials: testimonials
        },
        is_active: true,
        order: 4
      };

      const existingSection = sections.find(s => s.section_key === 'benefits');
      if (existingSection) {
        await adminAPI.patchBulkOrderPageContent(existingSection.id, benefitsData);
        showToast('Benefits section updated successfully', 'success');
      } else {
        await adminAPI.createBulkOrderPageContent(benefitsData);
        showToast('Benefits section created successfully', 'success');
      }

      await fetchSections();
    } catch (err: any) {
      console.error('Error saving benefits section:', err);
      showToast(err.response?.data?.error || 'Failed to save benefits section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    setCategories([...categories, {
      id: categories.length + 1,
      title: '',
      description: '',
      image: '',
      items: []
    }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const addCategoryItem = (categoryIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].items = [...updated[categoryIndex].items, ''];
    setCategories(updated);
  };

  const removeCategoryItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].items = updated[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setCategories(updated);
  };

  const updateCategoryItem = (categoryIndex: number, itemIndex: number, value: string) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex] = value;
    setCategories(updated);
  };

  const addProcessStep = () => {
    setProcessSteps([...processSteps, {
      id: processSteps.length + 1,
      number: String(processSteps.length + 1).padStart(2, '0'),
      title: '',
      description: ''
    }]);
  };

  const removeProcessStep = (index: number) => {
    setProcessSteps(processSteps.filter((_, i) => i !== index));
  };

  const updateProcessStep = (index: number, field: string, value: string) => {
    const updated = [...processSteps];
    updated[index] = { ...updated[index], [field]: value };
    setProcessSteps(updated);
  };

  const addBenefit = () => {
    setBenefits([...benefits, {
      id: benefits.length + 1,
      title: '',
      description: ''
    }]);
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index: number, field: string, value: string) => {
    const updated = [...benefits];
    updated[index] = { ...updated[index], [field]: value };
    setBenefits(updated);
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, {
      id: testimonials.length + 1,
      quote: '',
      authorName: '',
      authorPosition: '',
      authorInitials: ''
    }]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  const updateTestimonial = (index: number, field: string, value: string) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  if (loading) {
    return <div className="admin-container"><p>Loading...</p></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Bulk Order Page Management</h1>
        <p>Customize the bulk order page content sections</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'hero' ? 'active' : ''}
          onClick={() => setActiveTab('hero')}
        >
          Hero Section
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={activeTab === 'process' ? 'active' : ''}
          onClick={() => setActiveTab('process')}
        >
          Process Steps
        </button>
        <button
          className={activeTab === 'benefits' ? 'active' : ''}
          onClick={() => setActiveTab('benefits')}
        >
          Benefits & Testimonials
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'hero' && (
          <div className="admin-section">
            <h2>Hero Section</h2>
            <div className="form-group">
              <label>Brand Badge</label>
              <input
                type="text"
                value={heroContent.brandBadge}
                onChange={(e) => setHeroContent({ ...heroContent, brandBadge: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Eyebrow Text</label>
              <input
                type="text"
                value={heroContent.eyebrow}
                onChange={(e) => setHeroContent({ ...heroContent, eyebrow: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Headline</label>
              <input
                type="text"
                value={heroContent.headline}
                onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Highlight Text</label>
              <input
                type="text"
                value={heroContent.highlightText}
                onChange={(e) => setHeroContent({ ...heroContent, highlightText: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Subheadline</label>
              <textarea
                value={heroContent.subheadline}
                onChange={(e) => setHeroContent({ ...heroContent, subheadline: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Hero Image URL</label>
              <input
                type="text"
                value={heroContent.heroImage}
                onChange={(e) => setHeroContent({ ...heroContent, heroImage: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Primary Button Text</label>
              <input
                type="text"
                value={heroContent.primaryButtonText}
                onChange={(e) => setHeroContent({ ...heroContent, primaryButtonText: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Primary Button Link</label>
              <input
                type="text"
                value={heroContent.primaryButtonLink}
                onChange={(e) => setHeroContent({ ...heroContent, primaryButtonLink: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Secondary Button Text</label>
              <input
                type="text"
                value={heroContent.secondaryButtonText}
                onChange={(e) => setHeroContent({ ...heroContent, secondaryButtonText: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Secondary Button Link</label>
              <input
                type="text"
                value={heroContent.secondaryButtonLink}
                onChange={(e) => setHeroContent({ ...heroContent, secondaryButtonLink: e.target.value })}
              />
            </div>
            <h3>Stats</h3>
            {heroContent.stats.map((stat, index) => (
              <div key={index} className="form-group">
                <label>Stat {index + 1}</label>
                <input
                  type="text"
                  placeholder="Value"
                  value={stat.value}
                  onChange={(e) => {
                    const updated = [...heroContent.stats];
                    updated[index] = { ...updated[index], value: e.target.value };
                    setHeroContent({ ...heroContent, stats: updated });
                  }}
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={stat.label}
                  onChange={(e) => {
                    const updated = [...heroContent.stats];
                    updated[index] = { ...updated[index], label: e.target.value };
                    setHeroContent({ ...heroContent, stats: updated });
                  }}
                />
              </div>
            ))}
            <h3>Floating Card</h3>
            <div className="form-group">
              <label>Card Icon</label>
              <input
                type="text"
                value={heroContent.floatingCard.icon}
                onChange={(e) => setHeroContent({
                  ...heroContent,
                  floatingCard: { ...heroContent.floatingCard, icon: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>Card Title</label>
              <input
                type="text"
                value={heroContent.floatingCard.title}
                onChange={(e) => setHeroContent({
                  ...heroContent,
                  floatingCard: { ...heroContent.floatingCard, title: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>Card Subtitle</label>
              <input
                type="text"
                value={heroContent.floatingCard.subtitle}
                onChange={(e) => setHeroContent({
                  ...heroContent,
                  floatingCard: { ...heroContent.floatingCard, subtitle: e.target.value }
                })}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSaveHero}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Hero Section'}
            </button>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="admin-section">
            <h2>Categories Section</h2>
            <div className="form-group">
              <label>Section Title</label>
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Section Subtitle</label>
              <input
                type="text"
                value={sectionSubtitle}
                onChange={(e) => setSectionSubtitle(e.target.value)}
              />
            </div>
            <h3>Categories</h3>
            {categories.map((category, index) => (
              <div key={index} className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4>Category {index + 1}</h4>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeCategory(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={category.title}
                    onChange={(e) => updateCategory(index, 'title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={category.description}
                    onChange={(e) => updateCategory(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    value={category.image}
                    onChange={(e) => updateCategory(index, 'image', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Items</label>
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateCategoryItem(index, itemIndex, e.target.value)}
                      />
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeCategoryItem(index, itemIndex)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => addCategoryItem(index)}
                  >
                    Add Item
                  </button>
                </div>
              </div>
            ))}
            <button
              className="btn btn-secondary"
              onClick={addCategory}
            >
              Add Category
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveCategories}
              disabled={saving}
              style={{ marginLeft: '10px' }}
            >
              {saving ? 'Saving...' : 'Save Categories Section'}
            </button>
          </div>
        )}

        {activeTab === 'process' && (
          <div className="admin-section">
            <h2>Process Steps Section</h2>
            <div className="form-group">
              <label>Section Title</label>
              <input
                type="text"
                value={processTitle}
                onChange={(e) => setProcessTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Section Subtitle</label>
              <input
                type="text"
                value={processSubtitle}
                onChange={(e) => setProcessSubtitle(e.target.value)}
              />
            </div>
            <h3>Process Steps</h3>
            {processSteps.map((step, index) => (
              <div key={index} className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4>Step {index + 1}</h4>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeProcessStep(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Step Number</label>
                  <input
                    type="text"
                    value={step.number}
                    onChange={(e) => updateProcessStep(index, 'number', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <button
              className="btn btn-secondary"
              onClick={addProcessStep}
            >
              Add Step
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveProcess}
              disabled={saving}
              style={{ marginLeft: '10px' }}
            >
              {saving ? 'Saving...' : 'Save Process Section'}
            </button>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="admin-section">
            <h2>Benefits & Testimonials Section</h2>
            <div className="form-group">
              <label>Benefits Title</label>
              <input
                type="text"
                value={benefitsTitle}
                onChange={(e) => setBenefitsTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Benefits Description</label>
              <textarea
                value={benefitsDescription}
                onChange={(e) => setBenefitsDescription(e.target.value)}
                rows={2}
              />
            </div>
            <h3>Benefits</h3>
            {benefits.map((benefit, index) => (
              <div key={index} className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4>Benefit {index + 1}</h4>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeBenefit(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={benefit.title}
                    onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={benefit.description}
                    onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <button
              className="btn btn-secondary"
              onClick={addBenefit}
            >
              Add Benefit
            </button>
            <h3 style={{ marginTop: '30px' }}>Testimonials</h3>
            <div className="form-group">
              <label>Testimonials Title</label>
              <input
                type="text"
                value={testimonialsTitle}
                onChange={(e) => setTestimonialsTitle(e.target.value)}
              />
            </div>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4>Testimonial {index + 1}</h4>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeTestimonial(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Quote</label>
                  <textarea
                    value={testimonial.quote}
                    onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Author Name</label>
                  <input
                    type="text"
                    value={testimonial.authorName}
                    onChange={(e) => updateTestimonial(index, 'authorName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Author Position</label>
                  <input
                    type="text"
                    value={testimonial.authorPosition}
                    onChange={(e) => updateTestimonial(index, 'authorPosition', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Author Initials</label>
                  <input
                    type="text"
                    value={testimonial.authorInitials}
                    onChange={(e) => updateTestimonial(index, 'authorInitials', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button
              className="btn btn-secondary"
              onClick={addTestimonial}
            >
              Add Testimonial
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveBenefits}
              disabled={saving}
              style={{ marginLeft: '10px' }}
            >
              {saving ? 'Saving...' : 'Save Benefits Section'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBulkOrderPageManagement;

