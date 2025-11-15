import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';

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

interface ReturnsListProps {
  onRequestReturn?: () => void;
}

const ReturnsList: React.FC<ReturnsListProps> = ({ onRequestReturn }) => {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getReturnRequests();
      setReturnRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching return requests:', error);
      setReturnRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, sellerApproval: boolean | null) => {
    if (sellerApproval === true) {
      return <span className="badge bg-success">Refund Approved</span>;
    } else if (sellerApproval === false) {
      return <span className="badge bg-danger">Rejected</span>;
    } else {
      return <span className="badge bg-warning">Pending Approval</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (returnRequests.length === 0) {
    return (
      <div className="text-center py-5">
        <h4>No Return Requests</h4>
        <p className="text-muted mb-4">You haven't submitted any return requests yet.</p>
        {onRequestReturn && (
          <button className="btn btn-primary" onClick={onRequestReturn}>
            Request a Return
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="returns-list">
      {returnRequests.map((returnRequest) => (
        <div key={returnRequest.id} className="order-card mb-4">
          <div className="order-header">
            <div className="order-header-row">
              <div className="order-info-group">
                <div className="info-item">
                  <span className="info-label">RETURN REQUESTED</span>
                  <span className="info-value">{formatDate(returnRequest.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">PICKUP DATE</span>
                  <span className="info-value">{formatDate(returnRequest.pickup_date)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">STATUS</span>
                  <span className="info-value">{getStatusBadge(returnRequest.status, returnRequest.seller_approval)}</span>
                </div>
                {returnRequest.refund_amount && (
                  <div className="info-item">
                    <span className="info-label">REFUND AMOUNT</span>
                    <span className="info-value">₹{returnRequest.refund_amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="order-id-group">
                <span className="order-id-label">
                  RETURN #{returnRequest.id}
                </span>
              </div>
            </div>
          </div>

          <div className="order-body">
            <div className="order-item">
              <div className="item-image-container">
                <img
                  src={returnRequest.product_image || 'https://via.placeholder.com/150'}
                  alt={returnRequest.product_title}
                  className="item-image"
                />
              </div>
              <div className="item-details">
                <h3 className="item-title">{returnRequest.product_title}</h3>
                <div className="item-status mt-3">
                  <p><strong>Reason:</strong> {returnRequest.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  {returnRequest.reason_description && (
                    <p><strong>Description:</strong> {returnRequest.reason_description}</p>
                  )}
                  {returnRequest.seller_notes && (
                    <p><strong>Seller Notes:</strong> {returnRequest.seller_notes}</p>
                  )}
                  {returnRequest.seller_approval === true && (
                    <div className="alert alert-success mt-3">
                      <strong>✓ Refund Approved</strong> - Your refund will be processed according to the refund timelines.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReturnsList;

