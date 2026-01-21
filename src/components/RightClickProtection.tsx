import { useEffect, useState } from 'react';
import API from '../services/api';

interface SiteSettings {
  right_click_protection_enabled: boolean;
}

/**
 * Component to disable right-click based on admin settings
 * This helps protect content from being easily copied
 */
const RightClickProtection: React.FC = () => {
  const [protectionEnabled, setProtectionEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch site settings from API
    const fetchSiteSettings = async () => {
      try {
        const response = await API.get<SiteSettings>('/site-settings/');
        const settings = response.data;
        setProtectionEnabled(settings.right_click_protection_enabled ?? true);
      } catch (error) {
        console.error('Error fetching site settings:', error);
        // Default to enabled if API fails
        setProtectionEnabled(true);
      }
    };

    fetchSiteSettings();
  }, []);

  useEffect(() => {
    // Only apply protection if enabled from admin settings
    if (protectionEnabled !== true) {
      return;
    }

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection (optional - can be removed if needed)
    const handleSelectStart = (e: Event) => {
      // Allow selection in input fields and textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Disable drag and drop for images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [protectionEnabled]);

  return null; // This component doesn't render anything
};

export default RightClickProtection;
