import { useState, useEffect } from 'react';
import API from '../services/api';

interface FooterSettings {
  footer_phone_number: string;
  footer_linkedin_url: string;
  footer_twitter_url: string;
  footer_instagram_url: string;
  ios_app_url: string;
  android_app_url: string;
}

export const useFooterSettings = () => {
  const [settings, setSettings] = useState<FooterSettings>({
    footer_phone_number: '',
    footer_linkedin_url: '',
    footer_twitter_url: '',
    footer_instagram_url: '',
    ios_app_url: '',
    android_app_url: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await API.get('/footer-settings/');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching footer settings:', error);
        // Use default fallback values
        setSettings({
          footer_phone_number: '9897268972',
          footer_linkedin_url: '',
          footer_twitter_url: '',
          footer_instagram_url: '',
          ios_app_url: '',
          android_app_url: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Helper function to format phone number for WhatsApp
  const getWhatsAppNumber = (): string => {
    const phone = settings.footer_phone_number || '9897268972';
    // Remove all non-numeric characters
    return phone.replace(/[^0-9]/g, '');
  };

  // Helper function to format phone number for display
  const getDisplayPhoneNumber = (): string => {
    const phone = settings.footer_phone_number || '9897268972';
    // If it doesn't start with +, add +91
    if (!phone.startsWith('+')) {
      return `+91 ${phone.replace(/[^0-9]/g, '')}`;
    }
    return phone;
  };

  return {
    settings,
    loading,
    phoneNumber: settings.footer_phone_number || '9897268972',
    whatsAppNumber: getWhatsAppNumber(),
    displayPhoneNumber: getDisplayPhoneNumber(),
    iosAppUrl: settings.ios_app_url || '',
    androidAppUrl: settings.android_app_url || ''
  };
};

