import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';

interface Material {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

const AdminMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchMaterials();
  }, [searchTerm]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await adminAPI.getMaterials(params);
      setMaterials(response.data.results || response.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching materials:', err);
      setError(err.response?.data?.error || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await adminAPI.updateMaterial(editingMaterial.id, formData);
        showToast('Material updated successfully', 'success');
      } else {
        await adminAPI.createMaterial(formData);
        showToast('Material created successfully', 'success');
      }
      setShowModal(false);
      setEditingMaterial(null);
      resetForm();
      fetchMaterials();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save material', 'error');
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
      is_active: material.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }
    try {
      await adminAPI.deleteMaterial(id);
      showToast('Material deleted successfully', 'success');
      fetchMaterials();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete material', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    setEditingMaterial(null);
  };

  if (loading && materials.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-4 sm:tw-mb-6">
        <h2 className="tw-text-xl sm:tw-text-2xl tw-font-bold">Materials Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors tw-flex tw-items-center tw-gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Material
        </button>
      </div>

      {error && (
        <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-text-red-700 tw-px-4 tw-py-3 tw-rounded tw-mb-4">
          {error}
        </div>
      )}

      <div className="tw-mb-4">
        <input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
        />
      </div>

      <div className="tw-bg-white tw-rounded-lg tw-shadow tw-overflow-hidden">
        <div className="tw-overflow-x-auto">
          <table className="tw-w-full">
            <thead className="tw-bg-gray-50">
              <tr>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Name</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Description</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Products</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Status</th>
                <th className="tw-px-4 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="tw-px-4 tw-py-8 tw-text-center tw-text-gray-500">
                    No materials found
                  </td>
                </tr>
              ) : (
                materials.map((material) => (
                  <tr key={material.id} className="hover:tw-bg-gray-50">
                    <td className="tw-px-4 tw-py-3 tw-text-sm tw-font-medium">{material.name}</td>
                    <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-500">
                      {material.description || 'N/A'}
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-500">{material.product_count || 0}</td>
                    <td className="tw-px-4 tw-py-3 tw-text-sm">
                      <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs ${
                        material.is_active
                          ? 'tw-bg-green-100 tw-text-green-800'
                          : 'tw-bg-red-100 tw-text-red-800'
                      }`}>
                        {material.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-right">
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <button
                          onClick={() => handleEdit(material)}
                          className="tw-px-3 tw-py-1 tw-text-blue-600 hover:tw-bg-blue-50 tw-rounded tw-transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
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
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="tw-mb-4">
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Material Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                  required
                />
              </div>
              <div className="tw-mb-4">
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                  rows={3}
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
                  {editingMaterial ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterials;

