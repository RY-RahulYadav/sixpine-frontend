import { useApp } from '../context/AppContext';
import styles from './ReviewItems.module.css';

const ReviewItems = () => {
  const { state } = useApp();

  if (!state.cart || state.cart.items.length === 0) {
    return (
      <div className={styles.reviewContainer}>
        <h2 className={styles.title}>Review items and shipping</h2>
        <p className={styles.emptyMessage}>No items in cart</p>
      </div>
    );
  }

  return (
    <div className={styles.reviewContainer}>
      <h2 className={styles.title}>Review items and shipping</h2>
      <div className={styles.itemsList}>
        {state.cart.items.map((item) => (
          <div key={item.id} className={styles.itemRow}>
            <img 
              src={item.product.main_image || '/placeholder-image.jpg'} 
              alt={item.product.title}
              className={styles.itemImage}
            />
            <div className={styles.itemDetails}>
              <div className={styles.itemTitle}>{item.product.title}</div>
              {(item as any).variant && (
                <div className={styles.itemVariant}>
                  {(item as any).variant.color?.name && <span>Color: {(item as any).variant.color.name} </span>}
                  {(item as any).variant.size && <span>| Size: {(item as any).variant.size} </span>}
                  {(item as any).variant.pattern && <span>| Pattern: {(item as any).variant.pattern}</span>}
                </div>
              )}
              <div className={styles.itemQuantity}>Quantity: {item.quantity}</div>
              <div className={styles.itemPrice}>₹{Number(item.total_price).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewItems;
