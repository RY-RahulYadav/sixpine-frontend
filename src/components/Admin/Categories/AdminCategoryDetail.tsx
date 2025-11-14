import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  parent_name?: string;
  level: number;
  is_active: boolean;
  product_count: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface ParentOption {
  id: number;
  name: string;
  level: number;
}

const AdminCategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewCategory = id === 'new';
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [possibleParents, setPossibleParents] = useState<ParentOption[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
    is_active: true,
  });
  
  // Fetch category details or initialize new category
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch possible parent categories regardless
        const parentsResponse = await adminAPI.getCategories({ exclude_id: id, flat: true });
        setPossibleParents(parentsResponse.data.results);
        
        if (!isNewCategory) {
          const response = await adminAPI.getCategory(parseInt(id!));
          setCategory(response.data);
          
          setFormData({
            name: response.data.name,
            slug: response.data.slug,
            description: response.data.description || '',
            parent: response.data.parent ? String(response.data.parent) : '',
            is_active: response.data.is_active,
          });
          
          if (response.data.image_url) {
            setImagePreview(response.data.image_url);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching category details:', err);
        setError('Failed to load category details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryDetails();
  }, [id, isNewCategory]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
    
    // Auto-generate slug from name if slug is empty
    if (name === 'name' && (!formData.slug || formData.slug === '')) {
      setFormData({
        ...formData,
        [name]: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      });
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const categoryData = new FormData();
      categoryData.append('name', formData.name);
      categoryData.append('slug', formData.slug);
      categoryData.append('description', formData.description);
      categoryData.append('is_active', formData.is_active.toString());
      
      if (formData.parent) {
        categoryData.append('parent', formData.parent);
      }
      
      if (imageFile) {
        categoryData.append('image', imageFile);
      }
      
      let response;
      
      if (isNewCategory) {
        response = await adminAPI.createCategory(categoryData);
      } else {
        response = await adminAPI.updateCategory(parseInt(id!), categoryData);
      }
      
      alert(`Category ${isNewCategory ? 'created' : 'updated'} successfully!`);
      
      // Navigate to the category detail page if it was a new category
      if (isNewCategory) {
        navigate(`/admin/categories/${response.data.id}`);
      } else {
        setCategory(response.data);
      }
    } catch (err) {
      console.error(`Error ${isNewCategory ? 'creating' : 'updating'} category:`, err);
      setError(`Failed to ${isNewCategory ? 'create' : 'update'} category`);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading category details...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-category-detail">
      <div className="admin-header-actions">
        <div className="admin-header-with-back">
          <button 
            className="admin-back-button" 
            onClick={() => navigate('/admin/categories')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2>{isNewCategory ? 'Create New Category' : 'Edit Category'}</h2>
        </div>
        {!isNewCategory && (
          <button 
            className="admin-btn danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this category? This will affect any associated products.')) {
                adminAPI.deleteCategory(parseInt(id!))
                  .then(() => {
                    alert('Category deleted successfully');
                    navigate('/admin/categories');
                  })
                  .catch(err => {
                    console.error('Error deleting category:', err);
                    alert('Failed to delete category');
                  });
              }
            }}
          >
            <span className="material-symbols-outlined">delete</span>
            Delete Category
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      
      <div className="admin-content-grid">
        <div className="admin-content-main">
          <div className="admin-card">
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Category Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="slug">Slug*</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-helper">
                    Used in URLs. Should contain only letters, numbers, and hyphens.
                  </small>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="parent">Parent Category</label>
                  <select
                    id="parent"
                    name="parent"
                    value={formData.parent}
                    onChange={handleChange}
                  >
                    <option value="">None (Top-level Category)</option>
                    {possibleParents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} {parent.level > 0 ? `(Level ${parent.level})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      is_active: e.target.checked 
                    })}
                  />
                  <label htmlFor="is_active">Active</label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="image">Category Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Category preview" />
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => navigate('/admin/categories')}
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
                      {isNewCategory ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      {isNewCategory ? 'Create Category' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {!isNewCategory && category && (
          <div className="admin-content-sidebar">
            <div className="admin-card">
              <h3>Category Details</h3>
              <div className="category-info-list">
                <div className="info-item">
                  <label>Created:</label>
                  <span>{new Date(category.created_at).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <label>Last Updated:</label>
                  <span>{new Date(category.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <label>Products:</label>
                  <span>{category.product_count}</span>
                </div>
                <div className="info-item">
                  <label>Level:</label>
                  <span>{category.level}</span>
                </div>
              </div>
            </div>
            
            <div className="admin-card">
              <h3>Related Products</h3>
              <div className="quick-actions">
                <button 
                  className="admin-btn secondary block"
                  onClick={() => navigate(`/admin/products?category=${category.id}`)}
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  View Products in this Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoryDetail;