import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import adminAPI from '../services/adminApi';

interface ThemeColors {
  // Header colors (all 3 sections)
  header_bg_color: string;
  header_text_color: string;
  subnav_bg_color: string;
  subnav_text_color: string;
  category_tabs_bg_color: string;
  category_tabs_text_color: string;
  
  // Footer colors
  footer_bg_color: string;
  footer_text_color: string;
  
  // Buy button colors
  buy_button_bg_color: string;
  buy_button_text_color: string;
  
  // Logo URL
  logo_url: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  loading: boolean;
  refreshColors: () => Promise<void>;
}

const defaultColors: ThemeColors = {
  // Header defaults
  header_bg_color: '#212121', // --dark1
  header_text_color: '#ffffff',
  subnav_bg_color: '#1a3ba9', // --blue01
  subnav_text_color: '#ffffff',
  category_tabs_bg_color: '#eeeeee',
  category_tabs_text_color: '#333333',
  
  // Footer defaults
  footer_bg_color: '#212121',
  footer_text_color: '#ffffff',
  
  // Buy button defaults
  buy_button_bg_color: '#ff6f00', // --primary-color
  buy_button_text_color: '#ffffff',
  
  // Logo default
  logo_url: '/logo.png',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [loading, setLoading] = useState(true);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const settings = await adminAPI.getGlobalSettings();
      const settingsMap: { [key: string]: string } = {};
      
      if (Array.isArray(settings.data)) {
        settings.data.forEach((setting: any) => {
          settingsMap[setting.key] = setting.value;
        });
      }
      
      setColors({
        header_bg_color: settingsMap['header_bg_color'] || defaultColors.header_bg_color,
        header_text_color: settingsMap['header_text_color'] || defaultColors.header_text_color,
        subnav_bg_color: settingsMap['subnav_bg_color'] || defaultColors.subnav_bg_color,
        subnav_text_color: settingsMap['subnav_text_color'] || defaultColors.subnav_text_color,
        category_tabs_bg_color: settingsMap['category_tabs_bg_color'] || defaultColors.category_tabs_bg_color,
        category_tabs_text_color: settingsMap['category_tabs_text_color'] || defaultColors.category_tabs_text_color,
        footer_bg_color: settingsMap['footer_bg_color'] || defaultColors.footer_bg_color,
        footer_text_color: settingsMap['footer_text_color'] || defaultColors.footer_text_color,
        buy_button_bg_color: settingsMap['buy_button_bg_color'] || defaultColors.buy_button_bg_color,
        buy_button_text_color: settingsMap['buy_button_text_color'] || defaultColors.buy_button_text_color,
        logo_url: settingsMap['logo_url'] || defaultColors.logo_url,
      });
    } catch (error) {
      console.error('Error fetching theme colors:', error);
      setColors(defaultColors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  // Apply colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-header-bg', colors.header_bg_color);
    root.style.setProperty('--theme-header-text', colors.header_text_color);
    root.style.setProperty('--theme-subnav-bg', colors.subnav_bg_color);
    root.style.setProperty('--theme-subnav-text', colors.subnav_text_color);
    root.style.setProperty('--theme-category-tabs-bg', colors.category_tabs_bg_color);
    root.style.setProperty('--theme-category-tabs-text', colors.category_tabs_text_color);
    root.style.setProperty('--theme-footer-bg', colors.footer_bg_color);
    root.style.setProperty('--theme-footer-text', colors.footer_text_color);
    root.style.setProperty('--theme-buy-button-bg', colors.buy_button_bg_color);
    root.style.setProperty('--theme-buy-button-text', colors.buy_button_text_color);
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ colors, loading, refreshColors: fetchColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

