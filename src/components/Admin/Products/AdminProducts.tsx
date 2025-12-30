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

const AdminProducts: React.FC = () => {
  const api = useAdminAPI();
  const { showConfirmation } = useNotification();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSellerPanel = location.pathname.startsWith('/seller');
  const basePath = isSellerPanel ? '/seller' : '/admin';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>(searchParams.get('category') || '');
  const [filterStock, setFilterStock] = useState<string>(searchParams.get('stock_status') || '');
  const [filterActive, setFilterActive] = useState<string>(searchParams.get('is_active') || '');
  const [filterBrand, setFilterBrand] = useState<string>(searchParams.get('vendor') || '');
  
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

  // Fetch brands for filter dropdown (only in admin panel)
  useEffect(() => {
    if (!isSellerPanel) {
      const fetchBrands = async () => {
        try {
          const response = await (api as any).getBrands();
          if (response.data && Array.isArray(response.data.results)) {
            setBrands(response.data.results);
          } else if (response.data && Array.isArray(response.data)) {
            setBrands(response.data);
          }
        } catch (err) {
          console.error('Error fetching brands:', err);
        }
      };
      
      fetchBrands();
    }
  }, [isSellerPanel, api]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
        };
        
        if (searchTerm) params.search = searchTerm;
        if (filterCategory) params.category = filterCategory;
        if (filterStock) params.stock_status = filterStock;
        if (filterActive) params.is_active = filterActive;
        if (filterBrand && !isSellerPanel) params.vendor = filterBrand;
        
        console.log('Fetching products with params:', params);
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
  }, [currentPage, searchTerm, filterCategory, filterStock, filterActive, filterBrand, isSellerPanel]);
  
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
  
  const handleDeleteProduct = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
      showToast('Product deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Failed to delete product', 'error');
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
          <button
            className="admin-modern-btn secondary"
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = '.xlsx,.xls';
              fileInput.onchange = async (e: any) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  const response = await adminAPI.importProductsExcel(formData);
                  
                  if (response.data.success) {
                    showToast(
                      `Import successful: ${response.data.products_created} products, ${response.data.variants_created} variants created`,
                      'success'
                    );
                    if (response.data.errors && response.data.errors.length > 0) {
                      console.warn('Import errors:', response.data.errors);
                    }
                    // Refresh products list
                    fetchProducts();
                  } else {
                    showToast(response.data.message || 'Import failed', 'error');
                  }
                } catch (error: any) {
                  showToast(
                    error.response?.data?.error || 'Failed to import Excel file',
                    'error'
                  );
                }
              };
              fileInput.click();
            }}
          >
            <span className="material-symbols-outlined">upload_file</span>
            Import Excel
          </button>
          <Link to={`${basePath}/products/new`} className="admin-modern-btn primary">
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
          {!isSellerPanel && (
            <select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-form-select"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.brand_name || brand.business_name || `Brand ${brand.id}`}</option>
              ))}
            </select>
          )}
          
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
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-modern-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th>Product</th>
                <th style={{ width: '120px' }}>Price</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Stock</th>
                <th style={{ width: '200px' }}>Variants</th>
                <th style={{ width: '150px' }}>Category</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
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
                      <button 
                        className="admin-modern-btn danger icon-only"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && !loading && (
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
                      margin: '0 auto',
                      gap: '16px'
                    }}>
                      <span className="material-symbols-outlined" style={{ 
                        fontSize: '64px', 
                        color: '#ccc', 
                        marginBottom: '8px' 
                      }}>inventory_2</span>
                      <h3 style={{ margin: '0 0 8px 0', textAlign: 'center', color: '#555' }}>No products found</h3>
                      <p style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#888' }}>Start by adding your first product to the catalog</p>
                      <Link to={`${basePath}/products/new`} className="admin-modern-btn primary">
                        <span className="material-symbols-outlined">add</span>
                        Add New Product
                      </Link>
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
    </div>
  );
};

export default AdminProducts;
