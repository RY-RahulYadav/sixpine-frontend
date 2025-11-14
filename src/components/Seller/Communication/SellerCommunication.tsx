import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../../../services/api';
import { showToast } from '../../Admin/utils/adminUtils';
import '../../../styles/admin-theme.css';

interface Customer {
  id: number;
  email: string;
}

const SellerCommunication: React.FC = () => {
  const [recipientType, setRecipientType] = useState<'customer' | 'admin'>('customer');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(false);

  useEffect(() => {
    if (recipientType === 'customer') {
      fetchCustomers();
    } else {
      setSelectedCustomerId('');
    }
  }, [recipientType]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await sellerAPI.getCustomersList();
      if (response.data.success) {
        setCustomers(response.data.customers || []);
      } else {
        showToast('Failed to load customers', 'error');
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      showToast(error.response?.data?.error || 'Failed to load customers', 'error');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      showToast('Please fill in subject and message', 'error');
      return;
    }

    if (recipientType === 'customer' && !selectedCustomerId) {
      showToast('Please select a customer', 'error');
      return;
    }

    setSending(true);
    try {
      const response = await sellerAPI.sendEmail({
        recipient_type: recipientType,
        recipient_id: recipientType === 'customer' ? parseInt(selectedCustomerId) : undefined,
        subject: subject.trim(),
        message: message.trim()
      });

      if (response.data.success) {
        showToast(response.data.message || 'Email sent successfully', 'success');
        // Reset form
        setSubject('');
        setMessage('');
        if (recipientType === 'customer') {
          setSelectedCustomerId('');
        }
      } else {
        showToast(response.data.error || 'Failed to send email', 'error');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      showToast(error.response?.data?.error || 'Failed to send email', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loadingCustomers) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-modern-card">
      <div className="admin-card-header">
        <h2>Send Email</h2>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Recipient Type Selection */}
        <div className="form-group">
          <label>Send Message To*</label>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="recipientType"
                value="customer"
                checked={recipientType === 'customer'}
                onChange={(e) => setRecipientType(e.target.value as 'customer' | 'admin')}
              />
              <span>Customer</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="recipientType"
                value="admin"
                checked={recipientType === 'admin'}
                onChange={(e) => setRecipientType(e.target.value as 'customer' | 'admin')}
              />
              <span>Admin</span>
            </label>
          </div>
        </div>

        {/* Customer Selector (only for customer type) */}
        {recipientType === 'customer' && (
          <>
            <div className="form-group">
              <label>Select Customer*</label>
              {loadingCustomers ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <p style={{ color: '#666', margin: 0 }}>No customers found. You can only send emails to customers who have ordered from you.</p>
                </div>
              ) : (
                <select
                  className="admin-input"
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  required
                >
                  <option value="">-- Select Customer Email --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id.toString()}>
                      {customer.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        )}

        {/* Admin Email Display (when admin is selected) */}
        {recipientType === 'admin' && (
          <div className="form-group">
            <label>Recipient Email</label>
            <input
              type="email"
              className="admin-input"
              value="admin@sixpine.com"
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
              Your message will be sent to the admin team
            </small>
          </div>
        )}

        {/* Subject */}
        <div className="form-group">
          <label>Subject*</label>
          <input
            type="text"
            className="admin-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            required
          />
        </div>

        {/* Message */}
        <div className="form-group">
          <label>Message*</label>
          <textarea
            className="admin-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            rows={10}
            required
            style={{ resize: 'vertical', minHeight: '200px' }}
          />
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="admin-btn primary"
            disabled={sending || (recipientType === 'customer' && !selectedCustomerId)}
          >
            {sending ? (
              <>
                <span className="spinner-border spinner-border-sm" style={{ marginRight: '8px' }}></span>
                Sending...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>send</span>
                Send Email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerCommunication;

