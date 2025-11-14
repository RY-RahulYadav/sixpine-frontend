import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';

// Safe formatter for amounts: handles undefined/null/string inputs
const formatAmount = (value: any) => {
  const n = Number(value);
  if (!isFinite(n)) return '0';
  return n.toLocaleString();
};

// Normalize item shape coming from backend (different APIs may return different keys)
const normalizeItem = (item: any) => {
  const quantity = Number(item.quantity ?? item.qty ?? 0) || 0;
  const unitPrice = Number(item.price ?? item.unit_price ?? item.product?.price ?? 0) || 0;
  const subtotal = Number(item.subtotal ?? item.total ?? unitPrice * quantity) || unitPrice * quantity;
  // product serializer uses `title` and `main_image` (ProductListSerializer)
  const name = item.product_name ?? item.name ?? item.title ?? item.product?.title ?? item.product?.name ?? `Product #${item.product_id ?? item.id ?? ''}`;
  const image = item.product_image ?? item.image ?? item.product?.main_image ?? item.product?.image ?? (item.product?.images && item.product.images[0] && item.product.images[0].image) ?? '';
  // Variant information
  const variant = item.variant || null;
  const variantColor = item.variant_color || variant?.color?.name || null;
  const variantSize = item.variant_size || variant?.size || null;
  const variantPattern = item.variant_pattern || variant?.pattern || null;
  return { quantity, unitPrice, subtotal, name, image, variantColor, variantSize, variantPattern };
};

