import React, { useState } from 'react';
import { orderAPI } from '../../services/api';

interface OrderItem {
  id: number;
  product: {
    id: number;
    title: string;
    main_image: string;
  };
  quantity: number;
  price: number;
}

interface ReturnRequestModalProps {
  orderId: string;
  orderItem: OrderItem;
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  orderId,
  orderItem,
  show,
  onHide,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [reasonDescription, setReasonDescription] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  // Get maximum date (30 days from today)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason || !pickupDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await orderAPI.submitReturnRequest({
        order_id: orderId,
        order_item: orderItem.id,
        reason,
        reason_description: reasonDescription,
        pickup_date: pickupDate
      });

      alert('Return request submitted successfully!');
      onSuccess();
      onHide();
      // Reset form
      setReason('');
      setReasonDescription('');
      setPickupDate('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Failed to submit return request';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onHide}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Request Return</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <img
                  src={orderItem.product.main_image || 'https://via.placeholder.com/150'}
                  alt={orderItem.product.title}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <p className="mt-2 mb-0"><strong>{orderItem.product.title}</strong></p>
                <p className="text-muted">Quantity: {orderItem.quantity}</p>
              </div>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <div className="mb-3">
                <label htmlFor="reason" className="form-label">Return Reason <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="damaged">Damaged</option>
                  <option value="defective">Defective</option>
                  <option value="incorrect">Incorrect Item</option>
                  <option value="not_as_described">Not as Described</option>
                  <option value="wrong_size">Wrong Size</option>
                  <option value="wrong_color">Wrong Color</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="reasonDescription" className="form-label">Additional Details</label>
                <textarea
                  className="form-control"
                  id="reasonDescription"
                  rows={3}
                  value={reasonDescription}
                  onChange={(e) => setReasonDescription(e.target.value)}
                  placeholder="Please provide more details about the return reason..."
                />
              </div>

              <div className="mb-3">
                <label htmlFor="pickupDate" className="form-label">Preferred Pickup Date <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  id="pickupDate"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={today}
                  max={maxDateStr}
                  required
                />
                <small className="form-text text-muted">Select a date between today and 30 days from now</small>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestModal;

