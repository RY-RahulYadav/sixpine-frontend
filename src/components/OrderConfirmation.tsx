import styles from './OrderConfirmation.module.css';

const OrderConfirmation = () => {
  return (
    <div className={styles.confirmationContainer}>
      <p>
        Need help? Check our <a href="#">help pages</a> or <a href="#">contact us 24x7</a>
      </p>
      <p>
        When your order is placed, we'll send you an e-mail message acknowledging receipt of your order. If you choose to pay using an electronic payment method (credit card, debit card or net banking), you will be directed to your bank's website to complete your payment. Your contract to purchase an item will not be complete until we receive your electronic payment and dispatch your item. If you choose to pay using Pay on Delivery (POD), you can pay using cash/card/net banking when you receive your item.
      </p>
      <p>
        See Amazon.in's <a href="#">Return Policy</a>.
      </p>
      <a href="#">Back to cart</a>
    </div>
  );
};

export default OrderConfirmation;
