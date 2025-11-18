import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface DataRequest {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  request_type: 'orders' | 'addresses' | 'payment_options';
  request_type_display: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  status_display: string;
  file_path: string | null;
  requested_at: string;
  approved_at: string | null;
  approved_by: number | null;
  approved_by_email: string | null;
  completed_at: string | null;
  admin_notes: string | null;
}

const AdminDataRequests: React.FC = () => {
  const { showConfirmation } = useNotification();
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState<{ [key: number]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<number | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.request_type = typeFilter;
      
      const response = await adminAPI.getDataRequests(params);
      // Handle different response structures
      const data = response.data;
      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data && Array.isArray(data.results)) {
        setRequests(data.results);
      } else if (data && Array.isArray(data.data)) {
        setRequests(data.data);
      } else {
        setRequests([]);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data requests:', err);
      setError('Failed to load data requests');
      showToast('Failed to load data requests', 'error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setProcessingId(id);
      const response = await adminAPI.approveDataRequest(id);
      if (response.data.success) {
        showToast('Request approved and file generated successfully', 'success');
        fetchRequests();
      } else {
        showToast(response.data.error || 'Failed to approve request', 'error');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to approve request';
      showToast(errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setProcessingId(id);
      const notes = rejectNotes[id] || '';
      const response = await adminAPI.rejectDataRequest(id, notes);
      if (response.data.success) {
        showToast('Request rejected successfully', 'success');
        setShowRejectForm(null);
        setRejectNotes({ ...rejectNotes, [id]: '' });
        fetchRequests();
      } else {
        showToast(response.data.error || 'Failed to reject request', 'error');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to reject request';
      showToast(errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await adminAPI.downloadDataRequest(id);
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data_export_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('File downloaded successfully', 'success');
      fetchRequests();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to download file';
      showToast(errorMsg, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Data Request',
      message: 'Are you sure you want to delete this data request? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(id);
      await adminAPI.deleteDataRequest(id);
      showToast('Data request deleted successfully', 'success');
      fetchRequests();
      setSelectedRequests(selectedRequests.filter(reqId => reqId !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to delete request';
      showToast(errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRequests.length === 0) {
      showToast('Please select at least one request to delete', 'error');
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Delete Data Requests',
      message: `Are you sure you want to delete ${selectedRequests.length} data request(s)? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(-1); // Use -1 to indicate bulk operation
      const response = await adminAPI.bulkDeleteDataRequests(selectedRequests);
      if (response.data.success) {
        showToast(response.data.message || `Successfully deleted ${response.data.deleted_count} request(s)`, 'success');
        fetchRequests();
        setSelectedRequests([]);
      } else {
        showToast('Failed to delete requests', 'error');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to delete requests';
      showToast(errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRequests(requests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, id]);
    } else {
      setSelectedRequests(selectedRequests.filter(reqId => reqId !== id));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: { [key: string]: string } = {
      'pending': 'admin-status-badge warning',
      'approved': 'admin-status-badge success',
      'rejected': 'admin-status-badge error',
      'completed': 'admin-status-badge success',
    };
    return classes[status] || 'admin-status-badge';
  };

  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading data requests...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">description</span>
          <div>
            <h1>Data Requests</h1>
            <p className="admin-page-subtitle">Manage customer data export requests</p>
          </div>
        </div>
        {selectedRequests.length > 0 && (
          <div>
            <button
              className="admin-modern-btn danger"
              onClick={handleBulkDelete}
              disabled={processingId === -1}
            >
              <span className="material-symbols-outlined">delete</span>
              Delete Selected ({selectedRequests.length})
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="admin-filters-bar">
        <div className="admin-filters-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-form-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="admin-form-select"
          >
            <option value="">All Types</option>
            <option value="orders">Orders</option>
            <option value="addresses">Addresses</option>
            <option value="payment_options">Payment Options</option>
          </select>
        </div>
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

      {/* Data Requests table */}
      {requests.length === 0 ? (
        <div className="admin-modern-card">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            textAlign: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ 
              fontSize: '64px', 
              color: '#ccc', 
              marginBottom: '16px' 
            }}>description</span>
            <h3 style={{ margin: '0 0 8px 0', color: '#555' }}>No data requests found</h3>
            <p style={{ margin: 0, color: '#888' }}>Data requests will appear here once customers submit requests</p>
          </div>
        </div>
      ) : (
        <div className="admin-modern-card">
          <table className="admin-modern-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>User</th>
                <th>Request Type</th>
                <th>Status</th>
                <th>Requested At</th>
                <th>Approved At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(requests) && requests.map((request) => (
                <tr key={request.id}>
                  <td data-label="">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td data-label="User">
                    <div>
                      <div style={{ fontWeight: 600 }}>{request.user_name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{request.user_email}</div>
                    </div>
                  </td>
                  <td data-label="Request Type">{request.request_type_display}</td>
                  <td data-label="Status">
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status_display}
                    </span>
                  </td>
                  <td data-label="Requested At">{new Date(request.requested_at).toLocaleString()}</td>
                  <td data-label="Approved At">{request.approved_at ? new Date(request.approved_at).toLocaleString() : '-'}</td>
                  <td data-label="Actions">
                    <div className="admin-action-buttons">
                      {request.status === 'pending' && (
                        <>
                          <button
                            className="admin-modern-btn success icon-only"
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            title="Approve"
                          >
                            <span className="material-symbols-outlined">check</span>
                          </button>
                          <button
                            className="admin-modern-btn danger icon-only"
                            onClick={() => setShowRejectForm(showRejectForm === request.id ? null : request.id)}
                            disabled={processingId === request.id}
                            title="Reject"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </>
                      )}
                      {(request.status === 'approved' || request.status === 'completed') && (
                        <button
                          className="admin-modern-btn primary icon-only"
                          onClick={() => handleDownload(request.id)}
                          title="Download"
                        >
                          <span className="material-symbols-outlined">download</span>
                        </button>
                      )}
                      <button
                        className="admin-modern-btn danger icon-only"
                        onClick={() => handleDelete(request.id)}
                        disabled={processingId === request.id}
                        title="Delete"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    {showRejectForm === request.id && (
                      <div style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                        <textarea
                          placeholder="Rejection reason (optional)"
                          value={rejectNotes[request.id] || ''}
                          onChange={(e) => setRejectNotes({ ...rejectNotes, [request.id]: e.target.value })}
                          style={{
                            width: '100%',
                            minHeight: '60px',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            marginBottom: '8px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="admin-modern-btn danger"
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            {processingId === request.id ? 'Rejecting...' : 'Confirm Reject'}
                          </button>
                          <button
                            className="admin-modern-btn secondary"
                            onClick={() => {
                              setShowRejectForm(null);
                              setRejectNotes({ ...rejectNotes, [request.id]: '' });
                            }}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDataRequests;

