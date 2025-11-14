import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { orderAPI, homepageAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderDetailsModal from '../components/OrderDetailsModal.tsx';
import Productdetails_Slider1 from '../components/Products_Details/productdetails_slider1';
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
  const { state } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'buyAgain' | 'notShipped' | 'cancelled'>('orders');
  const [timeFilter, setTimeFilter] = useState('past 3 months');
  const [searchQuery, setSearchQuery] = useState('');

  const [completingPayment, setCompletingPayment] = useState<string | null>(null);
  const [frequentlyViewedProducts, setFrequentlyViewedProducts] = useState<Product[]>([]);
  const [inspiredProducts, setInspiredProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrderId(null);
    // Refresh orders list in case order was cancelled
    fetchOrders();
  };

  const handleCompletePayment = async (order: Order) => {
    if (!order.shipping_address?.id) {
      alert('Shipping address not found. Please contact support.');
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

            alert('Payment completed successfully! Order confirmed.');
            fetchOrders();
          } catch (error: any) {
            alert(error.response?.data?.error || 'Payment verification failed');
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
        alert('Payment failed. Please try again.');
        setCompletingPayment(null);
      });
      razorpay.open();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to initiate payment. Please try again.');
      setCompletingPayment(null);
    }
  };

  const handleTrackOrder = (order: Order) => {
    // Open order details modal
    handleViewDetails(order.order_id);
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
    if (tabParam === 'buyAgain' || tabParam === 'notShipped' || tabParam === 'cancelled' || tabParam === 'orders') {
      setActiveTab(tabParam as 'orders' | 'buyAgain' | 'notShipped' | 'cancelled');
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
      case 'orders':
      default:
        // Show all orders
        return orders;
    }
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
                          <span className="separator">|</span>
                          <button className="btn-link-custom">Invoice</button>
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
                            <div className="item-rating">
                              <div className="stars">
                                <span className="star filled">★</span>
                                <span className="star filled">★</span>
                                <span className="star filled">★</span>
                                <span className="star half">★</span>
                                <span className="star empty">★</span>
                              </div>
                              <span className="review-count">(120 reviews)</span>
                            </div>
                            <div className="item-pricing">
                              <span className="item-price">₹{order.items[0].price.toLocaleString()}</span>
                              {order.items[0].product.old_price && Number(order.items[0].product.old_price) > Number(order.items[0].price) && (
                                <span className="item-strike">₹{Number(order.items[0] .product.old_price).toLocaleString()}</span>
                              )}
                            </div>
                            
                            {/* Show Buy Now and Add to Cart only in Buy Again tab */}
                            {activeTab === 'buyAgain' && (
                              <div className="item-actions">
                                <button className="btn btn-warning btn-buy-now">Buy Now</button>
                                <button className="btn btn-outline-secondary btn-add-cart">
                                  <i className="bi bi-cart"></i> Add to Cart
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
                                <button className="btn btn-warning btn-buy-now mt-2">Buy Again</button>
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
                                  <button className="btn btn-warning btn-buy-now mt-2">Buy Again</button>
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
          <OrderDetailsModal orderId={selectedOrderId} show={showModal} onHide={handleCloseModal} />
        )}
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default OrdersPage;