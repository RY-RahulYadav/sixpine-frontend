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
  
  const [footerSettings, setFooterSettings] = useState({
    phone_number: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    ios_app_url: '',
    android_app_url: ''
  });
  
  const [saving, setSaving] = useState<boolean>(false);
  const [savingFooter, setSavingFooter] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [footerError, setFooterError] = useState<string | null>(null);
  const [footerSuccess, setFooterSuccess] = useState<string | null>(null);
  
  // Fetch footer settings on mount
  useEffect(() => {
    fetchFooterSettings();
  }, []);
  
  const fetchFooterSettings = async () => {
    try {
      const settings = await adminAPI.getGlobalSettings();
      const settingsMap: { [key: string]: string } = {};
      
      if (Array.isArray(settings.data)) {
        settings.data.forEach((setting: any) => {
          settingsMap[setting.key] = setting.value;
        });
      }
      
      setFooterSettings({
        phone_number: settingsMap['footer_phone_number'] || '',
        linkedin_url: settingsMap['footer_linkedin_url'] || '',
        twitter_url: settingsMap['footer_twitter_url'] || '',
        instagram_url: settingsMap['footer_instagram_url'] || '',
        ios_app_url: settingsMap['ios_app_url'] || '',
        android_app_url: settingsMap['android_app_url'] || ''
      });
    } catch (error) {
      console.error('Error fetching footer settings:', error);
    }
  };
  
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
  
  const handleFooterSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFooterSettings({ ...footerSettings, [name]: value });
    setFooterError(null);
    setFooterSuccess(null);
  };
  
  const handleFooterSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSavingFooter(true);
      setFooterError(null);
      
      // Update each setting
      await Promise.all([
        adminAPI.updateGlobalSetting('footer_phone_number', footerSettings.phone_number, 'Footer phone number'),
        adminAPI.updateGlobalSetting('footer_linkedin_url', footerSettings.linkedin_url, 'Footer LinkedIn URL'),
        adminAPI.updateGlobalSetting('footer_twitter_url', footerSettings.twitter_url, 'Footer Twitter URL'),
        adminAPI.updateGlobalSetting('footer_instagram_url', footerSettings.instagram_url, 'Footer Instagram URL'),
        adminAPI.updateGlobalSetting('ios_app_url', footerSettings.ios_app_url, 'iOS App Store URL'),
        adminAPI.updateGlobalSetting('android_app_url', footerSettings.android_app_url, 'Android App Store URL')
      ]);
      
      setFooterSuccess('Footer settings updated successfully');
      showToast('Footer settings updated successfully', 'success');
      
      // Clear success message after 5 seconds
      setTimeout(() => setFooterSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error updating footer settings:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update footer settings';
      setFooterError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSavingFooter(false);
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
      
      <div className="tw-grid tw-grid-cols-1 tw-gap-6">
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
        
        {/* Change Password Card */}
        <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
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
        
        {/* Footer Settings Card */}
        <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-green-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
          <div className="tw-bg-gradient-to-r tw-from-green-50 tw-via-green-100 tw-to-green-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-green-200">
            <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
              <span className="material-symbols-outlined tw-text-green-600 tw-text-2xl">link</span>
              Footer Settings
            </h3>
          </div>
          
          {/* Footer success message */}
          {footerSuccess && (
            <div className="tw-mx-6 tw-mt-4 tw-p-4 tw-bg-green-50 tw-border-l-4 tw-border-green-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
              <span className="material-symbols-outlined tw-text-green-600 tw-text-2xl">check_circle</span>
              <span className="tw-text-green-800 tw-font-medium">{footerSuccess}</span>
            </div>
          )}
          
          {/* Footer error message */}
          {footerError && (
            <div className="tw-mx-6 tw-mt-4 tw-p-4 tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
              <span className="material-symbols-outlined tw-text-red-600 tw-text-2xl">error</span>
              <span className="tw-text-red-800 tw-font-medium">{footerError}</span>
            </div>
          )}
          
          <form onSubmit={handleFooterSettingsSubmit} className="tw-p-6">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-green-600">phone</span>
                  <label htmlFor="phone_number" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Phone Number
                  </label>
                </div>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={footerSettings.phone_number}
                  onChange={handleFooterSettingsChange}
                  placeholder="e.g., 9897268972"
                  disabled={savingFooter}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
              
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-green-600">link</span>
                  <label htmlFor="linkedin_url" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    LinkedIn URL
                  </label>
                </div>
                <input
                  type="url"
                  id="linkedin_url"
                  name="linkedin_url"
                  value={footerSettings.linkedin_url}
                  onChange={handleFooterSettingsChange}
                  placeholder="https://linkedin.com/company/..."
                  disabled={savingFooter}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
              
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-green-600">link</span>
                  <label htmlFor="twitter_url" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Twitter URL
                  </label>
                </div>
                <input
                  type="url"
                  id="twitter_url"
                  name="twitter_url"
                  value={footerSettings.twitter_url}
                  onChange={handleFooterSettingsChange}
                  placeholder="https://twitter.com/..."
                  disabled={savingFooter}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
              
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-green-600">link</span>
                  <label htmlFor="instagram_url" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Instagram URL
                  </label>
                </div>
                <input
                  type="url"
                  id="instagram_url"
                  name="instagram_url"
                  value={footerSettings.instagram_url}
                  onChange={handleFooterSettingsChange}
                  placeholder="https://instagram.com/..."
                  disabled={savingFooter}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
              
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-green-600">phone_iphone</span>
                  <label htmlFor="ios_app_url" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    iOS App Store URL
                  </label>
                </div>
                <input
                  type="url"
                  id="ios_app_url"
                  name="ios_app_url"
                  value={footerSettings.ios_app_url}
                  onChange={handleFooterSettingsChange}
                  placeholder="https://apps.apple.com/..."
                  disabled={savingFooter}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
              
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-green-600">phone_android</span>
                  <label htmlFor="android_app_url" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Android App Store URL
                  </label>
                </div>
                <input
                  type="url"
                  id="android_app_url"
                  name="android_app_url"
                  value={footerSettings.android_app_url}
                  onChange={handleFooterSettingsChange}
                  placeholder="https://play.google.com/store/apps/..."
                  disabled={savingFooter}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="tw-flex tw-gap-4 tw-mt-6">
              <button
                type="submit"
                className="tw-flex-1 tw-px-6 tw-py-3 tw-bg-green-600 tw-text-white tw-rounded-lg hover:tw-bg-green-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed hover:tw-scale-[1.02] active:tw-scale-95"
                disabled={savingFooter}
              >
                {savingFooter ? (
                  <>
                    <span className="spinner-small"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Save Footer Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
