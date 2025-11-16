import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { orderAPI, homepageAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderDetailsModal from '../components/OrderDetailsModal.tsx';
import Productdetails_Slider1 from '../components/Products_Details/productdetails_slider1';
import ReturnsList from '../components/Returns/ReturnsList';
import ReturnRequestModal from '../components/Returns/ReturnRequestModal';
import '../styles/orders.css';
import SubNav from '../components/SubNav.tsx';
import CategoryTabs from '../components/CategoryTabs.tsx';

// Product interface matching the slider component
interface Product {
  img: string;
  title: string;
  desc: string;
  rating: number;
  reviews: number;
  oldPrice: string;
  newPrice: string;
  id?: number;
  productId?: number;
  slug?: string;
}

interface OrderItem {
  id: number;
  product: {
    id: number;
    title: string;
    main_image: string;
    price: number;
    old_price?: number | null;
  };
  variant?: {
    id: number;
    color: { name: string };
    size: string;
    pattern: string;
  };
  variant_color?: string;
  variant_size?: string;
  variant_pattern?: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  estimated_delivery?: string;
  shipping_address?: any;
  razorpay_order_id?: string;
  items?: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, addToCart } = useApp();
  const { showError, showSuccess } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'buyAgain' | 'notShipped' | 'cancelled' | 'returns'>('orders');
  const [timeFilter, setTimeFilter] = useState('past 3 months');
  const [searchQuery, setSearchQuery] = useState('');

  const [completingPayment, setCompletingPayment] = useState<string | null>(null);
  const [frequentlyViewedProducts, setFrequentlyViewedProducts] = useState<Product[]>([]);
  const [inspiredProducts, setInspiredProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [buyAgainLoading, setBuyAgainLoading] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [selectedOrderItemForReturn, setSelectedOrderItemForReturn] = useState<OrderItem | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowModal(true);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    setDownloadingInvoice(orderId);
    try {
      const response = await orderAPI.downloadInvoice(orderId);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${orderId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Invoice downloaded successfully');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrderId(null);
    // Refresh orders list in case order was cancelled
    fetchOrders();
  };

  const handleCompletePayment = async (order: Order) => {
    if (!order.shipping_address?.id) {
      showError('Shipping address not found. Please contact support.');
      return;
    }

    setCompletingPayment(order.order_id);

    try {
      // Create new Razorpay order for the pending order
      const razorpayResponse = await orderAPI.createRazorpayOrder({
        amount: order.total_amount,
        shipping_address_id: order.shipping_address.id
      });

      const getRazorpayMethods = () => {
        const paymentMethod = order.payment_method || 'RAZORPAY';
        switch (paymentMethod) {
          case 'CARD':
            return {
              method: {
                card: true,
                netbanking: false,
                upi: false,
                wallet: false,
                emi: false
              }
            };
          case 'NET_BANKING':
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
            return {};
        }
      };

      const razorpayMethods = getRazorpayMethods();
      const options = {
        key: razorpayResponse.data.key,
        amount: razorpayResponse.data.amount * 100,
        currency: razorpayResponse.data.currency,
        name: 'SIXPINE',
        description: 'Complete Payment for Order',
        order_id: razorpayResponse.data.razorpay_order_id,
        ...razorpayMethods,
        handler: async function (response: any) {
          try {
            await orderAPI.completePayment({
              order_id: order.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_method: order.payment_method || 'RAZORPAY'
            });

            showSuccess('Payment completed successfully! Order confirmed.');
            fetchOrders();
          } catch (error: any) {
            showError(error.response?.data?.error || 'Payment verification failed');
          } finally {
            setCompletingPayment(null);
          }
        },
        prefill: {
          name: state.user?.first_name && state.user?.last_name 
            ? `${state.user.first_name} ${state.user.last_name}` 
            : state.user?.username || '',
          email: state.user?.email || '',
          contact: ''
        },
        theme: {
          color: '#FFD814'
        },
        modal: {
          ondismiss: function() {
            setCompletingPayment(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function () {
        showError('Payment failed. Please try again.');
        setCompletingPayment(null);
      });
      razorpay.open();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to initiate payment. Please try again.');
      setCompletingPayment(null);
    }
  };

  const handleTrackOrder = (order: Order) => {
    // Open order details modal
    handleViewDetails(order.order_id);
  };

  const handleBuyAgain = async (order: Order, navigateToCheckout: boolean = false) => {
    if (!order.items || order.items.length === 0) {
      showError('No items found in this order');
      return;
    }

    setBuyAgainLoading(order.order_id);

    try {
      // Add all items from the order to cart
      for (const item of order.items) {
        if (item.product?.id) {
          const variantId = item.variant?.id || undefined;
          await addToCart(item.product.id, item.quantity, variantId);
        }
      }

      if (navigateToCheckout) {
        navigate('/checkout');
      }
    } catch (error: any) {
      console.error('Error adding items to cart:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add items to cart';
      showError(errorMsg);
    } finally {
      setBuyAgainLoading(null);
    }
  };

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    // Don't show flash message from checkout (removed)

    // Check URL params for tab selection
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'buyAgain' || tabParam === 'notShipped' || tabParam === 'cancelled' || tabParam === 'orders' || tabParam === 'returns') {
      setActiveTab(tabParam as 'orders' | 'buyAgain' | 'notShipped' | 'cancelled' | 'returns');
    }

    fetchOrders();
    fetchHomepageData();
  }, [state.isAuthenticated, location.search]);

  const fetchHomepageData = async () => {
    try {
      setLoadingProducts(true);
      const response = await homepageAPI.getHomepageContent('banner-cards');
      const content = response.data.content || response.data;
      
      console.log('Homepage content:', content); // Debug log
      
      // Transform slider1Products (frequently viewed)
      // Backend returns products with: img, title, desc, rating, reviews, oldPrice, newPrice
      if (content.slider1Products && Array.isArray(content.slider1Products)) {
        const transformedFrequentlyViewed = content.slider1Products.map((product: any) => ({
          img: product.img || product.image || product.main_image || '/images/placeholder.jpg',
          title: product.title || product.name || '',
          desc: product.desc || product.short_description || product.description || '',
          rating: product.rating || product.average_rating || 4.5,
          reviews: product.reviews || product.review_count || 0,
          oldPrice: product.oldPrice || (product.old_price ? `₹${parseInt(String(product.old_price)).toLocaleString()}` : ''),
          newPrice: product.newPrice || product.price || '',
          id: product.id || product.productId,
          productId: product.id || product.productId,
          slug: product.slug || product.productSlug,  // Use slug or productSlug
          variantCount: product.variant_count || product.variants_count || 0,
          variants_count: product.variant_count || product.variants_count || 0,
        }));
        setFrequentlyViewedProducts(transformedFrequentlyViewed);
      }
      
      // Transform slider2Products (inspired by browsing history)
      if (content.slider2Products && Array.isArray(content.slider2Products)) {
        const transformedInspired = content.slider2Products.map((product: any) => ({
          img: product.img || product.image || product.main_image || '/images/placeholder.jpg',
          title: product.title || product.name || '',
          desc: product.desc || product.short_description || product.description || '',
          rating: product.rating || product.average_rating || 4.5,
          reviews: product.reviews || product.review_count || 0,
          oldPrice: product.oldPrice || (product.old_price ? `₹${parseInt(String(product.old_price)).toLocaleString()}` : ''),
          newPrice: product.newPrice || product.price || '',
          id: product.id || product.productId,
          productId: product.id || product.productId,
          slug: product.slug || product.productSlug,  // Use slug or productSlug
          variantCount: product.variant_count || product.variants_count || 0,
          variants_count: product.variant_count || product.variants_count || 0,
        }));
        setInspiredProducts(transformedInspired);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      // Set empty arrays on error
      setFrequentlyViewedProducts([]);
      setInspiredProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders();
      const fetchedOrders = response.data.results || response.data || [];
      
      // Only use real data from backend API
      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'buyAgain':
        // Show delivered orders for buy again
        return orders.filter(order => order.status === 'delivered');
      case 'notShipped':
        // Show orders that are pending, confirmed, or processing
        return orders.filter(order => 
          ['pending', 'confirmed', 'processing'].includes(order.status)
        );
      case 'cancelled':
        // Show cancelled orders
        return orders.filter(order => order.status === 'cancelled');
      case 'returns':
        // Returns tab will show return requests, not orders
        return [];
      case 'orders':
      default:
        // Show all orders
        return orders;
    }
  };

  const handleRequestReturn = (order: Order | any, orderItem: OrderItem | any) => {
    // Handle both Order type and OrderDetails type from modal
    const orderData: Order = {
      order_id: order.order_id || order.orderId || order.id,
      status: order.status,
      payment_status: order.payment_status || order.paymentStatus,
      payment_method: order.payment_method || order.paymentMethod,
      total_amount: order.total_amount || order.totalAmount || 0,
      items_count: order.items_count || order.itemsCount || 0,
      created_at: order.created_at || order.createdAt || '',
      estimated_delivery: order.estimated_delivery || order.estimatedDelivery,
      shipping_address: order.shipping_address || order.shippingAddress,
      items: order.items || []
    };
    
    // Handle order item structure from different sources
    const itemData: OrderItem = {
      id: orderItem.id || orderItem.order_item_id,
      product: {
        id: orderItem.product?.id || orderItem.product_id,
        title: orderItem.product?.title || orderItem.product_name || orderItem.name || '',
        main_image: orderItem.product?.main_image || orderItem.product_image || orderItem.image || '',
        price: orderItem.product?.price || orderItem.price || orderItem.unitPrice || 0,
        old_price: orderItem.product?.old_price || orderItem.old_price || null
      },
      variant: orderItem.variant,
      variant_color: orderItem.variant_color || orderItem.variantColor,
      variant_size: orderItem.variant_size || orderItem.variantSize,
      variant_pattern: orderItem.variant_pattern || orderItem.variantPattern,
      quantity: orderItem.quantity || orderItem.qty || 1,
      price: orderItem.price || orderItem.unitPrice || 0
    };
    
    setSelectedOrderForReturn(orderData);
    setSelectedOrderItemForReturn(itemData);
    setShowReturnModal(true);
  };

  const handleReturnRequestSuccess = () => {
    // Refresh orders to show updated status
    fetchOrders();
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container my-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />

        </div>
      <div className="page-content orders-page">
        <div className="container-fluid py-4" >
          {/* Breadcrumb */}
          <div className="breadcrumb-custom mb-3">
            <a href="/profile" className="breadcrumb-link">Your Account</a>
            <span className="breadcrumb-separator"> › </span>
            <span className="breadcrumb-current">Your Orders</span>
          </div>

          {/* Page Header */}
          <div className="orders-header mb-4">
            <h1 className="orders-title">Your Orders</h1>
            <div className="orders-search-container">
              <div className="search-box-orders">
                <input
                  type="text"
                  className="form-control search-input-orders"
                  placeholder="Search all orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-dark search-btn-orders">Search Orders</button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="orders-tabs mb-4">
            <button
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button
              className={`tab-button ${activeTab === 'buyAgain' ? 'active' : ''}`}
              onClick={() => setActiveTab('buyAgain')}
            >
              Buy Again
            </button>
            <button
              className={`tab-button ${activeTab === 'notShipped' ? 'active' : ''}`}
              onClick={() => setActiveTab('notShipped')}
            >
              Not Yet Shipped
            </button>
            <button
              className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled Order
            </button>
            <button
              className={`tab-button ${activeTab === 'returns' ? 'active' : ''}`}
              onClick={() => setActiveTab('returns')}
            >
              Returns
            </button>
          </div>

          {/* Time Filter */}
          <div className="time-filter mb-4">
            <span className="filter-label">
              <strong>{filteredOrders.length} orders</strong> placed in
            </span>
            <select
              className="form-select filter-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="past 3 months">past 3 months</option>
              <option value="past 6 months">past 6 months</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : activeTab === 'returns' ? (
            <ReturnsList onRequestReturn={() => {
              // Navigate to orders tab to select an order for return
              setActiveTab('orders');
            }} />
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <h4>No Orders Found</h4>
              <p className="text-muted mb-4">
                {activeTab === 'buyAgain' && 'You have no delivered orders to buy again.'}
                {activeTab === 'notShipped' && 'You have no unshipped orders.'}
                {activeTab === 'cancelled' && 'You have no cancelled orders.'}
                {activeTab === 'orders' && "You haven't placed any orders yet."}
              </p>
              {activeTab === 'orders' && (
                <button className="btn btn-primary" onClick={() => navigate('/products')}>
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order.order_id} className="order-card mb-4">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-header-row">
                      <div className="order-info-group">
                        <div className="info-item">
                          <span className="info-label">ORDER PLACED</span>
                          <span className="info-value">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">TOTAL</span>
                          <span className="info-value">₹{order.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">SHIP TO</span>
                          <span className="info-value">
                            {order.shipping_address ? (
                              <>
                                {order.shipping_address.city}, {order.shipping_address.state}
                              </>
                            ) : (
                              'Address not available'
                            )}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">PAYMENT STATUS</span>
                          <span className={`info-value ${
                            order.payment_status === 'paid' ? 'text-success' : 
                            order.payment_status === 'pending' ? 'text-warning' : 
                            'text-danger'
                          }`}>
                            {order.payment_status === 'paid' ? 'Paid' : 
                             order.payment_status === 'pending' ? 'Pending' : 
                             order.payment_status}
                          </span>
                        </div>
                      </div>
                      <div className="order-id-group">
                        <span className="order-id-label">
                          ORDER #{order.order_id.slice(0, 8)}
                          {order.items && order.items.length > 0 && (
                            <>
                              {' '}{order.items.length} item{order.items.length > 1 ? 's' : ''}
                              {order.items[0]?.product?.title && (
                                <span className="order-item-title">
                                  {' '}({order.items[0].product.title.length > 50 
                                    ? order.items[0].product.title.substring(0, 50) + '...'
                                    : order.items[0].product.title})
                                </span>
                              )}
                            </>
                          )}
                        </span>
                        <div className="order-actions-header">
                          <button
                            className="btn-link-custom"
                            onClick={() => handleViewDetails(order.order_id)}
                          >
                            View order details
                          </button>
                          <span style={{ margin: '0 1px', color: '#ccc' }}>|</span>
                          <button
                            className="btn-link-custom"
                            onClick={() => handleDownloadInvoice(order.order_id)}
                            disabled={downloadingInvoice === order.order_id}
                          >
                            {downloadingInvoice === order.order_id ? 'Downloading...' : 'Invoice'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="order-body">
                    {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                        <div key={order.order_id} className="order-item">
                          <div className="item-image-container">
                            <img
                              src={order.items[0].product.main_image || 'https://via.placeholder.com/150'}
                              alt={order.items[0].product.title}
                              className="item-image"
                            />
                          </div>
                          <div className="item-details">
                            <h3 className="item-title">Order #{order.order_id.slice(0, 8)}</h3>
                            
                            {order.items && order.items.length > 0 && (
                            <>
                              {order.items[0]?.product?.title && (
                                <>
                                <span className="order-item-title mt-0">
                                {order.items.length} item{order.items.length > 1 ? 's' : ''} 
                                  {' '}({order.items[0].product.title.length > 50 
                                    ? order.items[0].product.title.substring(0, 50) + '...'
                                    : order.items[0].product.title})
                                </span>

                                </>
                              )}
                            </>
                          )}
                            <div className="item-pricing">
                              <span className="item-price">₹{order.total_amount.toLocaleString()}</span>
                              <span className="text-muted small d-block mt-1">
                                {order.items.length} item{order.items.length > 1 ? 's' : ''} • Total paid
                              </span>
                            </div>
                            
                            {/* Show Buy Now and Add to Cart only in Buy Again tab */}
                            {activeTab === 'buyAgain' && (
                              <div className="item-actions">
                                <button 
                                  className="btn btn-warning btn-buy-now"
                                  onClick={() => handleBuyAgain(order, true)}
                                  disabled={buyAgainLoading === order.order_id}
                                >
                                  {buyAgainLoading === order.order_id ? 'Adding...' : 'Buy Now'}
                                </button>
                                <button 
                                  className="btn btn-outline-secondary btn-add-cart"
                                  onClick={() => handleBuyAgain(order, false)}
                                  disabled={buyAgainLoading === order.order_id}
                                >
                                  <i className="bi bi-cart"></i> {buyAgainLoading === order.order_id ? 'Adding...' : 'Add to Cart'}
                                </button>
                              </div>
                            )}

                            {/* Show status-specific information for other tabs */}
                            {activeTab === 'notShipped' && (
                              <div className="item-status">
                                <p className="status-text">
                                  <i className="bi bi-clock-history me-2"></i>
                                  <strong>Status:</strong> {
                                    // For COD orders with pending payment, show Confirmed
                                    order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                  }
                                </p>
                                {order.estimated_delivery && (
                                  <p className="delivery-text">
                                    <i className="bi bi-truck me-2"></i>
                                    <strong>Expected Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                )}
                                <button 
                                  className="btn btn-outline-primary btn-sm mt-2"
                                  onClick={() => handleTrackOrder(order)}
                                >
                                  <i className="bi bi-truck me-1"></i>
                                  Track Package
                                </button>
                              </div>
                            )}

                            {activeTab === 'cancelled' && (
                              <div className="item-status">
                                <p className="cancelled-text">
                                  <i className="bi bi-x-circle me-2 text-danger"></i>
                                  <strong>Order Cancelled</strong>
                                </p>
                                <p className="text-muted small">
                                  Refund will be processed within 5-7 business days
                                </p>
                                <button 
                                  className="btn btn-warning btn-buy-now mt-2"
                                  onClick={() => handleBuyAgain(order, true)}
                                  disabled={buyAgainLoading === order.order_id}
                                >
                                  {buyAgainLoading === order.order_id ? 'Adding...' : 'Buy Again'}
                                </button>
                              </div>
                            )}

                            {activeTab === 'orders' && (
                              <div className="item-status">
                                <div className="status-badge-container">
                                  <div className="status-icon-wrapper">
                                    {/* Show only one icon based on priority: cancelled > delivered > shipped > confirmed/COD > pending/processing */}
                                    {order.status === 'cancelled' ? (
                                      <i className="bi bi-x-circle-fill status-icon-cancelled"></i>
                                    ) : order.status === 'delivered' ? (
                                      <i className="bi bi-check-circle-fill status-icon-delivered"></i>
                                    ) : order.status === 'shipped' ? (
                                      <i className="bi bi-truck status-icon-shipped"></i>
                                    ) : (order.payment_method === 'COD' && order.payment_status === 'pending') || order.status === 'confirmed' ? (
                                      <i className="bi bi-check-circle-fill status-icon-delivered"></i>
                                    ) : ['pending', 'processing'].includes(order.status) ? (
                                      <i className="bi bi-clock status-icon-pending"></i>
                                    ) : null}
                                  </div>
                                  <p className="status-text-inline mb-0">
                                    <strong>Status:</strong>
                                    <span className={`status-label ms-2 ${
                                      order.status === 'delivered' ? 'text-success' :
                                      order.status === 'cancelled' ? 'text-danger' :
                                      order.status === 'shipped' ? 'text-info' :
                                      // For COD orders with pending payment, show as confirmed
                                      (order.payment_method === 'COD' && order.payment_status === 'pending') ? 'text-success' :
                                      'text-warning'
                                    }`}>
                                      {/* For COD orders with pending payment, show Confirmed */}
                                      { order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                  </p>
                                </div>
                                
                                {/* Payment Status and Actions - Don't show for cancelled orders */}
                                {order.payment_status === 'pending' && order.status !== 'cancelled' && (
                                  <>
                                    {order.payment_method === 'COD' ? (
                                      <div className="payment-pending-alert mt-3 p-3 border border-success rounded bg-light">
                                        <p className="text-success mb-2">
                                          <i className="bi bi-check-circle me-2"></i>
                                          <strong>Order Confirmed</strong>
                                        </p>
                                        <p className="text-muted small mb-2">
                                          <strong>Payment Pending</strong> - Your order will be delivered and payment collected on delivery.
                                        </p>
                                        <button 
                                          className="btn btn-warning btn-sm"
                                          onClick={() => handleCompletePayment(order)}
                                          disabled={completingPayment === order.order_id}
                                        >
                                          {completingPayment === order.order_id ? 'Processing...' : 'You can also pay'}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="payment-pending-alert mt-3 p-3 border border-warning rounded bg-light">
                                        <p className="text-warning mb-2">
                                          <i className="bi bi-exclamation-triangle me-2"></i>
                                          <strong>Payment Not Successful</strong>
                                        </p>
                                        <p className="text-muted small mb-2">
                                          Your order was created but payment verification failed. Please complete the payment to confirm your order.
                                        </p>
                                        <button 
                                          className="btn btn-warning btn-sm"
                                          onClick={() => handleCompletePayment(order)}
                                          disabled={completingPayment === order.order_id}
                                        >
                                          {completingPayment === order.order_id ? 'Processing...' : 'Complete Payment'}
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
{/*                                 
                                {order.payment_status === 'paid' && order.status === 'confirmed' && (
                                  <div className="payment-success-alert mt-3 p-3 border border-success rounded bg-light">
                                    <p className="text-success mb-0">
                                      <i className="bi bi-check-circle me-2"></i>
                                      <strong>Order Placed Successfully</strong>
                                    </p>
                                  </div>
                                )} */}
                                
                                {order.status === 'delivered' && (
                                  <div className="d-flex gap-2 mt-2">
                                    <button 
                                      className="btn btn-warning btn-buy-now"
                                      onClick={() => handleBuyAgain(order, true)}
                                      disabled={buyAgainLoading === order.order_id}
                                    >
                                      {buyAgainLoading === order.order_id ? 'Adding...' : 'Buy Again'}
                                    </button>
                                    {order.items && order.items.length > 0 && (
                                      <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => {
                                          // Show return options for delivered orders
                                          if (order.items && order.items.length === 1) {
                                            handleRequestReturn(order, order.items[0]);
                                          } else {
                                            // If multiple items, show order details to select item
                                            handleViewDetails(order.order_id);
                                          }
                                        }}
                                      >
                                        Return/Replace
                                      </button>
                                    )}
                                  </div>
                                )}
                                {['pending', 'confirmed', 'processing', 'shipped'].includes(order.status) && order.payment_status === 'paid' && (
                                  <button 
                                    className="btn btn-outline-primary btn-sm mt-2"
                                    onClick={() => handleTrackOrder(order)}
                                  >
                                    <i className="bi bi-truck me-1"></i>
                                    Track Package
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <p className="mb-0">No items found for this order.</p>
                      </div>
                    )}
                  </div>

                 
                </div>
              ))}
            </div>
          )}

          {/* Product Sections */}
          {filteredOrders.length > 0 && (
            <div className="mt-5">
              {/* First Row - Customers frequently viewed */}
              {!loadingProducts && frequentlyViewedProducts.length > 0 && (
                <Productdetails_Slider1 
                  title="Customers frequently viewed | Popular products in the last 7 days"
                  products={frequentlyViewedProducts}
                />
              )}

              {/* Second Row - Inspired by your browsing history */}
              {!loadingProducts && inspiredProducts.length > 0 && (
                <Productdetails_Slider1 
                  title="Inspired by your browsing history"
                  products={inspiredProducts}
                />
              )}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrderId && (
          <OrderDetailsModal 
            orderId={selectedOrderId} 
            show={showModal} 
            onHide={handleCloseModal}
            onRequestReturn={handleRequestReturn}
          />
        )}

        {/* Return Request Modal */}
        {selectedOrderForReturn && selectedOrderItemForReturn && (
          <ReturnRequestModal
            orderId={selectedOrderForReturn.order_id}
            orderItem={selectedOrderItemForReturn}
            show={showReturnModal}
            onHide={() => {
              setShowReturnModal(false);
              setSelectedOrderForReturn(null);
              setSelectedOrderItemForReturn(null);
            }}
            onSuccess={handleReturnRequestSuccess}
          />
        )}
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default OrdersPage;