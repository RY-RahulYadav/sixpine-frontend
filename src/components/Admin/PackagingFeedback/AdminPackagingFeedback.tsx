import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface PackagingFeedback {
  id: number;
  user: number | null;
  user_email: string | null;
  user_name: string;
  feedback_type: 'general' | 'damaged' | 'excessive_packaging' | 'insufficient_packaging' | 'sustainability' | 'other';
  feedback_type_display: string;
  rating: number | null;
  was_helpful: boolean | null;
  message: string;
  order_id: string | null;
  product_id: number | null;
  email: string | null;
  name: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'closed';
  status_display: string;
  admin_notes: string | null;
  reviewed_by: number | null;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const AdminPackagingFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<PackagingFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter, typeFilter, searchTerm]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.feedback_type = typeFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await adminAPI.getPackagingFeedback(params);
      const data = response.data;
      if (Array.isArray(data)) {
        setFeedback(data);
      } else if (data && Array.isArray(data.results)) {
        setFeedback(data.results);
      } else {
        setFeedback([]);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching packaging feedback:', err);
      setError('Failed to load packaging feedback');
      showToast('Failed to load packaging feedback', 'error');
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id: number) => {
    const item = feedback.find(f => f.id === id);
    if (item) {
      setSelectedFeedback(id);
      setAdminNotes(item.admin_notes || '');
      setNewStatus(item.status);
      setShowDetailModal(true);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedFeedback || !newStatus) return;
    
    try {
      setProcessingId(selectedFeedback);
      await adminAPI.updatePackagingFeedbackStatus(selectedFeedback, newStatus, adminNotes);
      showToast('Feedback status updated successfully', 'success');
      setShowDetailModal(false);
      setSelectedFeedback(null);
      setAdminNotes('');
      setNewStatus('');
      fetchFeedback();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await adminAPI.deletePackagingFeedback(id);
      showToast('Feedback deleted successfully', 'success');
      fetchFeedback();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete feedback', 'error');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading packaging feedback...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>Packaging Feedback</h2>
        <p style={{ margin: 0, color: 'var(--admin-text-light)' }}>Manage customer packaging feedback</p>
      </div>

      {/* Filters */}
      <div className="admin-modern-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px', fontWeight: '600' }}>Search</label>
            <input
              type="text"
              placeholder="Search by message, email, name, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-form-input"
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px', fontWeight: '600' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-form-input"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px', fontWeight: '600' }}>Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="admin-form-input"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="damaged">Damaged Item</option>
              <option value="excessive_packaging">Excessive Packaging</option>
              <option value="insufficient_packaging">Insufficient Packaging</option>
              <option value="sustainability">Sustainability</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            onClick={() => {
              setStatusFilter('');
              setTypeFilter('');
              setSearchTerm('');
            }}
            className="admin-btn admin-btn-secondary"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Feedback List */}
      {error && (
        <div className="admin-error-state" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {error}
        </div>
      )}

      {feedback.length === 0 ? (
        <div className="admin-empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--admin-text-light)', marginBottom: 'var(--spacing-md)' }}>feedback</span>
          <p>No packaging feedback found</p>
        </div>
      ) : (
        <div className="admin-modern-card">
          <table className="admin-modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Type</th>
                <th>Rating</th>
                <th>Was Helpful</th>
                <th>Status</th>
                <th>Message Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id}>
                  <td data-label="Date">{formatDate(item.created_at)}</td>
                  <td data-label="User">
                    {item.user_email || item.email || 'Anonymous'}
                    {item.user_name && item.user_name !== (item.user_email || item.email) && (
                      <div style={{ fontSize: '12px', color: 'var(--admin-text-light)' }}>{item.user_name}</div>
                    )}
                  </td>
                  <td data-label="Type">
                    <span className="admin-status-badge info">{item.feedback_type_display}</span>
                  </td>
                  <td data-label="Rating">
                    {item.rating ? (
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <span key={num} style={{ color: num <= item.rating! ? '#FF6F00' : '#ddd' }}>★</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--admin-text-light)' }}>N/A</span>
                    )}
                  </td>
                  <td data-label="Was Helpful">
                    {item.was_helpful === null ? (
                      <span style={{ color: 'var(--admin-text-light)' }}>N/A</span>
                    ) : item.was_helpful ? (
                      <span className="admin-status-badge success">Yes</span>
                    ) : (
                      <span className="admin-status-badge error">No</span>
                    )}
                  </td>
                  <td data-label="Status">
                    <span className={`admin-status-badge ${
                      item.status === 'resolved' ? 'success' :
                      item.status === 'closed' ? 'info' :
                      item.status === 'reviewed' ? 'info' :
                      'warning'
                    }`}>
                      {item.status_display}
                    </span>
                  </td>
                  <td data-label="Message">
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.message.substring(0, 100)}{item.message.length > 100 ? '...' : ''}
                    </div>
                  </td>
                  <td data-label="Actions">
                    <div className="admin-action-buttons">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="admin-btn admin-btn-secondary"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="admin-btn admin-btn-danger"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="admin-modal-overlay" onClick={() => !processingId && setShowDetailModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-modal-header" style={{ padding: '24px 28px', borderBottom: '1px solid var(--admin-border-color)' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--admin-text-primary)' }}>Feedback Details</h3>
              <button
                onClick={() => !processingId && setShowDetailModal(false)}
                disabled={processingId !== null}
                style={{ 
                  padding: '8px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  cursor: processingId !== null ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: processingId !== null ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!processingId) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!processingId) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
                title="Close"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
              {(() => {
                const item = feedback.find(f => f.id === selectedFeedback);
                if (!item) return null;
                
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* User Information Section */}
                    <div style={{ 
                      padding: '20px', 
                      background: 'var(--admin-bg-secondary)', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--admin-border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--admin-primary)' }}>person</span>
                        <strong style={{ fontSize: '14px', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Information</strong>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--admin-text-primary)', marginBottom: '4px' }}>
                        {item.user_email || item.email || 'Anonymous'}
                      </div>
                      {item.user_name && (
                        <div style={{ fontSize: '14px', color: 'var(--admin-text-light)' }}>{item.user_name}</div>
                      )}
                      {item.user && (
                        <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginTop: '4px' }}>
                          Role: {item.user_email?.includes('admin') ? 'Admin User' : 'Customer'}
                        </div>
                      )}
                    </div>

                    {/* Feedback Details Grid */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '16px' 
                    }}>
                      <div style={{ 
                        padding: '16px', 
                        background: 'var(--admin-bg-secondary)', 
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--admin-border-color)'
                      }}>
                        <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feedback Type</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--admin-text-primary)' }}>
                          {item.feedback_type_display}
                        </div>
                      </div>
                      
                      {item.rating && (
                        <div style={{ 
                          padding: '16px', 
                          background: 'var(--admin-bg-secondary)', 
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--admin-border-color)'
                        }}>
                          <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--admin-text-primary)' }}>{item.rating}/5</span>
                            <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <span key={num} style={{ color: num <= item.rating! ? '#FF6F00' : '#ddd', fontSize: '14px' }}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {item.was_helpful !== null && (
                        <div style={{ 
                          padding: '16px', 
                          background: 'var(--admin-bg-secondary)', 
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--admin-border-color)'
                        }}>
                          <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Was Helpful</div>
                          <span className={`admin-status-badge ${item.was_helpful ? 'success' : 'error'}`} style={{ fontSize: '13px' }}>
                            {item.was_helpful ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      
                      <div style={{ 
                        padding: '16px', 
                        background: 'var(--admin-bg-secondary)', 
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--admin-border-color)'
                      }}>
                        <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</div>
                        <span className={`admin-status-badge ${
                          item.status === 'resolved' ? 'success' :
                          item.status === 'closed' ? 'info' :
                          item.status === 'reviewed' ? 'info' :
                          'warning'
                        }`} style={{ fontSize: '13px' }}>
                          {item.status_display}
                        </span>
                      </div>
                    </div>

                    {/* Order & Product Info */}
                    {(item.order_id || item.product_id) && (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '16px' 
                      }}>
                        {item.order_id && (
                          <div style={{ 
                            padding: '16px', 
                            background: 'var(--admin-bg-secondary)', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--admin-border-color)'
                          }}>
                            <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--admin-text-primary)' }}>{item.order_id}</div>
                          </div>
                        )}
                        {item.product_id && (
                          <div style={{ 
                            padding: '16px', 
                            background: 'var(--admin-bg-secondary)', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--admin-border-color)'
                          }}>
                            <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product ID</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--admin-text-primary)' }}>{item.product_id}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Section */}
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginBottom: '12px' 
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--admin-primary)' }}>message</span>
                        <strong style={{ fontSize: '14px', color: 'var(--admin-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</strong>
                      </div>
                      <div style={{ 
                        padding: '16px', 
                        background: 'var(--admin-bg-secondary)', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--admin-border-color)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        color: 'var(--admin-text-primary)',
                        minHeight: '80px'
                      }}>
                        {item.message || 'No message provided'}
                      </div>
                    </div>

                    {/* Review Information */}
                    {item.reviewed_by_email && (
                      <div style={{ 
                        padding: '16px', 
                        background: 'var(--admin-bg-secondary)', 
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--admin-border-color)'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          marginBottom: '8px' 
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--admin-primary)' }}>verified</span>
                          <strong style={{ fontSize: '14px', color: 'var(--admin-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reviewed By</strong>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--admin-text-primary)', marginBottom: '4px' }}>
                          {item.reviewed_by_email}
                        </div>
                        {item.reviewed_at && (
                          <div style={{ fontSize: '13px', color: 'var(--admin-text-light)' }}>
                            {formatDate(item.reviewed_at)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Notes (Existing) */}
                    {item.admin_notes && (
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          marginBottom: '12px' 
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--admin-primary)' }}>note</span>
                          <strong style={{ fontSize: '14px', color: 'var(--admin-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Notes</strong>
                        </div>
                        <div style={{ 
                          padding: '16px', 
                          background: 'var(--admin-bg-secondary)', 
                          borderRadius: 'var(--radius-md)', 
                          border: '1px solid var(--admin-border-color)',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6',
                          color: 'var(--admin-text-primary)'
                        }}>
                          {item.admin_notes}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div style={{ 
                      height: '1px', 
                      background: 'var(--admin-border-color)', 
                      margin: '8px 0' 
                    }} />

                    {/* Update Section */}
                    <div style={{ 
                      padding: '20px', 
                      background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.05) 0%, rgba(0, 123, 255, 0.02) 100%)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--admin-border-color)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginBottom: '20px' 
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--admin-primary)' }}>edit</span>
                        <strong style={{ fontSize: '14px', color: 'var(--admin-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Update Feedback</strong>
                      </div>
                      
                      <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="new_status" style={{ 
                          display: 'block', 
                          marginBottom: '10px', 
                          fontWeight: '600',
                          fontSize: '14px',
                          color: 'var(--admin-text-primary)'
                        }}>
                          Update Status
                        </label>
                        <select
                          id="new_status"
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="admin-form-input"
                          disabled={processingId !== null}
                          style={{ width: '100%', padding: '12px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="admin_notes" style={{ 
                          display: 'block', 
                          marginBottom: '10px', 
                          fontWeight: '600',
                          fontSize: '14px',
                          color: 'var(--admin-text-primary)'
                        }}>
                          Admin Notes
                        </label>
                        <textarea
                          id="admin_notes"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="admin-form-input"
                          rows={4}
                          placeholder="Add notes about this feedback..."
                          disabled={processingId !== null}
                          style={{ width: '100%', padding: '12px', resize: 'vertical', minHeight: '100px' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="admin-modal-footer" style={{ 
              padding: '24px 28px', 
              borderTop: '1px solid var(--admin-border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              background: 'var(--admin-bg-secondary)'
            }}>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="admin-btn admin-btn-primary"
                disabled={processingId !== null || !newStatus}
                style={{ 
                  padding: '12px 24px', 
                  minWidth: '160px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  backgroundColor: processingId !== null || !newStatus ? '#d1d5db' : 'var(--admin-button-primary)',
                  color: 'white',
                  border: 'none',
                  cursor: processingId !== null || !newStatus ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: processingId !== null || !newStatus ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!processingId && newStatus) {
                    e.currentTarget.style.backgroundColor = 'var(--admin-button-primary-hover)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!processingId && newStatus) {
                    e.currentTarget.style.backgroundColor = 'var(--admin-button-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {processingId !== null ? (
                  <>
                    <span className="spinner-small"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackagingFeedback;

