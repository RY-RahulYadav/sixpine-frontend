import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vendorAPI } from '../services/api';
import '../styles/auth.css';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';
import CategoryTabs from '../components/CategoryTabs';

const VendorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await vendorAPI.login(formData);
      const { token, user, vendor } = response.data;
      
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('vendor', JSON.stringify(vendor));
      localStorage.setItem('userType', 'vendor');
      
      // Navigate to seller panel
      navigate('/seller', { replace: true });
    } catch (err: any) {
      // Enhanced error handling with proper backend validation message extraction
      let errorMessage = 'Invalid credentials. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for non_field_errors (from serializer validation)
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.error) {
          // Handle string, array, or object error formats
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (Array.isArray(errorData.error)) {
            errorMessage = errorData.error.join(', ');
          } else {
            errorMessage = JSON.stringify(errorData.error);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.details) {
          errorMessage = typeof errorData.details === 'string' 
            ? errorData.details 
            : JSON.stringify(errorData.details);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Display the error message (backend will return messages like:
      // "Admin users must login through the admin login page"
      // "This account is not registered as a vendor. Please use the regular login page.")
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
        <CategoryTabs />
      </div>
      <div className="sixpine-auth-page">
        <div className="sixpine-auth-container">
          <div className="sixpine-auth-card">
            <div className="sixpine-brand">
              <h1>Sixpine</h1>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Seller Login</p>
            </div>
            
            <div className="sixpine-toggle-buttons">
              <button className="sixpine-toggle-btn active">Sign in</button>
              <Link to="/seller/register" className="sixpine-toggle-btn">Register as Seller</Link>
            </div>

            {error && (
              <div className="sixpine-error-message" style={{ whiteSpace: 'pre-line' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="sixpine-form">
              <div className="sixpine-form-group">
                <label>Email or Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="abc@gmail.com"
                  required
                />
              </div>

              <div className="sixpine-form-group">
                <div className="sixpine-password-header">
                  <label>Password</label>
                  <Link to="/forgot-password" className="sixpine-forgot-link">Forget Password?</Link>
                </div>
                <div className="sixpine-password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
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

              <div className="sixpine-checkbox-group">
                <label className="sixpine-checkbox-label">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                  />
                  <span className="sixpine-checkbox-custom"></span>
                  Keep me signed in
                </label>
              </div>

              <button
                type="submit"
                className="sixpine-submit-btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
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

export default VendorLoginPage;

