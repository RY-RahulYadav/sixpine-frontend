import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import { formatCurrency, showToast } from '../utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface Variant {
  id: number;
  title?: string;
  color: {
    id: number;
    name: string;
    hex_code?: string;
  };
  size: string;
  pattern: string;
  price: number | null;
  stock_quantity: number;
  is_in_stock: boolean;
  image?: string;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  old_price: number | null;
  variant_count: number;
  total_stock: number;
  order_count: number;
  category: string;
  subcategory?: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  main_image?: string;
  variants?: Variant[];
}

const AdminSixpineProducts: React.FC = () => {
  const api = useAdminAPI();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSellerPanel = location.pathname.startsWith('/seller');
  const basePath = isSellerPanel ? '/seller' : '/admin';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>(searchParams.get('category') || '');
  const [filterStock, setFilterStock] = useState<string>(searchParams.get('stock_status') || '');
  const [filterActive, setFilterActive] = useState<string>(searchParams.get('is_active') || '');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategories();
        if (response.data && Array.isArray(response.data.results)) {
          setCategories(response.data.results);
        } else if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          brand: 'Sixpine', // Filter by Sixpine brand
        };
        
        if (searchTerm) params.search = searchTerm;
        if (filterCategory) params.category = filterCategory;
        if (filterStock) params.stock_status = filterStock;
        if (filterActive) params.is_active = filterActive;
        
        console.log('Fetching Sixpine products with params:', params);
        const response = await api.getProducts(params);
        
        console.log('API Response:', response.data);
        
        if (response.data) {
          let productsList = [];
          let count = 0;
          
          if (response.data.results && Array.isArray(response.data.results)) {
            productsList = response.data.results;
            count = response.data.count || productsList.length;
          } else if (Array.isArray(response.data)) {
            productsList = response.data;
            count = productsList.length;
          }
          
          setProducts(productsList);
          setTotalCount(count);
          
          const pageSize = 20;
          setTotalPages(Math.max(Math.ceil(count / pageSize), 1));
          setError(null);
        } else {
          setProducts([]);
          setTotalPages(1);
          setError('No data received from server');
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          setError(err.response.data.detail || err.response.data.error || 'Failed to load products');
        } else {
          setError('Failed to load products');
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory, filterStock, filterActive]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await api.toggleProductActive(id);
      setProducts(products.map(product => 
        product.id === id ? { ...product, is_active: !isActive } : product
      ));
      showToast('Product status updated', 'success');
    } catch (err) {
      console.error('Error toggling product status:', err);
      showToast('Failed to update product status', 'error');
    }
  };
  
  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) {
      showToast('Please select at least one product to delete', 'error');
      return;
    }
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const handleConfirmBulkDelete = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete product') {
      showToast('Please type "delete product" to confirm', 'error');
      return;
    }

    const selectedCount = selectedProducts.size;
    const selectedIds = Array.from(selectedProducts);
    
    setIsDeleting(true);
    try {
      const deletePromises = selectedIds.map(id => api.deleteProduct(id));
      await Promise.all(deletePromises);
      
      setProducts(products.filter(product => !selectedProducts.has(product.id)));
      setSelectedProducts(new Set());
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      showToast(`${selectedCount} product(s) deleted successfully`, 'success');
    } catch (err) {
      console.error('Error deleting products:', err);
      showToast('Failed to delete some products', 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (loading && products.length === 0) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading products...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">inventory_2</span>
          <div>
            <h1>Products Management</h1>
            <p className="admin-page-subtitle">Manage your product catalog, variants, and inventory</p>
          </div>
        </div>
        <div className="admin-page-actions">
          <Link 
            to={`${basePath}/products/new`} 
            state={{ fromSixpine: true }}
            className="admin-modern-btn primary"
          >
            <span className="material-symbols-outlined">add</span>
            Add New Product
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
              placeholder="Search products by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-modern-btn secondary">
            Search
          </button>
        </form>
        
        <div className="admin-filters-group">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-form-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <select
            value={filterStock}
            onChange={(e) => {
              setFilterStock(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-form-select"
          >
            <option value="">All Stock</option>
            <option value="low_stock">Low Stock</option>
          </select>
          
          <select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-form-select"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
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
      
      {/* Products Table */}
      <div className="admin-modern-card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: '16px',
          alignItems: 'center'
        }}>
          {selectedProducts.size > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="admin-modern-btn danger"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span className="material-symbols-outlined">delete</span>
              Delete Selected ({selectedProducts.size})
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-modern-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedProducts.size === products.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ width: '80px' }}>Image</th>
                <th>Product</th>
                <th style={{ width: '120px' }}>Price</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Stock</th>
                <th style={{ width: '200px' }}>Variants</th>
                <th style={{ width: '150px' }}>Category</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    {(() => {
                      // Try main_image first, then first variant image
                      const imageUrl = product.main_image || 
                                     (product.variants && product.variants.length > 0 && product.variants[0].image) || 
                                     null;
                      
                      return imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.title} 
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('tw-hidden');
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          border: '1px solid #f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f9f9f9'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#ccc' }}>
                            image_not_supported
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <div>
                      <Link 
                        to={`${basePath}/products/${product.id}`} 
                        style={{ 
                          color: '#ff6f00', 
                          fontWeight: '600', 
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        {product.title}
                      </Link>
                      {product.is_featured && (
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 8px',
                          background: '#fef3c7',
                          color: '#f59e0b',
                          fontSize: '11px',
                          borderRadius: '12px',
                          fontWeight: '600'
                        }}>
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {formatCurrency(product.price)}
                      </div>
                      {product.old_price && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#888', 
                          textDecoration: 'line-through' 
                        }}>
                          {formatCurrency(product.old_price)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontWeight: '600',
                      fontSize: '14px',
                      color: product.total_stock === 0 ? '#ef4444' : product.total_stock < 10 ? '#f59e0b' : '#067d62'
                    }}>
                      {product.total_stock || 0}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--admin-text)' }}>
                      {product.variant_count || 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{product.category}</div>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${product.is_active ? 'success' : 'inactive'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <button 
                        className={`admin-modern-btn ${product.is_active ? 'warning' : 'success'} icon-only`}
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        title={product.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <span className="material-symbols-outlined">
                          {product.is_active ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                      <Link to={`${basePath}/products/${product.id}`} className="admin-modern-btn secondary icon-only">
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} style={{ 
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
                      }}>inventory_2</span>
                      <h3 style={{ margin: '0 0 8px 0', textAlign: 'center', color: '#555' }}>No products found</h3>
                      <p style={{ margin: 0, textAlign: 'center', color: '#888' }}>Start by adding your first product to the catalog</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalCount > 0 && (
        <div className="admin-pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="admin-modern-btn secondary"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Previous
          </button>
          
          <div className="admin-pagination-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong> 
            <span style={{ margin: '0 8px', color: '#ddd' }}>|</span> 
            <strong>{totalCount}</strong> total products
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="admin-modern-btn secondary"
          >
            Next
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setDeleteConfirmText('');
            }
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              Delete Products
            </h3>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
              You are about to delete <strong>{selectedProducts.size}</strong> product(s). This action cannot be undone.
            </p>
            <p style={{ margin: '0 0 16px 0', color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>
              Type <strong>"delete product"</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type 'delete product' to confirm"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting || deleteConfirmText.toLowerCase() !== 'delete product'}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isDeleting || deleteConfirmText.toLowerCase() !== 'delete product' ? '#fca5a5' : '#ef4444',
                  color: 'white',
                  cursor: isDeleting || deleteConfirmText.toLowerCase() !== 'delete product' ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-small"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    Delete Products
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSixpineProducts;

