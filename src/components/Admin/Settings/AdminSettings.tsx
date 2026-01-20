import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';

const AdminSettings: React.FC = () => {
  const { state } = useApp();
  const { colors: themeColors, refreshColors } = useTheme();
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
  
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [savingEmail, setSavingEmail] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  
  const [saving, setSaving] = useState<boolean>(false);
  const [savingFooter, setSavingFooter] = useState<boolean>(false);
  const [savingTheme, setSavingTheme] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [footerError, setFooterError] = useState<string | null>(null);
  const [footerSuccess, setFooterSuccess] = useState<string | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [themeSuccess, setThemeSuccess] = useState<string | null>(null);
  
  // Theme color state
  const [themeSettings, setThemeSettings] = useState({
    header_bg_color: themeColors.header_bg_color,
    header_text_color: themeColors.header_text_color,
    subnav_bg_color: themeColors.subnav_bg_color,
    subnav_text_color: themeColors.subnav_text_color,
    category_tabs_bg_color: themeColors.category_tabs_bg_color,
    category_tabs_text_color: themeColors.category_tabs_text_color,
    footer_bg_color: themeColors.footer_bg_color,
    footer_text_color: themeColors.footer_text_color,
    back_to_top_bg_color: themeColors.back_to_top_bg_color,
    back_to_top_text_color: themeColors.back_to_top_text_color,
    buy_button_bg_color: themeColors.buy_button_bg_color,
    buy_button_text_color: themeColors.buy_button_text_color,
    cart_icon_color: themeColors.cart_icon_color,
    wishlist_icon_color: themeColors.wishlist_icon_color,
    wishlist_icon_inactive_color: themeColors.wishlist_icon_inactive_color,
    logo_url: themeColors.logo_url,
  });
  
  // Fetch footer settings on mount
  useEffect(() => {
    fetchFooterSettings();
  }, []);
  
  // Update theme settings when theme colors change
  useEffect(() => {
    setThemeSettings({
      header_bg_color: themeColors.header_bg_color,
      header_text_color: themeColors.header_text_color,
      subnav_bg_color: themeColors.subnav_bg_color,
      subnav_text_color: themeColors.subnav_text_color,
      category_tabs_bg_color: themeColors.category_tabs_bg_color,
      category_tabs_text_color: themeColors.category_tabs_text_color,
      footer_bg_color: themeColors.footer_bg_color,
      footer_text_color: themeColors.footer_text_color,
      back_to_top_bg_color: themeColors.back_to_top_bg_color,
      back_to_top_text_color: themeColors.back_to_top_text_color,
      buy_button_bg_color: themeColors.buy_button_bg_color,
      buy_button_text_color: themeColors.buy_button_text_color,
      cart_icon_color: themeColors.cart_icon_color,
      wishlist_icon_color: themeColors.wishlist_icon_color,
      wishlist_icon_inactive_color: themeColors.wishlist_icon_inactive_color,
      logo_url: themeColors.logo_url,
    });
  }, [themeColors]);
  
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
      
      setAdminEmail(settingsMap['admin_email'] || '');
    } catch (error) {
      console.error('Error fetching footer settings:', error);
    }
  };
  
  const handleThemeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setThemeSettings({ ...themeSettings, [name]: value });
    setThemeError(null);
    setThemeSuccess(null);
  };
  
  const handleThemeSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSavingTheme(true);
      setThemeError(null);
      
      // Update each theme setting
      await Promise.all([
        adminAPI.updateGlobalSetting('header_bg_color', themeSettings.header_bg_color, 'Header background color'),
        adminAPI.updateGlobalSetting('header_text_color', themeSettings.header_text_color, 'Header text color'),
        adminAPI.updateGlobalSetting('subnav_bg_color', themeSettings.subnav_bg_color, 'Sub navigation background color'),
        adminAPI.updateGlobalSetting('subnav_text_color', themeSettings.subnav_text_color, 'Sub navigation text color'),
        adminAPI.updateGlobalSetting('category_tabs_bg_color', themeSettings.category_tabs_bg_color, 'Category tabs background color'),
        adminAPI.updateGlobalSetting('category_tabs_text_color', themeSettings.category_tabs_text_color, 'Category tabs text color'),
        adminAPI.updateGlobalSetting('footer_bg_color', themeSettings.footer_bg_color, 'Footer background color'),
        adminAPI.updateGlobalSetting('footer_text_color', themeSettings.footer_text_color, 'Footer text color'),
        adminAPI.updateGlobalSetting('back_to_top_bg_color', themeSettings.back_to_top_bg_color, 'Back to top button background color'),
        adminAPI.updateGlobalSetting('back_to_top_text_color', themeSettings.back_to_top_text_color, 'Back to top button text color'),
        adminAPI.updateGlobalSetting('buy_button_bg_color', themeSettings.buy_button_bg_color, 'Buy button background color'),
        adminAPI.updateGlobalSetting('buy_button_text_color', themeSettings.buy_button_text_color, 'Buy button text color'),
        adminAPI.updateGlobalSetting('cart_icon_color', themeSettings.cart_icon_color, 'Cart icon color'),
        adminAPI.updateGlobalSetting('wishlist_icon_color', themeSettings.wishlist_icon_color, 'Wishlist icon color (active)'),
        adminAPI.updateGlobalSetting('wishlist_icon_inactive_color', themeSettings.wishlist_icon_inactive_color, 'Wishlist icon color (inactive)'),
        adminAPI.updateGlobalSetting('logo_url', themeSettings.logo_url, 'Logo URL for header and footer'),
      ]);
      
      // Refresh theme colors to apply changes
      await refreshColors();
      
      setThemeSuccess('Theme colors updated successfully');
      showToast('Theme colors updated successfully', 'success');
      
      setTimeout(() => setThemeSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error updating theme settings:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update theme colors';
      setThemeError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSavingTheme(false);
    }
  };
  
  const handleResetTheme = async () => {
    const defaultTheme = {
      header_bg_color: '#212121',
      header_text_color: '#ffffff',
      subnav_bg_color: '#1a3ba9',
      subnav_text_color: '#ffffff',
      category_tabs_bg_color: '#eeeeee',
      category_tabs_text_color: '#333333',
      footer_bg_color: '#212121',
      footer_text_color: '#ffffff',
      back_to_top_bg_color: '#37475a',
      back_to_top_text_color: '#ffffff',
      buy_button_bg_color: '#ff6f00',
      buy_button_text_color: '#ffffff',
      cart_icon_color: '#999999',
      wishlist_icon_color: '#ff6f00',
      wishlist_icon_inactive_color: '#999999',
      logo_url: '/logo.png',
    };
    
    setThemeSettings(defaultTheme);
    
    try {
      setSavingTheme(true);
      setThemeError(null);
      
      await Promise.all([
        adminAPI.updateGlobalSetting('header_bg_color', defaultTheme.header_bg_color, 'Header background color'),
        adminAPI.updateGlobalSetting('header_text_color', defaultTheme.header_text_color, 'Header text color'),
        adminAPI.updateGlobalSetting('subnav_bg_color', defaultTheme.subnav_bg_color, 'Sub navigation background color'),
        adminAPI.updateGlobalSetting('subnav_text_color', defaultTheme.subnav_text_color, 'Sub navigation text color'),
        adminAPI.updateGlobalSetting('category_tabs_bg_color', defaultTheme.category_tabs_bg_color, 'Category tabs background color'),
        adminAPI.updateGlobalSetting('category_tabs_text_color', defaultTheme.category_tabs_text_color, 'Category tabs text color'),
        adminAPI.updateGlobalSetting('footer_bg_color', defaultTheme.footer_bg_color, 'Footer background color'),
        adminAPI.updateGlobalSetting('footer_text_color', defaultTheme.footer_text_color, 'Footer text color'),
        adminAPI.updateGlobalSetting('back_to_top_bg_color', defaultTheme.back_to_top_bg_color, 'Back to top button background color'),
        adminAPI.updateGlobalSetting('back_to_top_text_color', defaultTheme.back_to_top_text_color, 'Back to top button text color'),
        adminAPI.updateGlobalSetting('buy_button_bg_color', defaultTheme.buy_button_bg_color, 'Buy button background color'),
        adminAPI.updateGlobalSetting('buy_button_text_color', defaultTheme.buy_button_text_color, 'Buy button text color'),
        adminAPI.updateGlobalSetting('cart_icon_color', defaultTheme.cart_icon_color, 'Cart icon color'),
        adminAPI.updateGlobalSetting('wishlist_icon_color', defaultTheme.wishlist_icon_color, 'Wishlist icon color (active)'),
        adminAPI.updateGlobalSetting('wishlist_icon_inactive_color', defaultTheme.wishlist_icon_inactive_color, 'Wishlist icon color (inactive)'),
        adminAPI.updateGlobalSetting('logo_url', defaultTheme.logo_url, 'Logo URL for header and footer'),
      ]);
      
      await refreshColors();
      
      setThemeSuccess('Theme colors reset to defaults');
      showToast('Theme colors reset to defaults', 'success');
      
      setTimeout(() => setThemeSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error resetting theme settings:', err);
      const errorMessage = err.response?.data?.error || 'Failed to reset theme colors';
      setThemeError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSavingTheme(false);
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
    if (!passwordForm.new_password || !passwordForm.confirm_password) {
      setError('New password and confirm password are required');
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
  
  const handleAdminEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminEmail.trim()) {
      setEmailError('Admin email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    try {
      setSavingEmail(true);
      setEmailError(null);
      
      await adminAPI.updateGlobalSetting('admin_email', adminEmail.trim(), 'Admin email for seller communication');
      
      setEmailSuccess('Admin email updated successfully');
      showToast('Admin email updated successfully', 'success');
      
      setTimeout(() => setEmailSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error updating admin email:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update admin email';
      setEmailError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSavingEmail(false);
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
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
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
                disabled={saving || !passwordForm.new_password || !passwordForm.confirm_password}
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
        
        {/* Admin Email Settings Card */}
        <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-orange-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
          <div className="tw-bg-gradient-to-r tw-from-orange-50 tw-via-orange-100 tw-to-orange-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-orange-200">
            <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
              <span className="material-symbols-outlined tw-text-orange-600 tw-text-2xl">email</span>
              Admin Email Settings
            </h3>
          </div>
          
          {/* Email success message */}
          {emailSuccess && (
            <div className="tw-mx-6 tw-mt-4 tw-p-4 tw-bg-green-50 tw-border-l-4 tw-border-green-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
              <span className="material-symbols-outlined tw-text-green-600 tw-text-2xl">check_circle</span>
              <span className="tw-text-green-800 tw-font-medium">{emailSuccess}</span>
            </div>
          )}
          
          {/* Email error message */}
          {emailError && (
            <div className="tw-mx-6 tw-mt-4 tw-p-4 tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
              <span className="material-symbols-outlined tw-text-red-600 tw-text-2xl">error</span>
              <span className="tw-text-red-800 tw-font-medium">{emailError}</span>
            </div>
          )}
          
          <form onSubmit={handleAdminEmailSubmit} className="tw-p-6">
            <div className="tw-space-y-4">
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-orange-600">email</span>
                  <label htmlFor="admin_email" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Admin Email Address
                  </label>
                </div>
                <input
                  type="email"
                  id="admin_email"
                  name="admin_email"
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    setEmailError(null);
                    setEmailSuccess(null);
                  }}
                  placeholder="admin@sixpine.com"
                  required
                  disabled={savingEmail}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-orange-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
                <small className="tw-text-xs tw-text-gray-500 tw-flex tw-items-center tw-gap-1">
                  <span className="material-symbols-outlined tw-text-xs">info</span>
                  This email will be used when sellers send messages to admin. It will not be visible to sellers.
                </small>
              </div>
            </div>
            
            <div className="tw-flex tw-gap-4 tw-mt-6">
              <button
                type="submit"
                className="tw-flex-1 tw-px-6 tw-py-3 tw-bg-orange-600 tw-text-white tw-rounded-lg hover:tw-bg-orange-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed hover:tw-scale-[1.02] active:tw-scale-95"
                disabled={savingEmail || !adminEmail.trim()}
              >
                {savingEmail ? (
                  <>
                    <span className="spinner-small"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Save Admin Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Theme Colors Settings Card */}
        <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-indigo-100 tw-overflow-hidden hover:tw-shadow-xl tw-transition-all">
          <div className="tw-bg-gradient-to-r tw-from-indigo-50 tw-via-indigo-100 tw-to-indigo-50 tw-px-6 tw-py-4 tw-border-b-2 tw-border-indigo-200">
            <h3 className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-bold tw-text-gray-800">
              <span className="material-symbols-outlined tw-text-indigo-600 tw-text-2xl">palette</span>
              Theme Colors Settings
            </h3>
          </div>
          
          {/* Theme success message */}
          {themeSuccess && (
            <div className="tw-mx-6 tw-mt-4 tw-p-4 tw-bg-green-50 tw-border-l-4 tw-border-green-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
              <span className="material-symbols-outlined tw-text-green-600 tw-text-2xl">check_circle</span>
              <span className="tw-text-green-800 tw-font-medium">{themeSuccess}</span>
            </div>
          )}
          
          {/* Theme error message */}
          {themeError && (
            <div className="tw-mx-6 tw-mt-4 tw-p-4 tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-rounded-lg tw-flex tw-items-center tw-gap-3 tw-shadow-md">
              <span className="material-symbols-outlined tw-text-red-600 tw-text-2xl">error</span>
              <span className="tw-text-red-800 tw-font-medium">{themeError}</span>
            </div>
          )}
          
          <form onSubmit={handleThemeSettingsSubmit} className="tw-p-6">
            {/* Header Colors */}
            <div className="tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-indigo-600">menu</span>
                Header Colors (Top Navigation)
              </h4>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div className="tw-space-y-2">
                  <label htmlFor="header_bg_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Background Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="header_bg_color"
                      name="header_bg_color"
                      value={themeSettings.header_bg_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.header_bg_color}
                      onChange={handleThemeSettingsChange}
                      name="header_bg_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="tw-space-y-2">
                  <label htmlFor="header_text_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Text Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="header_text_color"
                      name="header_text_color"
                      value={themeSettings.header_text_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.header_text_color}
                      onChange={handleThemeSettingsChange}
                      name="header_text_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* SubNav Colors */}
            <div className="tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-indigo-600">navigation</span>
                Sub Navigation Colors
              </h4>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div className="tw-space-y-2">
                  <label htmlFor="subnav_bg_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Background Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="subnav_bg_color"
                      name="subnav_bg_color"
                      value={themeSettings.subnav_bg_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.subnav_bg_color}
                      onChange={handleThemeSettingsChange}
                      name="subnav_bg_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="tw-space-y-2">
                  <label htmlFor="subnav_text_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Text Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="subnav_text_color"
                      name="subnav_text_color"
                      value={themeSettings.subnav_text_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.subnav_text_color}
                      onChange={handleThemeSettingsChange}
                      name="subnav_text_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Category Tabs Colors */}
            <div className="tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-indigo-600">category</span>
                Category Tabs Colors
              </h4>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div className="tw-space-y-2">
                  <label htmlFor="category_tabs_bg_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Background Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="category_tabs_bg_color"
                      name="category_tabs_bg_color"
                      value={themeSettings.category_tabs_bg_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.category_tabs_bg_color}
                      onChange={handleThemeSettingsChange}
                      name="category_tabs_bg_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="tw-space-y-2">
                  <label htmlFor="category_tabs_text_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Text Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="category_tabs_text_color"
                      name="category_tabs_text_color"
                      value={themeSettings.category_tabs_text_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.category_tabs_text_color}
                      onChange={handleThemeSettingsChange}
                      name="category_tabs_text_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Colors */}
            <div className="tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-indigo-600">web</span>
                Footer Colors
              </h4>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div className="tw-space-y-2">
                  <label htmlFor="footer_bg_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Background Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="footer_bg_color"
                      name="footer_bg_color"
                      value={themeSettings.footer_bg_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.footer_bg_color}
                      onChange={handleThemeSettingsChange}
                      name="footer_bg_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="tw-space-y-2">
                  <label htmlFor="footer_text_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Text Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="footer_text_color"
                      name="footer_text_color"
                      value={themeSettings.footer_text_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.footer_text_color}
                      onChange={handleThemeSettingsChange}
                      name="footer_text_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Back to Top Button Colors */}
            <div className="tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-indigo-600">arrow_upward</span>
                Back to Top Button Colors
              </h4>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div className="tw-space-y-2">
                  <label htmlFor="back_to_top_bg_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Background Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="back_to_top_bg_color"
                      name="back_to_top_bg_color"
                      value={themeSettings.back_to_top_bg_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.back_to_top_bg_color}
                      onChange={handleThemeSettingsChange}
                      name="back_to_top_bg_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="tw-space-y-2">
                  <label htmlFor="back_to_top_text_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Text Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="back_to_top_text_color"
                      name="back_to_top_text_color"
                      value={themeSettings.back_to_top_text_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.back_to_top_text_color}
                      onChange={handleThemeSettingsChange}
                      name="back_to_top_text_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Logo URL */}
            <div className="tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-indigo-600">image</span>
                Logo Settings
              </h4>
              <div className="tw-space-y-2">
                <label htmlFor="logo_url" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                  Logo URL (used in header and footer)
                </label>
                <input
                  type="text"
                  id="logo_url"
                  name="logo_url"
                  value={themeSettings.logo_url}
                  onChange={handleThemeSettingsChange}
                  placeholder="/logo.png or https://example.com/logo.png"
                  disabled={savingTheme}
                  className="tw-w-full tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-transparent disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
                <small className="tw-text-xs tw-text-gray-500 tw-flex tw-items-center tw-gap-1">
                  <span className="material-symbols-outlined tw-text-xs">info</span>
                  Enter a relative path (e.g., /logo.png) or full URL (e.g., https://example.com/logo.png)
                </small>
                {themeSettings.logo_url && (
                  <div className="tw-mt-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200">
                    <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">Preview:</p>
                    <img 
                      src={themeSettings.logo_url} 
                      alt="Logo Preview" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      className="tw-max-h-20 tw-w-auto"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Buy Button Colors */}
            <div className="tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-indigo-600">shopping_cart</span>
                Buy Button Colors (Product Tiles)
              </h4>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div className="tw-space-y-2">
                  <label htmlFor="buy_button_bg_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Background Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="buy_button_bg_color"
                      name="buy_button_bg_color"
                      value={themeSettings.buy_button_bg_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.buy_button_bg_color}
                      onChange={handleThemeSettingsChange}
                      name="buy_button_bg_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="tw-space-y-2">
                  <label htmlFor="buy_button_text_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Text Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="buy_button_text_color"
                      name="buy_button_text_color"
                      value={themeSettings.buy_button_text_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.buy_button_text_color}
                      onChange={handleThemeSettingsChange}
                      name="buy_button_text_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Icon Colors Section */}
            <div className="tw-mt-8 tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-200">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                <span className="material-symbols-outlined tw-text-2xl tw-text-indigo-600">favorite</span>
                <h3 className="tw-text-xl tw-font-bold tw-text-gray-800">Icon Colors</h3>
              </div>
              
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                {/* Cart Icon Color */}
                <div className="tw-space-y-2">
                  <label htmlFor="cart_icon_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Cart Icon Color
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="cart_icon_color"
                      name="cart_icon_color"
                      value={themeSettings.cart_icon_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.cart_icon_color}
                      onChange={handleThemeSettingsChange}
                      name="cart_icon_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Wishlist Icon Color (Active) */}
                <div className="tw-space-y-2">
                  <label htmlFor="wishlist_icon_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Wishlist Icon Color (Active)
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="wishlist_icon_color"
                      name="wishlist_icon_color"
                      value={themeSettings.wishlist_icon_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.wishlist_icon_color}
                      onChange={handleThemeSettingsChange}
                      name="wishlist_icon_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mt-6">
                {/* Wishlist Icon Color (Inactive) */}
                <div className="tw-space-y-2">
                  <label htmlFor="wishlist_icon_inactive_color" className="tw-text-sm tw-font-semibold tw-text-gray-700">
                    Wishlist Icon Color (Inactive)
                  </label>
                  <div className="tw-flex tw-gap-2">
                    <input
                      type="color"
                      id="wishlist_icon_inactive_color"
                      name="wishlist_icon_inactive_color"
                      value={themeSettings.wishlist_icon_inactive_color}
                      onChange={handleThemeSettingsChange}
                      disabled={savingTheme}
                      className="tw-w-16 tw-h-10 tw-border-2 tw-border-gray-300 tw-rounded-lg tw-cursor-pointer disabled:tw-opacity-50"
                    />
                    <input
                      type="text"
                      value={themeSettings.wishlist_icon_inactive_color}
                      onChange={handleThemeSettingsChange}
                      name="wishlist_icon_inactive_color"
                      disabled={savingTheme}
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="tw-flex tw-gap-4 tw-mt-6">
              <button
                type="submit"
                className="tw-flex-1 tw-px-6 tw-py-3 tw-bg-indigo-600 tw-text-white tw-rounded-lg hover:tw-bg-indigo-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed hover:tw-scale-[1.02] active:tw-scale-95"
                disabled={savingTheme}
              >
                {savingTheme ? (
                  <>
                    <span className="spinner-small"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Save Theme Colors
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleResetTheme}
                className="tw-px-6 tw-py-3 tw-bg-gray-200 tw-text-gray-700 tw-rounded-lg hover:tw-bg-gray-300 hover:tw-shadow-md tw-transition-all tw-duration-200 tw-font-semibold tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-cursor-not-allowed"
                disabled={savingTheme}
              >
                <span className="material-symbols-outlined">restart_alt</span>
                Reset to Defaults
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
