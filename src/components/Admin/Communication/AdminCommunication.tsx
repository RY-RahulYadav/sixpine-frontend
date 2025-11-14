import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  business_name: string;
  brand_name: string;
}

const AdminCommunication: React.FC = () => {
  const [recipientType, setRecipientType] = useState<'customer' | 'vendor'>('customer');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [loadingRecipients, setLoadingRecipients] = useState<boolean>(false);

  useEffect(() => {
    fetchRecipients();
  }, [recipientType]);

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true);
      if (recipientType === 'customer') {
        const response = await adminAPI.getCustomersList();
        if (response.data.success) {
          setCustomers(response.data.customers || []);
        } else {
          showToast('Failed to load customers', 'error');
        }
      } else {
        const response = await adminAPI.getVendorsList();
        if (response.data.success) {
          setVendors(response.data.vendors || []);
        } else {
          showToast('Failed to load vendors', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error fetching recipients:', error);
      showToast(error.response?.data?.error || 'Failed to load recipients', 'error');
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleRecipientChange = (recipientId: string) => {
    setSelectedRecipientId(recipientId);
    if (recipientType === 'customer') {
      const customer = customers.find(c => c.id.toString() === recipientId);
      if (customer) {
        setSelectedRecipientEmail(customer.email);
      } else {
        setSelectedRecipientEmail('');
      }
    } else {
      const vendor = vendors.find(v => v.id.toString() === recipientId);
      if (vendor) {
        setSelectedRecipientEmail(vendor.email);
      } else {
        setSelectedRecipientEmail('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      showToast('Please fill in subject and message', 'error');
      return;
    }

    if (!selectedRecipientId) {
      showToast(`Please select a ${recipientType}`, 'error');
      return;
    }

    setSending(true);
    try {
      const response = await adminAPI.sendEmail({
        recipient_type: recipientType,
        recipient_id: parseInt(selectedRecipientId),
        subject: subject.trim(),
        message: message.trim()
      });

      if (response.data.success) {
        showToast(response.data.message || 'Email sent successfully', 'success');
        // Reset form
        setSubject('');
        setMessage('');
        setSelectedRecipientId('');
        setSelectedRecipientEmail('');
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

  if (loadingRecipients) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const recipients = recipientType === 'customer' ? customers : vendors;
  const recipientLabel = recipientType === 'customer' ? 'Customer' : 'Vendor';

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
                onChange={(e) => {
                  setRecipientType(e.target.value as 'customer' | 'vendor');
                  setSelectedRecipientId('');
                  setSelectedRecipientEmail('');
                }}
              />
              <span>Customer</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="recipientType"
                value="vendor"
                checked={recipientType === 'vendor'}
                onChange={(e) => {
                  setRecipientType(e.target.value as 'customer' | 'vendor');
                  setSelectedRecipientId('');
                  setSelectedRecipientEmail('');
                }}
              />
              <span>Vendor</span>
            </label>
          </div>
        </div>

        {/* Recipient Selector */}
        <div className="form-group">
          <label>Select {recipientLabel}*</label>
          {loadingRecipients ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Loading {recipientType}s...</p>
            </div>
          ) : recipients.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ color: '#666', margin: 0 }}>No {recipientType}s found.</p>
            </div>
          ) : (
            <select
              className="admin-input"
              value={selectedRecipientId}
              onChange={(e) => handleRecipientChange(e.target.value)}
              required
            >
              <option value="">-- Select {recipientLabel} --</option>
              {recipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id.toString()}>
                  {recipient.name} ({recipient.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Recipient Email Display */}
        {selectedRecipientEmail && (
          <div className="form-group">
            <label>{recipientLabel} Email</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e1e4e8',
              borderRadius: '8px',
              gap: '10px'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#1a3ba9', fontSize: '20px' }}>
                email
              </span>
              <input
                type="email"
                className="admin-input"
                value={selectedRecipientEmail}
                disabled
                style={{ 
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'default',
                  padding: 0,
                  color: '#1a3ba9',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              />
            </div>
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
            disabled={sending || !selectedRecipientId}
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

export default AdminCommunication;

