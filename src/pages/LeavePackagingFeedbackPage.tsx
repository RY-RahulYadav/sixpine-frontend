import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import '../styles/packagingFeedback.css';
import '../styles/Pages.css';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";
import { packagingFeedbackAPI, homepageAPI } from '../services/api';
import { useApp } from '../context/AppContext';

// Product interface matching the slider component
interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
  id?: number;
  productId?: number;
  slug?: string;
  variantCount?: number;
  variants_count?: number;
  colorCount?: number;
  color_count?: number;
}

const LeavePackagingFeedbackPage: React.FC = () => {
  const { state } = useApp();
  const [showYesInfo, setShowYesInfo] = useState(false);
  const [showNoInfo, setShowNoInfo] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>('general');
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [frequentlyViewedProducts, setFrequentlyViewedProducts] = useState<Product[]>([]);
  const [inspiredProducts, setInspiredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const response = await homepageAPI.getHomepageContent('banner-cards');
      const content = response.data.content || response.data;
      
      // Transform slider1Products (frequently viewed)
      if (content.slider1Products && Array.isArray(content.slider1Products)) {
        const transformedFrequentlyViewed = content.slider1Products.map((product: any) => ({
          img: product.img || product.image || product.main_image || '/images/placeholder.jpg',
          title: product.title || product.name || '',
          desc: product.desc || product.short_description || product.description || '',
          rating: product.rating || product.average_rating || 4.5,
          reviews: product.reviews || product.review_count || 0,
          oldPrice: product.oldPrice || (product.old_price ? `₹${parseInt(String(product.old_price)).toLocaleString()}` : ''),
          newPrice: product.newPrice || product.price || '',
          id: product.id || product.productId,
          productId: product.id || product.productId,
          slug: product.slug || product.productSlug,
          variantCount: product.variant_count || product.variants_count || 0,
          variants_count: product.variant_count || product.variants_count || 0,
          colorCount: product.color_count || product.colorCount || 0,
          color_count: product.color_count || product.colorCount || 0,
        }));
        setFrequentlyViewedProducts(transformedFrequentlyViewed);
      }
      
      // Transform slider2Products (inspired by browsing history)
      if (content.slider2Products && Array.isArray(content.slider2Products)) {
        const transformedInspired = content.slider2Products.map((product: any) => ({
          img: product.img || product.image || product.main_image || '/images/placeholder.jpg',
          title: product.title || product.name || '',
          desc: product.desc || product.short_description || product.description || '',
          rating: product.rating || product.average_rating || 4.5,
          reviews: product.reviews || product.review_count || 0,
          oldPrice: product.oldPrice || (product.old_price ? `₹${parseInt(String(product.old_price)).toLocaleString()}` : ''),
          newPrice: product.newPrice || product.price || '',
          id: product.id || product.productId,
          productId: product.id || product.productId,
          slug: product.slug || product.productSlug,
          variantCount: product.variant_count || product.variants_count || 0,
          variants_count: product.variant_count || product.variants_count || 0,
          colorCount: product.color_count || product.colorCount || 0,
          color_count: product.color_count || product.colorCount || 0,
        }));
        setInspiredProducts(transformedInspired);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setFrequentlyViewedProducts([]);
      setInspiredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="homepage_container packaging-feedback-page">
        {/* Main Content */}
        <div className="lpf-content">
          <h1 className="lpf-title">Enter Your Packaging Feedback</h1>
          <p className="lpf-subtitle">About packaging and packaging programs for Sixpine.</p>

          {/* Sustainable Packaging Section */}
          <section className="lpf-section">
            <h2 className="lpf-section-title">Sixpine Smart & Sustainable Packaging Program</h2>
            <p className="lpf-text">
              At Sixpine, we are committed to providing the best packaging experience for our customers. We actively listen to customer feedback to discover new ways to reduce waste, minimize packaging, and use materials that are easier to recycle. Your feedback helps us use it in our fulfillment process under our Smart & Sustainable Packaging Program.
            </p>
            <p className="lpf-text">
              We gather insights through customer service, returns, and reviews to provide the best possible experience while minimizing excess packaging. One of the biggest challenges in e-commerce packaging is keeping it compact without compromising product safety. With your help, we can identify opportunities to reduce the amount of air or void-fill in our packaging, reduce waste across the supply chain, and ensure products reach customers safely and undamaged.
            </p>
          </section>

          {/* Damaged Delivery Section */}
          <section className="lpf-section">
            <h3 className="lpf-section-subtitle">Concerned About Damaged Delivery or Packaging Issues?</h3>
            <p className="lpf-text">
              While our goal is to minimize packaging and still guarantee safe delivery, we acknowledge that sometimes issues occur. If you received a damaged item, we'd love to hear and share your feedback. We use this information to evaluate both the manufacturer's packaging and the packaging methods we apply in our fulfillment centers. Based on these insights, we can continuously improve packaging, and in some cases, may temporarily stop selling an item until packaging improvements are made to ensure the best customer experience.
            </p>
          </section>

          {/* Question Section */}
          <div className="lpf-question-box">
            <p className="lpf-question">Was this information helpful?</p>
            <div className="lpf-button-group">
              <button 
                className="lpf-btn lpf-btn-yes"
                onClick={() => {
                  setShowYesInfo(!showYesInfo);
                  setShowNoInfo(false);
                }}
              >
                Yes
              </button>
              <button 
                className="lpf-btn lpf-btn-no"
                onClick={() => {
                  setShowNoInfo(!showNoInfo);
                  setShowYesInfo(false);
                }}
              >
                No
              </button>
            </div>
            {showYesInfo && (
              <div className="lpf-feedback-message">
                <p>Thank you for your feedback!</p>
                {!submitSuccess && (
                  <button 
                    className="lpf-btn lpf-btn-primary"
                    onClick={() => setShowFeedbackForm(true)}
                    style={{ marginTop: '10px' }}
                  >
                    Submit Detailed Feedback
                  </button>
                )}
              </div>
            )}
            {showNoInfo && (
              <div className="lpf-feedback-message">
                <p>We're sorry to hear that. Please let us know how we can improve.</p>
                {!submitSuccess && (
                  <button 
                    className="lpf-btn lpf-btn-primary"
                    onClick={() => setShowFeedbackForm(true)}
                    style={{ marginTop: '10px' }}
                  >
                    Submit Feedback
                  </button>
                )}
              </div>
            )}
            
            {/* Feedback Form */}
            {showFeedbackForm && !submitSuccess && (
              <div className="lpf-feedback-form" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                <h3 style={{ marginBottom: '15px' }}>Submit Your Feedback</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  setError(null);
                  
                  try {
                    const feedbackData: any = {
                      feedback_type: feedbackType,
                      was_helpful: showYesInfo ? true : (showNoInfo ? false : null),
                      message: message.trim(),
                    };
                    
                    if (rating) feedbackData.rating = rating;
                    if (orderId.trim()) feedbackData.order_id = orderId.trim();
                    
                    // For anonymous users, require name and email
                    if (!state.user) {
                      if (!name.trim() || !email.trim()) {
                        setError('Please provide your name and email');
                        setSubmitting(false);
                        return;
                      }
                      feedbackData.name = name.trim();
                      feedbackData.email = email.trim();
                    }
                    
                    const response = await packagingFeedbackAPI.submitFeedback(feedbackData);
                    
                    if (response.data.success) {
                      setSubmitSuccess(true);
                      setMessage('');
                      setOrderId('');
                      setName('');
                      setEmail('');
                      setRating(null);
                    } else {
                      setError(response.data.error || 'Failed to submit feedback');
                    }
                  } catch (err: any) {
                    setError(err.response?.data?.error || err.message || 'Failed to submit feedback. Please try again.');
                  } finally {
                    setSubmitting(false);
                  }
                }}>
                  {!state.user && (
                    <>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Name *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email *</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                    </>
                  )}
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Feedback Type</label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="general">General Feedback</option>
                      <option value="damaged">Damaged Item</option>
                      <option value="excessive_packaging">Excessive Packaging</option>
                      <option value="insufficient_packaging">Insufficient Packaging</option>
                      <option value="sustainability">Sustainability Concern</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Rating (1-5, optional)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(rating === num ? null : num)}
                          style={{
                            padding: '8px 12px',
                            border: `2px solid ${rating === num ? '#FF6F00' : '#ddd'}`,
                            borderRadius: '4px',
                            background: rating === num ? '#FF6F00' : 'white',
                            color: rating === num ? 'white' : '#333',
                            cursor: 'pointer'
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Order ID (optional)</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="If related to a specific order"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Message *</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      placeholder="Please provide detailed feedback about the packaging..."
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                    />
                  </div>
                  
                  {error && (
                    <div style={{ marginBottom: '15px', padding: '10px', background: '#fee', color: '#c00', borderRadius: '4px' }}>
                      {error}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      disabled={submitting || !message.trim()}
                      style={{
                        padding: '10px 20px',
                        background: submitting ? '#ccc' : '#FF6F00',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeedbackForm(false);
                        setError(null);
                        setMessage('');
                        setOrderId('');
                        setName('');
                        setEmail('');
                        setRating(null);
                      }}
                      style={{
                        padding: '10px 20px',
                        background: '#f0f0f0',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {submitSuccess && (
              <div className="lpf-feedback-message" style={{ background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '4px', marginTop: '20px' }}>
                <p style={{ fontWeight: '600', margin: 0 }}>✓ Thank you for your feedback! We appreciate your input and will use it to improve our packaging.</p>
              </div>
            )}
          </div>

        </div>

        {/* First Row - Customers frequently viewed */}
        {!loading && frequentlyViewedProducts.length > 0 && (
    <Productdetails_Slider1 
            title="Customers frequently viewed | Popular products in the last 7 days"
            products={frequentlyViewedProducts}
        />
        )}

        {/* Second Row - Inspired by your browsing history */}
        {!loading && inspiredProducts.length > 0 && (
        <Productdetails_Slider1 
          title="Inspired by your browsing history"
            products={inspiredProducts}
        />
        )}
      </div>

      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default LeavePackagingFeedbackPage;
