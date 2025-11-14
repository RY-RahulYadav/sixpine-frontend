import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';

interface Discount {
  id: number;
  percentage: number;
  label: string;
  is_active: boolean;
  created_at: string;
}

const AdminDiscounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    percentage: 0,
    label: '',
    is_active: true
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDiscounts();
      setDiscounts(response.data.results || response.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching discounts:', err);
      setError(err.response?.data?.error || 'Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDiscount) {
        await adminAPI.updateDiscount(editingDiscount.id, formData);
        showToast('Discount updated successfully', 'success');
      } else {
        await adminAPI.createDiscount(formData);
        showToast('Discount created successfully', 'success');
      }
      setShowModal(false);
      setEditingDiscount(null);
      resetForm();
      fetchDiscounts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save discount', 'error');
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      percentage: discount.percentage,
      label: discount.label || '',
      is_active: discount.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }
    try {
      await adminAPI.deleteDiscount(id);
      showToast('Discount deleted successfully', 'success');
      fetchDiscounts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete discount', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      percentage: 0,
      label: '',
      is_active: true
    });
    setEditingDiscount(null);
  };

  if (loading && discounts.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading discounts...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-4 sm:tw-mb-6">
        <h2 className="tw-text-xl sm:tw-text-2xl tw-font-bold">Discounts Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors tw-flex tw-items-center tw-gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Discount
        </button>
      </div>

      {error && (
        <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-text-red-700 tw-px-4 tw-py-3 tw-rounded tw-mb-4">
          {error}
        </div>
      )}

      <div className="tw-bg-white tw-rounded-lg tw-shadow tw-overflow-hidden">
        <div className="tw-overflow-x-auto">
          <table className="tw-w-full">
            <thead className="tw-bg-gray-50">
              <tr>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Percentage</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Label</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Status</th>
                <th className="tw-px-4 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="tw-px-4 tw-py-8 tw-text-center tw-text-gray-500">
                    No discounts found
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:tw-bg-gray-50">
                    <td className="tw-px-4 tw-py-3 tw-text-sm tw-font-medium">{discount.percentage}%</td>
                    <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-500">{discount.label || `${discount.percentage}%`}</td>
                    <td className="tw-px-4 tw-py-3 tw-text-sm">
                      <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs ${
                        discount.is_active
                          ? 'tw-bg-green-100 tw-text-green-800'
                          : 'tw-bg-red-100 tw-text-red-800'
                      }`}>
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-right">
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="tw-px-3 tw-py-1 tw-text-blue-600 hover:tw-bg-blue-50 tw-rounded tw-transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="tw-px-3 tw-py-1 tw-text-red-600 hover:tw-bg-red-50 tw-rounded tw-transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
          <div className="tw-bg-white tw-rounded-lg tw-p-6 tw-w-full tw-max-w-md tw-mx-4">
            <h3 className="tw-text-lg tw-font-bold tw-mb-4">
              {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="tw-mb-4">
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Discount Percentage (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      percentage: value,
                      label: formData.label || `${value}%`
                    });
                  }}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                  required
                />
              </div>
              <div className="tw-mb-4">
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                  placeholder="e.g., Summer Sale"
                />
              </div>
              <div className="tw-mb-4">
                <label className="tw-flex tw-items-center tw-gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="tw-rounded tw-text-blue-600 tw-focus:ring-blue-500"
                  />
                  <span className="tw-text-sm tw-font-medium tw-text-gray-700">Active</span>
                </label>
              </div>
              <div className="tw-flex tw-gap-3 tw-justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-text-gray-700 hover:tw-bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700"
                >
                  {editingDiscount ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;

