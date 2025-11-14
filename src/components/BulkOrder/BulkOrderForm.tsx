import { useState } from 'react';
import styles from './BulkOrderForm.module.css';
import API from '../../services/api';

const BulkOrderForm = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    project_type: 'Corporate',
    estimated_quantity: '',
    estimated_budget: '',
    delivery_date: '',
    special_requirements: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare data, converting empty strings to null for optional fields
      const submitData: any = {
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country || 'India',
        project_type: formData.project_type || 'Corporate',
      };
      
      // Add optional fields only if they have values
      if (formData.estimated_quantity) {
        submitData.estimated_quantity = parseInt(formData.estimated_quantity);
      }
      if (formData.estimated_budget) {
        submitData.estimated_budget = parseFloat(formData.estimated_budget);
      }
      if (formData.delivery_date) {
        submitData.delivery_date = formData.delivery_date;
      }
      if (formData.special_requirements) {
        submitData.special_requirements = formData.special_requirements;
      }
      
      const response = await API.post('/auth/bulk-order/submit/', submitData);
      const result = response.data;
      
      if (result && result.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          company_name: '',
          contact_person: '',
          email: '',
          phone_number: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          project_type: 'Corporate',
          estimated_quantity: '',
          estimated_budget: '',
          delivery_date: '',
          special_requirements: ''
        });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        // Show detailed error message
        const errorMsg = result?.error || result?.detail || 
                        (result?.errors ? JSON.stringify(result.errors) : 'Failed to submit. Please try again.');
        console.error('Bulk order error:', result);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error('Bulk order submission error:', error);
      const errorMessage = error?.response?.data?.error || 
                           error?.response?.data?.detail ||
                           error?.message || 
                           'Network error. Please try again later.';
      alert(`Failed to submit: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="quote-form" className={styles.bulkOrderFormSection}>
      <h2 className={styles.sectionTitle}>Request a Bulk Order Quote</h2>
      <p className={styles.sectionDescription}>
        Fill out the form below to get a customized quote for your bulk order requirements.
        Our business team will contact you within 24 hours.
      </p>
      
      <form className={styles.bulkOrderForm} onSubmit={handleSubmit}>
        <div className={styles.formColumns}>
          <div className={styles.formColumn}>
            <div className={styles.formGroup}>
              <label htmlFor="contact_person">Contact Person Name *</label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="company_name">Company Name *</label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="Enter your company name"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="phone_number">Phone Number *</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Enter your complete address"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Enter city"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="Enter state"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                placeholder="Enter pincode"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="project_type">Project Type *</label>
              <select
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                required
              >
                <option value="Corporate">Corporate</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Residential">Residential</option>
                <option value="Educational">Educational</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className={styles.formColumn}>
            <div className={styles.formGroup}>
              <label htmlFor="estimated_quantity">Estimated Quantity</label>
              <input
                type="number"
                id="estimated_quantity"
                name="estimated_quantity"
                value={formData.estimated_quantity}
                onChange={handleChange}
                placeholder="Enter approximate quantity"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="estimated_budget">Estimated Budget (₹)</label>
              <input
                type="number"
                id="estimated_budget"
                name="estimated_budget"
                value={formData.estimated_budget}
                onChange={handleChange}
                placeholder="Enter estimated budget"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="delivery_date">Expected Delivery Date</label>
              <input
                type="date"
                id="delivery_date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="special_requirements">Special Requirements</label>
              <textarea
                id="special_requirements"
                name="special_requirements"
                value={formData.special_requirements}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your requirements, including product details, customization needs, etc."
              />
            </div>
          </div>
        </div>
        
        {submitSuccess && (
          <div className={styles.successMessage} style={{
            padding: '16px',
            marginBottom: '20px',
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            color: '#065f46'
          }}>
            ✓ Your bulk order inquiry has been submitted successfully! Our sales team will contact you within 24 hours.
          </div>
        )}
        
        <div className={styles.formActions}>
          <div className={styles.formDisclaimer}>
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to Sixpine's <a href="/privacy-policy">Privacy Policy</a> and <a href="/terms-and-conditions">Terms of Service</a>
            </label>
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkOrderForm;