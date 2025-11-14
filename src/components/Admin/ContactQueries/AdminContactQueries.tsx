import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';

interface ContactQuery {
  id: number;
  full_name: string;
  pincode: string;
  phone_number: string;
  email: string;
  message: string;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

const AdminContactQueries: React.FC = () => {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
        };
        
        if (searchTerm) params.search = searchTerm;
        if (filterStatus) params.status = filterStatus;
        
        const response = await adminAPI.getContactQueries(params);
        const data = response.data;
        setQueries(data.results || data);
        if (data.count !== undefined) {
          setTotalPages(Math.ceil(data.count / (data.results?.length || 20)));
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching contact queries:', err);
        setError(err.response?.data?.error || 'Failed to load contact queries');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueries();
  }, [currentPage, searchTerm, filterStatus]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await adminAPI.updateContactQueryStatus(id, status);
      setQueries(queries.map(q => q.id === id ? { ...q, status } : q));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && queries.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading contact queries...</p>
      </div>
    );
  }

  return (
    <div className="tw-p-6">
      <div className="tw-mb-6 tw-flex tw-items-center tw-justify-between">
        <h2 className="tw-text-2xl tw-font-bold tw-text-gray-900">Contact Queries</h2>
      </div>

      {/* Filters */}
      <div className="tw-mb-6 tw-flex tw-gap-4 tw-flex-wrap">
        <div className="tw-flex-1 tw-min-w-[300px]">
          <input
            type="text"
            placeholder="Search by name, phone, email, or pincode..."
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
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
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
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Name</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Contact</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Pincode</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Status</th>
              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Date</th>
              <th className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
            {queries.length === 0 ? (
              <tr>
                <td colSpan={6} className="tw-px-6 tw-py-8 tw-text-center tw-text-gray-500">
                  No contact queries found
                </td>
              </tr>
            ) : (
              queries.map((query) => (
                <tr key={query.id} className="tw-hover:bg-gray-50">
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div className="tw-text-sm tw-font-medium tw-text-gray-900">{query.full_name}</div>
                    {query.email && (
                      <div className="tw-text-sm tw-text-gray-500">{query.email}</div>
                    )}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div className="tw-text-sm tw-text-gray-900">{query.phone_number}</div>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div className="tw-text-sm tw-text-gray-900">{query.pincode}</div>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <span className={`tw-inline-flex tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full ${getStatusBadgeClass(query.status)}`}>
                      {query.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                    {new Date(query.created_at).toLocaleDateString()}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                    <select
                      value={query.status}
                      onChange={(e) => handleStatusUpdate(query.id, e.target.value)}
                      className="tw-px-3 tw-py-1 tw-border tw-border-gray-300 tw-rounded tw-text-sm tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
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

export default AdminContactQueries;

