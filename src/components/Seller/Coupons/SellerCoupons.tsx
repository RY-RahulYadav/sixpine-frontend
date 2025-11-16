import React, { useState, useEffect } from 'react';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import { showToast } from '../../Admin/utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order_amount: string;
  max_discount_amount: string | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
  one_time_use_per_user: boolean;
  is_valid_now: boolean;
  remaining_uses: number | null;
  created_at: string;
  updated_at: string;
}

const SellerCoupons: React.FC = () => {
  const api = useAdminAPI();
  const { showConfirmation } = useNotification();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '0',
    max_discount_amount: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
    usage_limit: '',
    one_time_use_per_user: false
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.getCoupons();
      setCoupons(response.data.results || response.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err.response?.data?.error || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        // For percentage, ensure it's a whole number (round to avoid precision issues)
        discount_value: formData.discount_type === 'percentage' 
          ? Math.round(parseFloat(formData.discount_value) || 0)
          : parseFloat(formData.discount_value) || 0,
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      };
      
      if (editingCoupon) {
        await api.updateCoupon(editingCoupon.id, submitData);
        showToast('Coupon updated successfully', 'success');
      } else {
        await api.createCoupon(submitData);
        showToast('Coupon created successfully', 'success');
      }
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save coupon', 'error');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const validFrom = new Date(coupon.valid_from).toISOString().slice(0, 16);
    const validUntil = new Date(coupon.valid_until).toISOString().slice(0, 16);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount || '',
      valid_from: validFrom,
      valid_until: validUntil,
      is_active: coupon.is_active,
      usage_limit: coupon.usage_limit?.toString() || '',
      one_time_use_per_user: coupon.one_time_use_per_user
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Coupon',
      message: 'Are you sure you want to delete this coupon?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }
    try {
      await api.deleteCoupon(id);
      showToast('Coupon deleted successfully', 'success');
      fetchCoupons();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete coupon', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '0',
      max_discount_amount: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
      usage_limit: '',
      one_time_use_per_user: false
    });
    setEditingCoupon(null);
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">local_offer</span>
          <div>
            <h1>Coupons</h1>
            <p className="admin-page-subtitle">Manage discount coupons</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="admin-modern-btn primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <span className="material-symbols-outlined">add</span>
            Create Coupon
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert error">
          <span className="material-symbols-outlined">error</span>
          <div className="admin-alert-content">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Valid From</th>
              <th>Valid Until</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>
                  <strong>{coupon.code}</strong>
                  {coupon.description && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {coupon.description}
                    </div>
                  )}
                </td>
                <td>
                  {coupon.discount_type === 'percentage' 
                    ? `${coupon.discount_value}%`
                    : `₹${coupon.discount_value}`}
                  {coupon.max_discount_amount && (
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      Max: ₹{coupon.max_discount_amount}
                    </div>
                  )}
                </td>
                <td>₹{coupon.min_order_amount}</td>
                <td>{new Date(coupon.valid_from).toLocaleDateString()}</td>
                <td>{new Date(coupon.valid_until).toLocaleDateString()}</td>
                <td>
                  {coupon.usage_limit 
                    ? `${coupon.used_count}/${coupon.usage_limit}`
                    : `${coupon.used_count} uses`}
                </td>
                <td>
                  <span className={`status-badge ${coupon.is_valid_now ? 'active' : 'inactive'}`}>
                    {coupon.is_valid_now ? 'Valid' : 'Invalid'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      className="admin-btn icon"
                      onClick={() => handleEdit(coupon)}
                      title="Edit"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      className="admin-btn icon danger"
                      onClick={() => handleDelete(coupon.id)}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && !loading && (
              <tr>
                <td colSpan={8} style={{ 
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
                    }}>local_offer</span>
                    <h3 style={{ margin: '0 0 8px 0', textAlign: 'center', color: '#555' }}>No coupons found</h3>
                    <p style={{ margin: 0, textAlign: 'center', color: '#888' }}>Create your first coupon to get started</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button
                className="admin-modal-close"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-body">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="SUMMER2024"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Coupon description"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Discount Type *</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="form-group">
                <label>Discount Value *</label>
                <input
                  type="number"
                  step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  value={formData.discount_value}
                  onChange={(e) => {
                    const value = e.target.value;
                    // For percentage, ensure it's a whole number
                    if (formData.discount_type === 'percentage') {
                      const numValue = parseInt(value) || 0;
                      setFormData({ ...formData, discount_value: numValue.toString() });
                    } else {
                      setFormData({ ...formData, discount_value: value });
                    }
                  }}
                  required
                  placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                />
                {formData.discount_type === 'percentage' && (
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Enter percentage value (0-100)
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Minimum Order Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Discount Amount (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.max_discount_amount}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                  placeholder="Leave empty for no limit"
                />
              </div>
              <div className="form-group">
                <label>Valid From *</label>
                <input
                  type="datetime-local"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Valid Until *</label>
                <input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Usage Limit (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.one_time_use_per_user}
                    onChange={(e) => setFormData({ ...formData, one_time_use_per_user: e.target.checked })}
                  />
                  One-time use per user
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCoupons;

