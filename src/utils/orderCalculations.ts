/**
 * Utility functions for order calculations
 */

interface PlatformFees {
  platform_fee_upi: number;
  platform_fee_card: number;
  platform_fee_netbanking: number;
  platform_fee_cod: number;
  tax_rate: number;
}

// Default platform fees (based on Razorpay)
const DEFAULT_PLATFORM_FEES: PlatformFees = {
  platform_fee_upi: 0.00,
  platform_fee_card: 2.36,
  platform_fee_netbanking: 2.36,
  platform_fee_cod: 0.00,
  tax_rate: 5.00,
};

/**
 * Get platform fee percentage based on payment method
 */
export function getPlatformFeePercentage(
  paymentMethod: string | null | undefined,
  platformFees?: Partial<PlatformFees>
): number {
  const fees = { ...DEFAULT_PLATFORM_FEES, ...platformFees };
  
  if (!paymentMethod) return fees.platform_fee_cod;
  
  const method = paymentMethod.toUpperCase();
  
  switch (method) {
    case 'UPI':
      return fees.platform_fee_upi;
    case 'CC':
    case 'CARD':
    case 'RAZORPAY':
      return fees.platform_fee_card;
    case 'NB':
    case 'NET_BANKING':
      return fees.platform_fee_netbanking;
    case 'COD':
      return fees.platform_fee_cod;
    default:
      return fees.platform_fee_cod;
  }
}

/**
 * Calculate platform fee amount
 */
export function calculatePlatformFee(
  subtotal: number,
  paymentMethod: string | null | undefined,
  platformFees?: Partial<PlatformFees>
): number {
  const feePercentage = getPlatformFeePercentage(paymentMethod, platformFees);
  return (subtotal * feePercentage) / 100;
}

/**
 * Calculate all order totals
 */
export function calculateOrderTotals(
  subtotal: number,
  paymentMethod: string | null | undefined,
  platformFees?: Partial<PlatformFees>,
  couponDiscount: number = 0
) {
  const fees = { ...DEFAULT_PLATFORM_FEES, ...platformFees };
  
  // Apply coupon discount to subtotal first
  const subtotalAfterDiscount = Math.max(0, subtotal - couponDiscount);
  
  // Calculate tax on subtotal after discount
  const tax = (subtotalAfterDiscount * fees.tax_rate) / 100;
  // Calculate platform fee on subtotal after discount
  const platformFee = calculatePlatformFee(subtotalAfterDiscount, paymentMethod, fees);
  const shippingCost = 0; // Shipping is removed
  const total = subtotalAfterDiscount + tax + platformFee + shippingCost;
  
  return {
    subtotal: Number(subtotal.toFixed(2)),
    couponDiscount: Number(couponDiscount.toFixed(2)),
    subtotalAfterDiscount: Number(subtotalAfterDiscount.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    shippingCost: 0,
    total: Number(total.toFixed(2)),
  };
}

