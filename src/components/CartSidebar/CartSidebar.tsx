import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cartAPI } from '../../services/api';
import styles from './CartSidebar.module.css';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
    // isOpen =false;
  const navigate = useNavigate();
  const { state, fetchCart } = useApp();

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      await cartAPI.updateCartItem(itemId, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await cartAPI.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Remove item error:', error);
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
    onClose();
  };

  // const handleDetailsClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   // Could implement a details modal here
  //   console.log('Details clicked');
  // };

  const subtotal = state.cart?.total_price || 0;
  const totalItems = state.cart?.total_items || 0;
  const isFirstOrder = totalItems <= 1;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {/* Content */}
        <div className={styles.content}>
          {/* Subtotal Section */}
          <div className={styles.subtotalSection}>
            <div className={styles.subtotalLabel}>Subtotal</div>
            <div className={styles.subtotalAmount}>₹{subtotal.toLocaleString('en-IN')}</div>
          </div>

          {/* Free Delivery Message */}
          {isFirstOrder && subtotal > 0 && (
            <div className={styles.freeDeliveryMessage}>
              Your first order qualifies for FREE Delivery. Select this option at checkout.
            </div>
          )}

          {/* Details Link */}
          

          {/* Go to Cart Button */}
          {subtotal > 0 && (
            <button className={styles.goToCartButton} onClick={handleGoToCart}>
              Go to Cart
            </button>
          )}

          {/* Cart Items */}
          <div className={styles.cartItems}>
                              <hr />

            {state.cart && state.cart.items.length > 0 ? (
              state.cart.items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  {/* clickable image to product page (if slug available) */}
                  <div>
                    {item.product?.slug ? (
                      <a onClick={() => { navigate(`/products-details/${item.product.slug}`); onClose(); }} style={{cursor:'pointer'}}>
                        <img
                          src={item.product.main_image || '/placeholder-image.jpg'}
                          alt={item.product.title}
                          className={styles.itemImage}
                        />
                      </a>
                    ) : (
                      <img
                        src={item.product.main_image || '/placeholder-image.jpg'}
                        alt={item.product.title}
                        className={styles.itemImage}
                      />
                    )}
                  </div>

                  <div className={styles.itemPrice}>₹{Number(item.total_price).toLocaleString('en-IN')}</div>

                  {/* Quantity Selector (trash | qty | +) */}
                  <div className={styles.quantitySelector}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => removeItem(item.id)}
                      title="Delete item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>

                    <span className={styles.quantity}>{item.quantity}</span>

                    <button
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      title="Increase quantity"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyCart}>
                <p>Your cart is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
