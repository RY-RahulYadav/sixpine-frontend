import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface ReturnRequest {
  id: number;
  order_id: string;
  order_item_id: number;
  product_title: string;
  product_image: string;
  reason: string;
  reason_description: string;
  pickup_date: string;
  status: string;
  seller_approval: boolean | null;
  seller_notes: string;
  refund_amount: number | null;
  customer_name: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
}

const SellerReturnRequests: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<boolean | null>(null);
  const [sellerNotes, setSellerNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getSellerReturnRequests();
      setReturnRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching return requests:', error);
      setReturnRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = (request: ReturnRequest, approve: boolean) => {
    setSelectedRequest(request);
    setApprovalStatus(approve);
    setSellerNotes(request.seller_notes || '');
    setShowModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!selectedRequest || approvalStatus === null) return;

    try {
      setProcessing(true);
      await orderAPI.approveReturnRequest(selectedRequest.id, {
        approval: approvalStatus,
        seller_notes: sellerNotes
      });
      showSuccess(`Return request ${approvalStatus ? 'approved' : 'rejected'} successfully!`);
      setShowModal(false);
      setSelectedRequest(null);
      fetchReturnRequests();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to update return request');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (_status: string, sellerApproval: boolean | null) => {
    if (sellerApproval === true) {
      return <span className="badge bg-success">Approved</span>;
    } else if (sellerApproval === false) {
      return <span className="badge bg-danger">Rejected</span>;
    } else {
      return <span className="badge bg-warning">Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredRequests = returnRequests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'pending') return request.seller_approval === null;
    if (filter === 'approved') return request.seller_approval === true;
    if (filter === 'rejected') return request.seller_approval === false;
    return true;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">assignment_return</span>
          <div>
            <h1>Return Requests</h1>
            <p className="admin-page-subtitle">Manage customer return requests</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({returnRequests.length})
        </button>
        <button
          className={`admin-tab-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({returnRequests.filter(r => r.seller_approval === null).length})
        </button>
        <button
          className={`admin-tab-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({returnRequests.filter(r => r.seller_approval === true).length})
        </button>
        <button
          className={`admin-tab-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({returnRequests.filter(r => r.seller_approval === false).length})
        </button>
      </div>

      {/* Return Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="admin-card">
          <div className="text-center py-5">
            <p className="text-muted">No return requests found</p>
          </div>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Pickup Date</th>
                <th>Status</th>
                <th>Refund Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={request.product_image || 'https://via.placeholder.com/50'}
                        alt={request.product_title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '500' }}>{request.product_title}</div>
                        <small className="text-muted">Order #{request.order_id.slice(0, 8)}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{request.customer_name}</div>
                      <small className="text-muted">{request.customer_email}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{request.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                      {request.reason_description && (
                        <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {request.reason_description.substring(0, 50)}
                          {request.reason_description.length > 50 ? '...' : ''}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(request.pickup_date)}</td>
                  <td>{getStatusBadge(request.status, request.seller_approval)}</td>
                  <td>
                    {request.refund_amount ? (
                      <strong>₹{request.refund_amount.toLocaleString()}</strong>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {request.seller_approval === null ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApproveReject(request, true)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleApproveReject(request, false)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {approvalStatus ? 'Approve' : 'Reject'} Return Request
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Product:</strong> {selectedRequest.product_title}
                </div>
                <div className="mb-3">
                  <strong>Customer:</strong> {selectedRequest.customer_name} ({selectedRequest.customer_email})
                </div>
                <div className="mb-3">
                  <strong>Reason:</strong> {selectedRequest.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                {selectedRequest.reason_description && (
                  <div className="mb-3">
                    <strong>Description:</strong> {selectedRequest.reason_description}
                  </div>
                )}
                <div className="mb-3">
                  <strong>Pickup Date:</strong> {formatDate(selectedRequest.pickup_date)}
                </div>
                {approvalStatus && (
                  <div className="mb-3">
                    <strong>Refund Amount:</strong> ₹{(selectedRequest.refund_amount || 0).toLocaleString()}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="sellerNotes" className="form-label">Seller Notes</label>
                  <textarea
                    className="form-control"
                    id="sellerNotes"
                    rows={3}
                    value={sellerNotes}
                    onChange={(e) => setSellerNotes(e.target.value)}
                    placeholder="Add any notes or comments..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${approvalStatus ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleSubmitApproval}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : approvalStatus ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerReturnRequests;

