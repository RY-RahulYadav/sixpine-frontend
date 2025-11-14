import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileSection.module.css';
import { authAPI, productAPI } from '../services/api';
import { useApp } from '../context/AppContext';

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
}

interface UserProfile {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_joined?: string;
}

const ProfileSection: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setSubcategories] = useState<Subcategory[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [, setLoading] = useState(true);
  
  // Accordion states
  const [accountDetailOpen, setAccountDetailOpen] = useState(true); // Open by default
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<number[]>([]);
  
  // Form states
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      // Handle both response formats: {user: {...}} or direct user object
      const profile = response.data.user || response.data;
      
      // Merge with user from context/localStorage as fallback
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
        first_name: profile?.first_name || userFromStorage?.first_name || '',
        last_name: profile?.last_name || userFromStorage?.last_name || '',
        email: profile?.email || userFromStorage?.email || '',
        username: profile?.username || userFromStorage?.username || '',
        phone: profile?.phone || profile?.mobile || userFromStorage?.phone || userFromStorage?.mobile || '',
      };
      
      setUserProfile(mergedProfile);
      setEditFormData({
        first_name: mergedProfile.first_name || '',
        last_name: mergedProfile.last_name || '',
        email: mergedProfile.email || '',
        phone: mergedProfile.phone || ''
      });
      
      // Load saved interests - always set, even if empty
      if (profile?.interests) {
        if (Array.isArray(profile.interests)) {
          setInterests(profile.interests);
        } else if (typeof profile.interests === 'string') {
          try {
            const parsed = JSON.parse(profile.interests);
            setInterests(Array.isArray(parsed) ? parsed : []);
          } catch {
            setInterests(profile.interests.split(',').map((i: string) => i.trim()).filter(Boolean));
          }
        } else {
          setInterests([]);
        }
      } else {
        setInterests([]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage user
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const userFromStorage = JSON.parse(stored);
          setUserProfile({
            username: userFromStorage.username || '',
            email: userFromStorage.email || '',
            first_name: userFromStorage.first_name || '',
            last_name: userFromStorage.last_name || '',
          });
          setEditFormData({
            first_name: userFromStorage.first_name || '',
            last_name: userFromStorage.last_name || '',
            email: userFromStorage.email || '',
            phone: userFromStorage.phone || ''
          });
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      const cats = response.data.results || response.data || [];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await productAPI.getSubcategories();
      const subcats = response.data.results || response.data || [];
      setSubcategories(subcats);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await authAPI.updateProfile(editFormData);
      // Update localStorage user if response includes user data
      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      await fetchUserProfile();
      setShowEditProfile(false);
      alert('Profile updated successfully');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error updating profile';
      alert(errorMsg);
      console.error('Update profile error:', error);
    }
  };

  const handleChangePassword = async () => {
    if (passwordFormData.new_password !== passwordFormData.new_password_confirm) {
      alert('New passwords do not match');
      return;
    }
    if (passwordFormData.new_password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    try {
      await authAPI.changePassword(passwordFormData);
      setShowChangePassword(false);
      setPasswordFormData({ old_password: '', new_password: '', new_password_confirm: '' });
      alert('Password changed successfully');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data?.old_password?.[0] || 'Error changing password';
      alert(errorMsg);
      console.error('Change password error:', error);
    }
  };

  const handleOpenCategoryModal = () => {
    // Get currently selected category IDs based on interests
    const currentCategoryIds = categories
      .filter(cat => interests.includes(cat.name))
      .map(cat => cat.id);
    setTempSelectedCategories(currentCategoryIds);
    setShowCategoryModal(true);
  };

  const handleCategoryModalToggle = (categoryId: number) => {
    setTempSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSaveCategoryModal = async () => {
    // Convert selected category IDs to category names for interests
    const selectedCategoryNames = tempSelectedCategories
      .map(id => categories.find(cat => cat.id === id)?.name)
      .filter(Boolean) as string[];
    
    // Update interests with selected category names
    const updatedInterests = [...new Set(selectedCategoryNames)];
    setInterests(updatedInterests);
    setShowCategoryModal(false);
    
    // Auto-save to backend
    try {
      const updateData: any = {
        interests: updatedInterests
      };
      await authAPI.updateProfile(updateData);
      await fetchUserProfile(); // Refresh profile data
    } catch (error: any) {
      console.error('Error saving categories:', error);
      alert('Error saving categories. Please try again.');
    }
  };

  const handleRemoveInterest = async (interest: string) => {
    const updatedInterests = interests.filter(i => i !== interest);
    setInterests(updatedInterests);
    
    // Auto-save to backend
    try {
      const updateData: any = {
        interests: updatedInterests
      };
      await authAPI.updateProfile(updateData);
      await fetchUserProfile(); // Refresh profile data
    } catch (error: any) {
      console.error('Error removing interest:', error);
      alert('Error removing interest. Please try again.');
    }
  };

  const handleSavePreferences = async () => {
    try {
      const updateData: any = {
        // Always include interests field, even if empty, to ensure they're saved/cleared in backend
        interests: interests
      };
      
      await authAPI.updateProfile(updateData);
      await fetchUserProfile(); // Refresh profile data
      alert('Preferences saved successfully');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error saving preferences';
      alert(errorMsg);
      console.error('Save preferences error:', error);
    }
  };

  const displayName = userProfile.first_name && userProfile.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile.username || 'User';

  return (
    <div className={styles['sx-profile-hub-container']}>
      <div className={`${styles['sx-profile-header']} ${styles['sx-desktop']} ${styles['sx-lop-header']}`}>
        <img
          alt="Profile image"
          className={`${styles['sx-profile-avatar']} ${styles['sx-desktop']}`}
          src="https://m.media-amazon.com/images/G/01/IdentityAvatarService/Prod/DefaultAvatars/identity-avatar-head-n-shoulder-default-299BD1.png"
        />
        <div className={`${styles['sx-profile-name-container']} ${styles['sx-desktop']}`}>
          <div className={`${styles['sx-profile-name']} ${styles['sx-desktop']}`}>{displayName}</div>
          <span className={styles['sx-edit-profile']}>
            <button 
              className={styles['sx-edit-pencil-icon-button']}
              onClick={() => navigate('/login-security')}
            >
                <svg
                  aria-label="Edit your details"
                  className={styles['sx-edit-name-icon']}
                  fill="none"
                  height="20"
                  role="img"
                  viewBox="0 0 20 20"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg">
                  <title>Edit your details</title>
                  <path
                    d="M17.23 4.23001L15.77 2.77001C15.2997 2.30225 14.6633 2.03967 14 2.03967C13.3367 2.03967 12.7003 2.30225 12.23 2.77001L2.6 12.41C2.40983 12.5964 2.25879 12.8189 2.15576 13.0645C2.05273 13.31 1.99977 13.5737 2 13.84V17C2 17.2652 2.10536 17.5196 2.29289 17.7071C2.48043 17.8947 2.73478 18 3 18H6.18C6.70958 17.9978 7.21665 17.7856 7.59 17.41L17.23 7.77001C17.4628 7.53778 17.6475 7.2619 17.7736 6.95818C17.8996 6.65445 17.9645 6.32885 17.9645 6.00001C17.9645 5.67117 17.8996 5.34557 17.7736 5.04184C17.6475 4.73812 17.4628 4.46224 17.23 4.23001ZM11.23 6.62001L13.4 8.79001L7.61 14.56L5.44 12.39L11.23 6.62001ZM6.18 16H4V13.82L6.2 16H6.18ZM15.82 6.35001L14.82 7.35001L12.62 5.21001L13.62 4.21001C13.7147 4.1207 13.8399 4.07095 13.97 4.07095C14.1001 4.07095 14.2253 4.1207 14.32 4.21001L15.79 5.68001C15.8771 5.76812 15.9285 5.88544 15.934 6.00923C15.9395 6.13303 15.8989 6.25447 15.82 6.35001Z"
                    fill="#0F1111"
                  />
                </svg>
              </button>
            </span>
                    </div>
        <button
          className={styles['sx-change-password-button']}
          onClick={() => navigate('/login-security')}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#ffd814',
            border: '1px solid #ffd814',
            borderRadius: '4px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Change Password
                        </button>
      </div>

      <div className={styles['sx-profile-hub-content']}>
        <div className={`${styles['sx-program-grid']} ${styles['sx-redesign']}`}>
          <div id="accordionSection">
            <div className={`${styles['sx-context-header']} ${styles['sx-desktop']}`}>
              <div aria-level={1} className={`${styles['sx-primary']} ${styles['sx-desktop']}`} role="heading">
                Your Profile
              </div>
              <div className={`${styles['sx-secondary']} ${styles['sx-desktop']}`}>
                Your profile preferences help us personalise recommendations for you.
              </div>
            </div>

            <div className={`${styles['sx-profile-hub-category']} ${styles['sx-desktop']}`} id="sl_preferences">
              <div className={styles['sx-content']}>
                <div className={`${styles['sx-section-header']} ${styles['sx-desktop']}`} id="general-section-header">
                  <div
                    aria-label="About you"
                    aria-level={3}
                    className={`${styles['sx-primary']} ${styles['sx-desktop']}`}
                    role="heading">
                    About you
                  </div>
                </div>

                <div className={styles['sx-profile-hub-attributes-section']}>
                  <div className={styles['sx-profile-hub-attributes-data-list']}>
                    <div id="personal-info">
                      <div className={styles['sx-accordion']} data-orientation="vertical">
                        {/* Account Detail */}
                        <div className={`${styles['sx-accordion-item']}`} data-orientation="vertical" data-state={accountDetailOpen ? "open" : "closed"}>
                          <h3 className={`${styles['sx-accordion-header']}`} data-orientation="vertical" data-state={accountDetailOpen ? "open" : "closed"}>
                            <button
                              className={`${styles['sx-accordion-trigger']} ${styles['sx-desktop']}`}
                              onClick={() => setAccountDetailOpen(!accountDetailOpen)}
                              type="button">
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-desktop']}`}>Account Detail</div>
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-preview']} ${styles['sx-desktop']}`}>
                                <span>{userProfile.email || '--'}</span>
                              </div>
                              <svg 
                                aria-hidden="true" 
                                className={styles['sx-chevron']} 
                                fill="none" 
                                height="12" 
                                viewBox="0 0 15 12" 
                                width="15" 
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ transform: accountDetailOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                              >
                                <path clipRule="evenodd" d="M0.5 3.48303L7.494 11L14.488 3.48303L13.116 2.00903L7.494 8.05103L1.872 2.00903L0.5 3.48303Z" fill="#0F1111" fillRule="evenodd" />
                              </svg>
                            </button>
                          </h3>
                          {accountDetailOpen && (
                            <div className={styles['sx-accordion-content']} style={{ padding: '16px', borderTop: '1px solid #d5d9d9' }}>
                              <div style={{ marginBottom: '12px' }}>
                                <strong>Email:</strong> {userProfile.email || '--'}
                        </div>
                              <div style={{ marginBottom: '12px' }}>
                                <strong>Username:</strong> {userProfile.username || '--'}
                              </div>
                              <div style={{ marginBottom: '12px' }}>
                                <strong>Phone:</strong> {userProfile.phone || '--'}
                        </div>
                              <div style={{ marginBottom: '12px' }}>
                                <strong>Member since:</strong> {userProfile.date_joined ? new Date(userProfile.date_joined).toLocaleDateString() : '--'}
                      </div>
                    </div>
                          )}
                </div>


                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests Section */}
                <div style={{ margin: '24px 0 0 0' }}>
                  <div style={{ border: '1px solid #d5d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', padding: '16px', marginBottom: 8, background: '#f7fafa' }}>
                    <span style={{ fontWeight: 700, fontSize: 20, marginRight: 16 }}>Interests</span>
                    <button
                      onClick={handleOpenCategoryModal}
                      style={{
                        padding: '8px 16px',
                        background: '#ffd814',
                        border: '1px solid #ffd814',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginLeft: 'auto'
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className={styles['sx-pill-drawer']} role="group">
                  <div className={styles['sx-pill-drawer-label']}>
                    <div className={`${styles['sx-inline-header']} ${styles['sx-desktop']}`} id="suggested-interests-section-header">
                      <div aria-label="Your interests" aria-level={3} className={`${styles['sx-primary']} ${styles['sx-desktop']}`} role="heading">Your interests</div>
                      <div className={styles['sx-mako-description'] + ' ' + styles['sx-desktop']}>Select interests to get personalised recommendations</div>
                    </div>
                  </div>
                  <ul className={styles['sx-pill-drawer-content']}>
                    {interests.map((interest, index) => (
                      <li key={index}>
                        <button 
                          className={styles['sx-pill-container']}
                          onClick={() => handleRemoveInterest(interest)}
                        >
                          <span style={{fontWeight:600,marginRight:4}}>×</span>{interest}
                        </button>
                      </li>
                    ))}
                    {interests.length === 0 && (
                      <li style={{ padding: '8px', color: '#666' }}>No interests added yet</li>
                    )}
                  </ul>
                </div>

                <div style={{marginTop:12}}>
                  <button 
                    onClick={handleSavePreferences}
                    style={{background:'#ffd814',border:'1px solid #ffd814',borderRadius:100,padding:'2px 18px',fontWeight:400,fontSize:15,color:'#0f1111',boxShadow:'0 2px 5px 0 rgba(213,217,217,0.5)', cursor: 'pointer'}}
                  >
                    Save
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '16px' }}>Select Categories</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryModalToggle(category.id)}
                  style={{
                    padding: '8px 16px',
                    border: tempSelectedCategories.includes(category.id) ? '2px solid #ffd814' : '1px solid #d5d9d9',
                    borderRadius: '100px',
                    background: tempSelectedCategories.includes(category.id) ? '#ffd814' : 'white',
                    cursor: 'pointer',
                    fontWeight: tempSelectedCategories.includes(category.id) ? 600 : 400
                  }}
                >
                  {category.name}
                </button>
              ))}
              {categories.length === 0 && (
                <div style={{ padding: '8px', color: '#666' }}>Loading categories...</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setTempSelectedCategories([]);
                }}
                style={{ padding: '8px 16px', border: '1px solid #d5d9d9', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategoryModal}
                style={{ padding: '8px 16px', background: '#ffd814', border: '1px solid #ffd814', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h2 style={{ marginBottom: '16px' }}>Edit Profile</h2>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>First Name</label>
              <input
                type="text"
                value={editFormData.first_name}
                onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Last Name</label>
              <input
                type="text"
                value={editFormData.last_name}
                onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Phone</label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditProfile(false)}
                style={{ padding: '8px 16px', border: '1px solid #d5d9d9', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                style={{ padding: '8px 16px', background: '#ffd814', border: '1px solid #ffd814', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h2 style={{ marginBottom: '16px' }}>Change Password</h2>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Old Password</label>
              <input
                type="password"
                value={passwordFormData.old_password}
                onChange={(e) => setPasswordFormData({...passwordFormData, old_password: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>New Password</label>
              <input
                type="password"
                value={passwordFormData.new_password}
                onChange={(e) => setPasswordFormData({...passwordFormData, new_password: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Confirm New Password</label>
              <input
                type="password"
                value={passwordFormData.new_password_confirm}
                onChange={(e) => setPasswordFormData({...passwordFormData, new_password_confirm: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordFormData({ old_password: '', new_password: '', new_password_confirm: '' });
                }}
                style={{ padding: '8px 16px', border: '1px solid #d5d9d9', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                style={{ padding: '8px 16px', background: '#ffd814', border: '1px solid #ffd814', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles['sx-footer-container']} />
    </div>
  );
};

export default ProfileSection;
           