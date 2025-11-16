import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';

interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  date_joined: string;
  last_login: string | null;
  mobile?: string;
  phone_number?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
  };
  order_count?: number;
  total_spent?: number;
  // Preferences
  interests?: string[];
  advertising_enabled?: boolean;
  whatsapp_enabled?: boolean;
  whatsapp_order_updates?: boolean;
  whatsapp_promotional?: boolean;
  email_promotional?: boolean;
}

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showConfirmation } = useNotification();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await adminAPI.getUser(parseInt(id));
        setUser(response.data);
        
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [id]);
  
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="admin-error-container">
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
        <button 
          className="admin-btn"
          onClick={() => navigate('/admin/customers')}
        >
          Back to Users
        </button>
      </div>
    );
  }
  
  return (
    <div className="admin-user-detail">
      <div className="admin-header-actions">
        <div className="admin-header-with-back">
          <button 
            className="admin-back-button" 
            onClick={() => navigate('/admin/customers')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2>User Details</h2>
        </div>
        <div>
          <button
            className="admin-btn danger"
            onClick={() => {
              if (user?.is_superuser) {
                showToast('Cannot delete superuser accounts', 'error');
                return;
              }
              showConfirmation({
                title: 'Delete User',
                message: 'Are you sure you want to delete this user? This action cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                confirmButtonStyle: 'danger',
              }).then((confirmed) => {
                if (confirmed) {
                  adminAPI.deleteUser(parseInt(id!))
                    .then(() => {
                      showToast('User deleted successfully', 'success');
                      navigate('/admin/customers');
                    })
                    .catch((err: any) => {
                      console.error('Error deleting user:', err);
                      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to delete user';
                      showToast(errorMessage, 'error');
                    });
                }
              });
            }}
            disabled={user?.is_superuser}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            Delete User
          </button>
        </div>
      </div>
      
      {user && (
        <div className="admin-content-grid">
          <div className="admin-content-main">
            <div className="admin-card">
              <h3>User Information</h3>
              <div style={{ padding: '20px 0' }}>
                {/* Read-only user details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Username</label>
                    <div style={{ padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', color: '#333' }}>
                      {user.username || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Email</label>
                    <div style={{ padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', color: '#333' }}>
                      {user.email || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>First Name</label>
                    <div style={{ padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', color: '#333' }}>
                      {user.first_name || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Last Name</label>
                    <div style={{ padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', color: '#333' }}>
                      {user.last_name || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Mobile Number</label>
                    <div style={{ padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', color: '#333' }}>
                      {user.mobile || user.phone_number || 'N/A'}
                    </div>
                  </div>
                  
                  {/* Account Status */}
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                    <h4 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>Account Status</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#333' }}>
                          <strong>Active Account:</strong> {user.is_active ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#333' }}>
                          <strong>Admin Access:</strong> {user.is_staff ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#333' }}>
                          <strong>Superuser:</strong> {user.is_superuser ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#333' }}>
                          <strong>Verified:</strong> {user.is_verified ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="admin-content-sidebar">
            <div className="admin-card">
              <h3>Account Details</h3>
              <div className="account-stats">
                <div className="stat-item">
                  <label>Member Since:</label>
                  <span>{new Date(user.date_joined).toLocaleDateString()}</span>
                </div>
                <div className="stat-item">
                  <label>Last Login:</label>
                  <span>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="stat-item">
                  <label>Orders:</label>
                  <span>{user.order_count || 0}</span>
                </div>
                <div className="stat-item">
                  <label>Total Spent:</label>
                  <span>${typeof user.total_spent === 'number' ? user.total_spent.toFixed(2) : (user.total_spent ? parseFloat(String(user.total_spent)).toFixed(2) : '0.00')}</span>
                </div>
              </div>
            </div>
            
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ 
                padding: '20px 24px',
                color: 'black'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: 600,
                  color: 'black'
                }}>
                  User Preferences
                </h3>
              </div>
              
              <div style={{ padding: '24px' }}>
                {/* Interest Preferences */}
                <div style={{ 
                  marginBottom: '28px',
                  paddingBottom: '28px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '16px'
                  }}>
                    <span className="material-symbols-outlined" style={{ 
                      fontSize: '20px', 
                      color: 'var(--admin-primary)' 
                    }}>
                      favorite
                    </span>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: 'var(--admin-dark)',
                      margin: 0
                    }}>
                      Interest Preferences
                    </h4>
                  </div>
                  {user.interests && user.interests.length > 0 ? (
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '10px' 
                    }}>
                      {user.interests.map((interest, index) => (
                        <span 
                          key={index} 
                          style={{ 
                            padding: '8px 16px',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '20px',
                            fontSize: '13px',
                            color: 'var(--admin-primary)',
                            border: '1px solid #bfdbfe',
                            fontWeight: 500
                          }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px dashed #d1d5db'
                    }}>
                      <span style={{ 
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        No interests selected
                      </span>
                    </div>
                  )}
                </div>

                {/* Advertising Preferences */}
                <div style={{ 
                  marginBottom: '28px',
                  paddingBottom: '28px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '16px'
                  }}>
                    <span className="material-symbols-outlined" style={{ 
                      fontSize: '20px', 
                      color: '#f97316' 
                    }}>
                      campaign
                    </span>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: 'var(--admin-dark)',
                      margin: 0
                    }}>
                      Advertising Preferences
                    </h4>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#374151',
                      fontWeight: 500
                    }}>
                      Personalized Ads
                    </span>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '13px',
                        fontWeight: 600,
                        color: user.advertising_enabled ? '#059669' : '#6b7280',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        backgroundColor: user.advertising_enabled ? '#d1fae5' : '#f3f4f6',
                        border: `1px solid ${user.advertising_enabled ? '#10b981' : '#d1d5db'}`
                      }}>
                        {user.advertising_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Communication Preferences */}
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <span className="material-symbols-outlined" style={{ 
                      fontSize: '20px', 
                      color: '#f97316' 
                    }}>
                      notifications
                    </span>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: 'var(--admin-dark)',
                      margin: 0
                    }}>
                      Communication Preferences
                    </h4>
                  </div>
                  
                  {/* WhatsApp Subsection */}
                  <div style={{ 
                    marginBottom: '24px',
                    padding: '16px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '10px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <span className="material-symbols-outlined" style={{ 
                        fontSize: '18px', 
                        color: '#16a34a' 
                      }}>
                        chat
                      </span>
                      <h5 style={{ 
                        fontSize: '15px', 
                        fontWeight: 600, 
                        color: '#166534',
                        margin: 0
                      }}>
                        WhatsApp
                      </h5>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          WhatsApp Enabled
                        </span>
                        <span style={{ 
                          fontSize: '13px',
                          fontWeight: 600,
                          color: user.whatsapp_enabled ? '#059669' : '#6b7280',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: user.whatsapp_enabled ? '#d1fae5' : '#f3f4f6'
                        }}>
                          {user.whatsapp_enabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          Order Updates
                        </span>
                        <span style={{ 
                          fontSize: '13px',
                          fontWeight: 600,
                          color: user.whatsapp_order_updates ? '#059669' : '#6b7280',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: user.whatsapp_order_updates ? '#d1fae5' : '#f3f4f6'
                        }}>
                          {user.whatsapp_order_updates ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          Promotional Messages
                        </span>
                        <span style={{ 
                          fontSize: '13px',
                          fontWeight: 600,
                          color: user.whatsapp_promotional ? '#059669' : '#6b7280',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: user.whatsapp_promotional ? '#d1fae5' : '#f3f4f6'
                        }}>
                          {user.whatsapp_promotional ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Email Subsection */}
                  <div style={{ 
                    padding: '16px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '10px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <span className="material-symbols-outlined" style={{ 
                        fontSize: '18px', 
                        color: '#2563eb' 
                      }}>
                        mail
                      </span>
                      <h5 style={{ 
                        fontSize: '15px', 
                        fontWeight: 600, 
                        color: '#1e40af',
                        margin: 0
                      }}>
                        Email
                      </h5>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: 'white',
                      borderRadius: '6px'
                    }}>
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#374151',
                        fontWeight: 500
                      }}>
                        Promotional Emails
                      </span>
                      <span style={{ 
                        fontSize: '13px',
                        fontWeight: 600,
                        color: user.email_promotional ? '#059669' : '#6b7280',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: user.email_promotional ? '#d1fae5' : '#f3f4f6'
                      }}>
                        {user.email_promotional ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;