import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/communication-preferences.module.css";
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function CommunicationPreferences() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // WhatsApp preferences
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappOrderUpdates, setWhatsappOrderUpdates] = useState(true);
  const [whatsappPromotional, setWhatsappPromotional] = useState(true);
  
  // Email preferences
  const [emailPromotional, setEmailPromotional] = useState(true);
  
  // Original values for cancel functionality
  const [originalValues, setOriginalValues] = useState({
    whatsappEnabled: true,
    whatsappOrderUpdates: true,
    whatsappPromotional: true,
    emailPromotional: true,
  });

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      const profile = response.data.user || response.data;
      
      const userFromStorage = state.user || (() => {
        try {
          const stored = localStorage.getItem('user');
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }
      })();
      
      const mergedProfile = {
        ...userFromStorage,
        ...profile,
      };
      
      // Set preferences, defaulting to true if not set
      const prefs = {
        whatsappEnabled: mergedProfile.whatsapp_enabled !== false,
        whatsappOrderUpdates: mergedProfile.whatsapp_order_updates !== false,
        whatsappPromotional: mergedProfile.whatsapp_promotional !== false,
        emailPromotional: mergedProfile.email_promotional !== false,
      };
      
      setWhatsappEnabled(prefs.whatsappEnabled);
      setWhatsappOrderUpdates(prefs.whatsappOrderUpdates);
      setWhatsappPromotional(prefs.whatsappPromotional);
      setEmailPromotional(prefs.emailPromotional);
      setOriginalValues(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authAPI.updateProfile({
        whatsapp_enabled: whatsappEnabled,
        whatsapp_order_updates: whatsappOrderUpdates,
        whatsapp_promotional: whatsappPromotional,
        email_promotional: emailPromotional,
      });
      
      // Update original values after successful save
      setOriginalValues({
        whatsappEnabled,
        whatsappOrderUpdates,
        whatsappPromotional,
        emailPromotional,
      });
      
      alert('Communication preferences updated successfully');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error updating preferences';
      alert(errorMsg);
      console.error('Update preferences error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setWhatsappEnabled(originalValues.whatsappEnabled);
    setWhatsappOrderUpdates(originalValues.whatsappOrderUpdates);
    setWhatsappPromotional(originalValues.whatsappPromotional);
    setEmailPromotional(originalValues.emailPromotional);
  };

  const handleChangeClick = () => {
    navigate('/login-security');
  };
  
  // Get masked phone number
  const getMaskedPhone = () => {
    const userFromStorage = state.user || (() => {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();
    const phone = userFromStorage?.mobile || '';
    if (phone && phone.length > 3) {
      return `91${phone.slice(-3)}`;
    }
    return '91•••';
  };
  
  // Get user email
  const getUserEmail = () => {
    const userFromStorage = state.user || (() => {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();
    return userFromStorage?.email || 'your-email@example.com';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Communication Preferences Centre</h2>
      <p className={styles.subtext}>
        We’d like to stay in touch, but only in ways that you find useful.
      </p>

      {/* WhatsApp Preferences */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>WhatsApp Preferences</h3>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>General Settings</span>
            <span>
              WhatsApp notifications are currently being sent to {getMaskedPhone()}{" "}
              <button
                className={styles.changeBtn}
                onClick={handleChangeClick}
              >
                Change
              </button>
            </span>
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input 
                type="checkbox" 
                checked={whatsappOrderUpdates}
                onChange={(e) => setWhatsappOrderUpdates(e.target.checked)}
                disabled={saving}
              />
              Key order updates, shipments, payments and more
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={whatsappPromotional}
                onChange={(e) => setWhatsappPromotional(e.target.checked)}
                disabled={saving}
              />
              Personalised deals, recommendations, sales events, and more
            </label>
            <p className={styles.hint}>
              You can turn off notifications on WhatsApp
            </p>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              className={styles.updateBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Email  Preferences */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Email Preferences</h3>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>General Settings</span>
            <span>
              Email notifications are being sent to {getUserEmail()}{" "}
              <button
                className={styles.changeBtn}
                onClick={handleChangeClick}
              >
                Change
              </button>
            </span>
          </div>

           <div className={styles.checkboxGroup}>
            <label>
              <input 
                type="checkbox" 
                checked={emailPromotional}
                onChange={(e) => setEmailPromotional(e.target.checked)}
                disabled={saving}
              />
              Promotional Emails
            </label>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              className={styles.updateBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}
