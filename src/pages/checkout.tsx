import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useNotification } from "../context/NotificationContext";
import { orderAPI, addressAPI, cartAPI, paymentPreferencesAPI } from "../services/api";
import OrderConfirmation from '../components/OrderConfirmation';
import ReviewItems from '../components/ReviewItems';
import DeliveryAddress from '../components/DeliveryAddress';
import Navbar from "../components/Navbar";  
import OrderSummary from "../components/OrderSummary";
import NewPaymentMethod from "../components/NewPaymentMethod";
import Footer from "../components/Footer";
import CategoryTabs from "../components/CategoryTabs";
import SubNav from "../components/SubNav";
import PaymentModal from "../components/PaymentModal";
import CouponInput from "../components/CouponInput";
import "../styles/Pages.css";
import "../styles/CheckoutPage.css";

// Load Cashfree SDK dynamically
const loadCashfreeSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Cashfree) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.head.appendChild(script);
  });
};

declare global {
  interface Window {
    Razorpay: any;
    Cashfree: any;
  }
}

interface Address {
  id: number;
  type: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, fetchCart } = useApp();
  const { showError, showWarning } = useNotification();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState<'success' | 'failed'>('success');
  const [paymentModalMessage, setPaymentModalMessage] = useState<string>('');
  const [paymentSettings, setPaymentSettings] = useState<{
    razorpay_enabled: boolean;
    cod_enabled: boolean;
    coupons_enabled: boolean;
    active_payment_gateway: 'razorpay' | 'cashfree';
  }>({ razorpay_enabled: true, cod_enabled: true, coupons_enabled: true, active_payment_gateway: 'razorpay' });
  const paymentMethodInitialized = useRef(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: number; code: string; discount_amount: string } | null>(null);

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!state.cart || state.cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    // Reset initialization flag when component mounts
    paymentMethodInitialized.current = false;

    fetchCart();
    fetchAddresses();
    fetchSavedCards();
    fetchPaymentSettings().then((settings) => {
      // Fetch payment preference after settings are loaded
      if (settings && !paymentMethodInitialized.current) {
        fetchPaymentPreference(settings);
      }
    });
  }, [state.isAuthenticated]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await orderAPI.getPaymentCharges();
      const settings = {
        razorpay_enabled: response.data.razorpay_enabled !== false, // Default to true if not set
        cod_enabled: response.data.cod_enabled !== false, // Default to true if not set
        coupons_enabled: response.data.coupons_enabled !== false, // Default to true if not set
        active_payment_gateway: (response.data.active_payment_gateway || 'razorpay') as 'razorpay' | 'cashfree'
      };
      setPaymentSettings(settings);
      
      return settings;
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      // Keep defaults if fetch fails
      return null;
    }
  };

  const fetchPaymentPreference = async (settings?: { razorpay_enabled: boolean; cod_enabled: boolean; active_payment_gateway?: 'razorpay' | 'cashfree' }) => {
    // Prevent multiple initializations
    if (paymentMethodInitialized.current) {
      return;
    }

    try {
      const response = await paymentPreferencesAPI.getPaymentPreference();
      // Use provided settings or fall back to state
      const currentSettings = settings || paymentSettings;
      
      // Check if online payment is enabled (either razorpay_enabled for both gateways)
      const onlinePaymentEnabled = currentSettings.razorpay_enabled;
      
      let methodToSet: string | null = null;
      
      if (response.data.success && response.data.data?.preferred_method) {
        const preferredMethod = response.data.data.preferred_method;
        
        // Map backend payment method names to checkout payment method codes
        const methodMapping: { [key: string]: string } = {
          'card': 'CC',
          'netbanking': 'NB',
          'upi': 'UPI',
          'cod': 'COD'
        };
        
        const mappedMethod = methodMapping[preferredMethod];
        
        // Only auto-select if the method is available
        if (mappedMethod) {
          if (mappedMethod === 'COD' && currentSettings.cod_enabled) {
            methodToSet = mappedMethod;
          } else if (['CC', 'NB', 'UPI'].includes(mappedMethod) && onlinePaymentEnabled) {
            methodToSet = mappedMethod;
          }
        }
      }
      
      // If no preference or preference not available, set default based on availability
      if (!methodToSet) {
        if (onlinePaymentEnabled) {
          methodToSet = 'CC';
        } else if (currentSettings.cod_enabled) {
          methodToSet = 'COD';
        }
      }

      // Set the payment method only once
      if (methodToSet && !paymentMethodInitialized.current) {
        setSelectedPaymentMethod(methodToSet);
        paymentMethodInitialized.current = true;
      }
    } catch (err) {
      console.error('Error fetching payment preference:', err);
      // Set default if fetch fails (only if not already initialized)
      if (!paymentMethodInitialized.current) {
        const currentSettings = settings || paymentSettings;
        const onlinePaymentEnabled = currentSettings.razorpay_enabled;
        let methodToSet: string | null = null;
        if (onlinePaymentEnabled) {
          methodToSet = 'CC';
        } else if (currentSettings.cod_enabled) {
          methodToSet = 'COD';
        }
        if (methodToSet) {
          setSelectedPaymentMethod(methodToSet);
          paymentMethodInitialized.current = true;
        }
      }
    }
  };

  const fetchSavedCards = async () => {
    try {
      const response = await paymentPreferencesAPI.getSavedCards();
      if (response.data.success && response.data.saved_cards) {
        setSavedCards(response.data.saved_cards);
      }
    } catch (error) {
      console.error('Error fetching saved cards:', error);
      setSavedCards([]);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAddresses();
      const addressesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || response.data.data || []);
      
      if (addressesData.length > 0) {
        const defaultAddr = addressesData.find((addr: Address) => addr.is_default);
        const addrToSelect = defaultAddr || addressesData[0];
        setSelectedAddressId(addrToSelect.id);
        setSelectedAddress(addrToSelect);
      }
      // If no addresses, DeliveryAddress component will show add form inline
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressChange = async (addressId: number) => {
    setSelectedAddressId(addressId);
    // Fetch the full address details to get phone number
    try {
      const response = await addressAPI.getAddresses();
      const addressesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || response.data.data || []);
      const address = addressesData.find((addr: Address) => addr.id === addressId);
      if (address) {
        setSelectedAddress(address);
      }
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  };

  const handlePaymentMethodChange = (paymentMethod: string) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  const handlePayment = async () => {
    // Check authentication first
    if (!state.isAuthenticated) {
      showWarning('Please login to continue');
      navigate('/login');
      return;
    }

    // Check if token exists
    const token = localStorage.getItem('authToken');
    if (!token) {
      showError('Session expired. Please login again');
      navigate('/login');
      return;
    }

    if (!selectedAddressId) {
      showWarning('Please select a delivery address');
      return;
    }

    if (!selectedPaymentMethod) {
      showWarning('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      if (selectedPaymentMethod === 'COD') {
        // Validate token before making API call
        const currentToken = localStorage.getItem('authToken');
        if (!currentToken) {
          showError('Session expired. Please login again.');
          navigate('/login');
          setProcessing(false);
          return;
        }

        // Handle COD
        try {
          await orderAPI.checkoutWithCOD({
            shipping_address_id: selectedAddressId,
            order_notes: 'Order placed from checkout',
            coupon_id: appliedCoupon?.id
          });
          
                 // Clear cart after successful COD order
                 // Cart is automatically cleared by backend when order is created
          
          // Show success message and redirect
          navigate(`/orders`, { 
            state: { 
              message: 'Order placed successfully! We will deliver your order soon.' 
            } 
          });
        } catch (apiError: any) {
          // Handle API errors
          if (apiError.response?.status === 401 || apiError.response?.status === 403) {
            showError('Authentication failed. Please login again.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            navigate('/login');
            setProcessing(false);
            return;
          }
          throw apiError; // Re-throw other errors
        }
      } else {
        // Handle Online Payment (Razorpay or Cashfree based on admin settings)
        // Fetch platform fees for calculation
        let platformFees = null;
        try {
          const feesResponse = await orderAPI.getPaymentCharges();
          platformFees = feesResponse.data;
        } catch (err) {
          console.error('Error fetching platform fees:', err);
        }
        
        const { calculateOrderTotals } = await import('../utils/orderCalculations');
        const subtotal = state.cart?.total_price || 0;
        const couponDiscount = parseFloat(appliedCoupon?.discount_amount || '0') || 0;
        const totals = calculateOrderTotals(subtotal, selectedPaymentMethod, platformFees, couponDiscount);
        const total = totals.total;

        // Validate totals
        if (total <= 0) {
          showError('Invalid order total. Please check your cart.');
          setProcessing(false);
          return;
        }

        // Validate selected address ID
        if (!selectedAddressId || selectedAddressId <= 0) {
          showWarning('Please select a valid delivery address.');
          setProcessing(false);
          return;
        }

        // Validate token before making API call
        const currentToken = localStorage.getItem('authToken');
        if (!currentToken) {
          showError('Session expired. Please login again.');
          navigate('/login');
          setProcessing(false);
          return;
        }

        // Check which payment gateway is active
        const activeGateway = paymentSettings.active_payment_gateway || 'razorpay';

        if (activeGateway === 'cashfree') {
          // ==================== CASHFREE PAYMENT ====================
          try {
            // Load Cashfree SDK
            await loadCashfreeSDK();
            
            // Create Cashfree order
            const cashfreeResponse = await orderAPI.createCashfreeOrder({
              amount: total,
              shipping_address_id: selectedAddressId,
              payment_method: selectedPaymentMethod,  // Send payment method to backend
              coupon_id: appliedCoupon?.id,
              return_url: `${window.location.origin}/orders`
            });

            const { payment_session_id, order_id, environment } = cashfreeResponse.data;

            // Initialize Cashfree
            const cashfree = window.Cashfree({
              mode: environment === 'production' ? 'production' : 'sandbox'
            });

            // Checkout options - payment method filtering is done server-side
            const checkoutOptions = {
              paymentSessionId: payment_session_id,
              redirectTarget: '_modal' as const,
            };

            console.log('[CASHFREE] Opening checkout with session:', payment_session_id);
            console.log('[CASHFREE] Payment method filter applied on server:', selectedPaymentMethod);

            // Open Cashfree checkout
            cashfree.checkout(checkoutOptions).then(async (result: any) => {
              if (result.error) {
                // User closed the popup or error occurred
                console.error('Cashfree payment error:', result.error);
                setPaymentModalType('failed');
                setPaymentModalMessage('Payment was cancelled or an error occurred. Please try again.');
                setShowPaymentModal(true);
                setProcessing(false);
              } else if (result.redirect) {
                // Payment will be redirected (shouldn't happen with _modal)
                console.log('Payment redirecting...');
              } else if (result.paymentDetails) {
                // Payment completed - verify on backend
                try {
                  console.log('[CASHFREE] Payment completed, verifying with backend...');
                  const verifyResponse = await orderAPI.verifyCashfreePayment({
                    order_id: order_id,
                    shipping_address_id: selectedAddressId!,
                    payment_method: selectedPaymentMethod,
                    coupon_id: appliedCoupon?.id
                  });

                  console.log('[CASHFREE] Verification successful:', verifyResponse.data);
                  setPaymentModalType('success');
                  setPaymentModalMessage('Your payment has been processed successfully. Your order has been placed.');
                  setShowPaymentModal(true);
                  setProcessing(false);
                } catch (error: any) {
                  console.error('[CASHFREE] Verification failed:', error.response?.data || error);
                  const errorMsg = error.response?.data?.error || 'Payment verification failed';
                  const orderId = error.response?.data?.order_id;
                  
                  setPaymentModalType('failed');
                  if (orderId) {
                    setPaymentModalMessage(`${errorMsg}\nOrder ID: ${orderId}\nYou can complete payment from your orders page.`);
                  } else {
                    setPaymentModalMessage(errorMsg);
                  }
                  setShowPaymentModal(true);
                  setProcessing(false);
                }
              }
            });

          } catch (apiError: any) {
            if (apiError.response?.status === 401 || apiError.response?.status === 403) {
              showError('Authentication failed. Please login again.');
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              navigate('/login');
              setProcessing(false);
              return;
            }
            
            if (apiError.response?.status === 400) {
              const errorMsg = apiError.response?.data?.error || 'Invalid request. Please check your order details.';
              showError(errorMsg);
              setProcessing(false);
              return;
            }
            
            throw apiError;
          }
        } else {
          // ==================== RAZORPAY PAYMENT ====================
          // Map payment method to Razorpay method
          const getRazorpayMethods = () => {
            switch (selectedPaymentMethod) {
              case 'CC':
                // Credit/Debit Card - use object format to allow save option
                return {
                  method: {
                    card: {},  // Empty object to allow adding save: true
                    netbanking: false,
                    upi: false,
                    wallet: false,
                    emi: false
                  }
                };
              case 'NB':
                // Net Banking
                return {
                  method: {
                    card: false,
                    netbanking: true,
                    upi: false,
                    wallet: false,
                    emi: false
                  }
                };
              case 'UPI':
                // UPI
                return {
                  method: {
                    card: false,
                    netbanking: false,
                    upi: true,
                    wallet: false,
                    emi: false
                  }
                };
              default:
                // Show all methods
                return {};
            }
          };

          // Create Razorpay order
          let razorpayResponse;
          try {
            razorpayResponse = await orderAPI.createRazorpayOrder({
              amount: total,
              shipping_address_id: selectedAddressId,
              coupon_id: appliedCoupon?.id
            });
          } catch (apiError: any) {
            // Handle API errors before opening Razorpay
            if (apiError.response?.status === 401 || apiError.response?.status === 403) {
              showError('Authentication failed. Please login again.');
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              navigate('/login');
              setProcessing(false);
              return;
            }
            
            // Handle 400 Bad Request with detailed error message
            if (apiError.response?.status === 400) {
              const errorMsg = apiError.response?.data?.error || 'Invalid request. Please check your order details.';
              showError(errorMsg);
              setProcessing(false);
              return;
            }
            
            throw apiError; // Re-throw other errors
          }

          const razorpayMethods = getRazorpayMethods();

          // Get customer_id from order creation response (created automatically if doesn't exist)
          // This handles first-time payment where customer_id is created during order creation
          const customerId = razorpayResponse.data.customer_id?.trim() || null;

          // Validate customer_id format (should start with 'cust_')
          const isValidCustomerId = customerId && customerId.startsWith('cust_');

          // Build Razorpay options
          const options: any = {
            key: razorpayResponse.data.key,
            amount: razorpayResponse.data.amount * 100, // Convert rupees to paise (Razorpay requires amount in smallest currency unit)
            currency: razorpayResponse.data.currency,
            name: 'SIXPINE',
            description: 'Order Payment',
            order_id: razorpayResponse.data.razorpay_order_id,
            ...razorpayMethods, // Include payment method selection
            // Only add customer_id if it's valid (prevents "id does not exist" error)
            ...(isValidCustomerId && { customer_id: customerId }), // Add customer_id to enable card saving
            // Enable save card option - Razorpay requires save: 1 (number), not true (boolean)
            // This shows the "Save this card" checkbox in Razorpay checkout
            ...(selectedPaymentMethod === 'CC' && isValidCustomerId && { save: 1 }),
            handler: async function (response: any) {
              // Verify payment on backend and create order
              try {
                console.log('[RAZORPAY] Payment completed, verifying with backend...');
                const verifyResponse = await orderAPI.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  shipping_address_id: selectedAddressId,
                  payment_method: selectedPaymentMethod,
                  coupon_id: appliedCoupon?.id
                });

                // Refresh saved cards if a card was saved during payment
                if (verifyResponse.data?.saved_card) {
                  await fetchSavedCards();
                }

                console.log('[RAZORPAY] Verification successful:', verifyResponse.data);
                // Show success modal after Razorpay modal closes
                setPaymentModalType('success');
                setPaymentModalMessage('Your payment has been processed successfully. Your order has been placed.');
                setShowPaymentModal(true);
                setProcessing(false);
              } catch (error: any) {
                console.error('[RAZORPAY] Verification failed:', error.response?.data || error);
                const errorMsg = error.response?.data?.error || 'Payment verification failed';
                const orderId = error.response?.data?.order_id;
                
                // Show failed modal
                setPaymentModalType('failed');
                if (orderId) {
                  setPaymentModalMessage(`${errorMsg}\nOrder ID: ${orderId}\nYou can complete payment from your orders page.`);
                } else {
                  setPaymentModalMessage(errorMsg);
                }
                setShowPaymentModal(true);
                setProcessing(false);
              }
            },
            prefill: {
              name: selectedAddress?.full_name || (state.user?.first_name && state.user?.last_name 
                ? `${state.user.first_name} ${state.user.last_name}` 
                : state.user?.username || ''),
              email: state.user?.email || '',
              contact: selectedAddress?.phone ? selectedAddress.phone.replace(/\D/g, '') : ''
            },
            theme: {
              color: '#FFD814'
            },
            modal: {
              ondismiss: () => {
                setProcessing(false);
              }
            }
          };

          // Add saved cards configuration if CC is selected and cards are available
          if (selectedPaymentMethod === 'CC' && savedCards.length > 0 && isValidCustomerId) {
            options.config = {
              display: {
                blocks: {
                  saved: {
                    name: "Saved Cards",
                    instruments: savedCards.map((c) => ({
                      method: "card",
                      token: c.token_id,
                      card: { 
                        last4: c.card?.last4 || '', 
                        network: c.card?.network || '', 
                        type: c.card?.type || '' 
                      },
                    })),
                  }
                },
                sequence: [ "block.saved"],
                preferences: { show_default_blocks: true },
              },
            };
          }

          const razorpay = new window.Razorpay(options);
          razorpay.on('payment.failed', function (response: any) {
            // Handle payment failure
            console.error('Payment failed:', response);
            
            // Extract error details if available
            let errorMessage = 'Payment failed. Please try again.';
            if (response.error) {
              const errorDesc = response.error.description || response.error.reason || '';
              if (errorDesc) {
                errorMessage = `Payment failed: ${errorDesc}`;
              }
            }
            
            // Show failed modal
            setPaymentModalType('failed');
            setPaymentModalMessage(errorMessage);
            setShowPaymentModal(true);
            setProcessing(false);
          });
          razorpay.open();
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401 || error.response?.status === 403) {
        showError('Authentication failed. Please login again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.error || error.message || 'Failed to process payment. Please try again.';
      showError(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="checkout-page">
        <div className="checkout-main">
          <div className="checkout-left">
            <DeliveryAddress 
              selectedAddressId={selectedAddressId || undefined}
              onAddressChange={handleAddressChange}
            />
            <NewPaymentMethod 
              onPaymentMethodChange={handlePaymentMethodChange}
              razorpayEnabled={paymentSettings.razorpay_enabled}
              codEnabled={paymentSettings.cod_enabled}
              selectedPaymentMethod={selectedPaymentMethod}
            />
            <ReviewItems />
            <OrderConfirmation />
          </div>
          <div className="checkout-right">
            <CouponInput
              subtotal={state.cart?.total_price || 0}
              cartItems={state.cart?.items?.map((item: any) => ({
                product_id: item.product?.id || item.product_id,
                quantity: item.quantity,
                price: item.variant?.price || item.product?.price || item.price || 0
              })) || []}
              onCouponApplied={(coupon) => setAppliedCoupon(coupon)}
              onCouponRemoved={() => setAppliedCoupon(null)}
              appliedCoupon={appliedCoupon}
            />
            <OrderSummary 
              onPaymentClick={handlePayment}
              paymentDisabled={processing || !selectedAddressId || !selectedPaymentMethod}
              selectedPaymentMethod={selectedPaymentMethod}
              couponDiscount={parseFloat(appliedCoupon?.discount_amount || '0') || 0}
            />
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        type={paymentModalType}
        message={paymentModalMessage}
        onClose={async () => {
          setShowPaymentModal(false);
          if (paymentModalType === 'success') {
            // Refresh cart (backend already cleared it) and navigate to orders page
            try {
              await fetchCart();
            } catch (error) {
              console.error('Error refreshing cart:', error);
            }
            navigate('/orders');
          } else {
            // Clear cart and navigate to orders page
            try {
              await cartAPI.clearCart();
              await fetchCart();
            } catch (error) {
              console.error('Error clearing cart:', error);
            }
            navigate('/orders');
          }
        }}
      />
    </div>
  );
};

export default CheckoutPage;
