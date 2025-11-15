import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { formatCurrency } from '../utils/adminUtils';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import '../../../styles/admin-theme.css';

interface PlatformAnalyticsData {
  order_stats: {
    total_orders: number;
    total_order_value: number;
    average_order_value: number;
    orders_by_status: { status: string; count: number }[];
    orders_by_month: { month: string; count: number; order_value: number }[];
    payment_methods: { method: string; count: number; total_value: number }[];
  };
  seller_stats: {
    total_vendors: number;
    total_seller_products: number;
    total_seller_orders: number;
    seller_order_value: number;
    seller_net_profit: number;
    orders_by_month: { month: string; count: number; order_value: number; net_profit: number }[];
  };
  sixpine_stats: {
    total_products: number;
    active_products: number;
    total_orders: number;
    sixpine_order_value: number;
    sixpine_profit: number;
    orders_by_month: { month: string; count: number; order_value: number; profit: number }[];
    top_products: { id: number; title: string; sold: number; revenue: number }[];
  };
  platform_summary: {
    total_products: number;
    total_order_value: number;
    total_net_revenue: number;
    seller_net_profit: number;
    sixpine_profit: number;
  };
}

const COLORS = ['#ff6f00', '#067d62', '#357abd', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#6366f1'];

const AdminBrandAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'sixpine' | 'orders'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getPlatformAnalytics();
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Error fetching platform analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading platform analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="admin-page">
        <div className="admin-alert error">
          <span className="material-symbols-outlined">error</span>
          <div className="admin-alert-content">
            <strong>Error</strong>
            <p>{error || 'Failed to load analytics'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-header-container">
        <h1>Platform Analytics</h1>
        <p className="admin-subtitle">Comprehensive insights into seller profits, Sixpine products, and platform orders</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="material-symbols-outlined">dashboard</span>
          Overview
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'sellers' ? 'active' : ''}`}
          onClick={() => setActiveTab('sellers')}
        >
          <span className="material-symbols-outlined">store</span>
          Seller Profit
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'sixpine' ? 'active' : ''}`}
          onClick={() => setActiveTab('sixpine')}
        >
          <span className="material-symbols-outlined">inventory_2</span>
          Sixpine Products
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span className="material-symbols-outlined">receipt_long</span>
          Orders
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="admin-modern-card" style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #357abd 0%, #5a9ed6 100%)',
              color: 'white',
              border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Order Value</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    {formatCurrency(analytics.platform_summary.total_order_value)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    {analytics.order_stats.total_orders} total orders
                  </div>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>shopping_cart</span>
                </div>
              </div>
            </div>

            <div className="admin-modern-card" style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #067d62 0%, #0a9e7e 100%)',
              color: 'white',
              border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Net Revenue</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    {formatCurrency(analytics.platform_summary.total_net_revenue)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    Platform profit
                  </div>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>account_balance_wallet</span>
                </div>
              </div>
            </div>

            <div className="admin-modern-card" style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #ff6f00 0%, #ff8c42 100%)',
              color: 'white',
              border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Seller Net Profit</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    {formatCurrency(analytics.platform_summary.seller_net_profit)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    From {analytics.seller_stats.total_vendors} vendors
                  </div>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>store</span>
                </div>
              </div>
            </div>

            <div className="admin-modern-card" style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              color: 'white',
              border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Sixpine Profit</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    {formatCurrency(analytics.platform_summary.sixpine_profit)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    {analytics.sixpine_stats.active_products} active products
                  </div>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>inventory_2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="admin-modern-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
              Revenue Trend (Last 12 Months)
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics.order_stats.orders_by_month}>
                <defs>
                  <linearGradient id="colorOrderValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#357abd" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#357abd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Order Value']}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="order_value"
                  stroke="#357abd"
                  strokeWidth={3}
                  fill="url(#colorOrderValue)"
                  name="Order Value"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="admin-modern-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--admin-primary)', marginBottom: '8px' }}>
                {analytics.platform_summary.total_products}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)' }}>Total Products</div>
            </div>
            <div className="admin-modern-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--admin-primary)', marginBottom: '8px' }}>
                {analytics.seller_stats.total_vendors}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)' }}>Active Vendors</div>
            </div>
            <div className="admin-modern-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--admin-primary)', marginBottom: '8px' }}>
                {analytics.order_stats.total_orders}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)' }}>Total Orders</div>
            </div>
            <div className="admin-modern-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--admin-primary)', marginBottom: '8px' }}>
                {formatCurrency(analytics.order_stats.average_order_value)}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)' }}>Avg Order Value</div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Profit Tab */}
      {activeTab === 'sellers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Seller Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Total Vendors</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                {analytics.seller_stats.total_vendors}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Seller Products</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                {analytics.seller_stats.total_seller_products}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Seller Orders</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                {analytics.seller_stats.total_seller_orders}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Seller Order Value</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-primary)' }}>
                {formatCurrency(analytics.seller_stats.seller_order_value)}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #ff6f00 0%, #ff8c42 100%)', color: 'white', border: 'none' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Seller Net Profit</div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {formatCurrency(analytics.seller_stats.seller_net_profit)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                Tax + Platform Fees
              </div>
            </div>
          </div>

          {/* Seller Revenue & Profit Trend */}
          <div className="admin-modern-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
              Seller Revenue & Profit Trend
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics.seller_stats.orders_by_month}>
                <defs>
                  <linearGradient id="colorSellerValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6f00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff6f00" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSellerProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#067d62" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#067d62" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'order_value' ? 'Order Value' : 'Net Profit'
                  ]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="order_value"
                  stroke="#ff6f00"
                  strokeWidth={3}
                  fill="url(#colorSellerValue)"
                  name="Order Value"
                />
                <Area
                  type="monotone"
                  dataKey="net_profit"
                  stroke="#067d62"
                  strokeWidth={3}
                  fill="url(#colorSellerProfit)"
                  name="Net Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sixpine Products Tab */}
      {activeTab === 'sixpine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Sixpine Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Total Products</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                {analytics.sixpine_stats.total_products}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Active Products</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                {analytics.sixpine_stats.active_products}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Total Orders</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                {analytics.sixpine_stats.total_orders}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Order Value</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-primary)' }}>
                {formatCurrency(analytics.sixpine_stats.sixpine_order_value)}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', color: 'white', border: 'none' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Sixpine Profit</div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {formatCurrency(analytics.sixpine_stats.sixpine_profit)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                From delivered orders
              </div>
            </div>
          </div>

          {/* Sixpine Revenue & Profit Trend */}
          <div className="admin-modern-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
              Sixpine Revenue & Profit Trend
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics.sixpine_stats.orders_by_month}>
                <defs>
                  <linearGradient id="colorSixpineValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSixpineProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#067d62" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#067d62" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'order_value' ? 'Order Value' : 'Profit'
                  ]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="order_value"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#colorSixpineValue)"
                  name="Order Value"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#067d62"
                  strokeWidth={3}
                  fill="url(#colorSixpineProfit)"
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Sixpine Products */}
          {analytics.sixpine_stats.top_products && analytics.sixpine_stats.top_products.length > 0 && (
            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                Top Selling Sixpine Products
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.sixpine_stats.top_products.slice(0, 10).map((product, index) => (
                  <div key={product.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f9f9f9',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: COLORS[index % COLORS.length],
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          {product.title.length > 40 ? `${product.title.substring(0, 40)}...` : product.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {product.sold} sold
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#067d62' }}>
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Total Orders</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                {analytics.order_stats.total_orders}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Total Order Value</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-primary)' }}>
                {formatCurrency(analytics.order_stats.total_order_value)}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>Average Order Value</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--admin-dark)' }}>
                {formatCurrency(analytics.order_stats.average_order_value)}
              </div>
            </div>
          </div>

          {/* Orders by Status */}
          <div className="admin-modern-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
              Orders by Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.order_stats.orders_by_status}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }: any) => `${status}: ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.order_stats.orders_by_status.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Month */}
          <div className="admin-modern-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
              Orders Trend (Last 12 Months)
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analytics.order_stats.orders_by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'count' ? value : formatCurrency(value),
                    name === 'count' ? 'Orders' : 'Order Value'
                  ]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#357abd" name="Orders" radius={[8, 8, 0, 0]} />
                <Bar dataKey="order_value" fill="#ff6f00" name="Order Value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          {analytics.order_stats.payment_methods && analytics.order_stats.payment_methods.length > 0 && (
            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                Payment Methods
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.order_stats.payment_methods.map((method, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f9f9f9',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: COLORS[index % COLORS.length]
                      }}></div>
                      <span style={{ fontWeight: '500' }}>{method.method}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: '#ff6f00' }}>
                        {formatCurrency(method.total_value)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {method.count} {method.count === 1 ? 'order' : 'orders'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBrandAnalytics;

