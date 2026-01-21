import { useEffect, useRef, useState } from 'react';
import styles from './CashfreeWidget.module.css';
import { orderAPI } from '../../services/api';

// Declare global CF_Widget
declare global {
  interface Window {
    CF_Widget: any;
  }
}

interface CashfreeWidgetProps {
  amount: number; // Amount in rupees
}

const CashfreeWidget = ({ amount }: CashfreeWidgetProps) => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCashfreeEnabled, setIsCashfreeEnabled] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const widgetInitialized = useRef(false);
  const scriptLoaded = useRef(false);

  // Fetch payment settings and Cashfree App ID from server
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        // First check if Cashfree is the active gateway
        const settingsResponse = await orderAPI.getPaymentCharges();
        const activeGateway = settingsResponse.data?.active_payment_gateway || 'razorpay';
        
        console.log('[CashfreeWidget] Active gateway:', activeGateway);
        
        // Only show widget if Cashfree is the active gateway
        if (activeGateway !== 'cashfree') {
          setIsCashfreeEnabled(false);
          setIsLoading(false);
          return;
        }
        
        setIsCashfreeEnabled(true);
        
        // Now fetch the Cashfree App ID
        const response = await orderAPI.getCashfreeAppId();
        console.log('[CashfreeWidget] App ID response:', response.data);
        
        if (response.data?.app_id) {
          setClientId(response.data.app_id);
          setError(null);
        } else {
          throw new Error('App ID not found in response');
        }
      } catch (err) {
        console.error('Failed to fetch Cashfree settings:', err);
        setError('Failed to load payment options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentSettings();
  }, []);

  // Load Cashfree Widget Script
  useEffect(() => {
    if (!isCashfreeEnabled) return;
    
    if (scriptLoaded.current) {
      // Check if CF_Widget is already available
      if (window.CF_Widget) {
        setWidgetReady(true);
      } else {
        // Wait for script to fully execute
        const checkWidget = setInterval(() => {
          if (window.CF_Widget) {
            clearInterval(checkWidget);
            setWidgetReady(true);
          }
        }, 100);
        setTimeout(() => clearInterval(checkWidget), 5000);
      }
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/widget/1.0.2/cashfree-widget.prod.js"]'
    );

    if (existingScript) {
      scriptLoaded.current = true;
      if (window.CF_Widget) {
        setWidgetReady(true);
      }
      return;
    }

    console.log('[CashfreeWidget] Loading Cashfree script...');
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/widget/1.0.2/cashfree-widget.prod.js';
    script.async = true;
    script.onload = () => {
      console.log('[CashfreeWidget] Script loaded successfully');
      scriptLoaded.current = true;
      // Wait a bit for script to initialize
      setTimeout(() => {
        if (window.CF_Widget) {
          console.log('[CashfreeWidget] CF_Widget is available');
          setWidgetReady(true);
        }
      }, 200);
    };
    script.onerror = () => {
      console.error('[CashfreeWidget] Failed to load Cashfree Widget Script');
      setError('Failed to load payment options');
    };
    document.head.appendChild(script);
  }, [isCashfreeEnabled]);

  // Initialize Widget when everything is ready
  useEffect(() => {
    if (!clientId || !amount || amount <= 0 || isLoading || !isCashfreeEnabled || !widgetReady) {
      return;
    }

    // Prevent double initialization
    if (widgetInitialized.current) {
      return;
    }

    console.log('[CashfreeWidget] Initializing widget with:', { clientId, amount });

    // Check if CF_Widget exists
    if (!window.CF_Widget) {
      console.error('[CashfreeWidget] CF_Widget is not available');
      return;
    }

    // Make sure the widget container exists
    const widgetContainer = document.getElementById('cashfree-widget');
    if (!widgetContainer) {
      console.error('[CashfreeWidget] Widget container not found');
      return;
    }

    try {
      // Widget configuration - only EMI enabled (no offers, no payLater)
      // Theme colors matching page: #007185 (primary teal)
      const widgetConfig = {
        clientID: clientId,
        amount: amount.toString(),
        // Only show EMI options as requested
        offers: 'false',
        payLater: 'false',
        emi: 'true',
        theme: {
          widgetColor: '#b33d15', // Match page primary color
          linkColor: '#007185',   // Match page link color
          cfLogoTheme: 'dark',    // Dark logo on light background
          isLogoActive: true,
        }
      };

      console.log('[CashfreeWidget] Widget config:', widgetConfig);

      const cashfree = window.CF_Widget(widgetConfig);
      cashfree.load();
      
      widgetInitialized.current = true;
      setError(null);
      console.log('[CashfreeWidget] Widget initialized successfully');
    } catch (err) {
      console.error('[CashfreeWidget] Failed to initialize Cashfree Widget:', err);
      setError('Failed to display payment options');
    }
  }, [clientId, amount, isLoading, isCashfreeEnabled, widgetReady]);

  // Reset widget when amount changes
  useEffect(() => {
    if (widgetInitialized.current && amount > 0) {
      // Reset and reinitialize
      widgetInitialized.current = false;
      const widgetContainer = document.getElementById('cashfree-widget');
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    }
  }, [amount]);

  // Don't render if Cashfree is not enabled
  if (!isCashfreeEnabled && !isLoading) {
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
      <div className={styles.widgetWrapper}>
        {/* This div must have id="cashfree-widget" as per Cashfree documentation */}
        <div id="cashfree-widget"></div>
      </div>
    </div>
  );
};

export default CashfreeWidget;
