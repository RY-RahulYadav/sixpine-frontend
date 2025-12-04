import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { showToast, formatCurrency } from '../utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface Brand {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  brand_name: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  status_display: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  total_products: number;
  total_orders: number;
  total_order_value: string;
  total_net_profit: string;
}

interface BrandDetail extends Brand {
  user_first_name?: string;
  user_last_name?: string;
  user_mobile?: string;
  user_username?: string;
  business_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  gst_number?: string;
  pan_number?: string;
  business_type?: string;
  commission_percentage?: string;
  low_stock_threshold?: number;
  // Payment details
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  branch_name?: string;
  upi_id?: string;
  // Shipment details
  shipment_address?: string;
  shipment_city?: string;
  shipment_state?: string;
  shipment_pincode?: string;
  shipment_country?: string;
  shipment_latitude?: number;
  shipment_longitude?: number;
  approved_at?: string;
}

const AdminBrands: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirmation } = useNotification();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandDetail, setBrandDetail] = useState<BrandDetail | null>(null);
  const [showProductsModal, setShowProductsModal] = useState<boolean>(false);
  const [showOrdersModal, setShowOrdersModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  useEffect(() => {
    fetchBrands();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await adminAPI.getBrands(params);
      setBrands(response.data.results || response.data);
      if (response.data.count !== undefined) {
        setTotalPages(Math.ceil(response.data.count / (response.data.results?.length || 10)));
      } else {
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands');
      showToast('Failed to load brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSuspend = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Suspend Brand',
      message: 'Are you sure you want to suspend this brand? This will prevent them from accessing the seller panel.',
      confirmText: 'Suspend',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await adminAPI.suspendBrand(id);
      showToast('Brand suspended successfully', 'success');
      fetchBrands();
    } catch (err: any) {
      console.error('Error suspending brand:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to suspend brand';
      showToast(errorMessage, 'error');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await adminAPI.activateBrand(id);
      showToast('Brand activated successfully', 'success');
      fetchBrands();
    } catch (err: any) {
      console.error('Error activating brand:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to activate brand';
      showToast(errorMessage, 'error');
    }
  };

  const handleViewProducts = async (brand: Brand) => {
    setSelectedBrand(brand);
    setShowProductsModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await adminAPI.getBrandProducts(brand.id);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Failed to load products', 'error');
      setProducts([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteProduct = async (productId: number, productTitle: string) => {
    const confirmed = await showConfirmation({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${productTitle}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await adminAPI.deleteProduct(productId);
      showToast('Product deleted successfully', 'success');
      
      // Remove the product from the list
      setProducts(products.filter(p => p.id !== productId));
      
      // Update the brand's total_products count
      if (selectedBrand) {
        setSelectedBrand({
          ...selectedBrand,
          total_products: Math.max(0, selectedBrand.total_products - 1)
        });
        
        // Update the brand in the brands list
        setBrands(brands.map(b => 
          b.id === selectedBrand.id 
            ? { ...b, total_products: Math.max(0, b.total_products - 1) }
            : b
        ));
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to delete product';
      showToast(errorMessage, 'error');
    }
  };

  const handleViewOrders = async (brand: Brand) => {
    setSelectedBrand(brand);
    setShowOrdersModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await adminAPI.getBrandOrders(brand.id);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToast('Failed to load orders', 'error');
      setOrders([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (brand: Brand) => {
    setSelectedBrand(brand);
    setShowDetailModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await adminAPI.getBrand(brand.id);
      setBrandDetail(response.data);
    } catch (err) {
      console.error('Error fetching brand details:', err);
      showToast('Failed to load brand details', 'error');
      setBrandDetail(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'inactive';
      default:
        return 'inactive';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-container">
        <h1>Brand Management</h1>
        <p className="admin-subtitle">Manage all brands and vendors on the platform</p>
      </div>

      {error && (
        <div className="admin-alert error">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="admin-filters-bar">
        <form onSubmit={handleSearch} className="admin-search-form">
          <div className="admin-search-input">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search by brand name, business name, or email..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-form-select"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Brands Table */}
      <div className="admin-modern-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-loader"></div>
            <p>Loading brands...</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Business Name</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Orders</th>
                  <th>Order Value</th>
                  <th>Net Profit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <strong>{brand.brand_name || 'N/A'}</strong>
                      {brand.is_verified && (
                        <span className="material-symbols-outlined" style={{ marginLeft: '8px', color: '#10b981', fontSize: '18px' }}>
                          verified
                        </span>
                      )}
                    </td>
                    <td>{brand.business_name || 'N/A'}</td>
                    <td>{brand.business_email || brand.user_email}</td>
                    <td>
                      <button
                        className="admin-brand-number-link"
                        onClick={() => handleViewProducts(brand)}
                        title="View products"
                      >
                        {brand.total_products}
                      </button>
                    </td>
                    <td>
                      <button
                        className="admin-brand-number-link"
                        onClick={() => handleViewOrders(brand)}
                        title="View orders"
                      >
                        {brand.total_orders}
                      </button>
                    </td>
                    <td>
                      <strong>{formatCurrency(parseFloat(brand.total_order_value || '0'))}</strong>
                    </td>
                    <td>
                      <strong className="tw-text-green-600">{formatCurrency(parseFloat(brand.total_net_profit || '0'))}</strong>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${getStatusBadgeClass(brand.status)}`}>
                        {brand.status_display || brand.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          className="admin-modern-btn secondary icon-only"
                          onClick={() => handleViewDetails(brand)}
                          title="View details"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        {brand.status === 'active' ? (
                          <button
                            className="admin-modern-btn warning icon-only"
                            onClick={() => handleSuspend(brand.id)}
                            title="Suspend brand"
                          >
                            <span className="material-symbols-outlined">block</span>
                          </button>
                        ) : (
                          <button
                            className="admin-modern-btn success icon-only"
                            onClick={() => handleActivate(brand.id)}
                            title="Activate brand"
                          >
                            <span className="material-symbols-outlined">check_circle</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {brands.length === 0 && !loading && (
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
                        }}>store</span>
                        <h3 style={{ margin: '0 0 8px 0', textAlign: 'center', color: '#555' }}>No brands found</h3>
                        <p style={{ margin: 0, textAlign: 'center', color: '#888' }}>Brands will appear here once vendors register</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-btn secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="admin-btn secondary"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Products Modal */}
      {showProductsModal && selectedBrand && (
        <div className="admin-modal-overlay" onClick={() => setShowProductsModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Products - {selectedBrand.brand_name}</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowProductsModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              {loadingDetails ? (
                <div className="admin-loading-state">
                  <div className="admin-loader"></div>
                  <p>Loading products...</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {product.main_image && (
                                <img src={product.main_image} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                              )}
                              <span>{product.title}</span>
                            </div>
                          </td>
                          <td>{product.sku || 'N/A'}</td>
                          <td>{formatCurrency(product.price || 0)}</td>
                          <td>{product.total_stock || 0}</td>
                          <td>
                            <span className={`admin-status-badge ${product.is_active ? 'success' : 'inactive'}`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="admin-modern-btn danger icon-only"
                              onClick={() => handleDeleteProduct(product.id, product.title)}
                              title="Delete product"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
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
                                fontSize: '48px', 
                                color: '#ccc', 
                                marginBottom: '12px' 
                              }}>inventory_2</span>
                              <p style={{ margin: 0, textAlign: 'center', color: '#888' }}>No products found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrdersModal && selectedBrand && (
        <div className="admin-modal-overlay" onClick={() => setShowOrdersModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Orders - {selectedBrand.brand_name}</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowOrdersModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              {loadingDetails ? (
                <div className="admin-loading-state">
                  <div className="admin-loader"></div>
                  <p>Loading orders...</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.order_number || order.id}</td>
                          <td>
                            {order.customer_name || order.customer_email || order.user?.email || order.user_email || 'N/A'}
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`admin-status-badge ${
                              order.status === 'delivered' ? 'success' :
                              order.status === 'cancelled' || order.status === 'returned' ? 'error' :
                              order.status === 'processing' || order.status === 'shipped' ? 'info' :
                              'warning'
                            }`}>
                              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
                            </span>
                          </td>
                          <td>{formatCurrency(parseFloat(order.order_value || order.total_amount || '0'))}</td>
                          <td>
                            <button
                              className="admin-modern-btn secondary icon-only"
                              onClick={() => {
                                setShowOrdersModal(false);
                                navigate(`/admin/orders/${order.id}`);
                              }}
                              title="View order"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
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
                                fontSize: '48px', 
                                color: '#ccc', 
                                marginBottom: '12px' 
                              }}>receipt_long</span>
                              <p style={{ margin: 0, textAlign: 'center', color: '#888' }}>No orders found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Brand Detail Modal */}
      {showDetailModal && selectedBrand && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2>Brand Details - {selectedBrand.brand_name}</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              {loadingDetails ? (
                <div className="admin-loading-state">
                  <div className="admin-loader"></div>
                  <p>Loading brand details...</p>
                </div>
              ) : brandDetail ? (
                <div className="tw-space-y-6">
                  {/* Basic Information */}
                  <div className="admin-modern-card">
                    <div className="admin-card-header">
                      <h3 className="tw-flex tw-items-center tw-gap-2">
                        <span className="material-symbols-outlined tw-text-blue-600">store</span>
                        Basic Information
                      </h3>
                    </div>
                    <div className="tw-p-6 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Brand Name</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.brand_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Business Name</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.business_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Business Email</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.business_email || brandDetail.user_email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Business Phone</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.business_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Business Address</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.business_address || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">City, State, Pincode</label>
                        <p className="tw-text-base tw-text-gray-800">
                          {[brandDetail.city, brandDetail.state, brandDetail.pincode].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Country</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.country || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Status</label>
                        <p className="tw-text-base">
                          <span className={`admin-status-badge ${getStatusBadgeClass(brandDetail.status)}`}>
                            {brandDetail.status_display || brandDetail.status}
                          </span>
                          {brandDetail.is_verified && (
                            <span className="material-symbols-outlined" style={{ marginLeft: '8px', color: '#10b981' }}>
                              verified
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">GST Number</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.gst_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">PAN Number</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.pan_number || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="admin-modern-card">
                    <div className="admin-card-header">
                      <h3 className="tw-flex tw-items-center tw-gap-2">
                        <span className="material-symbols-outlined tw-text-green-600">person</span>
                        Account Information
                      </h3>
                    </div>
                    <div className="tw-p-6 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">User Name</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.user_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Email</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.user_email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Username</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.user_username || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Mobile</label>
                        <p className="tw-text-base tw-text-gray-800">{brandDetail.user_mobile || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="admin-modern-card">
                    <div className="admin-card-header">
                      <h3 className="tw-flex tw-items-center tw-gap-2">
                        <span className="material-symbols-outlined tw-text-purple-600">account_balance</span>
                        Payment Details
                      </h3>
                    </div>
                    <div className="tw-p-6 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                      {brandDetail.account_holder_name ? (
                        <>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Account Holder Name</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.account_holder_name}</p>
                          </div>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Account Number</label>
                            <p className="tw-text-base tw-text-gray-800">
                              {brandDetail.account_number ? '****' + brandDetail.account_number.slice(-4) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">IFSC Code</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.ifsc_code || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Bank Name</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.bank_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Branch Name</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.branch_name || 'N/A'}</p>
                          </div>
                        </>
                      ) : (
                        <div className="tw-col-span-2">
                          <p className="tw-text-gray-500 tw-text-center tw-py-4">No bank account details provided</p>
                        </div>
                      )}
                      {brandDetail.upi_id && (
                        <div>
                          <label className="tw-text-sm tw-font-semibold tw-text-gray-600">UPI ID</label>
                          <p className="tw-text-base tw-text-gray-800">{brandDetail.upi_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipment Details */}
                  <div className="admin-modern-card">
                    <div className="admin-card-header">
                      <h3 className="tw-flex tw-items-center tw-gap-2">
                        <span className="material-symbols-outlined tw-text-orange-600">local_shipping</span>
                        Shipment Address
                      </h3>
                    </div>
                    <div className="tw-p-6 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                      {brandDetail.shipment_address ? (
                        <>
                          <div className="tw-col-span-2">
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Street Address</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.shipment_address}</p>
                          </div>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">City</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.shipment_city || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">State</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.shipment_state || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Pincode</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.shipment_pincode || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Country</label>
                            <p className="tw-text-base tw-text-gray-800">{brandDetail.shipment_country || 'N/A'}</p>
                          </div>
                          {brandDetail.shipment_latitude && brandDetail.shipment_longitude && (
                            <div>
                              <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Coordinates</label>
                              <p className="tw-text-base tw-text-gray-800 tw-font-mono">
                                Lat: {Number(brandDetail.shipment_latitude).toFixed(6)}, Lng: {Number(brandDetail.shipment_longitude).toFixed(6)}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="tw-col-span-2">
                          <p className="tw-text-gray-500 tw-text-center tw-py-4">No shipment address provided</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="admin-modern-card">
                    <div className="admin-card-header">
                      <h3 className="tw-flex tw-items-center tw-gap-2">
                        <span className="material-symbols-outlined tw-text-indigo-600">analytics</span>
                        Statistics
                      </h3>
                    </div>
                    <div className="tw-p-6 tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Total Products</label>
                        <p className="tw-text-2xl tw-font-bold tw-text-gray-800">{brandDetail.total_products || 0}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Total Orders</label>
                        <p className="tw-text-2xl tw-font-bold tw-text-gray-800">{brandDetail.total_orders || 0}</p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Total Order Value</label>
                        <p className="tw-text-2xl tw-font-bold tw-text-gray-800">
                          {formatCurrency(parseFloat(brandDetail.total_order_value || '0'))}
                        </p>
                      </div>
                      <div>
                        <label className="tw-text-sm tw-font-semibold tw-text-gray-600">Net Profit</label>
                        <p className="tw-text-2xl tw-font-bold tw-text-green-600">
                          {formatCurrency(parseFloat(brandDetail.total_net_profit || '0'))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="admin-empty-state">
                  <p>Failed to load brand details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;

