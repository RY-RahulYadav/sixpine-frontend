import React, { useState, useEffect } from 'react';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import { sellerAPI } from '../../../services/api';
import { showToast } from '../../Admin/utils/adminUtils';
import '../../../styles/admin-theme.css';

interface ShipmentSettingsData {
  shipment_address: string;
  shipment_city: string;
  shipment_state: string;
  shipment_pincode: string;
  shipment_country: string;
  shipment_latitude: number | null;
  shipment_longitude: number | null;
}

const SellerShipmentSettings: React.FC = () => {
  const api = useAdminAPI();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [formData, setFormData] = useState<ShipmentSettingsData>({
    shipment_address: '',
    shipment_city: '',
    shipment_state: '',
    shipment_pincode: '',
    shipment_country: 'India',
    shipment_latitude: null,
    shipment_longitude: null,
  });

  useEffect(() => {
    fetchShipmentSettings();
  }, []);

  const fetchShipmentSettings = async () => {
    try {
      setLoading(true);
      const response = await (api as typeof sellerAPI).getShipmentSettings();
      setFormData(response.data);
    } catch (err: any) {
      console.error('Error fetching shipment settings:', err);
      showToast('Failed to load shipment settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding API to get address from coordinates
          // Using OpenStreetMap Nominatim API (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const address = data.address;
            setFormData(prev => ({
              ...prev,
              shipment_address: [
                address.house_number || '',
                address.road || '',
                address.neighbourhood || '',
                address.suburb || '',
              ].filter(Boolean).join(', '),
              shipment_city: address.city || address.town || address.village || address.county || '',
              shipment_state: address.state || '',
              shipment_pincode: address.postcode || '',
              shipment_country: address.country || 'India',
              shipment_latitude: latitude,
              shipment_longitude: longitude,
            }));
            showToast('Address filled from current location', 'success');
          } else {
            // If reverse geocoding fails, at least save coordinates
            setFormData(prev => ({
              ...prev,
              shipment_latitude: latitude,
              shipment_longitude: longitude,
            }));
            showToast('Location detected. Please fill address manually.', 'info');
          }
        } catch (err) {
          console.error('Error reverse geocoding:', err);
          // At least save coordinates
          setFormData(prev => ({
            ...prev,
            shipment_latitude: latitude,
            shipment_longitude: longitude,
          }));
          showToast('Location detected. Please fill address manually.', 'info');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to get current location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied. Please enable location permissions.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        showToast(errorMessage, 'error');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shipment_address || !formData.shipment_city || !formData.shipment_state || !formData.shipment_pincode) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setSaving(true);
      await (api as typeof sellerAPI).updateShipmentSettings(formData);
      showToast('Shipment address updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating shipment settings:', err);
      showToast(err.response?.data?.error || 'Failed to update shipment address', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p className="admin-loading-text">Loading shipment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">local_shipping</span>
          <div>
            <h1>Shipment Settings</h1>
            <p className="admin-page-subtitle">Manage your shipment address for order fulfillment</p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">
                <span className="material-symbols-outlined">location_on</span>
                Shipment Address
              </h2>
              <p className="admin-card-description">
                This address will be used as the origin point for all your shipments
              </p>
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="admin-modern-btn outline"
            >
              <span className="material-symbols-outlined">
                {gettingLocation ? 'hourglass_empty' : 'my_location'}
              </span>
              {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
            </button>
          </div>

          <div className="admin-card-body">
            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-form-group">
                <label htmlFor="shipment_address" className="admin-form-label">
                  <span className="material-symbols-outlined">home</span>
                  Street Address <span className="required">*</span>
                </label>
                <textarea
                  id="shipment_address"
                  name="shipment_address"
                  value={formData.shipment_address}
                  onChange={handleInputChange}
                  rows={3}
                  className="admin-input"
                  placeholder="Enter your complete street address"
                  required
                />
                <small className="admin-form-hint">Include building number, street name, and any additional details</small>
              </div>

              <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                <div className="admin-form-group">
                  <label htmlFor="shipment_city" className="admin-form-label">
                    <span className="material-symbols-outlined">location_city</span>
                    City <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="shipment_city"
                    name="shipment_city"
                    value={formData.shipment_city}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="City"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="shipment_state" className="admin-form-label">
                    <span className="material-symbols-outlined">map</span>
                    State <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="shipment_state"
                    name="shipment_state"
                    value={formData.shipment_state}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="State"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="shipment_pincode" className="admin-form-label">
                    <span className="material-symbols-outlined">markunread_mailbox</span>
                    Pincode <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="shipment_pincode"
                    name="shipment_pincode"
                    value={formData.shipment_pincode}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="Pincode"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="shipment_country" className="admin-form-label">
                    <span className="material-symbols-outlined">public</span>
                    Country
                  </label>
                  <input
                    type="text"
                    id="shipment_country"
                    name="shipment_country"
                    value={formData.shipment_country}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="Country"
                  />
                </div>
              </div>

              {(formData.shipment_latitude && formData.shipment_longitude) && (
                <div className="admin-info-card" style={{ 
                  marginTop: 'var(--spacing-md)',
                  background: 'linear-gradient(135deg, rgba(26, 59, 169, 0.05) 0%, rgba(53, 122, 189, 0.05) 100%)',
                  border: '1px solid rgba(26, 59, 169, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--spacing-md)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>
                      location_on
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: 'var(--admin-text)',
                      marginBottom: 'var(--spacing-xs)',
                      fontSize: '14px'
                    }}>
                      Location Coordinates
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--admin-text-medium)',
                      fontFamily: 'monospace',
                      background: 'rgba(255, 255, 255, 0.5)',
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-block'
                    }}>
                      Lat: {formData.shipment_latitude.toFixed(6)}, Lng: {formData.shipment_longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="admin-card-footer">
            <button
              type="submit"
              disabled={saving}
              className="admin-modern-btn primary"
            >
              {saving ? (
                <>
                  <div className="admin-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Save Shipment Address
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerShipmentSettings;

