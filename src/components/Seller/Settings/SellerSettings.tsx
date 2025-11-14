import React, { useState, useEffect } from 'react';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import { sellerAPI } from '../../../services/api';
import { showToast } from '../../Admin/utils/adminUtils';
import '../../../styles/admin-theme.css';

interface VendorData {
  id: number;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gst_number: string;
  pan_number: string;
  business_type: string;
  brand_name: string;
  status: string;
  is_verified: boolean;
  low_stock_threshold: number;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
  upi_id: string;
}

interface UserData {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  mobile: string;
}

const SellerSettings: React.FC = () => {
  const api = useAdminAPI();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingThreshold, setSavingThreshold] = useState<boolean>(false);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(100);
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await (api as typeof sellerAPI).getSettings();
      setVendor(response.data.vendor);
      setUser(response.data.user);
      setLowStockThreshold(response.data.vendor.low_stock_threshold || 100);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('vendor_')) {
      const field = name.replace('vendor_', '');
      setVendor(prev => prev ? { ...prev, [field]: value } : null);
    } else if (name.startsWith('user_')) {
      const field = name.replace('user_', '');
      setUser(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendor || !user) return;

    try {
      setSaving(true);
      setError(null);
      
      const updateData = {
        business_name: vendor.business_name,
        business_email: vendor.business_email,
        business_phone: vendor.business_phone,
        business_address: vendor.business_address,
        city: vendor.city,
        state: vendor.state,
        pincode: vendor.pincode,
        country: vendor.country,
        gst_number: vendor.gst_number,
        pan_number: vendor.pan_number,
        business_type: vendor.business_type,
        brand_name: vendor.brand_name,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
      };
      
      const response = await (api as typeof sellerAPI).updateSettings(updateData);
      setVendor(response.data.vendor);
      setUser(response.data.user);
      setSuccessMessage('Profile updated successfully');
      showToast('Profile updated successfully', 'success');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleThresholdSave = async () => {
    if (lowStockThreshold < 0) {
      showToast('Threshold must be a positive number', 'error');
      return;
    }
    
    try {
      setSavingThreshold(true);
      await (api as typeof sellerAPI).updateSettings({ low_stock_threshold: lowStockThreshold });
      if (vendor) {
        setVendor({ ...vendor, low_stock_threshold: lowStockThreshold });
      }
      showToast('Low stock threshold updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating threshold:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update threshold';
      showToast(errorMessage, 'error');
    } finally {
      setSavingThreshold(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirm password do not match');
      return;
    }
    
    try {
      setSavingPassword(true);
      setPasswordError(null);
      
      await (api as typeof sellerAPI).changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      
      setPasswordSuccess('Password changed successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      showToast('Password changed successfully', 'success');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      const errorMessage = err.response?.data?.error || 'Failed to change password';
      setPasswordError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!vendor || !user) {
    return <div>Error loading settings</div>;
  }

  return (
    <div className="admin-settings-simple">
      <div className="admin-header-actions tw-mb-6">
        <h2 className="tw-flex tw-items-center tw-gap-3 tw-text-3xl tw-font-bold tw-text-gray-800">
          <span className="material-symbols-outlined tw-text-4xl tw-text-blue-600">settings</span>
          Seller Settings
        </h2>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="tw-mb-6 tw-p-4 tw-bg-green-50 tw-border-l-4 tw-border-green-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
          <span className="material-symbols-outlined tw-text-green-600 tw-text-2xl">check_circle</span>
          <span className="tw-text-green-800 tw-font-medium">{successMessage}</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="tw-mb-6 tw-p-4 tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
          <span className="material-symbols-outlined tw-text-red-600 tw-text-2xl">error</span>
          <span className="tw-text-red-800 tw-font-medium">{error}</span>
        </div>
      )}
      
      <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
        {/* Seller Information Card */}
        <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-blue-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
          <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-via-blue-100 tw-to-blue-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-blue-200">
            <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
              <span className="material-symbols-outlined tw-text-blue-600 tw-text-2xl">store</span>
              Seller Information
            </h3>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="tw-p-6 tw-space-y-5">
            <div className="admin-form-group">
              <label htmlFor="vendor_business_name">Business Name *</label>
              <input
                type="text"
                id="vendor_business_name"
                name="vendor_business_name"
                value={vendor.business_name}
                onChange={handleInputChange}
                className="admin-input"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="vendor_brand_name">Brand Name *</label>
              <input
                type="text"
                id="vendor_brand_name"
                name="vendor_brand_name"
                value={vendor.brand_name}
                onChange={handleInputChange}
                className="admin-input"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="vendor_business_email">Business Email *</label>
              <input
                type="email"
                id="vendor_business_email"
                name="vendor_business_email"
                value={vendor.business_email}
                onChange={handleInputChange}
                className="admin-input"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="vendor_business_phone">Business Phone *</label>
              <input
                type="text"
                id="vendor_business_phone"
                name="vendor_business_phone"
                value={vendor.business_phone}
                onChange={handleInputChange}
                className="admin-input"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="vendor_business_address">Business Address *</label>
              <textarea
                id="vendor_business_address"
                name="vendor_business_address"
                value={vendor.business_address}
                onChange={handleInputChange}
                rows={3}
                className="admin-input"
                required
              />
            </div>
            
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="vendor_city">City *</label>
                <input
                  type="text"
                  id="vendor_city"
                  name="vendor_city"
                  value={vendor.city}
                  onChange={handleInputChange}
                  className="admin-input"
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="vendor_state">State *</label>
                <input
                  type="text"
                  id="vendor_state"
                  name="vendor_state"
                  value={vendor.state}
                  onChange={handleInputChange}
                  className="admin-input"
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="vendor_pincode">Pincode *</label>
                <input
                  type="text"
                  id="vendor_pincode"
                  name="vendor_pincode"
                  value={vendor.pincode}
                  onChange={handleInputChange}
                  className="admin-input"
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="vendor_country">Country</label>
                <input
                  type="text"
                  id="vendor_country"
                  name="vendor_country"
                  value={vendor.country}
                  onChange={handleInputChange}
                  className="admin-input"
                />
              </div>
            </div>
            
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="vendor_gst_number">GST Number</label>
                <input
                  type="text"
                  id="vendor_gst_number"
                  name="vendor_gst_number"
                  value={vendor.gst_number}
                  onChange={handleInputChange}
                  className="admin-input"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="vendor_pan_number">PAN Number</label>
                <input
                  type="text"
                  id="vendor_pan_number"
                  name="vendor_pan_number"
                  value={vendor.pan_number}
                  onChange={handleInputChange}
                  className="admin-input"
                />
              </div>
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="vendor_business_type">Business Type</label>
              <input
                type="text"
                id="vendor_business_type"
                name="vendor_business_type"
                value={vendor.business_type}
                onChange={handleInputChange}
                className="admin-input"
              />
            </div>
            
            <div className="admin-form-group">
              <label>Status</label>
              <div className="admin-input" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                {vendor.status ? (vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)) : 'N/A'}
                {vendor.is_verified && (
                  <span className="material-symbols-outlined" style={{ marginLeft: '8px', color: '#10b981' }}>
                    verified
                  </span>
                )}
              </div>
            </div>
            
            <div className="admin-form-actions">
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
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* User Information & Low Stock Threshold Card */}
        <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-blue-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
          <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-via-blue-100 tw-to-blue-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-blue-200">
            <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
              <span className="material-symbols-outlined tw-text-blue-600 tw-text-2xl">person</span>
              User Information
            </h3>
          </div>
          
          <div className="tw-p-6 tw-space-y-5">
            <div className="tw-flex tw-items-start tw-gap-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200">
              <div className="tw-p-2 tw-bg-blue-100 tw-rounded-lg">
                <span className="material-symbols-outlined tw-text-blue-600 tw-text-xl">email</span>
              </div>
              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-1">Email Address</label>
                <div className="tw-text-base tw-font-medium tw-text-gray-800">
                  {user.email}
                </div>
              </div>
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="user_first_name">First Name</label>
              <input
                type="text"
                id="user_first_name"
                name="user_first_name"
                value={user.first_name}
                onChange={handleInputChange}
                className="admin-input"
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="user_last_name">Last Name</label>
              <input
                type="text"
                id="user_last_name"
                name="user_last_name"
                value={user.last_name}
                onChange={handleInputChange}
                className="admin-input"
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="user_mobile">Mobile</label>
              <input
                type="text"
                id="user_mobile"
                name="user_mobile"
                value={user.mobile}
                onChange={handleInputChange}
                className="admin-input"
              />
            </div>
            
            {/* Low Stock Threshold */}
            <div className="tw-mt-6 tw-pt-6 tw-border-t tw-border-gray-200">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
                <div className="tw-p-2 tw-bg-green-100 tw-rounded-lg">
                  <span className="material-symbols-outlined tw-text-green-600 tw-text-xl">inventory</span>
                </div>
                <label htmlFor="low_stock_threshold" className="tw-text-base tw-font-semibold tw-text-gray-700">
                  Low Stock Threshold
                </label>
              </div>
              
              <input
                type="number"
                id="low_stock_threshold"
                name="low_stock_threshold"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 0)}
                placeholder="Enter threshold (e.g., 100)"
                min="0"
                disabled={savingThreshold}
                className="tw-w-full tw-px-4 tw-py-3 tw-text-lg tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed tw-font-medium"
              />
              
              <div className="tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200 tw-mt-3">
                <p className="tw-text-sm tw-text-blue-800 tw-flex tw-items-start tw-gap-2">
                  <span className="material-symbols-outlined tw-text-base tw-mt-0.5">info</span>
                  <span>Products with total stock (sum of all variants) below this value will be marked as low stock</span>
                </p>
              </div>
              
              <button
                type="button"
                className="tw-w-full tw-mt-3 tw-px-6 tw-py-3 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed hover:tw-scale-[1.02] active:tw-scale-95"
                onClick={handleThresholdSave}
                disabled={savingThreshold}
              >
                {savingThreshold ? (
                  <>
                    <span className="spinner-small"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Save Threshold
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Change Password Card - Full Width */}
        <div className="lg:tw-col-span-2 tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
          <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-via-purple-100 tw-to-purple-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-purple-200">
            <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
              <span className="material-symbols-outlined tw-text-purple-600 tw-text-2xl">lock</span>
              Change Password
            </h3>
          </div>
          
          {passwordSuccess && (
            <div className="tw-m-6 tw-p-4 tw-bg-green-50 tw-border-l-4 tw-border-green-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
              <span className="material-symbols-outlined tw-text-green-600 tw-text-2xl">check_circle</span>
              <span className="tw-text-green-800 tw-font-medium">{passwordSuccess}</span>
            </div>
          )}
          
          {passwordError && (
            <div className="tw-m-6 tw-p-4 tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
              <span className="material-symbols-outlined tw-text-red-600 tw-text-2xl">error</span>
              <span className="tw-text-red-800 tw-font-medium">{passwordError}</span>
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit} className="tw-p-6">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-purple-600">key</span>
                  <label htmlFor="current_password" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Current Password
                  </label>
                </div>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  disabled={savingPassword}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
              
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-purple-600">lock_reset</span>
                  <label htmlFor="new_password" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    New Password
                  </label>
                </div>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  disabled={savingPassword}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
                <small className="tw-text-xs tw-text-gray-500 tw-flex tw-items-center tw-gap-1">
                  <span className="material-symbols-outlined tw-text-xs">info</span>
                  At least 8 characters
                </small>
              </div>
              
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-purple-600">lock_reset</span>
                  <label htmlFor="confirm_password" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Confirm Password
                  </label>
                </div>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  disabled={savingPassword}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="tw-flex tw-gap-4 tw-mt-6">
              <button
                type="submit"
                className="tw-flex-1 tw-px-6 tw-py-3 tw-bg-purple-600 tw-text-white tw-rounded-lg hover:tw-bg-purple-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed hover:tw-scale-[1.02] active:tw-scale-95"
                disabled={savingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
              >
                {savingPassword ? (
                  <>
                    <span className="spinner-small"></span>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Change Password
                  </>
                )}
              </button>
              
              <button
                type="button"
                className="tw-px-6 tw-py-3 tw-bg-gray-200 tw-text-gray-700 tw-rounded-lg hover:tw-bg-gray-300 hover:tw-shadow-md tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-cursor-not-allowed"
                onClick={() => {
                  setPasswordForm({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                  });
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                disabled={savingPassword}
              >
                <span className="material-symbols-outlined">close</span>
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;

