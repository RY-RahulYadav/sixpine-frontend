import React, { useState, useEffect } from 'react';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import { sellerAPI } from '../../../services/api';
import { showToast } from '../../Admin/utils/adminUtils';
import '../../../styles/admin-theme.css';

interface VendorData {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
  upi_id: string;
  shipment_address: string;
  shipment_city: string;
  shipment_state: string;
  shipment_pincode: string;
  shipment_country: string;
  shipment_latitude: number | null;
  shipment_longitude: number | null;
}

const SellerPaymentSettings: React.FC = () => {
  const api = useAdminAPI();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [bankDetailsForm, setBankDetailsForm] = useState({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    upi_id: ''
  });
  const [shipmentForm, setShipmentForm] = useState({
    shipment_address: '',
    shipment_city: '',
    shipment_state: '',
    shipment_pincode: '',
    shipment_country: 'India',
    shipment_latitude: null as number | null,
    shipment_longitude: null as number | null,
  });
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const response = await (api as typeof sellerAPI).getSettings();
      if (response.data.vendor) {
        const vendorData = response.data.vendor;
        const paymentData = {
          account_holder_name: vendorData.account_holder_name || '',
          account_number: vendorData.account_number || '',
          ifsc_code: vendorData.ifsc_code || '',
          bank_name: vendorData.bank_name || '',
          branch_name: vendorData.branch_name || '',
          upi_id: vendorData.upi_id || ''
        };
        setVendor(paymentData);
        setBankDetailsForm(paymentData);
      }
    } catch (err: any) {
      console.error('Error fetching payment settings:', err);
      showToast('Failed to load payment settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetailsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleShipmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShipmentForm(prev => ({ ...prev, [name]: value }));
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
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const address = data.address;
            setShipmentForm(prev => ({
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
            setShipmentForm(prev => ({
              ...prev,
              shipment_latitude: latitude,
              shipment_longitude: longitude,
            }));
            showToast('Location detected. Please fill address manually.', 'info');
          }
        } catch (err) {
          console.error('Error reverse geocoding:', err);
          setShipmentForm(prev => ({
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
    try {
      setSaving(true);
      const updateData = {
        ...bankDetailsForm,
        ...shipmentForm
      };
      const response = await (api as typeof sellerAPI).updateSettings(updateData);
      if (response.data.vendor) {
        const vendorData = response.data.vendor;
        const paymentData = {
          account_holder_name: vendorData.account_holder_name || '',
          account_number: vendorData.account_number || '',
          ifsc_code: vendorData.ifsc_code || '',
          bank_name: vendorData.bank_name || '',
          branch_name: vendorData.branch_name || '',
          upi_id: vendorData.upi_id || '',
          shipment_address: vendorData.shipment_address || '',
          shipment_city: vendorData.shipment_city || '',
          shipment_state: vendorData.shipment_state || '',
          shipment_pincode: vendorData.shipment_pincode || '',
          shipment_country: vendorData.shipment_country || 'India',
          shipment_latitude: vendorData.shipment_latitude || null,
          shipment_longitude: vendorData.shipment_longitude || null,
        };
        setVendor(paymentData);
        setBankDetailsForm({
          account_holder_name: paymentData.account_holder_name,
          account_number: paymentData.account_number,
          ifsc_code: paymentData.ifsc_code,
          bank_name: paymentData.bank_name,
          branch_name: paymentData.branch_name,
          upi_id: paymentData.upi_id,
        });
        setShipmentForm({
          shipment_address: paymentData.shipment_address,
          shipment_city: paymentData.shipment_city,
          shipment_state: paymentData.shipment_state,
          shipment_pincode: paymentData.shipment_pincode,
          shipment_country: paymentData.shipment_country,
          shipment_latitude: paymentData.shipment_latitude,
          shipment_longitude: paymentData.shipment_longitude,
        });
        showToast('Payment and shipment details saved successfully', 'success');
      }
    } catch (err: any) {
      console.error('Error saving details:', err);
      showToast(err.response?.data?.error || 'Failed to save details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading payment settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings-simple">
      <div className="admin-header-actions tw-mb-6">
        <h2 className="tw-flex tw-items-center tw-gap-3 tw-text-3xl tw-font-bold tw-text-gray-800">
          <span className="material-symbols-outlined tw-text-4xl tw-text-blue-600">account_balance</span>
          Payment & Shipment Settings
        </h2>
        <p className="tw-text-gray-600 tw-mt-2">Manage your payment details and shipment address</p>
      </div>

      {/* Payment Details Card */}
      <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-blue-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
        <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-via-blue-100 tw-to-blue-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-blue-200">
          <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
            <span className="material-symbols-outlined tw-text-blue-600 tw-text-2xl">account_balance</span>
            Payment Details
          </h3>
          <p className="tw-text-sm tw-text-gray-600 tw-mt-1">Add your bank account or UPI ID to receive payments from orders</p>
        </div>
        
        <form onSubmit={handleSubmit} className="tw-p-6 tw-space-y-5">
          {/* Bank Account Details Section */}
          <div className="tw-mb-6">
            <h4 className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <span className="material-symbols-outlined tw-text-blue-600">account_balance</span>
              Bank Account Details
            </h4>
            
            <div className="admin-form-group">
              <label htmlFor="account_holder_name">Account Holder Name *</label>
              <input
                type="text"
                id="account_holder_name"
                name="account_holder_name"
                value={bankDetailsForm.account_holder_name}
                onChange={handleBankDetailsChange}
                className="admin-input"
                placeholder="Enter account holder name"
              />
            </div>
            
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="account_number">Account Number *</label>
                <input
                  type="text"
                  id="account_number"
                  name="account_number"
                  value={bankDetailsForm.account_number}
                  onChange={handleBankDetailsChange}
                  className="admin-input"
                  placeholder="Enter account number"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="ifsc_code">IFSC Code *</label>
                <input
                  type="text"
                  id="ifsc_code"
                  name="ifsc_code"
                  value={bankDetailsForm.ifsc_code}
                  onChange={handleBankDetailsChange}
                  className="admin-input"
                  placeholder="Enter IFSC code"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
            
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="bank_name">Bank Name *</label>
                <input
                  type="text"
                  id="bank_name"
                  name="bank_name"
                  value={bankDetailsForm.bank_name}
                  onChange={handleBankDetailsChange}
                  className="admin-input"
                  placeholder="Enter bank name"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="branch_name">Branch Name</label>
                <input
                  type="text"
                  id="branch_name"
                  name="branch_name"
                  value={bankDetailsForm.branch_name}
                  onChange={handleBankDetailsChange}
                  className="admin-input"
                  placeholder="Enter branch name"
                />
              </div>
            </div>
          </div>
          
          {/* UPI ID Section */}
          <div className="tw-mt-6 tw-pt-6 tw-border-t tw-border-gray-200">
            <h4 className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <span className="material-symbols-outlined tw-text-green-600">payments</span>
              UPI ID (Alternative Payment Method)
            </h4>
            
            <div className="admin-form-group">
              <label htmlFor="upi_id">UPI ID</label>
              <input
                type="text"
                id="upi_id"
                name="upi_id"
                value={bankDetailsForm.upi_id}
                onChange={handleBankDetailsChange}
                className="admin-input"
                placeholder="Enter UPI ID (e.g., yourname@paytm, yourname@phonepe)"
              />
              <small className="tw-text-xs tw-text-gray-500 tw-mt-1 tw-block tw-flex tw-items-start tw-gap-1">
                <span className="material-symbols-outlined tw-text-xs tw-mt-0.5">info</span>
                <span>Alternative to bank account for receiving payments. You can provide either bank details or UPI ID, or both.</span>
              </small>
            </div>
          </div>
          
          {/* Shipment Details Section */}
          <div className="tw-mt-8 tw-pt-8 tw-border-t-2 tw-border-gray-300">
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h4 className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-purple-600">local_shipping</span>
                Shipment Address
              </h4>
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
            <p className="tw-text-sm tw-text-gray-600 tw-mb-4">This address will be used as the origin point for all your shipments</p>
            
            <div className="admin-form-group">
              <label htmlFor="shipment_address">Street Address *</label>
              <textarea
                id="shipment_address"
                name="shipment_address"
                value={shipmentForm.shipment_address}
                onChange={handleShipmentChange}
                rows={3}
                className="admin-input"
                placeholder="Enter your complete street address"
              />
            </div>
            
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="shipment_city">City *</label>
                <input
                  type="text"
                  id="shipment_city"
                  name="shipment_city"
                  value={shipmentForm.shipment_city}
                  onChange={handleShipmentChange}
                  className="admin-input"
                  placeholder="City"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="shipment_state">State *</label>
                <input
                  type="text"
                  id="shipment_state"
                  name="shipment_state"
                  value={shipmentForm.shipment_state}
                  onChange={handleShipmentChange}
                  className="admin-input"
                  placeholder="State"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="shipment_pincode">Pincode *</label>
                <input
                  type="text"
                  id="shipment_pincode"
                  name="shipment_pincode"
                  value={shipmentForm.shipment_pincode}
                  onChange={handleShipmentChange}
                  className="admin-input"
                  placeholder="Pincode"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="shipment_country">Country</label>
                <input
                  type="text"
                  id="shipment_country"
                  name="shipment_country"
                  value={shipmentForm.shipment_country}
                  onChange={handleShipmentChange}
                  className="admin-input"
                  placeholder="Country"
                />
              </div>
            </div>
            
            {shipmentForm.shipment_latitude && shipmentForm.shipment_longitude && (
              <div className="tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200 tw-mt-4">
                <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-1">Location Coordinates</p>
                <p className="tw-text-sm tw-text-gray-600 tw-font-mono">
                  Lat: {shipmentForm.shipment_latitude.toFixed(6)}, Lng: {shipmentForm.shipment_longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="admin-form-actions tw-mt-6">
            <button
              type="submit"
              disabled={saving}
              className="admin-btn primary"
            >
              {saving ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Save Payment & Shipment Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerPaymentSettings;

