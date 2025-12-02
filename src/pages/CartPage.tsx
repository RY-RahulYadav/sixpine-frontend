import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { cartAPI, orderAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';

interface CartItem {
  id: number;
  product: {
    id: number;
    title: string;
    price: number;
    main_image: string;
    slug: string;
  };
  variant?: {
    id: number;
    color: { name: string };
    size: string;
    pattern: string;
  };
  quantity: number;
  total_price: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, fetchCart } = useApp();
  const { showWarning, showConfirmation } = useNotification();
  const [loading, setLoading] = useState(false);
  const [taxRate, setTaxRate] = useState<number>(5); // Default to 5%

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
    fetchTaxRate();
  }, [state.isAuthenticated]);

  const fetchTaxRate = async () => {
    try {
      const response = await orderAPI.getPaymentCharges();
      const rate = parseFloat(response.data.tax_rate || '5');
      setTaxRate(rate);
    } catch (err) {
      console.error('Error fetching tax rate:', err);
      // Keep default 5% if fetch fails
    }
  };

  const handleCheckout = () => {
    if (!state.cart || state.cart.items.length === 0) {
      showWarning('Your cart is empty!');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setLoading(true);
    try {
      await cartAPI.updateCartItem(itemId, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Update quantity error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setLoading(true);
    try {
      await cartAPI.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Remove item error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    const confirmed = await showConfirmation({
      title: 'Clear Cart',
      message: 'Are you sure you want to clear your cart?',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });
    
    if (confirmed) {
      setLoading(true);
      try {
        await cartAPI.clearCart();
        await fetchCart();
      } catch (error) {
        console.error('Clear cart error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!state.cart || state.cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
        <div className="page-content" style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div className="container my-5" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-center">
              <h2>Your Cart is Empty</h2>
              <p className="text-muted mb-4">Add some products to your cart to get started!</p>
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
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
      <div className="page-content">
        <div className="container my-5">
        <div className="row">
          <div className="col-md-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Shopping Cart ({state.cart.items_count} items)</h2>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={clearCart}
                disabled={loading}
              >
                Clear Cart
              </button>
            </div>

            {state.cart.items.map((item: CartItem) => (
              <div key={item.id} className="card mb-3">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <img
                        src={item.product.main_image || '/placeholder-image.jpg'}
                        alt={item.product.title}
                        className="img-fluid rounded"
                        style={{ maxHeight: '80px' }}
                      />
                    </div>
                    <div className="col-md-4">
                      <h6 className="mb-1">{item.product.title}</h6>
                      {item.variant && (
                        <div className="mb-1">
                          <small className="text-muted">
                            {item.variant.color?.name && <span>Color: {item.variant.color.name} </span>}
                            {item.variant.size && <span>| Size: {item.variant.size} </span>}
                            {item.variant.pattern && <span>| Pattern: {item.variant.pattern}</span>}
                          </small>
                        </div>
                      )}
                      <small className="text-muted">₹{item.product.price.toLocaleString()}</small>
                    </div>
                    <div className="col-md-3">
                      <div className="quantity-box">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading || item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center mx-2"
                          style={{ width: '60px' }}
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value);
                            if (qty > 0) updateQuantity(item.id, qty);
                          }}
                          min="1"
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <strong>₹{item.total_price.toLocaleString()}</strong>
                    </div>
                    <div className="col-md-1">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                        disabled={loading}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({state.cart.total_items} items)</span>
                  <span>₹{state.cart.total_price.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span className="text-success">Free</span>
                </div>
                {taxRate > 0 && (state.cart.total_price * (taxRate / 100)) > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax ({taxRate}%)</span>
                    <span>₹{(state.cart.total_price * (taxRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total</strong>
                  <strong>₹{(state.cart.total_price * (1 + taxRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>

            <div className="mt-3">
              <Link to="/products" className="btn btn-outline-secondary w-100">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default CartPage;