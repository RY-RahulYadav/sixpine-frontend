import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import '../../../styles/admin-theme.css';

interface AdminLog {
  id: number;
  user: number | null;
  user_email: string | null;
  user_name: string | null;
  action_type: string;
  model_name: string;
  object_id: number | null;
  object_repr: string;
  details: any;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState({
    action_type: '',
    model_name: '',
    user: '',
    date_from: '',
    date_to: '',
  });
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          ...filters
        };
        
        const response = await adminAPI.getLogs(params);
        const results = response.data.results || [];
        const count = response.data.count || 0;
        const pageSize = 20; // Default page size
        setLogs(results);
        setTotalPages(Math.ceil(count / pageSize) || 1);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin logs:', err);
        setError('Failed to load admin logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [currentPage, filters]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleSubmitFilters = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the actual fetching since we're tracking filters state
  };
  
  const getActionTypeClass = (actionType: string | undefined): string => {
    if (!actionType) return 'inactive';
    
    const action = actionType.toLowerCase();
    if (action === 'create' || action === 'add') return 'success';
    if (action === 'update' || action === 'edit' || action === 'modify') return 'info';
    if (action === 'delete' || action === 'remove') return 'error';
    if (action === 'view' || action === 'read') return 'secondary';
    if (action === 'login' || action === 'logout' || action === 'auth') return 'warning';
    return 'secondary';
  };

  const getActionIcon = (actionType: string | undefined): string => {
    if (!actionType) return 'info';
    
    const action = actionType.toLowerCase();
    if (action === 'create' || action === 'add') return 'add_circle';
    if (action === 'update' || action === 'edit' || action === 'modify') return 'edit';
    if (action === 'delete' || action === 'remove') return 'delete';
    if (action === 'view' || action === 'read') return 'visibility';
    if (action === 'login') return 'login';
    if (action === 'logout') return 'logout';
    return 'info';
  };
  
  if (loading && logs.length === 0) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading logs...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">history</span>
          <div>
            <h1>System Logs</h1>
            <p className="admin-page-subtitle">View activity logs and system events</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="admin-filters-bar">
        <form onSubmit={handleSubmitFilters} className="admin-filters-form">
          <select
            name="action_type"
            value={filters.action_type}
            onChange={handleFilterChange}
            className="admin-form-select"
          >
            <option value="">All Action Types</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="view">View</option>
          </select>
          
          <select
            name="model_name"
            value={filters.model_name}
            onChange={handleFilterChange}
            className="admin-form-select"
          >
            <option value="">All Models</option>
            <option value="Product">Products</option>
            <option value="Order">Orders</option>
            <option value="User">Users</option>
            <option value="Category">Categories</option>
          </select>
          
          <input
            type="text"
            name="user"
            placeholder="Filter by user"
            value={filters.user}
            onChange={handleFilterChange}
            className="admin-form-input"
          />
          
          <div className="date-range-filter">
            <input
              type="date"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              className="admin-form-input"
            />
            <span>to</span>
            <input
              type="date"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              className="admin-form-input"
            />
          </div>
          
          <button type="submit" className="admin-modern-btn primary">
            <span className="material-symbols-outlined">filter_alt</span>
            Apply
          </button>
          <button 
            type="button"
            className="admin-modern-btn secondary"
            onClick={() => {
              setFilters({
                action_type: '',
                model_name: '',
                user: '',
                date_from: '',
                date_to: '',
              });
            }}
          >
            <span className="material-symbols-outlined">filter_alt_off</span>
            Reset
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
      
      {/* Logs table */}
      <div className="admin-modern-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-modern-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Timestamp</th>
                <th style={{ width: '150px' }}>User</th>
                <th style={{ width: '120px' }}>Action</th>
                <th style={{ width: '120px' }}>Model</th>
                <th>Object</th>
                <th style={{ width: '100px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #ff6f00, #ff9e40)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {(log.user_name || log.user_email || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '13px' }}>
                        {log.user_name || log.user_email || 'System'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`admin-status-badge ${getActionTypeClass(log.action_type)}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {getActionIcon(log.action_type)}
                      </span>
                      {log.action_type}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      background: '#f5f5f5', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {log.model_name}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.object_repr}
                    </div>
                  </td>
                  <td>
                    {(typeof log.details === 'string' ? log.details : JSON.stringify(log.details)).length > 0 && (
                      <button 
                        className="admin-modern-btn secondary icon-only"
                        onClick={() => {
                          const detailsText = typeof log.details === 'string' 
                            ? log.details 
                            : JSON.stringify(log.details, null, 2);
                          
                          // Create a better modal display
                          const modal = document.createElement('div');
                          modal.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0,0,0,0.7);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 10000;
                            padding: 20px;
                          `;
                          
                          const content = document.createElement('div');
                          content.style.cssText = `
                            background: white;
                            border-radius: 12px;
                            padding: 24px;
                            max-width: 600px;
                            max-height: 80vh;
                            overflow: auto;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                          `;
                          
                          content.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                              <h3 style="margin: 0; font-size: 18px; font-weight: 700;">Log Details</h3>
                              <button onclick="this.closest('[style*=fixed]').remove()" 
                                style="border: none; background: #f0f0f0; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <span class="material-symbols-outlined">close</span>
                              </button>
                            </div>
                            <pre style="background: #f9f9f9; padding: 16px; border-radius: 8px; overflow: auto; font-size: 12px; margin: 0;">${detailsText}</pre>
                          `;
                          
                          modal.appendChild(content);
                          modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                          document.body.appendChild(modal);
                        }}
                        title="View full details"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-state">
                      <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#ccc' }}>
                        history
                      </span>
                      <h3>No logs found</h3>
                      <p>System activity logs will appear here</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
          
          <div className="admin-pagination-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            <span style={{ margin: '0 8px', color: '#ddd' }}>|</span>
            Showing <strong>{logs.length}</strong> logs
          </div>
          
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

export default AdminLogs;