import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';

const AdminSettings: React.FC = () => {
  const { state } = useApp();
  const currentUser = state.user;
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(100);
  const [loadingThreshold, setLoadingThreshold] = useState<boolean>(true);
  const [savingThreshold, setSavingThreshold] = useState<boolean>(false);
  
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Load low stock threshold on mount
  useEffect(() => {
    const loadThreshold = async () => {
      try {
        setLoadingThreshold(true);
        const response = await adminAPI.getGlobalSettings();
        const threshold = response.data?.low_stock_threshold || response.data?.['low_stock_threshold'] || 100;
        setLowStockThreshold(parseInt(String(threshold), 10) || 100);
      } catch (err) {
        console.error('Error loading low stock threshold:', err);
        // Default to 100 if error
        setLowStockThreshold(100);
      } finally {
        setLoadingThreshold(false);
      }
    };
    
    loadThreshold();
  }, []);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    setError(null);
    setSuccessMessage(null);
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setError('All fields are required');
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New password and confirm password do not match');
      return;
    }
    
    if (!currentUser?.id) {
      setError('User information not available');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // First verify current password by attempting to get user details
      // Then update password using reset_password endpoint
      await adminAPI.resetUserPassword(currentUser.id, passwordForm.new_password);
      
      setSuccessMessage('Password changed successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      showToast('Password changed successfully', 'success');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to change password';
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
      await adminAPI.updateGlobalSetting(
        'low_stock_threshold',
        lowStockThreshold,
        'Global low stock threshold. Products with total stock (sum of all variants) below this value will be considered low stock.'
      );
      showToast('Low stock threshold updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating threshold:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update threshold';
      showToast(errorMessage, 'error');
    } finally {
      setSavingThreshold(false);
    }
  };
  
  return (
    <div className="admin-settings-simple">
      <div className="admin-header-actions tw-mb-6">
        <h2 className="tw-flex tw-items-center tw-gap-3 tw-text-3xl tw-font-bold tw-text-gray-800">
          <span className="material-symbols-outlined tw-text-4xl tw-text-blue-600">settings</span>
          Admin Settings
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
        {/* Admin Information Card */}
        <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-blue-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
          <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-via-blue-100 tw-to-blue-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-blue-200">
            <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
              <span className="material-symbols-outlined tw-text-blue-600 tw-text-2xl">person</span>
              Admin Information
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
                  {currentUser?.email || 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="tw-flex tw-items-start tw-gap-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200">
              <div className="tw-p-2 tw-bg-blue-100 tw-rounded-lg">
                <span className="material-symbols-outlined tw-text-blue-600 tw-text-xl">badge</span>
              </div>
              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-1">Username</label>
                <div className="tw-text-base tw-font-medium tw-text-gray-800">
                  {currentUser?.username || 'N/A'}
                </div>
              </div>
            </div>
            
            {currentUser?.first_name || currentUser?.last_name ? (
              <div className="tw-flex tw-items-start tw-gap-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200">
                <div className="tw-p-2 tw-bg-purple-100 tw-rounded-lg">
                  <span className="material-symbols-outlined tw-text-purple-600 tw-text-xl">account_circle</span>
                </div>
                <div className="tw-flex-1">
                  <label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-1">Full Name</label>
                  <div className="tw-text-base tw-font-medium tw-text-gray-800">
                    {`${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'N/A'}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Global Settings Card */}
        <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-blue-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
          <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-via-blue-100 tw-to-blue-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-blue-200">
            <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
              <span className="material-symbols-outlined tw-text-blue-600 tw-text-2xl">settings</span>
              Global Settings
            </h3>
          </div>
          
          <div className="tw-p-6">
            <div className="tw-space-y-4">
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
                disabled={loadingThreshold || savingThreshold}
                className="tw-w-full tw-px-4 tw-py-3 tw-text-lg tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed tw-font-medium"
              />
              
              <div className="tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
                <p className="tw-text-sm tw-text-blue-800 tw-flex tw-items-start tw-gap-2">
                  <span className="material-symbols-outlined tw-text-base tw-mt-0.5">info</span>
                  <span>Products with total stock (sum of all variants) below this value will be marked as low stock</span>
                </p>
              </div>
              
              <button
                type="button"
                className="tw-w-full tw-px-6 tw-py-3 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed hover:tw-scale-[1.02] active:tw-scale-95"
                onClick={handleThresholdSave}
                disabled={loadingThreshold || savingThreshold}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="tw-flex tw-gap-4 tw-mt-6">
              <button
                type="submit"
                className="tw-flex-1 tw-px-6 tw-py-3 tw-bg-purple-600 tw-text-white tw-rounded-lg hover:tw-bg-purple-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed hover:tw-scale-[1.02] active:tw-scale-95"
                disabled={saving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
              >
                {saving ? (
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
                  setError(null);
                  setSuccessMessage(null);
                }}
                disabled={saving}
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

export default AdminSettings;
