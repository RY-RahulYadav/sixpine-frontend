import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import { showToast } from '../utils/adminUtils';

interface OrderItem {
  id: number;
  product: {
    id: number;
    title?: string;
    name?: string;
    slug?: string;
    main_image?: string;
    image_url?: string;
    main_image_url?: string;
  };
  product_id?: number;
  quantity: number;
  price?: number | string;
  unit_price?: number | string;
  total_price: number | string;
  variant_info?: string;
}

interface Order {
  id: number;
  order_number: string;
  order_id?: string;
  coupon?: {
    id: number;
    code: string;
    discount_type: string;
    discount_value: string;
  } | null;
  coupon_discount?: number;
  tax_rate?: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  items: OrderItem[];
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number | string;
  total: number | string;
  total_amount?: number | string;
  shipping_cost: number | string;
  platform_fee?: number | string;
  tax: number | string;
  tax_amount?: number | string;
  shipping_address: {
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const AdminOrderDetail: React.FC = () => {
  const api = useAdminAPI();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id || isNaN(parseInt(id))) {
          setError('Invalid order ID');
          setLoading(false);
          return;
        }
        
        const response = await api.getOrder(parseInt(id!));
        
        if (!response || !response.data) {
          setError('Order not found');
          setLoading(false);
          return;
        }
        
        const orderData = response.data;
        const normalizedOrder: Order = {
          ...orderData,
          items: orderData.items || orderData.order_items || [],
          status: (orderData.status || '').toLowerCase().trim(),
          payment_status: (orderData.payment_status || '').toLowerCase().trim(),
          user: orderData.user || orderData.customer || {
            id: 0,
            username: 'Unknown',
            email: '',
            first_name: '',
            last_name: ''
          },
          shipping_address: orderData.shipping_address || {
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            phone: ''
          }
        };
        
        setOrder(normalizedOrder);
        
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load order details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="admin-error-container">
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
        <button 
          className="admin-btn"
          onClick={() => navigate('/admin/orders')}
        >
          Back to Orders
        </button>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="admin-error-container">
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          Order not found
        </div>
        <button 
          className="admin-btn"
          onClick={() => navigate('/admin/orders')}
        >
          Back to Orders
        </button>
      </div>
    );
  }
  
  const formatCurrency = (amount: number | string) => {
    let safeAmount = 0;
    
    if (typeof amount === 'string') {
      safeAmount = parseFloat(amount) || 0;
    } else if (typeof amount === 'number') {
      safeAmount = amount;
    }
    
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(safeAmount);
  };
  
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'processing': return '#8b5cf6';
      case 'shipped': return '#06b6d4';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'paid': return '#10b981';
      case 'failed': return '#ef4444';
      case 'refunded': return '#ef4444';
      case 'partially_refunded': return '#f59e0b';
      default: return '#6b7280';
    }
  };
  
  return (
    <div className="admin-order-detail-improved">
      {/* Header */}
      <div className="order-detail-header">
        <div className="header-left">
          <button 
            className="back-btn-icon" 
            onClick={() => navigate('/admin/orders')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="order-title-section">
            <h1>Order Details</h1>
            <p className="order-number">#{order?.order_number || order?.order_id || 'Unknown'}</p>
          </div>
        </div>
        <div className="header-status-badges">
          <div 
            className="status-badge-large"
            style={{ 
              backgroundColor: `${getStatusColor(order?.status || '')}15`,
              color: getStatusColor(order?.status || ''),
              borderColor: getStatusColor(order?.status || '')
            }}
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="status-text">{order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1) || 'Unknown'}</span>
        </div>
          <div 
            className="status-badge-large"
            style={{ 
              backgroundColor: `${getStatusColor(order?.payment_status || '')}15`,
              color: getStatusColor(order?.payment_status || ''),
              borderColor: getStatusColor(order?.payment_status || '')
            }}
          >
            <span className="material-symbols-outlined">payment</span>
            <span className="status-text">
              {order?.payment_status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="order-detail-grid">
        {/* Main Content */}
        <div className="order-main-content">
          {/* Order Items Card */}
          <div className="order-card">
            <div className="card-header">
              <h3>
                <span className="material-symbols-outlined">shopping_cart</span>
                Order Items
              </h3>
            </div>
            <div className="order-items-table-wrapper">
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="product-info-cell">
                            {(item.product?.main_image || item.product?.image_url || item.product?.main_image_url) && (
                              <img 
                                src={item.product.main_image || item.product.image_url || item.product.main_image_url} 
                                alt={item.product?.title || item.product?.name || 'Product'} 
                                className="product-img" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="product-details">
                              <div className="product-title">
                                {item.product?.title || item.product?.name || 'Unknown Product'}
                              </div>
                              {item.product?.slug && (
                                  <a 
                                  className="view-product-link"
                                  href={`/products-details/${item.product.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >
                                    View Product
                                  </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="variant-cell">
                          <span className="variant-badge">{item.variant_info || '-'}</span>
                        </td>
                        <td className="price-cell">{formatCurrency(item.price || item.unit_price || 0)}</td>
                        <td className="quantity-cell">
                          <span className="quantity-badge">{item.quantity || 0}</span>
                        </td>
                        <td className="total-cell">
                          <strong>{formatCurrency(item.total_price || 0)}</strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px',
                        verticalAlign: 'middle',
                        width: '100%',
                        color: '#888'
                      }}>
                        No order items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Order Summary */}
            <div className="order-summary-card">
              <h4>Order Summary</h4>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order?.subtotal || 0)}</span>
              </div>
              {(Number(order.coupon_discount) || 0) > 0 && (
                <>
                  <div className="summary-row discount-row" style={{ color: '#28a745' }}>
                    <span>
                      {order.coupon?.code ? `Coupon Discount (${order.coupon.code})` : 'Discount'}
                    </span>
                    <span>-{formatCurrency(order?.coupon_discount || 0)}</span>
                  </div>
                  {order.coupon && (
                    <div className="summary-row" style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', paddingTop: '4px' }}>
                      <span>Coupon Applied:</span>
                      <span>{order.coupon.code} ({order.coupon.discount_value}{order.coupon.discount_type === 'percentage' ? '%' : '₹'})</span>
                    </div>
                  )}
                </>
              )}
              {(Number(order.shipping_cost) || 0) > 0 && (
                <div className="summary-row">
                  <span>Shipping Cost</span>
                  <span>{formatCurrency(order?.shipping_cost || 0)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Platform Fee</span>
                <span>{formatCurrency(order?.platform_fee || 0)}</span>
              </div>
              <div className="summary-row">
                <span>Tax ({order.tax_rate || '5.00'}%)</span>
                <span>{formatCurrency(order?.tax_amount || order.tax || 0)}</span>
              </div>
              <div className="summary-row total-row">
                <span><strong>Total Amount Paid</strong></span>
                <span className="total-amount"><strong>{formatCurrency(order?.total_amount || order.total || 0)}</strong></span>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Sidebar */}
        <div className="order-sidebar">
          {/* Order Info Card */}
          <div className="order-card">
            <div className="card-header">
              <h3>
                <span className="material-symbols-outlined">info</span>
                Order Information
              </h3>
            </div>
            <div className="info-list">
              <div className="info-item">
                <label>
                  <span className="material-symbols-outlined">calendar_today</span>
                  Order Date
                </label>
                <span>{order?.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>
                  <span className="material-symbols-outlined">person</span>
                  Customer
                </label>
                <span>{order?.user?.first_name} {order?.user?.last_name}</span>
              </div>
              <div className="info-item">
                <label>
                  <span className="material-symbols-outlined">email</span>
                  Email
                </label>
                <span>{order?.user?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>
                  <span className="material-symbols-outlined">credit_card</span>
                  Payment Method
                </label>
                <span>{order?.payment_method || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Shipping Address Card */}
          <div className="order-card">
            <div className="card-header">
              <h3>
                <span className="material-symbols-outlined">local_shipping</span>
                Shipping Address
              </h3>
            </div>
            <div className="address-card">
              <p className="address-line">{order?.shipping_address?.address_line1 || ''}</p>
              {order?.shipping_address?.address_line2 && (
                <p className="address-line">{order.shipping_address.address_line2}</p>
              )}
              <p className="address-line">
                {order?.shipping_address?.city}, {order?.shipping_address?.state} {order?.shipping_address?.postal_code}
              </p>
              <p className="address-line">{order?.shipping_address?.country}</p>
              {order?.shipping_address?.phone && (
                <p className="address-line phone-line">
                  <span className="material-symbols-outlined">phone</span>
                  {order.shipping_address.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
