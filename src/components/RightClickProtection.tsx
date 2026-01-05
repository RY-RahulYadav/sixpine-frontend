import { useEffect } from 'react';

/**
 * Component to disable right-click on production URLs (not localhost)
 * This helps protect content from being easily copied
 */
const RightClickProtection: React.FC = () => {
  useEffect(() => {
    // Check if we're on localhost or production
    const isLocalhost = 
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.endsWith('.local');

    // Only disable right-click on production URLs
    if (!isLocalhost) {
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
    }
  }, []);

  return null; // This component doesn't render anything
};

export default RightClickProtection;

