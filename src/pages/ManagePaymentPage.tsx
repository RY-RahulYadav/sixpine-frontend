import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { paymentPreferencesAPI, addressAPI, homepageAPI } from '../services/api';
import ManagePaymentMethods from '../components/ManagePaymentMethods';
import PaymentPreferenceModal from '../components/PaymentPreferenceModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Productdetails_Slider1 from '../components/Products_Details/productdetails_slider1';
import '../styles/Pages.css';

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
  productSlug?: string;
  variantCount?: number;
  variants_count?: number;
}

interface PaymentPreference {
  id: number;
  preferred_method: string;
  preferred_card_token_id?: string;
  razorpay_customer_id?: string;
}

interface SavedCard {
  token_id: string;
  method: string;
  card: {
    last4: string;
    network: string;
    type: string;
    issuer: string;
    name: string;
    expiry_month: string;
    expiry_year: string;
  };
  created_at?: number;
}

interface Address {
  id: number;
  type: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const ManagePaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const { showSuccess, showError, showConfirmation } = useNotification();
  const [loading, setLoading] = useState(true);
  const [preference, setPreference] = useState<PaymentPreference | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [frequentlyViewedProducts, setFrequentlyViewedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (state.loading) return;
    
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [state.isAuthenticated, state.loading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPaymentPreference(),
        fetchSavedCards(),
        fetchAddresses(),
        fetchHomepageData()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomepageData = async () => {
    try {
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
        const transformedRecommended = content.slider2Products.map((product: any) => ({
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
        setRecommendedProducts(transformedRecommended);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setFrequentlyViewedProducts([]);
      setRecommendedProducts([]);
    }
  };

  const fetchPaymentPreference = async () => {
    try {
      const response = await paymentPreferencesAPI.getPaymentPreference();
      if (response.data.success) {
        setPreference(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment preference:', error);
    }
  };

  const fetchSavedCards = async () => {
    try {
      const response = await paymentPreferencesAPI.getSavedCards();
      if (response.data.success) {
        setSavedCards(response.data.saved_cards || []);
      }
    } catch (error) {
      console.error('Error fetching saved cards:', error);
      setSavedCards([]);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAddresses();
      const addressesData = Array.isArray(response.data)
        ? response.data
        : (response.data.results || response.data.data || []);
      setAddresses(Array.isArray(addressesData) ? addressesData : []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    }
  };

  const handleUpdatePreference = async (data: {
    preferred_method: string;
    preferred_card_token_id?: string;
  }) => {
    try {
      await paymentPreferencesAPI.updatePaymentPreference(data);
      await fetchPaymentPreference();
      setShowModal(false);
      showSuccess('Payment preference updated successfully');
    } catch (error: any) {
      console.error('Error updating preference:', error);
      showError(error.response?.data?.error || 'Failed to update preference');
    }
  };

  const handleDeleteCard = async (tokenId: string) => {
    const confirmed = await showConfirmation({
      title: 'Remove Card',
      message: 'Are you sure you want to remove this card?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await paymentPreferencesAPI.deleteSavedCard(tokenId);
      await fetchSavedCards();
      // If this was the preferred card, update preference
      if (preference?.preferred_card_token_id === tokenId) {
        await paymentPreferencesAPI.updatePaymentPreference({
          preferred_method: preference.preferred_method,
          preferred_card_token_id: undefined
        });
        await fetchPaymentPreference();
      }
      showSuccess('Card removed successfully');
    } catch (error: any) {
      console.error('Error deleting card:', error);
      showError(error.response?.data?.error || 'Failed to delete card');
    }
  };


  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <SubNav />
          <CategoryTabs />
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading payment preferences...</p>
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
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="homepage_container manage-payment-page">
        <ManagePaymentMethods
          preference={preference}
          savedCards={savedCards || []}
          addresses={addresses || []}
          onUpdateClick={() => setShowModal(true)}
          onDeleteCard={handleDeleteCard}
        />
        
        {/* Product Suggestions */}
        {!loading && frequentlyViewedProducts.length > 0 && (
          <Productdetails_Slider1 
            title="Buy it with



"
            products={frequentlyViewedProducts}
          />
        )}
        
        {!loading && recommendedProducts.length > 0 && (
          <Productdetails_Slider1 
            title="Inspired by your browsing history"
            products={recommendedProducts}
          />
        )}
      </div>
      
      {showModal && (
        <PaymentPreferenceModal
          preference={preference}
          savedCards={savedCards}
          addresses={addresses}
          onClose={() => setShowModal(false)}
          onSave={handleUpdatePreference}
        />
      )}

      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default ManagePaymentPage;

