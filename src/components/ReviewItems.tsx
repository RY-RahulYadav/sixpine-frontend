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
        {state.cart.items.map((item) => {
          const variant = (item as any).variant;
          const displayImage = variant?.image || item.product.main_image || '/placeholder-image.jpg';
          const displayTitle = variant?.title || item.product.title;
          // total_price is already calculated correctly by backend (variant price * quantity)
          // But if variant has price, we can use it for display consistency
          const displayPrice = item.total_price;
          
          return (
            <div key={item.id} className={styles.itemRow}>
              <img 
                src={displayImage} 
                alt={displayTitle}
                className={styles.itemImage}
              />
              <div className={styles.itemDetails}>
                <div className={styles.itemTitle}>{displayTitle}</div>
                {variant && (
                  <div className={styles.itemVariant}>
                    {variant.color?.name && <span>Color: {variant.color.name} </span>}
                    {variant.size && <span>| Size: {variant.size} </span>}
                    {variant.pattern && <span>| Pattern: {variant.pattern} </span>}
                    {variant.quality && <span>| Quality: {variant.quality}</span>}
                  </div>
                )}
                <div className={styles.itemQuantity}>Quantity: {item.quantity}</div>
                <div className={styles.itemPrice}>₹{Number(displayPrice).toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewItems;
