/**
 * Utility functions for admin panel
 */

/**
 * Safely format a value as currency (INR - Rupee)
 * Handles both string and number inputs
 */
export const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) {
    return '₹0.00';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '₹0.00';
  }
  
  // Format with Indian number system and add rupee symbol
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a date string to include time
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncate a string to a specific length
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Get status badge class name
 */
export const getStatusClass = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'pending':
      return 'status-pending';
    case 'confirmed':
      return 'status-confirmed';
    case 'processing':
      return 'status-processing';
    case 'shipped':
      return 'status-shipped';
    case 'delivered':
      return 'status-delivered';
    case 'cancelled':
      return 'status-cancelled';
    case 'paid':
      return 'status-paid';
    case 'failed':
      return 'status-failed';
    case 'refunded':
      return 'status-refunded';
    default:
      return 'status-default';
  }
};

/**
 * Show toast notification
 */
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
  // Remove existing toast if any
  const existingToast = document.querySelector('.admin-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  
  // Add icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = 'check_circle';
      break;
    case 'error':
      icon = 'error';
      break;
    case 'info':
    default:
      icon = 'info';
      break;
  }
  
  toast.innerHTML = `
    <span class="material-symbols-outlined">${icon}</span>
    ${message}
  `;
  
  // Add to body
  document.body.appendChild(toast);
  
  // Remove after duration
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, duration);
};
