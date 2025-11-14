import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import { formatCurrency } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface Order {
  id: number;
  customer_name: string;
  status: string;
  payment_status: string;
  items_count: number;
  order_value: string;
  net_profit: string;
  vendor_profit: string;
  created_at: string;
}

const AdminOrders: React.FC = () => {
  const api = useAdminAPI();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSellerPanel = location.pathname.startsWith('/seller');
  const basePath = isSellerPanel ? '/seller' : '/admin';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || '');
  const [filterPayment, setFilterPayment] = useState<string>(searchParams.get('payment_status') || '');
  const [filterPaymentMethod] = useState<string>(searchParams.get('payment_method') || '');
  const [filterBrand, setFilterBrand] = useState<string>(searchParams.get('brand') || '');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [brands, setBrands] = useState<any[]>([]);
  
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
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          search: searchTerm,
          date_from: dateFrom,
          date_to: dateTo,
        };
        
        if (filterStatus) params.status = filterStatus;
        if (filterPayment) params.payment_status = filterPayment;
        if (filterPaymentMethod) params.payment_method = filterPaymentMethod;
        if (filterBrand && !isSellerPanel) {
          params.vendor = filterBrand;
        } else if (!isSellerPanel && !filterBrand) {
          // Exclude Sixpine orders by default in admin order management
          params.exclude_sixpine = 'true';
        }
        
        const response = await api.getOrders(params);
        // Handle both paginated and non-paginated responses
        if (response.data.results) {
          setOrders(response.data.results);
          setTotalPages(Math.ceil(response.data.count / (response.data.results.length || 1)));
        } else if (Array.isArray(response.data)) {
          setOrders(response.data);
          setTotalPages(1);
        } else {
          setOrders([]);
          setTotalPages(1);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentPage, searchTerm, filterStatus, filterPayment, filterPaymentMethod, filterBrand, dateFrom, dateTo, isSellerPanel]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };
  
  if (loading && orders.length === 0) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading orders...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">shopping_bag</span>
          <div>
            <h1>Orders Management</h1>
            <p className="admin-page-subtitle">View and manage customer orders from other seller brands</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="admin-filters-bar">
        <form onSubmit={handleSearch} className="admin-search-form">
          <div className="admin-search-input">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search orders by customer name..."
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
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-form-select"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
          
          <select
            value={filterPayment}
            onChange={(e) => {
              setFilterPayment(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-form-select"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <div className="date-range-filter">
            <input
              type="date"
              placeholder="From"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-form-input"
            />
            <span>to</span>
            <input
              type="date"
              placeholder="To"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-form-input"
            />
          </div>
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
      
      {/* Orders table */}
      <div className="admin-modern-card">
        <table className="admin-modern-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Items</th>
              <th>Order Value</th>
              <th>Net Profit</th>
              <th>Vendor Profit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                <td data-label="Customer">{order.customer_name}</td>
                <td data-label="Status">
                  <span className={`admin-status-badge ${
                    order.status === 'delivered' ? 'success' :
                    order.status === 'cancelled' || order.status === 'returned' ? 'error' :
                    order.status === 'processing' || order.status === 'shipped' ? 'info' :
                    'warning'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td data-label="Payment">
                  <span className={`admin-status-badge ${
                    order.payment_status === 'paid' ? 'success' :
                    order.payment_status === 'failed' || order.payment_status === 'refunded' ? 'error' :
                    'warning'
                  }`}>
                    {order.payment_status}
                  </span>
                </td>
                <td data-label="Items">{order.items_count}</td>
                <td data-label="Order Value">
                  <strong>{formatCurrency(parseFloat(order.order_value || '0'))}</strong>
                </td>
                <td data-label="Net Profit">
                  <strong className="tw-text-green-600">{formatCurrency(parseFloat(order.net_profit || '0'))}</strong>
                </td>
                <td data-label="Vendor Profit">
                  <strong className="tw-text-blue-600">{formatCurrency(parseFloat(order.vendor_profit || '0'))}</strong>
                </td>
                <td className="actions" data-label="Actions">
                  <Link to={`${basePath}/orders/${order.id}`} className="admin-modern-btn secondary icon-only">
                    <span className="material-symbols-outlined">visibility</span>
                  </Link>
                </td>
              </tr>
            ))}
            
            {orders.length === 0 && !loading && (
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
                    }}>receipt_long</span>
                    <h3 style={{ margin: '0 0 8px 0', textAlign: 'center', color: '#555' }}>No orders found</h3>
                    <p style={{ margin: 0, textAlign: 'center', color: '#888' }}>Orders will appear here once customers make purchases</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
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

export default AdminOrders;