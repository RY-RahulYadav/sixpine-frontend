import React, { useState, useEffect, useRef } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface NavbarSubcategory {
  id: number;
  name: string;
  slug: string;
  link?: string;
  is_active: boolean;
  sort_order: number;
}

interface NavbarCategory {
  id: number;
  name: string;
  slug: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  subcategories: NavbarSubcategory[];
  subcategory_count: number;
}

const AdminNavbarCategories: React.FC = () => {
  const { showConfirmation } = useNotification();
  const [categories, setCategories] = useState<NavbarCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<NavbarCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<NavbarSubcategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    image: '',
    is_active: true,
    sort_order: 0
  });
  
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    slug: '',
    link: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNavbarCategories();
      const cats = response.data.results || response.data || [];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching navbar categories:', error);
      showToast('Failed to load navbar categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Category Modal handlers
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      image: '',
      is_active: true,
      sort_order: categories.length
    });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category: NavbarCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      image: category.image || '',
      is_active: category.is_active,
      sort_order: category.sort_order
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      const data = {
        ...categoryForm,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-')
      };
      
      if (editingCategory) {
        await adminAPI.updateNavbarCategory(editingCategory.id, data);
        showToast('Category updated successfully', 'success');
      } else {
        await adminAPI.createNavbarCategory(data);
        showToast('Category created successfully', 'success');
      }
      
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      showToast(error.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: NavbarCategory) => {
    const confirmed = await showConfirmation({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This will also delete all its subcategories.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    
    if (!confirmed) return;
    
    try {
      await adminAPI.deleteNavbarCategory(category.id);
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  // Subcategory Modal handlers
  const openAddSubcategoryModal = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setEditingSubcategory(null);
    const category = categories.find(c => c.id === categoryId);
    setSubcategoryForm({
      name: '',
      slug: '',
      link: '',
      is_active: true,
      sort_order: category?.subcategories.length || 0
    });
    setShowSubcategoryModal(true);
  };

  const openEditSubcategoryModal = (categoryId: number, subcategory: NavbarSubcategory) => {
    setSelectedCategoryId(categoryId);
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      link: subcategory.link || '',
      is_active: subcategory.is_active,
      sort_order: subcategory.sort_order
    });
    setShowSubcategoryModal(true);
  };

  const handleSaveSubcategory = async () => {
    if (!subcategoryForm.name.trim()) {
      showToast('Subcategory name is required', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      const data = {
        ...subcategoryForm,
        navbar_category: selectedCategoryId,
        slug: subcategoryForm.slug || subcategoryForm.name.toLowerCase().replace(/\s+/g, '-')
      };
      
      if (editingSubcategory) {
        await adminAPI.updateNavbarSubcategory(editingSubcategory.id, data);
        showToast('Subcategory updated successfully', 'success');
      } else {
        await adminAPI.createNavbarSubcategory(data);
        showToast('Subcategory created successfully', 'success');
      }
      
      setShowSubcategoryModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving subcategory:', error);
      showToast(error.response?.data?.message || 'Failed to save subcategory', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubcategory = async (subcategory: NavbarSubcategory) => {
    const confirmed = await showConfirmation({
      title: 'Delete Subcategory',
      message: `Are you sure you want to delete "${subcategory.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    
    if (!confirmed) return;
    
    try {
      await adminAPI.deleteNavbarSubcategory(subcategory.id);
      showToast('Subcategory deleted successfully', 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      showToast('Failed to delete subcategory', 'error');
    }
  };

  // Toggle active status
  const toggleCategoryActive = async (category: NavbarCategory) => {
    try {
      await adminAPI.updateNavbarCategory(category.id, { is_active: !category.is_active });
      showToast(`Category ${!category.is_active ? 'enabled' : 'disabled'}`, 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      showToast('Failed to update category', 'error');
    }
  };

  const toggleSubcategoryActive = async (subcategory: NavbarSubcategory) => {
    try {
      await adminAPI.updateNavbarSubcategory(subcategory.id, { is_active: !subcategory.is_active });
      showToast(`Subcategory ${!subcategory.is_active ? 'enabled' : 'disabled'}`, 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error toggling subcategory:', error);
      showToast('Failed to update subcategory', 'error');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    dragRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragRef.current !== null && dragRef.current !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Reorder categories
      const newCategories = [...categories];
      const [draggedItem] = newCategories.splice(draggedIndex, 1);
      newCategories.splice(dragOverIndex, 0, draggedItem);
      
      // Update local state immediately for smooth UX
      setCategories(newCategories);
      
      // Save new order to backend
      try {
        setSaving(true);
        // Update sort_order for all affected categories
        const updatePromises = newCategories.map((cat, idx) => 
          adminAPI.updateNavbarCategory(cat.id, { sort_order: idx })
        );
        await Promise.all(updatePromises);
        showToast('Category order updated', 'success');
      } catch (error) {
        console.error('Error reordering categories:', error);
        showToast('Failed to save category order', 'error');
        fetchCategories(); // Revert to server state
      } finally {
        setSaving(false);
      }
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragRef.current = null;
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Get active categories for preview (available for future use)
  const _activeCategories = categories.filter(cat => cat.is_active);
  void _activeCategories; // Suppress unused variable warning

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading navbar categories...</p>
      </div>
    );
  }

  return (
    <div className="admin-navbar-categories">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <h1 className="admin-page-title">
            <span className="material-symbols-outlined">category</span>
            Navbar Categories
          </h1>
          <p className="admin-page-subtitle">
            Manage categories and subcategories displayed in the site navigation dropdown menu. Drag categories to reorder.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={fetchCategories}
          >
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={openAddCategoryModal}
          >
            <span className="material-symbols-outlined">add</span>
            Add Category
          </button>
        </div>
      </div>

      {/* Navbar Preview with Drag & Drop */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <span className="material-symbols-outlined">preview</span>
            Navbar Preview
          </h2>
          <span className="admin-badge admin-badge-info">Drag to Reorder</span>
        </div>
        <div className="admin-card-body">
          <p style={{ color: 'var(--admin-text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Drag categories to reorder how they appear in the navigation menu.
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem', 
            padding: '1rem', 
            background: 'var(--admin-bg)', 
            borderRadius: '8px',
            border: '1px solid var(--admin-border)',
            minHeight: '60px'
          }}>
            {categories.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)', fontStyle: 'italic' }}>
                No categories to display
              </p>
            ) : (
              categories.map((category, index) => (
                <div 
                  key={category.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  style={{
                    padding: '0.5rem 1rem',
                    background: category.is_active ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'grab',
                    opacity: draggedIndex === index ? 0.5 : 1,
                    transform: dragOverIndex === index ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: dragOverIndex === index ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    transition: 'transform 0.15s, opacity 0.15s, box-shadow 0.15s',
                    userSelect: 'none'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', opacity: 0.7 }}>drag_indicator</span>
                  <span>{category.name}</span>
                  {!category.is_active && (
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: 'rgba(255,255,255,0.2)', 
                      padding: '0.125rem 0.375rem', 
                      borderRadius: '4px' 
                    }}>
                      Hidden
                    </span>
                  )}
                  {category.subcategories.filter(s => s.is_active).length > 0 && (
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: 'rgba(255,255,255,0.2)', 
                      padding: '0.125rem 0.375rem', 
                      borderRadius: '4px' 
                    }}>
                      {category.subcategories.filter(s => s.is_active).length}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <span className="material-symbols-outlined">list</span>
            All Categories
          </h2>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {categories.length === 0 ? (
            <div className="admin-empty-state" style={{ padding: '3rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--admin-text-muted)' }}>
                category
              </span>
              <h3>No Navbar Categories Found</h3>
              <p>Add categories to display in the site navigation.</p>
              <button onClick={openAddCategoryModal} className="admin-btn admin-btn-primary">
                Add First Category
              </button>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}></th>
                    <th>Category Name</th>
                    <th>Subcategories</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <React.Fragment key={category.id}>
                      <tr 
                        className={`${!category.is_active ? 'admin-row-inactive' : ''} ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handleDragEnd}
                        style={{
                          cursor: 'grab',
                          opacity: draggedIndex === index ? 0.5 : 1,
                          background: dragOverIndex === index ? 'var(--admin-primary-light)' : undefined,
                          transition: 'background 0.2s, opacity 0.2s'
                        }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--admin-text-muted)', cursor: 'grab' }}>
                              drag_indicator
                            </span>
                            <span style={{ 
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: 'var(--admin-text-muted)',
                              background: 'var(--admin-bg)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px'
                            }}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {category.image ? (
                              <img 
                                src={category.image} 
                                alt={category.name}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  border: '1px solid var(--admin-border)'
                                }}
                              />
                            ) : (
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '6px',
                                background: 'var(--admin-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--admin-border)'
                              }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--admin-text-muted)' }}>
                                  category
                                </span>
                              </div>
                            )}
                            <div>
                              <strong style={{ color: 'var(--admin-text)' }}>{category.name}</strong>
                              <p style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--admin-text-muted)',
                                margin: '0.125rem 0 0 0'
                              }}>
                                /{category.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {category.subcategories.length > 0 ? (
                              <>
                                <span className="admin-badge admin-badge-info">
                                  {category.subcategories.filter(s => s.is_active).length} active / {category.subcategories.length} total
                                </span>
                                <button
                                  className="admin-btn admin-btn-icon admin-btn-ghost"
                                  onClick={() => toggleCategoryExpand(category.id)}
                                  title={expandedCategory === category.id ? 'Collapse' : 'Expand'}
                                >
                                  <span className="material-symbols-outlined">
                                    {expandedCategory === category.id ? 'expand_less' : 'expand_more'}
                                  </span>
                                </button>
                              </>
                            ) : (
                              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem' }}>
                                No subcategories
                              </span>
                            )}
                            <button
                              className="admin-btn admin-btn-sm admin-btn-ghost"
                              onClick={() => openAddSubcategoryModal(category.id)}
                              title="Add Subcategory"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <label className="admin-toggle" title={category.is_active ? 'Click to hide' : 'Click to show'}>
                            <input
                              type="checkbox"
                              checked={category.is_active}
                              onChange={() => toggleCategoryActive(category)}
                            />
                            <span className="admin-toggle-slider"></span>
                          </label>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                            <button
                              className="admin-btn admin-btn-icon admin-btn-ghost"
                              onClick={() => openEditCategoryModal(category)}
                              title="Edit Category"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-danger"
                              onClick={() => handleDeleteCategory(category)}
                              title="Delete Category"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Subcategories Row */}
                      {expandedCategory === category.id && category.subcategories.length > 0 && (
                        <tr className="admin-expanded-row">
                          <td colSpan={5} style={{ padding: 0 }}>
                            <div style={{ 
                              background: 'var(--admin-bg)', 
                              padding: '1rem 1.5rem',
                              borderTop: '1px solid var(--admin-border)'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '0.75rem'
                              }}>
                                <h4 style={{ 
                                  margin: 0, 
                                  fontSize: '0.875rem', 
                                  color: 'var(--admin-text-muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>subdirectory_arrow_right</span>
                                  Subcategories for {category.name}
                                </h4>
                                <button
                                  className="admin-btn admin-btn-sm admin-btn-secondary"
                                  onClick={() => openAddSubcategoryModal(category.id)}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
                                  Add Subcategory
                                </button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {category.subcategories.map((sub) => (
                                  <div
                                    key={sub.id}
                                    style={{
                                      padding: '0.75rem 1rem',
                                      background: 'var(--admin-card-bg)',
                                      border: `1px solid ${sub.is_active ? 'var(--admin-border)' : 'var(--admin-warning)'}`,
                                      borderRadius: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      opacity: sub.is_active ? 1 : 0.7
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <span style={{ fontWeight: '500' }}>{sub.name}</span>
                                      {sub.link && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                                          → {sub.link}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <label className="admin-toggle" style={{ transform: 'scale(0.8)' }}>
                                        <input
                                          type="checkbox"
                                          checked={sub.is_active}
                                          onChange={() => toggleSubcategoryActive(sub)}
                                        />
                                        <span className="admin-toggle-slider"></span>
                                      </label>
                                      <button
                                        className="admin-btn admin-btn-icon admin-btn-ghost"
                                        onClick={() => openEditSubcategoryModal(category.id, sub)}
                                        title="Edit"
                                        style={{ padding: '0.25rem' }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
                                      </button>
                                      <button
                                        className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-danger"
                                        onClick={() => handleDeleteSubcategory(sub)}
                                        title="Delete"
                                        style={{ padding: '0.25rem' }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button 
                className="admin-btn admin-btn-icon admin-btn-ghost"
                onClick={() => setShowCategoryModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Category Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Sofas"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Slug</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="Auto-generated from name"
                />
                <small style={{ color: 'var(--admin-text-muted)' }}>Leave empty to auto-generate</small>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Image URL</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Sort Order</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-toggle-label">
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                  />
                  <span>Show in Navbar</span>
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button 
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </button>
              <button 
                className="admin-btn admin-btn-primary"
                onClick={handleSaveCategory}
                disabled={saving}
              >
                {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSubcategoryModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h3>
              <button 
                className="admin-btn admin-btn-icon admin-btn-ghost"
                onClick={() => setShowSubcategoryModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Subcategory Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  placeholder="e.g., 3 Seater"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Slug</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={subcategoryForm.slug}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })}
                  placeholder="Auto-generated from name"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Custom Link (Optional)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={subcategoryForm.link}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, link: e.target.value })}
                  placeholder="/products?category=sofas&subcategory=3-seater"
                />
                <small style={{ color: 'var(--admin-text-muted)' }}>Custom URL for this subcategory link</small>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Sort Order</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={subcategoryForm.sort_order}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, sort_order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-toggle-label">
                  <input
                    type="checkbox"
                    checked={subcategoryForm.is_active}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, is_active: e.target.checked })}
                  />
                  <span>Show in Navbar</span>
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button 
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowSubcategoryModal(false)}
              >
                Cancel
              </button>
              <button 
                className="admin-btn admin-btn-primary"
                onClick={handleSaveSubcategory}
                disabled={saving}
              >
                {saving ? 'Saving...' : (editingSubcategory ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbarCategories;
