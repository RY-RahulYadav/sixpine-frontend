import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import '../../../styles/admin-theme.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  level: number;
  is_active: boolean;
  product_count: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface HierarchicalCategory extends Category {
  children: HierarchicalCategory[];
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<HierarchicalCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode] = useState<'flat' | 'tree'>('flat');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        if (viewMode === 'flat') {
          const params = {
            page: currentPage,
            search: searchTerm,
          };
          
          const response = await adminAPI.getCategories(params);
          setCategories(response.data.results || []);
          // Fix for "Cannot read properties of undefined (reading 'length')"
          if (response.data.results && response.data.results.length > 0) {
            setTotalPages(Math.ceil(response.data.count / response.data.results.length));
          } else {
            setTotalPages(1); // Default to 1 page if no results or empty results
          }
        } else {
          const response = await adminAPI.getCategoriesHierarchical();
          setHierarchicalCategories(response.data || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [currentPage, searchTerm, viewMode]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      // Note: Assuming a toggleCategoryActive endpoint exists or needs to be added
      await adminAPI.updateCategory(id, { is_active: !isActive });
      
      // Update the category in the local state
      if (viewMode === 'flat') {
        setCategories(categories.map(category => 
          category.id === id ? { ...category, is_active: !isActive } : category
        ));
      } else {
        // For hierarchical view, we'd need a more complex update function
        // This is a simplified version
        const updateCategoryInTree = (cats: HierarchicalCategory[]): HierarchicalCategory[] => {
          return cats.map(cat => {
            if (cat.id === id) {
              return { ...cat, is_active: !isActive };
            } else if (cat.children.length > 0) {
              return { ...cat, children: updateCategoryInTree(cat.children) };
            }
            return cat;
          });
        };
        
        setHierarchicalCategories(updateCategoryInTree(hierarchicalCategories));
      }
    } catch (err) {
      console.error('Error toggling category status:', err);
      alert('Failed to update category status');
    }
  };
  
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect products associated with it.')) {
      try {
        await adminAPI.deleteCategory(id);
        
        // Remove the category from the local state
        if (viewMode === 'flat') {
          setCategories(categories.filter(category => category.id !== id));
        } else {
          // For hierarchical view, we'd need a more complex delete function
          const removeCategoryFromTree = (cats: HierarchicalCategory[]): HierarchicalCategory[] => {
            return cats.filter(cat => {
              if (cat.id === id) return false;
              if (cat.children.length > 0) {
                cat.children = removeCategoryFromTree(cat.children);
              }
              return true;
            });
          };
          
          setHierarchicalCategories(removeCategoryFromTree(hierarchicalCategories));
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Failed to delete category');
      }
    }
  };
  
  // Recursive component to render category tree
  const CategoryTree: React.FC<{ categories: HierarchicalCategory[] }> = ({ categories }) => {
    return (
      <ul className="admin-category-tree">
        {categories.map(category => (
          <li key={category.id} className="category-tree-item">
            <div className="category-tree-node">
              <div className="category-info">
                {category.image_url && (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="category-thumbnail" 
                  />
                )}
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.product_count})</span>
                <span className={`category-status ${category.is_active ? 'active' : 'inactive'}`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="category-actions">
                <button 
                  className={`status-toggle ${category.is_active ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(category.id, category.is_active)}
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </button>
                <Link to={`/admin/categories/${category.id}`} className="edit-btn">
                  <span className="material-symbols-outlined">edit</span>
                </Link>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
            {category.children.length > 0 && <CategoryTree categories={category.children} />}
          </li>
        ))}
      </ul>
    );
  };
  
  if (loading && categories.length === 0 && hierarchicalCategories.length === 0) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading categories...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">category</span>
          <div>
            <h1>Categories Management</h1>
            <p className="admin-page-subtitle">Organize products into categories and subcategories</p>
          </div>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/categories/new" className="admin-modern-btn primary">
            <span className="material-symbols-outlined">add</span>
            Add New Category
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="admin-filters-bar">
        <form onSubmit={handleSearch} className="admin-search-form">
          <div className="admin-search-input">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-modern-btn secondary">
            Search
          </button>
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="admin-alert error">
          <span className="material-symbols-outlined">error</span>
          <div className="admin-alert-content">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Categories display */}
      {viewMode === 'flat' ? (
        <div className="admin-modern-card">
          <table className="admin-modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th>Parent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="category-cell">
                      {category.image_url && (
                        <img 
                          src={category.image_url} 
                          alt={category.name} 
                          className="category-thumbnail" 
                        />
                      )}
                      <strong className="category-name">{category.name}</strong>
                    </div>
                  </td>
                  <td className="description-cell">
                    {category.description?.length > 50
                      ? `${category.description.substring(0, 50)}...`
                      : category.description}
                  </td>
                  <td>{category.product_count}</td>
                  <td>
                    {category.parent !== null ? (
                      <Link to={`/admin/categories/${category.parent}`} className="admin-link">
                        Parent #{category.parent}
                      </Link>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-status-badge ${category.is_active ? 'success' : 'inactive'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                      <button 
                        className={`admin-modern-btn ${category.is_active ? 'warning' : 'success'} icon-only`}
                        onClick={() => handleToggleActive(category.id, category.is_active)}
                        title={category.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <span className="material-symbols-outlined">
                          {category.is_active ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                      <Link to={`/admin/categories/${category.id}`} className="admin-modern-btn secondary icon-only">
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                      <button 
                        className="admin-modern-btn danger icon-only"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {categories.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ 
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
                      margin: '0 auto',
                      gap: '16px'
                    }}>
                      <span className="material-symbols-outlined" style={{ 
                        fontSize: '64px', 
                        color: '#ccc', 
                        marginBottom: '8px' 
                      }}>category</span>
                      <h3 style={{ margin: '0 0 8px 0', textAlign: 'center', color: '#555' }}>No categories found</h3>
                      <p style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#888' }}>Create categories to organize your products</p>
                      <Link to="/admin/categories/new" className="admin-modern-btn primary">
                        <span className="material-symbols-outlined">add</span>
                        Add New Category
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-category-tree-container">
          {hierarchicalCategories.length > 0 ? (
            <CategoryTree categories={hierarchicalCategories} />
          ) : (
            <div className="admin-empty-state">
              <span className="material-symbols-outlined">category</span>
              <h3>No categories found</h3>
              <p>Create categories to organize your products</p>
            </div>
          )}
        </div>
      )}
      
      {/* Pagination - only show for flat view */}
      {viewMode === 'flat' && totalPages > 1 && (
        <div className="admin-pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="admin-modern-btn secondary"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Previous
          </button>
          
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="admin-modern-btn secondary"
          >
            Next
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;