import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerAPI } from '../../../services/api';
import { formatCurrency } from '../../Admin/utils/adminUtils';
import { showToast } from '../../Admin/utils/adminUtils';
import '../../../styles/admin-theme.css';

interface PaymentStats {
  total_order_value: number;
  total_platform_fees: number;
  total_taxes: number;
  total_net_revenue: number;
  total_orders: number;
  this_month_value: number;
  last_month_value: number;
  this_month_net_revenue?: number;
  last_month_net_revenue?: number;
  orders_by_status: Array<{ status: string; count: number }>;
  recent_orders: Array<{
    id: number;
    order_id: string;
    date: string;
    customer_name: string;
    status: string;
    payment_status: string;
    order_value: number;
    platform_fee: number;
    tax: number;
    net_revenue: number;
    items_count: number;
  }>;
}

const SellerPaymentDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentDashboard();
  }, []);

  const fetchPaymentDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sellerAPI.getPaymentDashboard();
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError(response.data.error || 'Failed to load payment dashboard');
        showToast(response.data.error || 'Failed to load payment dashboard', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching payment dashboard:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load payment dashboard';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading payment dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-modern-card">
        <div className="admin-card-header">
          <h2>Payment Dashboard</h2>
        </div>
        <div className="tw-p-6 tw-text-center">
          <p className="tw-text-red-600">{error || 'Failed to load payment dashboard'}</p>
          <button
            onClick={fetchPaymentDashboard}
            className="admin-btn primary tw-mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use net revenue for monthly comparison if available, otherwise fallback to order value
  const thisMonthNetRevenue = stats.this_month_net_revenue ?? stats.this_month_value;
  const lastMonthNetRevenue = stats.last_month_net_revenue ?? stats.last_month_value;
  
  const monthGrowth = lastMonthNetRevenue > 0
    ? ((thisMonthNetRevenue - lastMonthNetRevenue) / lastMonthNetRevenue * 100).toFixed(1)
    : '0.0';

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <div>
            <h1>Payment Dashboard</h1>
            <p className="admin-page-subtitle">View your earnings, fees, and net revenue</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <Link to="/seller/payment-settings" className="admin-modern-btn secondary">
            <span className="material-symbols-outlined">account_balance</span>
            Payment Settings
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-mb-6">
        <div className="admin-modern-card tw-bg-gradient-to-br tw-from-blue-50 tw-to-blue-100 tw-border-2 tw-border-blue-200">
          <div className="tw-flex tw-items-center tw-justify-between">
            <div>
              <p className="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">Total Order Value</p>
              <p className="tw-text-2xl tw-font-bold tw-text-gray-800">{formatCurrency(stats.total_order_value)}</p>
            </div>
            <span className="material-symbols-outlined tw-text-4xl tw-text-blue-600">shopping_cart</span>
          </div>
        </div>

        <div className="admin-modern-card tw-bg-gradient-to-br tw-from-red-50 tw-to-red-100 tw-border-2 tw-border-red-200">
          <div className="tw-flex tw-items-center tw-justify-between">
            <div>
              <p className="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">Platform Fees</p>
              <p className="tw-text-2xl tw-font-bold tw-text-gray-800">{formatCurrency(stats.total_platform_fees)}</p>
            </div>
            <span className="material-symbols-outlined tw-text-4xl tw-text-red-600">remove_circle</span>
          </div>
        </div>

        <div className="admin-modern-card tw-bg-gradient-to-br tw-from-orange-50 tw-to-orange-100 tw-border-2 tw-border-orange-200">
          <div className="tw-flex tw-items-center tw-justify-between">
            <div>
              <p className="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">Taxes</p>
              <p className="tw-text-2xl tw-font-bold tw-text-gray-800">{formatCurrency(stats.total_taxes)}</p>
            </div>
            <span className="material-symbols-outlined tw-text-4xl tw-text-orange-600">receipt</span>
          </div>
        </div>

        <div className="admin-modern-card tw-bg-gradient-to-br tw-from-green-50 tw-to-green-100 tw-border-2 tw-border-green-200">
          <div className="tw-flex tw-items-center tw-justify-between">
            <div>
              <p className="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">Net Revenue</p>
              <p className="tw-text-2xl tw-font-bold tw-text-gray-800">{formatCurrency(stats.total_net_revenue)}</p>
            </div>
            <span className="material-symbols-outlined tw-text-4xl tw-text-green-600">account_balance_wallet</span>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="admin-modern-card tw-mb-6">
        <div className="admin-card-header">
          <h2>Monthly Performance</h2>
        </div>
        <div className="tw-p-6">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
            <div className="tw-text-center tw-p-4 tw-bg-blue-50 tw-rounded-lg">
              <p className="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-2">This Month</p>
              <p className="tw-text-2xl tw-font-bold tw-text-blue-600">{formatCurrency(thisMonthNetRevenue)}</p>
              <p className="tw-text-xs tw-text-gray-500 tw-mt-1">Net Revenue</p>
            </div>
            <div className="tw-text-center tw-p-4 tw-bg-gray-50 tw-rounded-lg">
              <p className="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-2">Last Month</p>
              <p className="tw-text-2xl tw-font-bold tw-text-gray-600">{formatCurrency(lastMonthNetRevenue)}</p>
              <p className="tw-text-xs tw-text-gray-500 tw-mt-1">Net Revenue</p>
            </div>
            <div className="tw-text-center tw-p-4 tw-bg-green-50 tw-rounded-lg">
              <p className="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-2">Growth</p>
              <p className={`tw-text-2xl tw-font-bold ${parseFloat(monthGrowth) >= 0 ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                {parseFloat(monthGrowth) >= 0 ? '+' : ''}{monthGrowth}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders with Payment Breakdown */}
      <div className="admin-modern-card">
        <div className="admin-card-header">
          <h2>Recent Orders Payment Breakdown</h2>
        </div>
        <div className="tw-overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Order Value</th>
                <th>Platform Fee</th>
                <th>Tax</th>
                <th>Net Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="tw-text-center tw-py-8 tw-text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                stats.recent_orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.customer_name}</td>
                    <td>
                      <span className={`admin-badge ${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="tw-font-semibold">{formatCurrency(order.order_value)}</td>
                    <td className="tw-text-red-600">{formatCurrency(order.platform_fee)}</td>
                    <td className="tw-text-orange-600">{formatCurrency(order.tax)}</td>
                    <td className="tw-font-bold tw-text-green-600">{formatCurrency(order.net_revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerPaymentDashboard;

