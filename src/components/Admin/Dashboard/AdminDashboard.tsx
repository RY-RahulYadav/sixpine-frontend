import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_order_value: number | string;
  total_net_profit: number | string;
  seller_net_profit: number | string;
  sixpine_profit: number | string;
  total_net_revenue: number | string;
  total_products: number;
  orders_placed_count: number;
  delivered_orders_count: number;
  cod_orders_count: number;
  online_payment_orders_count: number;
  low_stock_products: number;
  recent_orders: any[];
  top_selling_products: any[];
  sales_by_day: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboardStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p className="admin-loading-text">Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error || !stats) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon">
          <span className="material-symbols-outlined">error</span>
        </div>
        <h3 className="admin-empty-title">{error || 'An unknown error occurred'}</h3>
        <button onClick={() => window.location.reload()} className="admin-modern-btn primary">
          <span className="material-symbols-outlined">refresh</span>
          Try Again
        </button>
      </div>
    );
  }
  // Limit to 5 items for display
  const recentOrders = stats.recent_orders ? stats.recent_orders.slice(0, 5) : [];
  const topProducts = stats.top_selling_products ? stats.top_selling_products.slice(0, 5) : [];
  
  return (
    <div className="admin-dashboard">
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: 'var(--admin-dark)', 
          marginBottom: '8px',
          fontFamily: 'var(--font-heading)'
        }}>
          Dashboard Overview
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-light)' }}>
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="admin-grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon primary">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>payments</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Total Order Value</div>
              <div className="admin-stat-value">{formatCurrency(stats.total_order_value)}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon success" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)', color: '#10b981' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>trending_up</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Net Profit (Sellers)</div>
              <div className="admin-stat-value" style={{ color: '#10b981' }}>{formatCurrency(stats.seller_net_profit || stats.total_net_profit)}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon warning" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)', color: '#f59e0b' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>store</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Sixpine Profit</div>
              <div className="admin-stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(stats.sixpine_profit || '0')}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon success" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)', color: '#10b981' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>account_balance</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Total Net Revenue</div>
              <div className="admin-stat-value" style={{ color: '#10b981', fontWeight: '700' }}>{formatCurrency(stats.total_net_revenue || '0')}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Stats Row */}
      <div className="admin-grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>shopping_cart</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Total Orders</div>
              <div className="admin-stat-value">{stats.total_orders}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon success">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>inventory_2</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Products</div>
              <div className="admin-stat-value">{stats.total_products}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon success">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>check_circle</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Delivered Orders</div>
              <div className="admin-stat-value">{stats.delivered_orders_count}</div>
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-icon warning">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>warning</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="admin-stat-label">Low Stock Products</div>
              <div className="admin-stat-value">{stats.low_stock_products}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Summary Cards */}
      <div className="admin-grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="admin-modern-card" style={{ border: '2px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="admin-card-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>shopping_cart</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Orders Placed
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                  {stats.orders_placed_count}
                </div>
              </div>
            </div>
          </div>
          <Link to="/admin/orders" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
            View All Orders →
          </Link>
        </div>
        
        <div className="admin-modern-card" style={{ border: '2px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="admin-card-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>local_shipping</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Delivered
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                  {stats.delivered_orders_count}
                </div>
              </div>
            </div>
          </div>
          <Link to="/admin/orders?status=delivered" style={{ fontSize: '13px', color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>
            View Delivered →
          </Link>
        </div>
        
        <div className="admin-modern-card" style={{ border: '2px solid rgba(245, 158, 11, 0.2)' }}>
          <div className="admin-card-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>money</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  COD Orders
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                  {stats.cod_orders_count}
                </div>
              </div>
            </div>
          </div>
          <Link to="/admin/orders?payment_method=COD" style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600', textDecoration: 'none' }}>
            View COD Orders →
          </Link>
        </div>
        
        <div className="admin-modern-card" style={{ border: '2px solid rgba(139, 92, 246, 0.2)' }}>
          <div className="admin-card-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>credit_card</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Online Payment
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                  {stats.online_payment_orders_count}
                </div>
              </div>
            </div>
          </div>
          <Link to="/admin/orders?payment_method=online" style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: '600', textDecoration: 'none' }}>
            View Online Payments →
          </Link>
        </div>
      </div>
      
      {/* Recent Orders & Top Products */}
      <div className="admin-grid-2">
        {/* Recent Orders */}
        <div className="admin-modern-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Orders</h3>
              <div className="admin-card-subtitle">Latest customer orders</div>
            </div>
            <Link to="/admin/orders" className="admin-modern-btn sm outline">
              <span className="material-symbols-outlined">open_in_new</span>
              View All
            </Link>
          </div>
          <div className="admin-card-body">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="admin-modern-table-container" style={{ marginBottom: '0', boxShadow: 'none' }}>
                <table className="admin-modern-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                          #{order.order_id.substring(0, 8).toUpperCase()}
                        </td>
                        <td>{order.customer_name}</td>
                        <td style={{ fontWeight: '600' }}>{formatCurrency(order.total_amount)}</td>
                        <td>
                          <span className={`admin-status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <Link to={`/admin/orders/${order.id}`} className="admin-icon-btn primary">
                            <span className="material-symbols-outlined">visibility</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                <div className="admin-empty-icon">
                  <span className="material-symbols-outlined">shopping_cart</span>
                </div>
                <div className="admin-empty-message">No recent orders found.</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Top Products */}
        <div className="admin-modern-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Top Selling Products</h3>
              <div className="admin-card-subtitle">Best performing products</div>
            </div>
            <Link to="/admin/products" className="admin-modern-btn sm outline">
              <span className="material-symbols-outlined">open_in_new</span>
              View All
            </Link>
          </div>
          <div className="admin-card-body">
            {topProducts && topProducts.length > 0 ? (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--admin-text-light)' }} />
                    <YAxis 
                      type="category" 
                      dataKey="title" 
                      width={100}
                      tick={{ fontSize: 11, fill: 'var(--admin-text)' }}
                      tickFormatter={(title) => title.length > 15 ? title.substring(0, 15) + '...' : title} 
                    />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Units Sold']}
                      contentStyle={{
                        background: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    />
                    <Bar dataKey="sold" fill="var(--admin-primary)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="admin-empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                <div className="admin-empty-icon">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="admin-empty-message">No top selling products found.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;