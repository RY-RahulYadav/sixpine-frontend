import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';

interface BulkOrder {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  project_type: string;
  estimated_quantity: number | null;
  estimated_budget: number | null;
  delivery_date: string | null;
  special_requirements: string | null;
  status: string;
  admin_notes: string | null;
  quoted_price: number | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  created_at: string;
  updated_at: string;
}

const AdminBulkOrders: React.FC = () => {
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
        };
        
        if (searchTerm) params.search = searchTerm;
        if (filterStatus) params.status = filterStatus;
        
        const response = await adminAPI.getBulkOrders(params);
        const data = response.data;
        setOrders(data.results || data);
        if (data.count !== undefined) {
          setTotalPages(Math.ceil(data.count / (data.results?.length || 20)));
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching bulk orders:', err);
        setError(err.response?.data?.error || 'Failed to load bulk orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentPage, searchTerm, filterStatus]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await adminAPI.updateBulkOrderStatus(id, status);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      quoted: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading bulk orders...</p>
      </div>
    );
  }

  return (
    <div className="tw-p-6">
      <div className="tw-mb-6 tw-flex tw-items-center tw-justify-between">
        <h2 className="tw-text-2xl tw-font-bold tw-text-gray-900">Bulk Orders</h2>
      </div>

      {/* Filters */}
      <div className="tw-mb-6 tw-flex tw-gap-4 tw-flex-wrap">
        <div className="tw-flex-1 tw-min-w-[300px]">
          <input
            type="text"
            placeholder="Search by company, contact person, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Under Review</option>
          <option value="quoted">Quoted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="tw-mb-4 tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow tw-overflow-hidden">
        <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
          <thead className="tw-bg-gray-50">
            <tr>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Company</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Contact</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Project Type</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Budget</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Status</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Date</th>
              <th className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="tw-px-6 tw-py-8 tw-text-center tw-text-gray-500">
                  No bulk orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="tw-hover:bg-gray-50">
                  <td className="tw-px-6 tw-py-4">
                    <div className="tw-text-sm tw-font-medium tw-text-gray-900">{order.company_name}</div>
                    <div className="tw-text-sm tw-text-gray-500">{order.city}, {order.state}</div>
                  </td>
                  <td className="tw-px-6 tw-py-4">
                    <div className="tw-text-sm tw-text-gray-900">{order.contact_person}</div>
                    <div className="tw-text-sm tw-text-gray-500">{order.phone_number}</div>
                    <div className="tw-text-sm tw-text-gray-500">{order.email}</div>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div className="tw-text-sm tw-text-gray-900">{order.project_type}</div>
                    {order.estimated_quantity && (
                      <div className="tw-text-sm tw-text-gray-500">Qty: {order.estimated_quantity}</div>
                    )}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div className="tw-text-sm tw-text-gray-900">{formatCurrency(order.estimated_budget)}</div>
                    {order.quoted_price && (
                      <div className="tw-text-sm tw-text-green-600 font-semibold">Quoted: {formatCurrency(order.quoted_price)}</div>
                    )}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <span className={`tw-inline-flex tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {order.assigned_to_name && (
                      <div className="tw-text-xs tw-text-gray-500 tw-mt-1">Assigned: {order.assigned_to_name}</div>
                    )}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="tw-px-3 tw-py-1 tw-border tw-border-gray-300 tw-rounded tw-text-sm tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Under Review</option>
                      <option value="quoted">Quoted</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="tw-mt-6 tw-flex tw-items-center tw-justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-bg-white tw-text-gray-700 hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
          >
            Previous
          </button>
          <span className="tw-text-sm tw-text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-bg-white tw-text-gray-700 hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBulkOrders;

