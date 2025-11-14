import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface PaymentChargesSettings {
  platform_fee_upi: string;
  platform_fee_card: string;
  platform_fee_netbanking: string;
  platform_fee_cod: string;
  tax_rate: string;
  razorpay_enabled: boolean;
  cod_enabled: boolean;
}

const AdminPaymentCharges: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentChargesSettings>({
    platform_fee_upi: '0.00',
    platform_fee_card: '2.36',
    platform_fee_netbanking: '2.36',
    platform_fee_cod: '0.00',
    tax_rate: '5.00',
    razorpay_enabled: true,
    cod_enabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPaymentCharges();
      setFormData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching payment charges:', err);
      setError(err.response?.data?.error || 'Failed to load payment charges settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminAPI.updatePaymentCharges(formData);
      showToast('Payment charges updated successfully', 'success');
      fetchSettings();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update payment charges', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading payment charges settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="material-symbols-outlined">payments</span>
          <div>
            <h1>Payment & Charges Management</h1>
            <p className="admin-page-subtitle">Configure platform fees, tax rates, and payment methods</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="admin-alert error">
          <span className="material-symbols-outlined">error</span>
          <div className="admin-alert-content">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="admin-modern-card">
        <form onSubmit={handleSubmit}>
          {/* Platform Fees */}
          <div className="tw-mb-6">
            <h3 className="tw-text-lg tw-font-semibold tw-mb-4">Platform Fees (%)</h3>
            <p className="tw-text-sm tw-text-gray-600 tw-mb-4">
              Configure Razorpay platform fees as percentage for each payment method. These fees are calculated based on order subtotal.
            </p>
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-sm tw-align-middle tw-mr-1">account_balance_wallet</span>
                  UPI Platform Fee (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.platform_fee_upi}
                  onChange={(e) => setFormData({ ...formData, platform_fee_upi: e.target.value })}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                  required
                />
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Razorpay UPI fee: Typically 0%
                </p>
              </div>
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-sm tw-align-middle tw-mr-1">credit_card</span>
                  Credit/Debit Card Platform Fee (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.platform_fee_card}
                  onChange={(e) => setFormData({ ...formData, platform_fee_card: e.target.value })}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                  required
                />
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Razorpay Card fee: 2.36% (2% + 18% GST)
                </p>
              </div>
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-sm tw-align-middle tw-mr-1">account_balance</span>
                  Net Banking Platform Fee (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.platform_fee_netbanking}
                  onChange={(e) => setFormData({ ...formData, platform_fee_netbanking: e.target.value })}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                  required
                />
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Razorpay Net Banking fee: 2.36% (2% + 18% GST)
                </p>
              </div>
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  <span className="material-symbols-outlined tw-text-sm tw-align-middle tw-mr-1">money</span>
                  COD Platform Fee (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.platform_fee_cod}
                  onChange={(e) => setFormData({ ...formData, platform_fee_cod: e.target.value })}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                  required
                />
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Cash on Delivery: 0% (no gateway fee)
                </p>
              </div>
            </div>
          </div>

          {/* Tax Rate */}
          <div className="tw-mb-6">
            <h3 className="tw-text-lg tw-font-semibold tw-mb-4">Tax Configuration</h3>
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                required
              />
              <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                Tax percentage applied to order subtotal
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="tw-mb-6">
            <h3 className="tw-text-lg tw-font-semibold tw-mb-4">Payment Methods</h3>
            <div className="tw-space-y-3">
              <label className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-bg-gray-50 tw-cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.razorpay_enabled}
                  onChange={(e) => setFormData({ ...formData, razorpay_enabled: e.target.checked })}
                  className="tw-rounded tw-text-blue-600 tw-focus:ring-blue-500 tw-w-5 tw-h-5"
                />
                <div className="tw-flex-1">
                  <span className="tw-text-sm tw-font-medium tw-text-gray-900">Razorpay Payment Gateway</span>
                  <p className="tw-text-xs tw-text-gray-500">Enable online payments via Razorpay</p>
                </div>
              </label>
              <label className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-bg-gray-50 tw-cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cod_enabled}
                  onChange={(e) => setFormData({ ...formData, cod_enabled: e.target.checked })}
                  className="tw-rounded tw-text-blue-600 tw-focus:ring-blue-500 tw-w-5 tw-h-5"
                />
                <div className="tw-flex-1">
                  <span className="tw-text-sm tw-font-medium tw-text-gray-900">Cash on Delivery (COD)</span>
                  <p className="tw-text-xs tw-text-gray-500">Allow customers to pay on delivery</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="tw-flex tw-gap-3 tw-justify-end tw-pt-4 tw-border-t tw-border-gray-200">
            <button
              type="button"
              onClick={fetchSettings}
              className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-text-gray-700 hover:tw-bg-gray-50 tw-transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors tw-disabled:tw-opacity-50 tw-disabled:tw-cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="tw-mt-4 tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4">
        <div className="tw-flex tw-items-start tw-gap-3">
          <span className="material-symbols-outlined tw-text-blue-600">info</span>
          <div className="tw-flex-1">
            <h4 className="tw-text-sm tw-font-medium tw-text-blue-900 tw-mb-1">Platform Fees Information</h4>
            <p className="tw-text-xs tw-text-blue-700">
              Platform fees are calculated as a percentage of the order subtotal and added to the final order total.
              These settings affect all new orders. Changes will not retroactively apply to existing orders.
              Default values are based on Razorpay's standard pricing structure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentCharges;

