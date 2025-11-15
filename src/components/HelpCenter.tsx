import styles from '../styles/sixpineApp.module.css';
import { useFooterSettings } from '../hooks/useFooterSettings';

const HelpCenter = () => {
  const { whatsAppNumber, displayPhoneNumber, iosAppUrl, androidAppUrl } = useFooterSettings();
  return (
    <div className={styles.Appcontainer}>
      <h1 className={styles.heading}>Sixpine Help Center</h1>
      <p className={styles.intro}>
        Welcome to the Sixpine Help Center. Here you'll find detailed guidance on orders, shipping, payments, returns, warranty, and product safety. Use the sections below to quickly locate the help you need.
      </p>

      <section className={styles.section}>
        <h2 className={styles.subheading}>🛒 Your Orders</h2>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Track Your Order</h3>
        <ul className={styles.steps}>
          <li>Visit My Orders in your account.</li>
          <li>Select the item to view real-time tracking.</li>
          <li>You can also request tracking updates on <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>WhatsApp 📱</a> at {displayPhoneNumber}.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Change or Cancel an Order</h3>
        <ul className={styles.steps}>
          <li><strong>Before Shipment:</strong> Orders can be cancelled directly from your account.</li>
          <li><strong>After Shipment:</strong> Once the order is shipped, cancellation isn't possible. You may initiate a return once it's delivered.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Order Not Received</h3>
        <p className={styles.intro}>If you haven't received your package:</p>
        <ul className={styles.steps}>
          <li>Check tracking status.</li>
          <li>Verify your delivery address.</li>
          <li>Contact our delivery partner or Sixpine support.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Download Invoices</h3>
        <ul className={styles.steps}>
          <li>Go to My Orders → select order → Download Invoice.</li>
          <li>Invoices include GST details for business customers only.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>📦 Shipping & Delivery</h2>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Delivery Timelines</h3>
        <ul className={styles.steps}>
          <li><strong>Standard Furniture:</strong> 5–10 business days.</li>
          <li><strong>Large Sofas/Couches:</strong> 7–14 business days (depending on location).</li>
          <li><strong>Customized Products:</strong> Timeline provided during checkout.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Delivery Charges</h3>
        <ul className={styles.steps}>
          <li>Free shipping on most products.</li>
          <li>Some remote areas may include additional freight costs (displayed at checkout).</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Delivery Partners</h3>
        <p className={styles.intro}>
          We work with trusted logistics partners like SafeExpress, Delhivery, and BlueDart for secure handling.
        </p>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Delayed Delivery</h3>
        <p className={styles.intro}>If your package is delayed:</p>
        <ul className={styles.steps}>
          <li>Check order tracking.</li>
          <li>Reach out to our support team.</li>
          <li>In case of non-delivery, we'll issue a full refund or replacement.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Delivery Restrictions</h3>
        <p className={styles.intro}>
          Some pin codes may not be serviceable. In such cases, our support team will assist with alternate delivery solutions.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>🔄 Returns & Refunds</h2>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Return Eligibility</h3>
        <ul className={styles.steps}>
          <li>Damaged, defective, or incorrect items are eligible for return.</li>
          <li>Return window: 10 days from delivery.</li>
          <li>Customized or clearance items are not eligible for return.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>How to Initiate a Return</h3>
        <ul className={styles.steps}>
          <li>Go to My Orders.</li>
          <li>Select item → Return/Replace.</li>
          <li>Choose reason and schedule pickup.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Refund Methods</h3>
        <ul className={styles.steps}>
          <li><strong>Prepaid Orders:</strong> Refund to the same payment method.</li>
          <li><strong>Cash on Delivery:</strong> Refund via bank transfer or Sixpine Gift Card.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Refund Timelines</h3>
        <ul className={styles.steps}>
          <li><strong>Credit/Debit Card:</strong> 5–7 business days.</li>
          <li><strong>Net Banking/UPI:</strong> 3–5 business days.</li>
          <li><strong>Wallets:</strong> 24–48 hours.</li>
          <li><strong>Gift Card:</strong> Instant.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Replacements</h3>
        <ul className={styles.steps}>
          <li>Free replacement if product is damaged, defective, or missing parts.</li>
          <li>Replacement is subject to product availability.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>💳 Payments & Account</h2>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Accepted Payment Methods</h3>
        <ul className={styles.steps}>
          <li>Credit/Debit Cards (Visa, Mastercard, RuPay)</li>
          <li>Net Banking & UPI</li>
          <li>Digital Wallets (Paytm, PhonePe, Amazon Pay, etc.)</li>
          <li>Cash on Delivery (select pin codes only)</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Payment Issues</h3>
        <ul className={styles.steps}>
          <li><strong>Double charge</strong> → Refund auto-initiated within 5–7 days.</li>
          <li><strong>Failed transaction</strong> → Amount reversed by your bank within 3–5 days.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Coupons & Promotions</h3>
        <ul className={styles.steps}>
          <li>Enter coupon codes at checkout.</li>
          <li>Coupons cannot be combined with other promotional discounts unless specified.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Account Management</h3>
        <ul className={styles.steps}>
          <li>Update shipping/billing addresses anytime.</li>
          <li>Reset password using OTP/email verification.</li>
          <li>Multi-device login supported with OTP verification.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>🛋️ Product Information & Warranty</h2>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Product Dimensions & Assembly</h3>
        <ul className={styles.steps}>
          <li>Dimensions are listed on product pages.</li>
          <li>Some products require minor assembly (DIY or free installation depending on product type).</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Furniture Care Guide</h3>
        <ul className={styles.steps}>
          <li><strong>Fabric Sofas:</strong> Vacuum regularly, avoid harsh chemicals.</li>
          <li><strong>Leather Sofas:</strong> Wipe with damp cloth, condition leather every 6 months.</li>
          <li><strong>Wooden Furniture:</strong> Keep away from moisture, polish every 6–12 months.</li>
          <li><strong>Metal Frames:</strong> Clean with mild soap solution, avoid corrosive agents.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Warranty Policy</h3>
        <ul className={styles.steps}>
          <li><strong>Extended Warranty:</strong> Available on select sofa/furniture models.</li>
          <li>Warranty does not cover damages due to misuse, improper installation, or natural wear & tear.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Customized Products</h3>
        <ul className={styles.steps}>
          <li>Tailored to customer requirements.</li>
          <li>Not eligible for return or replacement (unless defective at delivery).</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>⚠️ Recalls & Product Safety</h2>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Current Product Recalls</h3>
        <p className={styles.intro}>
          If any product is recalled, details will be published here along with instructions for returns and refunds.
        </p>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Reporting a Safety Issue</h3>
        <p className={styles.intro}>If you notice:</p>
        <ul className={styles.steps}>
          <li>Loose frames,</li>
          <li>Instability, or</li>
          <li>Potential hazards,</li>
        </ul>
        <p className={styles.intro}>
                please contact us immediately at <a href="mailto:skwoodcity@gmail.com" style={{ color: '#0066cc', textDecoration: 'none' }}>skwoodcity@gmail.com</a> or <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>WhatsApp 📱</a> {displayPhoneNumber}.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>📱 Sixpine App Support</h2>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Download the App</h3>
        <ul className={styles.steps}>
          <li><strong>Android:</strong> {androidAppUrl ? <a href={androidAppUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>Google Play Store</a> : '[Google Play Store Link]'}</li>
          <li><strong>iOS:</strong> {iosAppUrl ? <a href={iosAppUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>App Store</a> : '[App Store Link]'}</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#333' }}>Benefits of the App</h3>
        <ul className={styles.steps}>
          <li>Track orders in real time.</li>
          <li>Get exclusive app-only offers.</li>
          <li>1-click customer support via <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>WhatsApp 📱</a>.</li>
          <li>Early access to new launches.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <div style={{ textAlign: 'center' }}>
          <footer className={styles.footer} style={{ textAlign: 'center', marginTop: '0' }}>
            <strong>Sixpine Promise</strong><br />
            At Sixpine, we value your trust. Every purchase is backed by our 100% Purchase Protection, ensuring genuine products, safe payments, reliable delivery, and easy returns.
          </footer>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1.1rem', fontWeight: '600', color: '#222' }}>
            Sixpine – Crafting Comfort. Delivering Trust.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>📞 Contact Sixpine Support</h2>
        <p className={styles.contact}>
          📧 <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a> <br />
          📞 <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp 📱: {displayPhoneNumber}</a> <br />
          🌐 <a href="https://www.sixpine.in" target="_blank" rel="noopener noreferrer">www.sixpine.in</a> <br />
          <br />
          <strong>Support Hours:</strong> Monday – Saturday, 10:00 AM – 6:00 PM (IST)
        </p>
      </section>
    </div>
  );
};

export default HelpCenter;