interface OrderItem {
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Address {
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface StatusHistory {
  status: string;
  notes: string;
  created_at: string;
  created_by?: string;
}

interface OrderDetails {
  order_id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  coupon?: {
    id: number;
    code: string;
    discount_type: string;
    discount_value: string;
  } | null;
  coupon_discount?: number;
  shipping_cost: number;
  platform_fee?: number;
  tax_amount: number;
  tax_rate?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  shipping_address: Address;
  items: OrderItem[];
  status_history?: StatusHistory[];
  order_notes?: string;
}

interface OrderDetailsModalProps {
  orderId: string;
  show: boolean;
  onHide: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, show, onHide }) => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (show && orderId) {
      fetchOrderDetails();
    }
  }, [show, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    try {
      await orderAPI.cancelOrder(orderId);
      alert('Order cancelled successfully');
      fetchOrderDetails(); // Refresh order details
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'confirmed':
        return 'bg-info';
      case 'processing':
        return 'bg-primary';
      case 'shipped':
        return 'bg-success';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'returned':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  };

  // Get order status flow with completion tracking
  const getOrderStatusFlow = (order: OrderDetails) => {
    const isCOD = order.payment_method === 'COD';
    const isCODPending = isCOD && order.payment_status === 'pending';
    
    // Base status flow
    const confirmedStep = {
      key: 'confirmed',
      label: 'Order Confirmed',
      completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) || isCODPending,
      current: order.status === 'confirmed' && !isCODPending,
      failed: false,
      date: (order.status === 'confirmed' || isCODPending) ? order.created_at : null
    };
    
    const paymentStep = {
      key: 'payment',
      label: 'Payment Success',
      completed: order.payment_status === 'paid',
      current: order.payment_status === 'pending' && !isCOD,
      failed: isCODPending,
      date: order.payment_status === 'paid' ? order.created_at : null
    };
    
    // For COD orders, show Order Confirmed first, then Payment Success
    // For non-COD orders, show Payment Success first, then Order Confirmed
    const statusFlow = isCOD 
      ? [confirmedStep, paymentStep]
      : [paymentStep, confirmedStep];
    
    // Add remaining steps
    statusFlow.push(
      {
        key: 'processing',
        label: 'Processing',
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
        current: order.status === 'processing',
        failed: false,
        date: null as string | null
      },
      {
        key: 'shipped',
        label: 'Shipped',
        completed: ['shipped', 'delivered'].includes(order.status),
        current: order.status === 'shipped',
        failed: false,
        date: null as string | null
      },
      {
        key: 'delivered',
        label: 'Delivered',
        completed: order.status === 'delivered',
        current: false,
        failed: false,
        date: order.status === 'delivered' ? order.updated_at : null
      }
    );

    // If cancelled, show cancelled status
    if (order.status === 'cancelled') {
      return [
        {
          key: 'payment',
          label: 'Payment Success',
          completed: false,
          current: false,
          failed: false,
          date: null
        },
        {
          key: 'cancelled',
          label: 'Cancelled',
          completed: true,
          current: false,
          failed: false,
          date: order.updated_at
        }
      ];
    }

    return statusFlow;
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order Details</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : order ? (
                <div>
                  {/* Order Header */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-3">Order Information</h6>
                      <p className="mb-2">
                        <strong>Order ID:</strong> #{order.order_id.slice(0, 8)}
                      </p>
                      <p className="mb-2">
                        <strong>Status:</strong>{' '}
                        <span className={`badge ${getStatusBadgeClass(order.payment_method === 'COD' && order.payment_status === 'pending' ? 'confirmed' : order.status)}`}>
                          {/* For COD orders with pending payment, show Confirmed */}
                          {(order.payment_method === 'COD' && order.payment_status === 'pending') 
                            ? 'Confirmed' 
                            : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>Payment Status:</strong>{' '}
                        <span className={`badge ${order.payment_status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>Payment Method:</strong> {order.payment_method || 'COD'}
                      </p>
                      <p className="mb-2">
                        <strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}
                      </p>
                      {order.estimated_delivery && (
                        <p className="mb-2">
                          <strong>Expected Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-3">Shipping Address</h6>
                      <p className="mb-1"><strong>{order.shipping_address.full_name}</strong></p>
                      <p className="mb-1">{order.shipping_address.phone_number}</p>
                      <p className="mb-1">{order.shipping_address.address_line1}</p>
                      {order.shipping_address.address_line2 && (
                        <p className="mb-1">{order.shipping_address.address_line2}</p>
                      )}
                      <p className="mb-1">
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p className="mb-1">{order.shipping_address.country}</p>
                    </div>
                  </div>

                  <hr />

                  {/* Order Items */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">Order Items</h6>
                    {order.items && order.items.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Product</th>
                              <th>Price</th>
                              <th>Quantity</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, index) => {
                              const it = normalizeItem(item);
                              return (
                                <tr key={index}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {it.image ? (
                                        <img
                                          src={it.image}
                                          alt={it.name}
                                          style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                                        />
                                      ) : null}
                                      <div>
                                        <div>{it.name}</div>
                                        {(it.variantColor || it.variantSize || it.variantPattern) && (
                                          <small className="text-muted">
                                            {it.variantColor && <span>Color: {it.variantColor} </span>}
                                            {it.variantSize && <span>| Size: {it.variantSize} </span>}
                                            {it.variantPattern && <span>| Pattern: {it.variantPattern}</span>}
                                          </small>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td>₹{formatAmount(it.unitPrice)}</td>
                                  <td>{it.quantity}</td>
                                  <td>₹{formatAmount(it.subtotal)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <p className="mb-0">No items found for this order.</p>
                      </div>
                    )}
                  </div>

                  <hr />

                  {/* Order Summary */}
                  <div className="row mb-4">
                    <div className="col-md-6 offset-md-6">
                      <h6 className="text-muted mb-3">Order Summary</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <strong>₹{formatAmount(order.subtotal)}</strong>
                      </div>
                      {(order.coupon_discount || 0) > 0 && (
                        <>
                          <div className="d-flex justify-content-between mb-2" style={{ color: '#28a745' }}>
                            <span>
                              Coupon Discount{order.coupon?.code ? ` (${order.coupon.code})` : ''}:
                            </span>
                            <strong>-₹{formatAmount(order.coupon_discount || 0)}</strong>
                          </div>
                          {order.coupon && (
                            <div className="mb-2" style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
                              <span>Applied: {order.coupon.code} ({order.coupon.discount_value}{order.coupon.discount_type === 'percentage' ? '%' : '₹'})</span>
                            </div>
                          )}
                        </>
                      )}
                      {(order.shipping_cost || 0) > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <span>Shipping Cost:</span>
                          <strong>₹{formatAmount(order.shipping_cost || 0)}</strong>
                        </div>
                      )}
                      <div className="d-flex justify-content-between mb-2">
                        <span>Platform Fee:</span>
                        <strong>₹{formatAmount(order.platform_fee || 0)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax{order.tax_rate ? ` (${order.tax_rate}%)` : ''}:</span>
                        <strong>₹{formatAmount(order.tax_amount)}</strong>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total Amount Paid:</strong>
                        <strong className="text-primary fs-5">₹{formatAmount(order.total_amount)}</strong>
                      </div>
                    </div>
                  </div>

                  {order.order_notes && (
                    <>
                      <hr />
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">Order Notes</h6>
                        <p className="text-muted">{order.order_notes}</p>
                      </div>
                    </>
                  )}

                  <hr />

                  {/* Order Status Flow */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">Order Status</h6>
                    <div className="order-status-flow" style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '20px 0',
                      position: 'relative'
                    }}>
                      {getOrderStatusFlow(order).map((statusItem, index) => (
                        <React.Fragment key={statusItem.key}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            position: 'relative',
                            zIndex: 2
                          }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: statusItem.completed ? '#28a745' : statusItem.failed ? '#dc3545' : statusItem.current ? '#ffc107' : '#e9ecef',
                              color: statusItem.completed ? '#fff' : statusItem.failed ? '#fff' : statusItem.current ? '#000' : '#6c757d',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              marginBottom: '8px',
                              border: statusItem.current ? '3px solid #ffc107' : '2px solid ' + (statusItem.completed ? '#28a745' : statusItem.failed ? '#dc3545' : '#dee2e6'),
                              boxShadow: statusItem.current ? '0 0 0 3px rgba(255, 193, 7, 0.25)' : 'none',
                              transition: 'all 0.3s ease'
                            }}>
                              {statusItem.completed ? (
                                <i className="bi bi-check-circle-fill"></i>
                              ) : statusItem.failed ? (
                                <i className="bi bi-x-circle-fill"></i>
                              ) : statusItem.current ? (
                                <i className="bi bi-clock-history"></i>
                              ) : (
                                <i className="bi bi-circle" style={{ fontSize: '16px' }}></i>
                              )}
                            </div>
                            <div style={{
                              textAlign: 'center',
                              fontSize: '13px',
                              fontWeight: statusItem.completed || statusItem.current || statusItem.failed ? '600' : '400',
                              color: statusItem.completed ? '#28a745' : statusItem.failed ? '#dc3545' : statusItem.current ? '#ffc107' : '#6c757d',
                              maxWidth: '100px'
                            }}>
                              {statusItem.label}
                            </div>
                            {statusItem.date && (
                              <div style={{
                                fontSize: '11px',
                                color: '#6c757d',
                                marginTop: '4px',
                                textAlign: 'center'
                              }}>
                                {new Date(statusItem.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            )}
                          </div>
                          {index < getOrderStatusFlow(order).length - 1 && (
                            <div style={{
                              flex: 1,
                              height: '2px',
                              backgroundColor: statusItem.completed ? '#28a745' : '#e9ecef',
                              margin: '0 10px',
                              marginBottom: '32px',
                              marginTop: '24px'
                            }}></div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Status History */}
                  {order.status_history && order.status_history.length > 0 && (
                    <>
                      <hr />
                      <div className="mb-3">
                        <h6 className="text-muted mb-3">Status History</h6>
                        <div className="timeline">
                          {order.status_history.map((history, index) => (
                            <div key={index} className="mb-3 d-flex">
                              <div className="me-3">
                                <span className={`badge ${getStatusBadgeClass(history.status)}`}>
                                  {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                                </span>
                              </div>
                              <div>
                                <p className="mb-1">{history.notes}</p>
                                <small className="text-muted">
                                  {new Date(history.created_at).toLocaleString()}
                                  {history.created_by && ` by ${history.created_by}`}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>Order not found</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {order && order.status === 'pending' && (
                <button
                  className="btn btn-danger"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsModal;
