import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../../../services/api';
import '../../../styles/admin-theme.css';

interface DashboardStats {
  total_orders: number;
  total_order_value: string;
  total_revenue: string; // Keep for backward compatibility
  total_net_profit: string;
  total_products: number;
  delivered_orders_count: number;
  cod_orders_count: number;
  online_payment_orders_count: number;
  low_stock_products: number;
  recent_orders: any[];
  top_selling_products: any[];
  sales_by_day: any[];
}

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>{error}</p>
        <button onClick={fetchDashboardStats}>Retry</button>
      </div>
    );
  }

  if (!stats) {
    return <div>No data available</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon primary">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <div>
              <div className="admin-stat-label">Total Products</div>
              <div className="admin-stat-value">{stats.total_products}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon secondary">
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
            <div>
              <div className="admin-stat-label">Total Orders</div>
              <div className="admin-stat-value">{stats.total_orders}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon primary">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>payments</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Total Order Value</div>
              <div className="admin-stat-value">₹{parseFloat(stats.total_order_value || stats.total_revenue || '0').toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon success" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)', color: '#10b981' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>trending_up</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Net Profit</div>
              <div className="admin-stat-value" style={{ color: '#10b981' }}>₹{parseFloat(stats.total_net_profit || '0').toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon success">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <div className="admin-stat-label">Delivered Orders</div>
              <div className="admin-stat-value">{stats.delivered_orders_count}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon secondary">
              <span className="material-symbols-outlined">credit_card</span>
            </div>
            <div>
              <div className="admin-stat-label">Online Payments</div>
              <div className="admin-stat-value">{stats.online_payment_orders_count}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon primary">
              <span className="material-symbols-outlined">money</span>
            </div>
            <div>
              <div className="admin-stat-label">COD Orders</div>
              <div className="admin-stat-value">{stats.cod_orders_count}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon warning">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <div className="admin-stat-label">Low Stock Products</div>
              <div className="admin-stat-value">{stats.low_stock_products}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)' }}>
        {/* Recent Orders Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">
                <span className="material-symbols-outlined">receipt_long</span>
                Recent Orders
              </h2>
              <p className="admin-card-description">Latest orders from your customers</p>
            </div>
            {stats.recent_orders.length > 0 && (
              <span className="admin-badge" style={{ background: 'var(--admin-primary)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                {stats.recent_orders.length}
              </span>
            )}
          </div>
          <div className="admin-card-body">
            {stats.recent_orders.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                <div className="admin-empty-icon">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div className="admin-empty-message">No recent orders found.</div>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-modern-table">
                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.slice(0, 10).map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--admin-primary)' }}>
                              person
                            </span>
                            <span>{order.customer_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '600', color: 'var(--admin-success)', fontSize: '14px' }}>
                            ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status-badge ${order.status?.toLowerCase() || 'pending'}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontSize: '13px', color: 'var(--admin-text-medium)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              calendar_today
                            </span>
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">
                <span className="material-symbols-outlined">trending_up</span>
                Top Selling Products
              </h2>
              <p className="admin-card-description">Your best performing products</p>
            </div>
            {stats.top_selling_products.length > 0 && (
              <span className="admin-badge" style={{ background: 'var(--admin-success)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                {stats.top_selling_products.length}
              </span>
            )}
          </div>
          <div className="admin-card-body">
            {stats.top_selling_products.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                <div className="admin-empty-icon">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="admin-empty-message">No top selling products found.</div>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-modern-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th style={{ textAlign: 'center' }}>SOLD</th>
                      <th style={{ textAlign: 'right' }}>REVENUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_selling_products.map((product, index) => (
                      <tr key={product.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              background: index < 3 
                                ? 'linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%)'
                                : 'linear-gradient(135deg, rgba(26, 59, 169, 0.1) 0%, rgba(53, 122, 189, 0.1) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontWeight: '700',
                              color: index < 3 ? 'white' : 'var(--admin-primary)',
                              fontSize: '12px'
                            }}>
                              {index + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '600', color: 'var(--admin-text)', fontSize: '14px', marginBottom: '2px' }}>
                                {product.title}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--admin-text-light)' }}>
                                Product ID: {product.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 'var(--spacing-xs)',
                            background: 'rgba(26, 59, 169, 0.1)',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: '600',
                            color: 'var(--admin-primary)',
                            fontSize: '13px'
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              shopping_cart
                            </span>
                            {product.sold}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ 
                            fontWeight: '700', 
                            color: 'var(--admin-success)', 
                            fontSize: '15px',
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                          }}>
                            ₹{product.revenue.toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

