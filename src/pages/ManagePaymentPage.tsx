import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { paymentPreferencesAPI, addressAPI } from '../services/api';
import ManagePaymentMethods from '../components/ManagePaymentMethods';
import PaymentPreferenceModal from '../components/PaymentPreferenceModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Productdetails_Slider1 from '../components/Products_Details/productdetails_slider1';
import { frequentlyViewedProducts, recommendedProducts } from '../data/productSliderData';
import '../styles/Pages.css';

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
        fetchAddresses()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

      <div className="productdetails_container">
        <ManagePaymentMethods
          preference={preference}
          savedCards={savedCards || []}
          addresses={addresses || []}
          onUpdateClick={() => setShowModal(true)}
          onDeleteCard={handleDeleteCard}
        />
        
        {/* Product Suggestions */}
        <Productdetails_Slider1 
          title="Buy with it"
          products={frequentlyViewedProducts}
        />
        
        <Productdetails_Slider1 
          title="Inspired by your browsing history"
          products={recommendedProducts}
        />
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

