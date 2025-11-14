import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/auth.css';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'register' | 'selectOTP' | 'verify'>('register');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    mobile: '',
    password: '',
    password_confirm: ''
  });
  const [otp, setOtp] = useState('');
  const [otpMethod, setOtpMethod] = useState<'email' | 'whatsapp' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer effect for resend OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    // Move to OTP selection step instead of directly requesting OTP
    setLoading(false);
    setStep('selectOTP');
  };

  const handleSendOTP = async (method: 'email' | 'whatsapp') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setOtpMethod(method);

    // Validate mobile number if WhatsApp is selected
    if (method === 'whatsapp' && !formData.mobile) {
      setError('Please provide a mobile number to receive OTP via WhatsApp');
      setLoading(false);
      return;
    }

    try {
      const destination = method === 'whatsapp' ? formData.mobile : formData.email;
      
      // Call API for both email and WhatsApp (response not needed here)
      await authAPI.requestOTP({
        ...formData,
        otp_method: method
      } as any);

      const successMessage = `OTP sent to your ${method === 'whatsapp' ? 'WhatsApp' : 'email'}: ${destination}`
      setSuccess(successMessage);
      
      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
      
      setStep('verify');
      setResendTimer(60); // 60 seconds cooldown for resend
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.username?.[0] ||
                          error.response?.data?.email?.[0] ||
                          error.response?.data?.password?.[0] ||
                          'Failed to send OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.verifyOTP({
        email: formData.email,
        otp: otp
      });
      
      // Store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Show success message
      setSuccess('Registration successful! Redirecting...');
      
      // Wait a moment for user to see success message, then force refresh home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const destination = otpMethod === 'whatsapp' ? formData.mobile : formData.email;
      let otpCode = '';
      
      // Call API for both email and WhatsApp
      const response = await authAPI.resendOTP({ 
        email: formData.email,
        otp_method: otpMethod 
      } as any);
      
      // Extract OTP from response if available
      otpCode = response.data?.otp || response.data?.debug_otp || '';
      
      const successMessage = otpCode 
        ? `OTP resent to your ${otpMethod === 'whatsapp' ? 'WhatsApp' : 'email'}: ${destination}. Code: ${otpCode}`
        : `OTP resent to your ${otpMethod === 'whatsapp' ? 'WhatsApp' : 'email'}: ${destination}`;
      
      setSuccess(successMessage);
      
      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
      
      setResendTimer(60);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setStep('register');
    setOtp('');
    setOtpMethod(null);
    setError(null);
    setSuccess(null);
  };

  const handleBackToOTPSelection = () => {
    setStep('selectOTP');
    setOtp('');
    setError(null);
    setSuccess(null);
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
            <h1 style={{marginBottom:12}}>Sixpine</h1>
          </div>
          
          {/* Toggle buttons */}
          <div className="sixpine-toggle-buttons">
            <Link to="/login" className="sixpine-toggle-btn">Sign in</Link>
            <button className="sixpine-toggle-btn active">Create account</button>
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

          {step === 'register' ? (
            /* Registration Form */
            <form onSubmit={handleRequestOTP} className="sixpine-form">
              {/* First row: name and email side-by-side */}
              <div className="sixpine-row" style={{marginBottom:16}}>
                <div className="sixpine-col">
                  <div className="sixpine-form-group">
                    <label>Your name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="sixpine-col">
                  <div className="sixpine-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="abc@gmail.com"
                      className="sixpine-prefilled"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="sixpine-form-group">
                <label>Mobile (optional)</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>

              <div className="sixpine-form-group">
                <label>Password</label>
                <div className="sixpine-password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••"
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
                <label>Re-enter password</label>
                <div className="sixpine-password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
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
                {loading ? 'Processing...' : 'Create account'}
              </button>
            </form>
          ) : step === 'selectOTP' ? (
            /* OTP Method Selection */
            <div className="sixpine-form">
              <div className="sixpine-otp-selection">
                <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '18px', color: '#333' }}>
                  Choose verification method
                </h3>
                <p style={{ textAlign: 'center', marginBottom: '24px', fontSize: '14px', color: '#666' }}>
                  Select how you'd like to receive your OTP
                </p>

                <div className="otp-method-options">
                  <button
                    type="button"
                    className="otp-method-btn"
                    onClick={() => handleSendOTP('email')}
                    disabled={loading}
                  >
                    <div className="otp-method-icon">📧</div>
                    <div className="otp-method-content">
                      <h4>Email</h4>
                      <p>{formData.email}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="otp-method-btn"
                    onClick={() => handleSendOTP('whatsapp')}
                    disabled={loading || !formData.mobile}
                  >
                    <div className="otp-method-icon">💬</div>
                    <div className="otp-method-content">
                      <h4>WhatsApp</h4>
                      <p>{formData.mobile || 'No mobile number provided'}</p>
                    </div>
                  </button>
                </div>

                {!formData.mobile && (
                  <p style={{ 
                    textAlign: 'center', 
                    fontSize: '12px', 
                    color: '#ff9800', 
                    marginTop: '16px',
                    fontStyle: 'italic'
                  }}>
                    Add a mobile number to enable WhatsApp verification
                  </p>
                )}

                <button
                  type="button"
                  className="sixpine-link-btn"
                  onClick={handleBackToRegister}
                  disabled={loading}
                  style={{ marginTop: '20px', width: '100%' }}
                >
                  ← Back to registration
                </button>
              </div>
            </div>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyOTP} className="sixpine-form">
              <div className="sixpine-otp-section">
                <p>We've sent a 6-digit verification code to</p>
                <p><strong>
                  {otpMethod === 'whatsapp' ? formData.mobile : formData.email}
                </strong></p>
                
                <div className="sixpine-form-group">
                  <label>Enter Verification Code</label>
                  <input
                    type="text"
                    className="sixpine-otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    placeholder="000000"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="sixpine-submit-btn"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                <div className="sixpine-otp-actions">
                  {resendTimer > 0 ? (
                    <p>Resend code in {resendTimer}s</p>
                  ) : (
                    <button
                      type="button"
                      className="sixpine-link-btn"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  )}
                  
                  <button
                    type="button"
                    className="sixpine-link-btn"
                    onClick={handleBackToOTPSelection}
                    disabled={loading}
                  >
                    Change Method
                  </button>
                </div>
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
    <Footer/>
    </>
  );
};

export default RegisterPage;