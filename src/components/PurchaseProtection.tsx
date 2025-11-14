import styles from "../styles/purchaseProtection.module.css";
import { Shield, CreditCard, Package, RefreshCw, Headphones } from "lucide-react";

export default function PurchaseProtection() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>100% Purchase Protection </h1>  {/*✅ */}
      <p className={styles.intro}>
        At Sixpine, your trust is our top priority. We want you to shop with complete confidence, 
        knowing that every order is protected by our <strong>100% Purchase Protection Guarantee</strong>.
      </p>

      <section className={styles.section}>
        <h2 className={styles.subheading}>What Our Purchase Protection Covers</h2>
        <ul className={styles.list}>
          <li>
            <Shield className={styles.icon} /> 
            <strong>Genuine & High-Quality Products</strong> – Every product is manufactured by us with strict quality checks. 
            No middlemen, no counterfeit items—only authentic Sixpine furniture.
          </li>
          <li>
            <CreditCard className={styles.icon} /> 
            <strong>Safe & Secure Payments</strong> – Trusted and encrypted gateways ensure your transactions 
            are always safe (online, UPI, card, or net banking).
          </li>
          <li>
            <Package className={styles.icon} /> 
            <strong>Reliable Delivery</strong> – Partnered with trusted logistics to deliver safely & on time. 
            Every delivery is trackable for peace of mind.
          </li>
          <li>
            <RefreshCw className={styles.icon} /> 
            <strong>Easy Returns & Replacements*</strong> – If your product is damaged, defective, or not as described, 
            you get free return, repair, or replacement. (Customized items may have exceptions.)
          </li>
          <li>
            <Headphones className={styles.icon} /> 
            <strong>Dedicated Support</strong> – Our customer care team is always here for pre-order queries 
            and after-sales assistance.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>How It Works</h2>
        <ol className={styles.steps}>
          <li><strong>Place Your Order</strong> – Shop from our official website or authorized platforms.</li>
          <li><strong>Get Order Protection</strong> – Every order is automatically covered.</li>
          <li><strong>Raise a Claim</strong> – Contact us within the return window if you face any issue.</li>
          <li><strong>Resolution Guaranteed</strong> – Refund, replacement, or repair ensured.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Your Peace of Mind, Our Promise</h2>
        <p>
          Shopping at Sixpine means shopping without worry. From the moment you place an order to delivery and beyond, 
          we guarantee safety, authenticity, and satisfaction.
        </p>
        <p className={styles.contact}>
          📧 <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a><br />
          📞 <a href="https://wa.me/919897268972" target="_blank" rel="noopener noreferrer">+91 9897268972 (WhatsApp)</a><br />
          🌐 <a href="https://www.sixpine.in" target="_blank" rel="noopener noreferrer">www.sixpine.in</a>
        </p>
      </section>

      <footer className={styles.footer}>
        Sixpine – 100% Genuine. 100% Safe. 100% Protected.
      </footer>
    </div>
  );
}
