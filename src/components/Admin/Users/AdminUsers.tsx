import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean;
  date_joined: string;
  last_login: string;
  // Preferences
  interests?: string[];
  advertising_enabled?: boolean;
  whatsapp_enabled?: boolean;
  whatsapp_order_updates?: boolean;
  whatsapp_promotional?: boolean;
  email_promotional?: boolean;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirmation } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          search: searchTerm,
        };
        
        const response = await adminAPI.getUsers(params);
        setUsers(response.data.results);
        setTotalPages(Math.ceil(response.data.count / response.data.results.length));
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentPage, searchTerm]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleToggleActive = async (id: number, isActive: boolean) => {
    const user = users.find(u => u.id === id);
    if (user?.is_superuser) {
      showToast('Cannot deactivate superuser accounts', 'error');
      return;
    }
    
    try {
      await adminAPI.toggleUserActive(id);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === id ? { ...user, is_active: !isActive } : user
      ));
      
      showToast(`User ${!isActive ? 'activated' : 'suspended'} successfully`, 'success');
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to update user status';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    const user = users.find(u => u.id === id);
    if (user?.is_superuser) {
      showToast('Cannot delete superuser accounts', 'error');
      return;
    }
    
    const confirmed = await showConfirmation({
      title: 'Delete User',
      message: `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      showToast('User deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to delete user';
      showToast(errorMessage, 'error');
    }
  };
  
  
  if (loading && users.length === 0) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading customers...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">people</span>
          <div>
            <h1>Customers Management</h1>
            <p className="admin-page-subtitle">View and manage customer accounts</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="admin-filters-bar">
        <form onSubmit={handleSearch} className="admin-search-form">
          <div className="admin-search-input">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search customers by name, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-modern-btn secondary">
            Search
          </button>
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="admin-alert error">
          <span className="material-symbols-outlined">error</span>
          <div className="admin-alert-content">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Users table */}
      <div className="admin-modern-card">
        <table className="admin-modern-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td data-label="Username"><strong>{user.username}</strong></td>
                <td data-label="Name">{user.first_name} {user.last_name}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Joined">{new Date(user.date_joined).toLocaleDateString()}</td>
                <td data-label="Status">
                  <span className={`admin-status-badge ${user.is_active ? 'success' : 'error'}`}>
                    {user.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td data-label="Actions" className="actions">
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      className={`admin-modern-btn ${user.is_active ? 'warning' : 'success'} icon-only`}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      title={user.is_active ? 'Suspend user' : 'Activate user'}
                      disabled={user.is_superuser}
                    >
                      <span className="material-symbols-outlined">
                        {user.is_active ? 'block' : 'check_circle'}
                      </span>
                    </button>
                    <button
                      className="admin-modern-btn danger icon-only"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      title="Delete user"
                      disabled={user.is_superuser}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
                <td data-label="Details">
                  <button
                    className="admin-modern-btn secondary icon-only"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    title="View user details"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ 
                  textAlign: 'center', 
                  padding: '80px 20px',
                  verticalAlign: 'middle',
                  width: '100%'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    margin: '0 auto'
                  }}>
                    <span className="material-symbols-outlined" style={{ 
                      fontSize: '64px', 
                      color: '#ccc', 
                      marginBottom: '16px' 
                    }}>people</span>
                    <h3 style={{ margin: '0 0 8px 0', textAlign: 'center', color: '#555' }}>No customers found</h3>
                    <p style={{ margin: 0, textAlign: 'center', color: '#888' }}>Customer accounts will appear here once users register</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="admin-modern-btn secondary"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Previous
          </button>
          
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="admin-modern-btn secondary"
          >
            Next
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;