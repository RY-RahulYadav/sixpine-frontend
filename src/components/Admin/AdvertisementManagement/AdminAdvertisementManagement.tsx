import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface Advertisement {
  id?: number;
  title: string;
  description: string;
  image: string;
  button_text: string;
  button_link: string;
  discount_percentage: number | null;
  is_active: boolean;
  display_order: number;
  valid_from: string | null;
  valid_until: string | null;
  is_valid_now?: boolean;
  created_at?: string;
  updated_at?: string;
}

const AdminAdvertisementManagement: React.FC = () => {
  const { showConfirmation } = useNotification();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAdvertisements();
      setAdvertisements(response.data.results || response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch advertisements');
      showToast('Failed to load advertisements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAd({
      title: '',
      description: '',
      image: '',
      button_text: 'Check Now',
      button_link: '',
      discount_percentage: null,
      is_active: true,
      display_order: advertisements.length,
      valid_from: null,
      valid_until: null,
    });
    setShowModal(true);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd({ ...ad });
    setShowModal(true);
  };

  const handleRemove = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Remove Advertisement',
      message: 'Are you sure you want to remove this advertisement?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await adminAPI.deleteAdvertisement(id);
      showToast('Advertisement removed successfully', 'success');
      fetchAdvertisements();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to remove advertisement', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    if (!editingAd.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    if (!editingAd.image.trim()) {
      showToast('Image URL is required', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingAd.id) {
        await adminAPI.updateAdvertisement(editingAd.id, editingAd);
        showToast('Advertisement updated successfully', 'success');
      } else {
        await adminAPI.createAdvertisement(editingAd);
        showToast('Advertisement created successfully', 'success');
      }
      setShowModal(false);
      setEditingAd(null);
      fetchAdvertisements();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save advertisement', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingAd(null);
  };

  const handleChange = (field: keyof Advertisement, value: any) => {
    if (!editingAd) return;
    setEditingAd({ ...editingAd, [field]: value });
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading advertisements...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <h1 className="admin-page-title">
            <span className="material-symbols-outlined">campaign</span>
            Advertisement Management
          </h1>
          <p className="admin-page-subtitle">
            Manage advertisements displayed on product detail pages.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="admin-modern-btn primary"
        >
          <span className="material-symbols-outlined">add</span>
          Add Advertisement
        </button>
      </div>

      {error && !advertisements.length && (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">
            <span className="material-symbols-outlined">error</span>
          </div>
          <h3 className="admin-empty-title">{error}</h3>
          <button onClick={fetchAdvertisements} className="admin-modern-btn primary">
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </button>
        </div>
      )}

      <div className="admin-content-grid">
        {advertisements.map((ad, index) => (
          <div key={ad.id || index} className="admin-card">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
              <div className="tw-flex tw-items-center tw-gap-2">
                <span className="material-symbols-outlined tw-text-pink-600">campaign</span>
                <h3 className="tw-font-bold tw-text-lg">Advertisement {index + 1}</h3>
              </div>
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => ad.id && handleRemove(ad.id)}
              >
                <span className="material-symbols-outlined">delete</span>
                Remove
              </button>
            </div>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="form-group">
                <label>Title*</label>
                <input
                  type="text"
                  value={ad.title}
                  readOnly
                  className="tw-w-full"
                />
              </div>
              <div className="form-group">
                <label>Description*</label>
                <input
                  type="text"
                  value={ad.description}
                  readOnly
                  className="tw-w-full"
                />
              </div>
              <div className="form-group">
                <label>Discount Percentage</label>
                <input
                  type="number"
                  value={ad.discount_percentage || ''}
                  readOnly
                  placeholder="e.g., 20"
                  className="tw-w-full"
                />
              </div>
              <div className="form-group">
                <label>Button Text</label>
                <input
                  type="text"
                  value={ad.button_text}
                  readOnly
                  className="tw-w-full"
                />
              </div>
              <div className="form-group">
                <label>Valid From</label>
                <input
                  type="datetime-local"
                  value={ad.valid_from ? new Date(ad.valid_from).toISOString().slice(0, 16) : ''}
                  readOnly
                  className="tw-w-full"
                />
              </div>
              <div className="form-group">
                <label>Valid Until</label>
                <input
                  type="datetime-local"
                  value={ad.valid_until ? new Date(ad.valid_until).toISOString().slice(0, 16) : ''}
                  readOnly
                  className="tw-w-full"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={ad.is_active}
                    readOnly
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="tw-mt-4">
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => handleEdit(ad)}
              >
                <span className="material-symbols-outlined">edit</span>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && editingAd && (
        <div className="admin-modal-overlay" onClick={handleCancel}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingAd.id ? 'Edit Advertisement' : 'Create Advertisement'}</h2>
              <button
                className="admin-modal-close"
                onClick={handleCancel}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div className="form-group">
                  <label>Title*</label>
                  <input
                    type="text"
                    value={editingAd.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., Special Offer: 20% Off"
                    required
                    className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                  <label>Description*</label>
                  <input
                    type="text"
                    value={editingAd.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Advertisement description"
                    required
                    className="tw-w-full"
                  />
                </div>
                <div className="form-group md:tw-col-span-2">
                  <label>Image URL*</label>
                  <input
                    type="url"
                    value={editingAd.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                    className="tw-w-full"
                  />
                  {editingAd.image && (
                    <img src={editingAd.image} alt="Preview" className="tw-mt-2 tw-h-32 tw-object-contain tw-border tw-rounded" />
                  )}
                </div>
                <div className="form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    value={editingAd.button_text}
                    onChange={(e) => handleChange('button_text', e.target.value)}
                    placeholder="Check Now"
                    className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                  <label>Button Link</label>
                  <input
                    type="text"
                    value={editingAd.button_link}
                    onChange={(e) => handleChange('button_link', e.target.value)}
                    placeholder="Product slug or URL"
                    className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                  <label>Discount Percentage</label>
                  <input
                    type="number"
                    value={editingAd.discount_percentage || ''}
                    onChange={(e) => handleChange('discount_percentage', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 20"
                    min="0"
                    max="100"
                    className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={editingAd.display_order}
                    onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                    min="0"
                    className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                  <label>Valid From</label>
                  <input
                    type="datetime-local"
                    value={editingAd.valid_from ? new Date(editingAd.valid_from).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleChange('valid_from', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="datetime-local"
                    value={editingAd.valid_until ? new Date(editingAd.valid_until).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleChange('valid_until', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="tw-w-full"
                  />
                </div>
                <div className="form-group md:tw-col-span-2">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingAd.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-small"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      {editingAd.id ? 'Update' : 'Create'} Advertisement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdvertisementManagement;
