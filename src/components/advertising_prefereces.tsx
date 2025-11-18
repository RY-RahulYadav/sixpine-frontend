import { useState, useEffect } from 'react';
import styles from "../styles/global_selling.module.css";
import { FaBullhorn, FaCheck, FaCog } from "react-icons/fa";
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';

function AdvertisingPreferences() {
  const { state } = useApp();
  const { showSuccess, showError } = useNotification();
  const [advertisingEnabled, setAdvertisingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      
      // Default to true if not set
      setAdvertisingEnabled(mergedProfile.advertising_enabled !== false);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setAdvertisingEnabled(true); // Default to enabled
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    try {
      setSaving(true);
      await authAPI.updateProfile({ advertising_enabled: enabled });
      setAdvertisingEnabled(enabled);
      showSuccess('Advertising preferences updated successfully');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error updating preferences';
      showError(errorMsg);
      console.error('Update preferences error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.main}>
        <section className={styles.globalSection}>
          <div className={styles.container}>
            <div className={styles.row}>
              <div className={styles.col}>
                <p>Loading...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <section className={styles.globalSection}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.col}>
              
              <h2 className={styles.heading}>
                <FaCog style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Advertising Preferences
              </h2>

              <p className={styles.text}>
                We use your browsing and shopping activity to show you more relevant ads.
              </p>
              <p className={styles.text}>
                <b>Turn ON button:</b> Get personalized offers, product recommendations, and promotions.
              </p>
              <p className={styles.text}>
                <b>Turn OFF button:</b> You'll still see ads, but they may be less relevant.
              </p>

              {/* Toggle Button */}
              <div className={styles.toggleCard}>
                <div className={styles.toggleCardContent}>
                  <div className={styles.toggleCardText}>
                    <h3 className={styles.toggleCardTitle}>
                      Personalized Advertising
                    </h3>
                    <p className={styles.toggleCardDescription}>
                      {advertisingEnabled 
                        ? 'You will see personalized ads based on your browsing and shopping activity.'
                        : 'You will see generic ads. Personalized ads are disabled.'}
                    </p>
                  </div>
                  <label className={styles.toggleSwitch} style={{ cursor: saving ? 'not-allowed' : 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={advertisingEnabled}
                      onChange={(e) => handleToggle(e.target.checked)}
                      disabled={saving}
                    />
                    <span className={`${styles.toggleSlider} ${advertisingEnabled ? styles.active : ''} ${saving ? styles.disabled : ''}`}></span>
                  </label>
                </div>
                {saving && (
                  <p className={styles.toggleSaving}>
                    Saving...
                  </p>
                )}
              </div>

              <h3 className={styles.subheading}>
                <FaBullhorn style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Advertising Preferences
              </h3>

              <p className={styles.text}>
                We respect your privacy and want to give you full control over how we use your information for advertising.
              </p>

              <h3 className={styles.subheading}>1. Personalized Ads</h3>
              <p className={styles.text}>
                <b>Personalized ads</b> are tailored to your interests based on your browsing and shopping activity...
              </p>

              <h3 className={styles.subheading}>2. Non-Personalized Ads</h3>
              <p className={styles.text}>
                If you opt out of personalized ads, you will still see advertisements...
              </p>

              <h3 className={styles.subheading}>3. How We Use Your Data</h3>
              <ul className={styles.list}>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Browsing history</b> on our website/app</li>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Demographic information</b> (age group, location, device type)</li>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Interactions</b> with promotions and campaigns</li>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Manage cookie preferences</b> to control data collection for ads</li>
              </ul>

              <h3 className={styles.subheading}>4. Your Choices</h3>
              <ul className={styles.list}>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Opt in or out</b> of personalized advertising...</li>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Request deletion</b> of your advertising data...</li>
              </ul>

              <h3 className={styles.subheading}>5. Third-Party Advertising Partners</h3>
              <p className={styles.text}>
                We may work with trusted partners (e.g., Google, Meta, ad networks)...
              </p>

              <h3 className={styles.subheading}>6. Why You Still See Ads After Opt Out</h3>
              <p className={styles.text}>
                Even if you turn off personalized ads, you may still see...
              </p>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdvertisingPreferences;
