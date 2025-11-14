import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { addressAPI, homepageAPI } from '../services/api';
import styles from '../styles/AddressesPage.module.css';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';

// Product interface matching the slider component
interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
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

const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: 'home',
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [frequentlyViewedProducts, setFrequentlyViewedProducts] = useState<Product[]>([]);
  const [inspiredProducts, setInspiredProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoadingProducts(true);
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
        }));
        setInspiredProducts(transformedInspired);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setFrequentlyViewedProducts([]);
      setInspiredProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    // Wait for auth initialization to complete
    if (state.loading) {
      return;
    }
    
    // Only redirect if auth is complete and user is not authenticated
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch addresses if authenticated
    if (state.isAuthenticated) {
      fetchAddresses();
    }
  }, [state.isAuthenticated, state.loading]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getAddresses();
      const addressesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || response.data.data || []);
      setAddresses(Array.isArray(addressesData) ? addressesData : []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    setEditingAddress(null);
    setFormData({
      type: 'home',
      full_name: '',
      phone: '',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      is_default: addresses.length === 0
    });
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
    setFormData({
      type: address.type,
      full_name: address.full_name,
      phone: address.phone,
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingAddress) {
        await addressAPI.updateAddress(editingAddress.id, formData);
      } else {
        await addressAPI.addAddress(formData);
      }
      
      await fetchAddresses();
      setShowAddForm(false);
      setEditingAddress(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await addressAPI.deleteAddress(addressId);
      // Only update UI if delete succeeds
      await fetchAddresses();
    } catch (err: any) {
      // Show user-friendly error message if address is protected
      const errorMessage = err.response?.data?.error || 'Failed to delete address. This address may be associated with an existing order.';
      alert(errorMessage);
      console.error('Failed to delete address:', err);
      // Don't update the UI - address remains in list
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      const address = addresses.find(a => a.id === addressId);
      if (address) {
        await addressAPI.updateAddress(addressId, { ...address, is_default: true });
        await fetchAddresses();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to set default address');
    }
  };

  if (state.loading || loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!state.isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      </div>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          Your Account &gt; Your Addresses
        </div>

        {/* Page Title */}
        <h1 className={styles.pageTitle}>Your Addresses</h1>

        {/* Add Address Form */}
        {showAddForm && (
          <div className={styles.addressFormContainer}>
            <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleFormSubmit} className={styles.addressForm}>
              <div className={styles.formRow}>
                <label>Address Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={styles.formInput}
                  required
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label>Street Address *</label>
                <textarea
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  className={styles.formInput}
                  required
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label>State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label>Postal Code *</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label>Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  />
                  Set as default address
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address Cards */}
        <div className={styles.addressGrid}>
          {/* Add New Address Card */}
          {!showAddForm && (
            <div className={styles.addressCardAdd} onClick={handleAddClick}>
              <div className={styles.addIcon}>+</div>
              <div className={styles.addText}>Add address</div>
            </div>
          )}

          {/* Address Cards */}
          {addresses.map((address) => (
            <div key={address.id} className={styles.addressCard}>
              {address.is_default && (
                <div className={styles.defaultLabel}>Default</div>
              )}
              <div className={styles.addressContent}>
                <p className={styles.addressLine}><strong>{address.full_name}</strong></p>
                <p className={styles.addressLine}>{address.street_address}</p>
                <p className={styles.addressLine}>{address.city}, {address.state} {address.postal_code}</p>
                <p className={styles.addressLine}>{address.country}</p>
                <p className={styles.addressLine}>Phone: {address.phone}</p>
              </div>
              <div className={styles.addressActions}>
                <a href="#" className={styles.actionLink}>Add Delivery Instructions</a>
                <div className={styles.actionLinks}>
                  <button
                    onClick={() => handleEditClick(address)}
                    className={styles.actionLinkButton}
                  >
                    Edit
                  </button>
                  {' | '}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className={styles.actionLinkButton}
                  >
                    Remove
                  </button>
                  {!address.is_default && (
                    <>
                      {' | '}
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className={styles.actionLinkButton}
                      >
                        Set as default
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {addresses.length === 0 && !showAddForm && (
            <div className={styles.emptyState}>
              <p>You don't have any saved addresses yet.</p>
              <button onClick={handleAddClick} className={styles.addButtonLarge}>
                Add Your First Address
              </button>
            </div>
          )}
        </div>

        {/* Product Sections */}
        {!loadingProducts && (
          <>
            {/* First Row - Customers frequently viewed */}
            {frequentlyViewedProducts.length > 0 && (
              <div className={styles.carouselSection}>
                <Productdetails_Slider1 
                  title="Customers frequently viewed | Popular products in the last 7 days"
                  products={frequentlyViewedProducts}
                />
              </div>
            )}

            {/* Second Row - Inspired by your browsing history */}
            {inspiredProducts.length > 0 && (
              <div className={styles.carouselSection}>
                <Productdetails_Slider1 
                  title="Inspired by your browsing history"
                  products={inspiredProducts}
                />
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AddressesPage;
