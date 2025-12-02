import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { useNotification } from '../../../context/NotificationContext';

interface ProductReview {
  id: number;
  product: number;
  product_title: string;
  product_slug: string;
  user: number;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  vendor_name: string;
}

const AdminReviewManagement: React.FC = () => {
  const { showError, showSuccess } = useNotification();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'pending', 'approved'

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const response = await adminAPI.getReviews(params);
      const data = response.data;
      setReviews(data.results || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to load reviews');
      showError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: number) => {
    try {
      const response = await adminAPI.approveReview(reviewId);
      if (response.data.success) {
        showSuccess('Review approved successfully');
        fetchReviews(); // Refresh the list
      } else {
        showError(response.data.message || 'Failed to approve review');
      }
    } catch (err: any) {
      console.error('Error approving review:', err);
      showError(err.response?.data?.message || 'Failed to approve review');
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      const response = await adminAPI.rejectReview(reviewId);
      if (response.data.success) {
        showSuccess('Review rejected successfully');
        fetchReviews(); // Refresh the list
      } else {
        showError(response.data.message || 'Failed to reject review');
      }
    } catch (err: any) {
      console.error('Error rejecting review:', err);
      showError(err.response?.data?.message || 'Failed to reject review');
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await adminAPI.deleteReview(reviewId);
      if (response.data.success) {
        showSuccess('Review deleted successfully');
        fetchReviews(); // Refresh the list
      } else {
        showError(response.data.message || 'Failed to delete review');
      }
    } catch (err: any) {
      console.error('Error deleting review:', err);
      showError(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleDeleteAll = async () => {
    const statusText = filterStatus === 'all' ? 'all reviews' : filterStatus === 'pending' ? 'all pending reviews' : 'all approved reviews';
    if (!window.confirm(`Are you sure you want to delete ${statusText}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await adminAPI.deleteAllReviews(filterStatus === 'all' ? undefined : filterStatus);
      if (response.data.success) {
        showSuccess(response.data.message || 'Reviews deleted successfully');
        fetchReviews(); // Refresh the list
      } else {
        showError(response.data.message || 'Failed to delete reviews');
      }
    } catch (err: any) {
      console.error('Error deleting reviews:', err);
      showError(err.response?.data?.message || 'Failed to delete reviews');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'tw-text-yellow-400' : 'tw-text-gray-300'}>
        ★
      </span>
    ));
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-green-100 tw-text-green-800">
          <span className="tw-mr-1">✓</span>
          Approved
        </span>
      );
    } else {
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-yellow-100 tw-text-yellow-800">
          <span className="tw-mr-1">⏳</span>
          Pending
        </span>
      );
    }
  };

  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;

  if (loading && reviews.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="tw-p-6">
      <div className="tw-mb-6 tw-flex tw-items-center tw-justify-between">
        <div>
          <h2 className="tw-text-2xl tw-font-bold tw-text-gray-900">Product Reviews</h2>
          <p className="tw-text-sm tw-text-gray-600 tw-mt-1">
            Manage and approve product reviews submitted by customers
          </p>
        </div>
        <div className="tw-flex tw-gap-4">
          <div className="tw-text-center tw-px-4 tw-py-2 tw-bg-yellow-50 tw-rounded-lg tw-border tw-border-yellow-200">
            <div className="tw-text-2xl tw-font-bold tw-text-yellow-700">{pendingCount}</div>
            <div className="tw-text-xs tw-text-yellow-600">Pending</div>
          </div>
          <div className="tw-text-center tw-px-4 tw-py-2 tw-bg-green-50 tw-rounded-lg tw-border tw-border-green-200">
            <div className="tw-text-2xl tw-font-bold tw-text-green-700">{approvedCount}</div>
            <div className="tw-text-xs tw-text-green-600">Approved</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="tw-mb-4 tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg">
          <p className="tw-text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="tw-mb-6 tw-bg-white tw-p-4 tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-flex tw-items-end tw-justify-between tw-gap-4">
        <div className="tw-max-w-xs">
          <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
        {reviews.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="tw-px-4 tw-py-2 tw-bg-red-600 tw-text-white tw-rounded-md hover:tw-bg-red-700 tw-transition-colors tw-flex tw-items-center tw-gap-2 tw-font-medium"
          >
            <span className="material-symbols-outlined tw-text-sm">delete_forever</span>
            Delete All {filterStatus !== 'all' ? filterStatus === 'pending' ? 'Pending' : 'Approved' : ''} Reviews
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-overflow-hidden">
        {reviews.length === 0 ? (
          <div className="tw-p-12 tw-text-center">
            <p className="tw-text-gray-500 tw-text-lg">No reviews found</p>
            <p className="tw-text-gray-400 tw-text-sm tw-mt-2">
              {filterStatus !== 'all' ? 'Try adjusting your filters' : 'Reviews will appear here once customers submit them'}
            </p>
          </div>
        ) : (
          <div className="tw-divide-y tw-divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="tw-p-6 hover:tw-bg-gray-50 tw-transition-colors">
                <div className="tw-flex tw-items-start tw-justify-between">
                  <div className="tw-flex-1">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                      <div className="tw-flex tw-items-center tw-gap-1">
                        {renderStars(review.rating)}
                      </div>
                      {getStatusBadge(review.is_approved)}
                      {review.is_verified_purchase && (
                        <span className="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium tw-bg-blue-100 tw-text-blue-800">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    
                    {review.title && (
                      <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2">
                        {review.title}
                      </h3>
                    )}
                    
                    <p className="tw-text-gray-700 tw-mb-3">{review.comment}</p>
                    
                    <div className="tw-flex tw-flex-wrap tw-gap-4 tw-text-sm tw-text-gray-600">
                      <div>
                        <span className="tw-font-medium">Customer:</span> {review.user_name} ({review.user_email})
                      </div>
                      <div>
                        <span className="tw-font-medium">Product:</span>{' '}
                        <a 
                          href={`/products-details/${review.product_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tw-text-blue-600 hover:tw-text-blue-800 hover:tw-underline"
                        >
                          {review.product_title}
                        </a>
                      </div>
                      {review.vendor_name && review.vendor_name !== 'N/A' && (
                        <div>
                          <span className="tw-font-medium">Vendor:</span> {review.vendor_name}
                        </div>
                      )}
                      <div>
                        <span className="tw-font-medium">Date:</span>{' '}
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="tw-ml-4 tw-flex tw-flex-col tw-gap-2">
                    <div className="tw-flex tw-gap-2">
                      {!review.is_approved ? (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="tw-px-4 tw-py-2 tw-bg-green-600 tw-text-white tw-rounded-md hover:tw-bg-green-700 tw-transition-colors tw-flex tw-items-center tw-gap-2 tw-font-medium"
                        >
                          <span className="material-symbols-outlined tw-text-sm">check_circle</span>
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReject(review.id)}
                          className="tw-px-4 tw-py-2 tw-bg-orange-600 tw-text-white tw-rounded-md hover:tw-bg-orange-700 tw-transition-colors tw-flex tw-items-center tw-gap-2 tw-font-medium"
                        >
                          <span className="material-symbols-outlined tw-text-sm">cancel</span>
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="tw-px-4 tw-py-2 tw-bg-red-600 tw-text-white tw-rounded-md hover:tw-bg-red-700 tw-transition-colors tw-flex tw-items-center tw-gap-2 tw-font-medium"
                      >
                        <span className="material-symbols-outlined tw-text-sm">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewManagement;

