import React, { useState, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useFooterSettings } from '../hooks/useFooterSettings';
import API from '../services/api';
import styles from '../components/Home/heroSection.module.css';

const SupportButtons: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { whatsAppNumber, displayPhoneNumber } = useFooterSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpertOpen, setIsExpertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contactFormRef = useRef<HTMLFormElement>(null);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpertPopup = () => {
    setIsExpertOpen(!isExpertOpen);
  };

  return (
    <>
      {/* Customer Support Section */}
      <div className={styles.supportButtons}>
        {/* Buy On Phone */}
        <div className={`${styles.supportBtn} ${styles.phoneBtn}`} onClick={togglePopup}>
          <div className={styles.supportIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92V19.92C22 20.52 21.52 21.01 20.92 21.01C9.39 21.01 2.99 14.61 2.99 3.08C2.99 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.05 8.71 5.94C8.87 6.31 8.76 6.76 8.44 7.04L6.9 8.22C8.07 10.86 10.13 12.92 12.77 14.09L13.95 12.55C14.23 12.23 14.68 12.12 15.05 12.28C15.94 12.64 16.91 12.83 17.91 12.83C18.51 12.83 18.99 13.31 18.99 13.91V16.91H22V16.92Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className={styles.supportText}>
            <div>Buy On</div>
            <div>Phone</div>
          </div>
        </div>

        {/* Get Expert Help */}
        <div className={`${styles.supportBtn} ${styles.expertBtn}`} onClick={toggleExpertPopup}>
          <div className={styles.supportIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.54 20.54 16 20 16H7L3 20V4C3 3.46 3.46 3 4 3H20C20.54 3 21 3.46 21 4V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.supportText}>
            <div>Get Expert</div>
            <div>Help</div>
          </div>
        </div>
      </div>

      {/* Side Popup */}
      {isOpen && (
        <div className={styles.popupOverlay} onClick={togglePopup}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            {/* Close Icon */}
            <button className={styles.closeIcon} onClick={togglePopup}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Header */}
            <div className={styles.popupHeader}>
              <div className={styles.bulletPoint}>● 8 Experts Online Now To Assist You</div>
              <h3 className={styles.popupTitle}>Talk To A Furniture Expert Now</h3>
              <p className={styles.popupTime}>Available between 10 AM - 7 PM</p>
            </div>

            {/* Phone Number with Icon */}
            <div className={styles.phoneDisplay}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.phoneIcon}>
                <path d="M22 16.92V19.92C22 20.52 21.52 21.01 20.92 21.01C9.39 21.01 2.99 14.61 2.99 3.08C2.99 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.05 8.71 5.94C8.87 6.31 8.76 6.76 8.44 7.04L6.9 8.22C8.07 10.86 10.13 12.92 12.77 14.09L13.95 12.55C14.23 12.23 14.68 12.12 15.05 12.28C15.94 12.64 16.91 12.83 17.91 12.83C18.51 12.83 18.99 13.31 18.99 13.91V16.91H22V16.92Z" stroke="#ff5722" strokeWidth="2"/>
              </svg>
              <a href={`tel:${whatsAppNumber}`} className={styles.phoneNumber}>{displayPhoneNumber}</a>
            </div>

            {/* OR Divider */}
            <div className={styles.orDivider}>OR</div>

            {/* WhatsApp Button */}
            <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer" className={styles.chatButton}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                alt="WhatsApp" 
                width="20" 
                height="20"
              />
              CHAT NOW
            </a>

            {/* Footer Text */}
            <p className={styles.footerText}>Call us to get <strong>free Sixpine credits</strong></p>
          </div>
        </div>
      )}

      {/* Expert Callback Drawer */}
      {isExpertOpen && (
        <div className={styles.popupOverlay} onClick={toggleExpertPopup}>
          <div className={`${styles.popupContent} ${styles.callbackContent}`} style={{marginTop: '80px'}} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeIcon} onClick={toggleExpertPopup}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <div className={styles.callbackHeader}>
              <h3 className={styles.callbackTitle}>Get A Callback From Us</h3>
              <p className={styles.callbackSubtitle}>Our Nearest Store Will Contact You</p>
            </div>

            <form 
              ref={contactFormRef}
              className={styles.callbackForm} 
              onSubmit={async (e) => { 
                e.preventDefault();
                
                // Prevent double submission
                if (isSubmitting) {
                  return;
                }
                
                setIsSubmitting(true);
                
                const form = contactFormRef.current || e.currentTarget;
                if (!form) {
                  setIsSubmitting(false);
                  return;
                }
                
                const formData = new FormData(form);
                const data = {
                  full_name: formData.get('name') as string,
                  pincode: formData.get('pincode') as string,
                  phone_number: formData.get('phone') as string,
                  email: (formData.get('email') as string) || '',
                  message: (formData.get('message') as string) || ''
                };
                
                try {
                  const response = await API.post('/auth/contact/submit/', data);
                  const result = response.data;
                  
                  if (result && result.success) {
                    const successMessage = result.message || 'Thank you! Our team will contact you soon.';
                    setIsSubmitting(false);
                    
                    // Reset form if it still exists
                    if (contactFormRef.current) {
                      contactFormRef.current.reset();
                    }
                    
                    showSuccess(successMessage);
                    
                    // Small delay before closing to ensure toast is processed
                    setTimeout(() => {
                      setIsExpertOpen(false);
                    }, 100);
                  } else {
                    const errorMsg = result?.error || result?.detail || 
                                    (result?.errors ? JSON.stringify(result.errors) : 'Failed to submit. Please try again.');
                    console.error('Contact form error:', result);
                    showError(errorMsg);
                    setIsSubmitting(false);
                  }
                } catch (error: any) {
                  console.error('Contact form error:', error);
                  const errorMessage = error?.response?.data?.error || 
                                     error?.response?.data?.detail ||
                                     error?.message || 
                                     'Network error. Please try again later.';
                  showError(`Failed to submit: ${errorMessage}`);
                  setIsSubmitting(false);
                }
              }}
            >
              <div className={styles.formGroup}>
                <input type="text" name="name" placeholder="Full Name" className={styles.inputField} required disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <input type="text" name="pincode" placeholder="Pincode" className={styles.inputField} required disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <input type="tel" name="phone" placeholder="Phone Number" className={styles.inputField} required disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'SUBMIT'}
                </button>
              </div>
            </form>

            <div className={styles.visitBanner}>
              <strong>Visit Us In Person</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportButtons;

