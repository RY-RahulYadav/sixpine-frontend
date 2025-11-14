import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import API from '../../../services/api';
import '../../../styles/auth.css';
import Navbar from '../../../components/Navbar';
import SubNav from '../../../components/SubNav';
import Footer from '../../../components/Footer';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useApp();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting admin login with username:', formData.username);
      
      // Use admin-specific login endpoint
      const response = await API.post('/admin/auth/login/', { 
        username: formData.username, 
        password: formData.password 
      });
      
      console.log('Admin login response:', response.data);
      
      // Store authentication data
      const { token, user } = response.data;
      
      // Verify user has admin privileges
      if (!user.is_staff) {
        setError('Access denied. Admin privileges required.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return;
      }
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update app context
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      
      // Navigate to admin dashboard
      navigate('/admin', { replace: true });
      
    } catch (err: any) {
      console.error('Admin login error:', err);
      console.error('Error response:', err.response);
      
      const errorMessage = err.response?.data?.error || 'Login failed. Please verify your credentials.';
      setError(errorMessage);
      
      // Clear any partial auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
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
            {/* Header with brand name */}
            <div className="sixpine-brand">
              <h1>Sixpine</h1>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Admin Login</p>
            </div>
            
            {/* Toggle buttons */}
            <div className="sixpine-toggle-buttons">
              <button className="sixpine-toggle-btn active">Sign in</button>
              <Link to="/" className="sixpine-toggle-btn">Back to Store</Link>
            </div>

            {/* Error message */}
            {error && (
              <div className="sixpine-error-message">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="sixpine-form">
              <div className="sixpine-form-group">
                <label>Email or Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="abc@gmail.com"
                  disabled={loading}
                  autoComplete="username"
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
                    disabled={loading}
                    autoComplete="current-password"
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

            {/* Footer links */}
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

export default AdminLogin;