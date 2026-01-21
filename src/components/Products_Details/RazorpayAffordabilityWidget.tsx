import { useEffect, useRef, useState } from 'react';
import styles from './RazorpayAffordabilityWidget.module.css';
import { orderAPI } from '../../services/api';

// Declare global RazorpayAffordabilitySuite
declare global {
  interface Window {
    RazorpayAffordabilitySuite: any;
  }
}

interface RazorpayAffordabilityWidgetProps {
  amount: number; // Amount in rupees (will be converted to paise internally)
}

const RazorpayAffordabilityWidget = ({ amount }: RazorpayAffordabilityWidgetProps) => {
  const [razorpayKey, setRazorpayKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(false);
  const widgetRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  // Fetch payment settings and Razorpay key from server
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        // First check if Razorpay is enabled from payment settings
        const settingsResponse = await orderAPI.getPaymentCharges();
        const razorpayEnabled = settingsResponse.data?.razorpay_enabled !== false;
        const activeGateway = settingsResponse.data?.active_payment_gateway || 'razorpay';
        
        // Only show widget if Razorpay is enabled AND is the active gateway
        if (!razorpayEnabled || activeGateway !== 'razorpay') {
          setIsRazorpayEnabled(false);
          setIsLoading(false);
          return;
        }
        
        setIsRazorpayEnabled(true);
        
        // Now fetch the Razorpay key
        const response = await orderAPI.getRazorpayKey();
        if (response.data?.key) {
          setRazorpayKey(response.data.key);
          setError(null);
        } else {
          throw new Error('Key not found in response');
        }
      } catch (err) {
        console.error('Failed to fetch Razorpay settings:', err);
        // Fallback to environment variable if available
        const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (envKey && isRazorpayEnabled) {
          setRazorpayKey(envKey);
          setError(null);
        } else {
          setError('Failed to load payment options');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentSettings();
  }, []);

  // Load Razorpay Affordability Script
  useEffect(() => {
    if (scriptLoaded.current) return;

    const existingScript = document.querySelector(
      'script[src="https://cdn.razorpay.com/widgets/affordability/affordability.js"]'
    );

    if (existingScript) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.razorpay.com/widgets/affordability/affordability.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay Affordability Script');
      setError('Failed to load payment options');
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount as it may be used by other components
    };
  }, []);

  // Initialize/Update Widget when key and amount are available
  useEffect(() => {
    if (!razorpayKey || !amount || amount <= 0 || isLoading) return;

    // Wait for script to load
    const initWidget = () => {
      if (!window.RazorpayAffordabilitySuite) {
        // Script not loaded yet, retry after a delay
        setTimeout(initWidget, 100);
        return;
      }

      // Clear previous widget if exists
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        // Re-create the widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'razorpay-affordability-widget';
        containerRef.current.appendChild(widgetContainer);
      }

      try {
        // Convert rupees to paise
        const amountInPaise = Math.round(amount * 100);

        // Widget configuration with custom theme matching the page
        // Based on Razorpay documentation: https://razorpay.com/docs/payments/payment-gateway/emi/widget/native-web/customise/
        const widgetConfig = {
          key: razorpayKey,
          amount: amountInPaise,
          display: {
            // Enable offers
            offers: true,
            widget: {
              main: {
                // Match page heading color (EMI from ₹xxx/month text)
                heading: {
                  color: '#0f1111',
                  fontSize: '14px'
                },
                // Match page content styling (provider logos area)
                content: {
                  backgroundColor: '#ffffff',
                  color: '#0f1111',
                  fontSize: '13px'
                },
                // Discount value in green (matching offers/deals color)
                discount: {
                  color: '#067D62'
                },
                // Link/button styling (View plans button) - match page theme
                link: {
                  button: false,
                  color: '#007185',
                  fontSize: '13px'
                },
                // Footer styling - darkLogo: true for dark logo on white background
                footer: {
                  color: '#565959',
                  fontSize: '12px',
                  darkLogo: true
                },
                // Light mode (not dark mode)
                isDarkMode: false
              }
            }
          },
          // Theme color for header background (teal color matching page)
          theme: {
            color: '#b33d15'
          }
        };

        widgetRef.current = new window.RazorpayAffordabilitySuite(widgetConfig);
        widgetRef.current.render();
        setError(null);
      } catch (err) {
        console.error('Failed to initialize Razorpay Affordability Widget:', err);
        setError('Failed to display payment options');
      }
    };

    initWidget();

    // Cleanup on unmount or when amount changes
    return () => {
      if (widgetRef.current) {
        try {
          // Clear the widget
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        widgetRef.current = null;
      }
    };
  }, [razorpayKey, amount, isLoading]);

  // Don't render if Razorpay is not enabled
  if (!isRazorpayEnabled) {
    return null;
  }

  // Don't render if amount is too low or invalid
  if (!amount || amount <= 0) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.widgetContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading payment options...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return null; // Silently hide widget if there's an error
  }

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.widgetWrapper} ref={containerRef}>
        <div id="razorpay-affordability-widget"></div>
      </div>
    </div>
  );
};

export default RazorpayAffordabilityWidget;
