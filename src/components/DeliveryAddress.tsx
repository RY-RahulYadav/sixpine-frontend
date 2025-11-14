import { useState, useEffect } from 'react';
import { addressAPI } from '../services/api';
import styles from './DeliveryAddress.module.css';

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

interface DeliveryAddressProps {
  selectedAddressId?: number;
  onAddressChange?: (addressId: number) => void;
}

const DeliveryAddress: React.FC<DeliveryAddressProps> = ({ selectedAddressId, onAddressChange }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
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

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getAddresses();
      // Handle both paginated and non-paginated responses
      const addressesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || response.data.data || []);
      
      // Ensure it's always an array
      const addressesArray = Array.isArray(addressesData) ? addressesData : [];
      setAddresses(addressesArray);
      
      // Auto-select default address if provided
      if (addressesArray.length > 0 && !selectedAddressId) {
        const defaultAddr = addressesArray.find((addr: Address) => addr.is_default);
        if (defaultAddr && onAddressChange) {
          onAddressChange(defaultAddr.id);
        } else if (addressesArray.length > 0 && onAddressChange) {
          onAddressChange(addressesArray[0].id);
        }
      } else if (selectedAddressId && onAddressChange) {
        onAddressChange(selectedAddressId);
      }
      
      if (addressesArray.length === 0) {
        setShowAddForm(true);
      }
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      // Set empty array on error to prevent .find() errors
      setAddresses([]);
      setShowAddForm(true);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAddress = () => {
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return null;
    }
    return addresses.find(a => a.id === selectedAddressId) || addresses.find(a => a.is_default);
  };

  const handleAddAddress = () => {
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

  const handleEditAddress = (address: Address) => {
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
        // Update address
        await addressAPI.updateAddress(editingAddress.id, formData);
      } else {
        // Create address
        const response = await addressAPI.addAddress(formData);
        if (onAddressChange) {
          onAddressChange(response.data.id);
        }
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

  const handleSelectAddress = (addressId: number) => {
    if (onAddressChange) {
      onAddressChange(addressId);
    }
    setShowAddressModal(false);
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

  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await addressAPI.deleteAddress(addressId);
      // Only update UI if delete succeeds
      await fetchAddresses();
      if (selectedAddressId === addressId && addresses.length > 1) {
        const remainingAddr = addresses.find(a => a.id !== addressId);
        if (remainingAddr && onAddressChange) {
          onAddressChange(remainingAddr.id);
        }
      }
    } catch (err: any) {
      // Show user-friendly error message if address is protected
      const errorMessage = err.response?.data?.error || 'Failed to delete address. This address may be associated with an existing order.';
      alert(errorMessage);
      console.error('Failed to delete address:', err);
      // Don't update the UI - address remains in list
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading addresses...</p>
      </div>
    );
  }

  const selectedAddress = getSelectedAddress();

  // Show add address form if no addresses exist
  if (addresses.length === 0 || showAddForm) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.title}>Select a delivery address</span>
        </div>
        
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
              placeholder="Enter full name"
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
              placeholder="Enter phone number"
            />
          </div>

          <div className={styles.formRow}>
            <label>Street Address *</label>
            <textarea
              value={formData.street_address}
              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
              className={styles.formInput}
              required
              placeholder="Enter street address"
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
              placeholder="Enter city"
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
              placeholder="Enter state"
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
              placeholder="Enter postal code"
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
            {addresses.length > 0 && (
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
            )}
          </div>
        </form>
      </div>
    );
  }

  // Show address selection modal or display current address
  return (
    <>
    <div className={styles.container}>
      <div className={styles.header}>
          <span className={styles.title}>
            Delivering to {selectedAddress?.full_name || 'Unknown User'}
          </span>
          <button 
            onClick={() => setShowAddressModal(true)} 
            className={styles.linkButton}
          >
            Change
          </button>
        </div>
        {selectedAddress && (
          <>
            <p className={styles.address}>
              {selectedAddress.street_address}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.postal_code}, {selectedAddress.country}
            </p>
            <button 
              onClick={() => setShowAddressModal(true)} 
              className={styles.linkButton}
            >
              Add a new address
            </button>
          </>
        )}
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddressModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Select a delivery address</h2>
              <button 
                className={styles.closeButton} 
                onClick={() => setShowAddressModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.addressList}>
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`${styles.addressCard} ${selectedAddressId === address.id ? styles.selected : ''}`}
                  onClick={() => handleSelectAddress(address.id)}
                >
                  <div className={styles.addressCardHeader}>
                    <div>
                      {address.is_default && (
                        <span className={styles.defaultBadge}>Default</span>
                      )}
                      <strong>{address.full_name}</strong>
                    </div>
                    <div className={styles.addressCardActions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                          setShowAddressModal(false);
                        }}
                        className={styles.actionButton}
                      >
                        Edit
                      </button>
                      {!address.is_default && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address.id);
                          }}
                          className={styles.actionButton}
                        >
                          Set as default
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        className={styles.deleteButton}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className={styles.addressCardBody}>
                    <p>{address.street_address}</p>
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <p>Phone: {address.phone}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  handleAddAddress();
                }}
                className={styles.addButton}
              >
                + Add a new address
              </button>
            </div>
          </div>
    </div>
      )}
    </>
  );
};

export default DeliveryAddress;
