import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CloseYourSixpineAccount.module.css";
import { AlertTriangle } from "lucide-react";
import { accountClosureAPI } from "../services/api";
import { useApp } from "../context/AppContext";

export default function CloseYourSixpineAccount() {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [canDelete, setCanDelete] = useState(false);
  const [ongoingOrdersCount, setOngoingOrdersCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Wait for auth state to load
    if (state.loading) {
      return;
    }
    
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    checkEligibility();
  }, [state.isAuthenticated, state.loading]);

  const checkEligibility = async () => {
    try {
      setChecking(true);
      const response = await accountClosureAPI.checkEligibility();
      if (response.data.success) {
        setCanDelete(response.data.can_delete);
        setOngoingOrdersCount(response.data.ongoing_orders_count || 0);
        if (!response.data.can_delete) {
          setErrorMessage(response.data.message || 'You have ongoing orders. Please complete or cancel them before closing your account.');
        }
      }
    } catch (error: any) {
      console.error('Error checking eligibility:', error);
      setErrorMessage('Failed to check account status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!confirm) {
      alert("⚠️ Please check the confirmation box before proceeding.");
      return;
    }
    
    if (!canDelete) {
      alert("⚠️ You cannot close your account because you have ongoing or pending orders. Please complete or cancel them first.");
      return;
    }
    
    if (!window.confirm("⚠️ Are you absolutely sure you want to permanently close your account? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await accountClosureAPI.closeAccount(reason);
      
      if (response.data.success) {
        alert(response.data.message || 'Your account has been closed successfully.');
        // Logout and redirect to home
        logout();
        navigate('/');
      } else {
        alert(response.data.error || 'Failed to close account. Please try again.');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to close account. Please try again.';
      alert(errorMsg);
      console.error('Error closing account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.main}>
      <h2>Close Your Sixpine Account</h2>
      <p className={styles.note}>Please read this carefully</p>

      <p>
        You are about to submit a request to permanently close your Sixpine
        account and have your data deleted. Once your account is closed, all
        products and services linked to it will no longer be accessible across
        any Sixpine platforms. For example, submitting your closure request here
        will also deactivate your account on other Sixpine regional sites where
        you use the same login credentials to access services and products.
      </p>
      <p>
        If you have uploaded your own content to any of our services (for
        example, images, videos, or documents), we recommend downloading a copy
        before closing your account.
      </p>

      {checking && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Checking account status...</p>
        </div>
      )}

      {/* Order Status Warning */}
      {!checking && !canDelete && ongoingOrdersCount > 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <AlertTriangle style={{ color: '#ff9800', marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }} />
          <strong style={{ color: '#856404' }}>Cannot Close Account</strong>
          <p style={{ color: '#856404', marginTop: '8px', marginBottom: 0 }}>
            {errorMessage || `You have ${ongoingOrdersCount} ongoing or pending order(s). Please complete or cancel all orders before closing your account.`}
          </p>
        </div>
      )}

      {/* Warning box */}
      <div className={styles.warningBox}>
        <AlertTriangle className={styles.icon} />
        <div>
          <strong>Account Closure is a Permanent Action</strong>
          <p>
            Please note: account closure is permanent, and once your account is
            closed it will no longer be available to you and cannot be reversed.
            If you close but later wish to use Sixpine services again, you will
            need to create a new account.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="reason">
          Please select the main reason for closing your Sixpine account
          (Optional)
        </label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={!canDelete || loading}
        >
          <option value="">Choose Reason</option>
          <option value="Privacy concerns">Privacy concerns</option>
          <option value="Not satisfied with services">
            Not satisfied with services
          </option>
          <option value="Too many notifications">Too many notifications</option>
          <option value="Other">Other</option>
        </select>

       <label className={styles.checkbox}>
  <input
    type="checkbox"
    checked={confirm}
    onChange={(e) => setConfirm(e.target.checked)}
    disabled={!canDelete || loading}
  />
  Yes, I want to permanently close my Sixpine Account and
  <span className={styles.mobileBreak}><br /></span>
  <strong> delete my data.</strong>
</label>


        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={!canDelete || loading || !confirm}
          style={{
            opacity: (!canDelete || loading || !confirm) ? 0.6 : 1,
            cursor: (!canDelete || loading || !confirm) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Closing Account...' : 'Close My Account'}
        </button>
      </form>

      <p className={styles.footerNote}>
        Please note that Sixpine is legally required or permitted to retain
        certain types of information, such as your order history. This is done
        in accordance with applicable law, including those related to tax,
        accounting, and fraud prevention.
      </p>
    </div>
  );
}
