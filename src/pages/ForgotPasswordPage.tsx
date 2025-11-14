import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/auth.css';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [step] = useState<'request' | 'reset'>(token ? 'reset' : 'request');
  const [formData, setFormData] = useState({
    email: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.requestPasswordReset({ email: formData.email });
      
      if (response.data.success) {
        setSuccess('Password reset link sent to your email. Please check your inbox.');
        // Show debug token in development
        if (response.data.debug_token) {
          console.log('Debug token:', response.data.debug_token);
        }
      } else {
        setError(response.data.error || 'Failed to send reset email');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.email?.[0] ||
                          'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.new_password !== formData.new_password_confirm) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.confirmPasswordReset({
        token: token || '',
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm
      });
      
      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to reset password');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.new_password?.[0] ||
                          'Failed to reset password. Please try again.';
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
            {/* Header with brand name */}
            <div className="sixpine-brand">
              <h1>Sixpine</h1>
            </div>
            
            {/* Toggle buttons */}
            <div className="sixpine-toggle-buttons">
              <Link to="/login" className="sixpine-toggle-btn">Sign in</Link>
              <Link to="/register" className="sixpine-toggle-btn">Create account</Link>
            </div>

            {/* Error/Success messages */}
            {error && (
              <div className="sixpine-error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="sixpine-success-message">
                {success}
              </div>
            )}

            {step === 'request' ? (
              /* Password Reset Request Form */
              <form onSubmit={handleRequestReset} className="sixpine-form">
                <div className="sixpine-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="sixpine-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="sixpine-form-footer">
                  <p>Remember your password? <Link to="/login">Sign in</Link></p>
                </div>
              </form>
            ) : (
              /* Password Reset Form */
              <form onSubmit={handleResetPassword} className="sixpine-form">
                <div className="sixpine-form-group">
                  <label>New Password</label>
                  <div className="sixpine-password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      minLength={8}
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

                <div className="sixpine-form-group">
                  <label>Confirm New Password</label>
                  <div className="sixpine-password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="new_password_confirm"
                      value={formData.new_password_confirm}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      required
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

                <button
                  type="submit"
                  className="sixpine-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div className="sixpine-form-footer">
                  <p>Remember your password? <Link to="/login">Sign in</Link></p>
                </div>
              </form>
            )}

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

export default ForgotPasswordPage;
