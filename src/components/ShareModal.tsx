import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import styles from './ShareModal.module.css';

interface ShareModalProps {
  show: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ show, onClose }) => {
  const { showSuccess } = useNotification();
  const [copied, setCopied] = useState(false);
  
  // Get current page URL dynamically
  const getCurrentUrl = () => window.location.href;

  const handleCopyLink = async () => {
    const currentUrl = getCurrentUrl();
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      showSuccess('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        showSuccess('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        showSuccess('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };


  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Share Product</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.urlContainer}>
            <input
              type="text"
              value={getCurrentUrl()}
              readOnly
              className={styles.urlInput}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.shareButton} ${styles.copyButton} ${copied ? styles.copied : ''}`}
              onClick={handleCopyLink}
            >
              <i className="fa-solid fa-copy"></i>
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

