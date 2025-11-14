import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { formatCurrency } from '../utils/adminUtils';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import '../../../styles/admin-theme.css';

interface AnalyticsData {
  order_stats: {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_by_status: { status: string; count: number }[];
    orders_by_month: { month: string; count: number; revenue: number }[];
    payment_methods: { method: string; count: number; revenue: number }[];
  };
  product_stats: {
    total_products: number;
    active_products: number;
    low_stock_products: number;
    top_selling: { id: number; title: string; sold: number; revenue: number }[];
    products_by_category: { category: string; count: number }[];
  };
  customer_stats: {
    total_customers: number;
    active_customers: number;
    new_customers_this_month: number;
    top_customers: { id: number; name: string; orders: number; total_spent: number }[];
    customers_by_month: { month: string; count: number }[];
  };
}

const COLORS = ['#ff6f00', '#067d62', '#357abd', '#f59e0b', '#ef4444', '#8b5cf6'];

const BrandAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers'>('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch dashboard stats for now, we'll create a dedicated analytics endpoint later
        const [statsResponse, productsResponse, ordersResponse, usersResponse] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getProducts({ page_size: 1000 }),
          adminAPI.getOrders({ page_size: 1000 }),
          adminAPI.getUsers({ page_size: 1000, is_staff: 'false' }),
        ]);

        const stats = statsResponse.data;
        const products = productsResponse.data.results || [];
        const orders = ordersResponse.data.results || [];
        const customers = usersResponse.data.results || [];

        // Process orders
        const ordersByStatus = orders.reduce((acc: any, order: any) => {
          const status = order.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const ordersByMonth = orders.reduce((acc: any, order: any) => {
          const date = new Date(order.created_at);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!acc[month]) {
            acc[month] = { month, count: 0, revenue: 0 };
          }
          acc[month].count += 1;
          const revenue = parseFloat(order.total_amount || order.total || 0);
          acc[month].revenue += revenue;
          return acc;
        }, {});

        const paymentMethods = orders.reduce((acc: any, order: any) => {
          const method = order.payment_method || 'Unknown';
          if (!acc[method]) {
            acc[method] = { method, count: 0, revenue: 0 };
          }
          acc[method].count += 1;
          const revenue = parseFloat(order.total_amount || order.total || 0);
          acc[method].revenue += revenue;
          return acc;
        }, {});

        // Process customers
        const customersByMonth = customers.reduce((acc: any, customer: any) => {
          const date = new Date(customer.date_joined);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        const thisMonth = new Date().toISOString().slice(0, 7);
        const newCustomersThisMonth = customers.filter((c: any) => 
          new Date(c.date_joined).toISOString().slice(0, 7) === thisMonth
        ).length;

        const analyticsData: AnalyticsData = {
          order_stats: {
            total_orders: stats.total_orders || 0,
            total_revenue: parseFloat(String(stats.total_revenue || '0')),
            average_order_value: (stats.total_orders || 0) > 0 
              ? parseFloat(String(stats.total_revenue || '0')) / (stats.total_orders || 1)
              : 0,
            orders_by_status: Object.entries(ordersByStatus).map(([status, count]) => ({
              status,
              count: count as number,
            })),
            orders_by_month: Object.values(ordersByMonth).sort((a: any, b: any) => 
              a.month.localeCompare(b.month)
            ) as any[],
            payment_methods: Object.values(paymentMethods) as any[],
          },
          product_stats: {
            total_products: stats.total_products || 0,
            active_products: Array.isArray(products) ? products.filter((p: any) => p.is_active).length : 0,
            low_stock_products: stats.low_stock_products || 0,
            top_selling: (stats.top_selling_products || []).map((p: any) => ({
              id: p.id || 0,
              title: p.title || 'Unknown',
              sold: p.sold || 0,
              revenue: p.revenue || 0,
            })),
            products_by_category: Array.isArray(products) ? products.reduce((acc: any, product: any) => {
              const category = product.category || 'Uncategorized';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {}) : {},
          },
          customer_stats: {
            total_customers: Array.isArray(customers) ? customers.length : 0,
            active_customers: Array.isArray(customers) ? customers.filter((c: any) => c.is_active).length : 0,
            new_customers_this_month: newCustomersThisMonth,
            top_customers: [], // Will be populated from order data
            customers_by_month: Object.entries(customersByMonth).map(([month, count]) => ({
              month,
              count: count as number,
            })).sort((a, b) => a.month.localeCompare(b.month)),
          },
        };

        setAnalytics(analyticsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading analytics...</p>
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
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">analytics</span>
          <div>
            <h1>Brand Analytics</h1>
            <p className="admin-page-subtitle">Comprehensive insights and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="material-symbols-outlined">dashboard</span>
          Overview
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          Orders
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <span className="material-symbols-outlined">inventory_2</span>
          Products
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <span className="material-symbols-outlined">people</span>
          Customers
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="analytics-overview">
          {/* Key Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px', 
            marginBottom: '24px' 
          }}>
            <div className="admin-modern-card" style={{ 
              padding: '24px',
              background: 'linear-gradient(135deg, #ff6f00 0%, #ff9e40 100%)',
              color: 'white',
              border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    {formatCurrency(analytics.order_stats.total_revenue)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    Avg: {formatCurrency(analytics.order_stats.average_order_value)} per order
                  </div>
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
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Orders</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    {analytics.order_stats.total_orders}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    {analytics.order_stats.orders_by_status.length} different statuses
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
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                    shopping_cart
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-modern-card" style={{ 
              padding: '24px',
              background: 'linear-gradient(135deg, #357abd 0%, #5a9ed6 100%)',
              color: 'white',
              border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Customers</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    {analytics.customer_stats.total_customers}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    +{analytics.customer_stats.new_customers_this_month} this month
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
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                    people
                  </span>
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
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Active Products</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    {analytics.product_stats.active_products}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    {analytics.product_stats.low_stock_products} low stock items
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
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                    inventory_2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                Revenue Trend
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analytics.order_stats.orders_by_month}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6f00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff6f00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    style={{ fontSize: '12px' }}
                    stroke="#888"
                  />
                  <YAxis 
                    style={{ fontSize: '12px' }}
                    stroke="#888"
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ff6f00" 
                    strokeWidth={3}
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                Orders by Status
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={analytics.order_stats.orders_by_status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.status}: ${entry.count} (${(entry.percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.order_stats.orders_by_status.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
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
                        {formatCurrency(method.revenue)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {method.count} orders
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                Top Selling Products
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.product_stats.top_selling.slice(0, 5).map((product, index) => (
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
                          {product.title.length > 25 ? `${product.title.substring(0, 25)}...` : product.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {product.sold} sold
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#067d62' }}>
                      {formatCurrency(product.revenue || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="analytics-orders">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #ff6f00, #ff9e40)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    shopping_bag
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Total Orders</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#333' }}>
                    {analytics.order_stats.total_orders}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #067d62, #0a9e7e)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    payments
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Total Revenue</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#333' }}>
                    {formatCurrency(analytics.order_stats.total_revenue)}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modern-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #357abd, #5a9ed6)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    calculate
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Average Order</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#333' }}>
                    {formatCurrency(analytics.order_stats.average_order_value)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                Payment Methods Distribution
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.order_stats.payment_methods}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="method" style={{ fontSize: '12px' }} stroke="#888" />
                  <YAxis style={{ fontSize: '12px' }} stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#ff6f00" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                Orders by Status
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={analytics.order_stats.orders_by_status}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="count"
                    label={(entry: any) => `${entry.status} ${(entry.percent * 100).toFixed(0)}%`}
                  >
                    {analytics.order_stats.orders_by_status.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="analytics-products">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="admin-modern-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Total Products</div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ff6f00' }}>
                {analytics.product_stats.total_products}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Active Products</div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#067d62' }}>
                {analytics.product_stats.active_products}
              </div>
            </div>
            <div className="admin-modern-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Low Stock</div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ef4444' }}>
                {analytics.product_stats.low_stock_products}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                Products by Category
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={Object.entries(analytics.product_stats.products_by_category).map(([category, count]) => ({
                    category,
                    count: Number(count),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" style={{ fontSize: '12px' }} stroke="#888" />
                  <YAxis style={{ fontSize: '12px' }} stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#067d62" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-modern-card">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                Top Selling Products
              </h3>
              <div style={{ overflowY: 'auto', maxHeight: '320px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>
                        Rank
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>
                        Product
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#666' }}>
                        Sold
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#666' }}>
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.product_stats.top_selling.slice(0, 10).map((product, index) => (
                      <tr key={product.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            background: index < 3 ? COLORS[index] : '#f0f0f0',
                            color: index < 3 ? 'white' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {index + 1}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                          {product.title.length > 30 ? `${product.title.substring(0, 30)}...` : product.title}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600', fontSize: '14px' }}>
                          {product.sold}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600', color: '#067d62', fontSize: '14px' }}>
                          {formatCurrency(product.revenue || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="analytics-customers">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="admin-modern-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #357abd, #5a9ed6)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <span className="material-symbols-outlined">people</span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Total Customers</div>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>
                    {analytics.customer_stats.total_customers}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modern-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #067d62, #0a9e7e)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Active Customers</div>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>
                    {analytics.customer_stats.active_customers}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modern-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #ff6f00, #ff9e40)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888' }}>New This Month</div>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>
                    {analytics.customer_stats.new_customers_this_month}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-modern-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
              Customer Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={analytics.customer_stats.customers_by_month}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#357abd" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#357abd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  style={{ fontSize: '12px' }}
                  stroke="#888"
                />
                <YAxis 
                  style={{ fontSize: '12px' }}
                  stroke="#888"
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#357abd" 
                  strokeWidth={3}
                  fill="url(#colorCustomers)" 
                  name="New Customers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandAnalytics;