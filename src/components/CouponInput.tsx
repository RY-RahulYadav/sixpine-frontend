import React, { useState } from 'react';
import { orderAPI } from '../services/api';
import '../styles/CouponInput.css';

interface CartItem {
  product_id: number;
  quantity: number;
  price: number;
}

interface CouponInputProps {
  subtotal: number;
  cartItems?: CartItem[];
  onCouponApplied: (coupon: { id: number; code: string; discount_amount: string }) => void;
  onCouponRemoved: () => void;
  appliedCoupon: { id: number; code: string; discount_amount: string } | null;
}

const CouponInput: React.FC<CouponInputProps> = ({
  subtotal,
  cartItems = [],
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await orderAPI.validateCoupon({
        code: couponCode.trim().toUpperCase(),
        order_amount: subtotal,
        cart_items: cartItems
      });

      if (response.data.success) {
        onCouponApplied(response.data.coupon);
        setCouponCode('');
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponCode('');
    setError(null);
  };

  if (appliedCoupon) {
    return (
      <div className="coupon-applied">
        <div className="coupon-applied-info">
          <span className="material-symbols-outlined">check_circle</span>
          <div>
            <strong>{appliedCoupon.code}</strong>
            <span>₹{parseFloat(appliedCoupon.discount_amount).toFixed(2)} discount applied</span>
          </div>
        </div>
        <button
          className="coupon-remove-btn"
          onClick={handleRemoveCoupon}
          type="button"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    );
  }

  return (
    <div className="coupon-input-container">
      <div className="coupon-input-wrapper">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Enter coupon code"
          className="coupon-input"
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleApplyCoupon();
            }
          }}
        />
        <button
          type="button"
          className="coupon-apply-btn"
          onClick={handleApplyCoupon}
          disabled={loading || !couponCode.trim()}
        >
          {loading ? 'Applying...' : 'Apply'}
        </button>
      </div>
      {error && (
        <div className="coupon-error">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default CouponInput;

