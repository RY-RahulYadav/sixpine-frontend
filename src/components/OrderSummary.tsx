import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { calculateOrderTotals } from '../utils/orderCalculations';
import { orderAPI } from '../services/api';
import styles from './OrderSummary.module.css';

interface OrderSummaryProps {
  onPaymentClick?: () => void;
  paymentDisabled?: boolean;
  selectedPaymentMethod?: string | null;
  couponDiscount?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onPaymentClick, paymentDisabled, selectedPaymentMethod, couponDiscount = 0 }) => {
  const { state } = useApp();
  const [platformFees, setPlatformFees] = useState<any>(null);

  // Fetch platform fees on mount
  useEffect(() => {
    const fetchPlatformFees = async () => {
      try {
        const response = await orderAPI.getPaymentCharges();
        setPlatformFees(response.data);
      } catch (err) {
        console.error('Error fetching platform fees:', err);
        // Use defaults if fetch fails
      }
    };
    fetchPlatformFees();
  }, []);

  // Calculate totals
  const subtotal = state.cart?.total_price || 0;
  const totalItems = state.cart?.total_items || 0;
  const totals = calculateOrderTotals(subtotal, selectedPaymentMethod, platformFees, couponDiscount);

  const handlePaymentClick = () => {
    if (paymentDisabled) return;
    if (onPaymentClick) {
      onPaymentClick();
    }
  };

  return (
    <div className={styles.orderSummaryContainer}>
      <button 
        className={`${styles.paymentButton} ${paymentDisabled ? styles.disabled : ''}`}
        onClick={handlePaymentClick}
        disabled={paymentDisabled}
      >
        Use this payment method
      </button>
      <hr className={styles.separator} />
      <div className={styles.summaryDetails}>
        <div className={styles.summaryLine}>
          <span>Items ({totalItems}):</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {totals.couponDiscount > 0 && (
          <div className={styles.summaryLine} style={{ color: '#28a745', fontWeight: '500' }}>
            <span>Coupon Discount:</span>
            <span>-₹{totals.couponDiscount.toFixed(2)}</span>
          </div>
        )}
        {totals.platformFee > 0 && (
          <div className={styles.summaryLine}>
            <span>Platform Fee:</span>
            <span>₹{totals.platformFee.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.summaryLine}>
          <span>Tax ({platformFees?.tax_rate || 5}%):</span>
          <span>₹{totals.tax.toFixed(2)}</span>
        </div>
        <div className={`${styles.summaryLine} ${styles.orderTotal}`}>
          <span>Order Total:</span>
          <span>₹{totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
