import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';

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
              if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
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
            
            <div className="admin-card">
              <h3>User Preferences</h3>
              <div className="preferences-section">
                {/* Interest Preferences */}
                <div className="preference-group">
                  <h4>Interest Preferences</h4>
                  {user.interests && user.interests.length > 0 ? (
                    <div className="preference-tags">
                      {user.interests.map((interest, index) => (
                        <span key={index} className="preference-tag">{interest}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="preference-empty">No interests selected</p>
                  )}
                </div>

                {/* Advertising Preferences */}
                <div className="preference-group">
                  <h4>Advertising Preferences</h4>
                  <div className="preference-item">
                    <span className="preference-label">Personalized Ads:</span>
                    <span className={`preference-value ${user.advertising_enabled ? 'enabled' : 'disabled'}`}>
                      {user.advertising_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Communication Preferences */}
                <div className="preference-group">
                  <h4>Communication Preferences</h4>
                  <div className="preference-subgroup">
                    <h5>WhatsApp</h5>
                    <div className="preference-item">
                      <span className="preference-label">WhatsApp Enabled:</span>
                      <span className={`preference-value ${user.whatsapp_enabled ? 'enabled' : 'disabled'}`}>
                        {user.whatsapp_enabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="preference-item">
                      <span className="preference-label">Order Updates:</span>
                      <span className={`preference-value ${user.whatsapp_order_updates ? 'enabled' : 'disabled'}`}>
                        {user.whatsapp_order_updates ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="preference-item">
                      <span className="preference-label">Promotional Messages:</span>
                      <span className={`preference-value ${user.whatsapp_promotional ? 'enabled' : 'disabled'}`}>
                        {user.whatsapp_promotional ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <div className="preference-subgroup">
                    <h5>Email</h5>
                    <div className="preference-item">
                      <span className="preference-label">Promotional Emails:</span>
                      <span className={`preference-value ${user.email_promotional ? 'enabled' : 'disabled'}`}>
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