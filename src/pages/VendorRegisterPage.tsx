import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vendorAPI } from '../services/api';
import '../styles/auth.css';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';

const VendorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // User Account (Required)
    email: '',
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate username from email if email is changed
    if (name === 'email') {
      const username = value.split('@')[0];
      setFormData({
        ...formData,
        email: value,
        username: username
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      await vendorAPI.register(formData as any);
      setSuccess('Vendor registration successful! Your account is pending approval.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/vendor/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.details || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
      </div>
      <div className="sixpine-auth-page">
        <div className="sixpine-auth-container">
          <div className="sixpine-auth-card">
            <div className="sixpine-brand">
              <h1>Sixpine</h1>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Vendor Registration</p>
            </div>
            
            <div className="sixpine-toggle-buttons">
              <Link to="/vendor/login" className="sixpine-toggle-btn">Sign in</Link>
              <button className="sixpine-toggle-btn active">Create account</button>
            </div>

            {error && (
              <div className="sixpine-error-message">
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="sixpine-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="sixpine-form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sixpine-form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="sixpine-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="abc@gmail.com"
                  required
                />
              </div>

              <div className="sixpine-form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Auto-generated from email"
                />
              </div>

              <div className="sixpine-form-group">
                <label>Password *</label>
                <div className="sixpine-password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="sixpine-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="sixpine-form-group">
                <label>Confirm Password *</label>
                <div className="sixpine-password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="sixpine-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={{ 
                padding: '12px', 
                backgroundColor: '#e7f3ff', 
                color: '#0066cc', 
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                <strong>Note:</strong> You can complete your business details later in the seller panel after login.
              </div>

              <button
                type="submit"
                className="sixpine-submit-btn"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register as Vendor'}
              </button>
            </form>

            <div className="sixpine-footer-links">
              <Link to="/privacy">Privacy</Link>
              <span>•</span>
              <Link to="/terms">Terms</Link>
              <span>•</span>
              <Link to="/help">Help</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VendorRegisterPage;

