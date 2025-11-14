import styles from "../styles/sixpineApp.module.css";
import { Smartphone, ShoppingBag, Truck, Shield, Heart } from "lucide-react";

export default function SixpineApp() {
  return (
    <div className={styles.Appcontainer}>
      <h1 className={styles.heading}>Download the Sixpine App 📲</h1>
      <p className={styles.intro}>
        Bring the world of Sixpine furniture right to your fingertips. With the Sixpine App, shopping for sofas, couches, 
        and home furniture has never been easier. Whether you’re furnishing your living room, bedroom, or workspace, our app 
        gives you instant access to exclusive collections, offers, and seamless ordering—all in one place.
      </p>

      {/* Why Download */}
      <section className={styles.section}>
        <h2 className={styles.subheading}>Why Download the Sixpine App?</h2>
        <ul className={styles.list}>
          <li><ShoppingBag className={styles.icon} /> <strong>Shop the Latest Collections</strong> – Browse sofas, couches, dining & bedroom furniture directly from your phone.</li>
          <li><Smartphone className={styles.icon} /> <strong>Exclusive App-Only Deals</strong> – Enjoy special discounts & early access to new launches.</li>
          <li><Truck className={styles.icon} /> <strong>Track Your Orders</strong> – Stay updated with live tracking & instant notifications.</li>
          <li><Shield className={styles.icon} /> <strong>100% Purchase Protection</strong> – Secure payments, genuine products & reliable delivery.</li>
          <li><Heart className={styles.icon} /> <strong>Wishlist & Easy Checkout</strong> – Save favorites, compare products & checkout faster.</li>
        </ul>
      </section>

      {/* How to Download */}
      <section className={styles.section}>
        <h2 className={styles.subheading}>How to Download</h2>
       <ul className={styles.steps}>
  <li>
    📱 <strong>Android Users</strong> – Download on{" "}
    <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">Google Play</a>
  </li>
  <li>
    🍎 <strong>iOS Users</strong> – Download on{" "}
    <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">App Store</a>
  </li>
  <li>
    <small>(Links will be activated once the app is live on stores)</small>
  </li>
</ul>

      </section>

      {/* Stay Connected */}
      <section className={styles.section}>
        <h2 className={styles.subheading}>Stay Connected with Sixpine</h2>
        <ul className={styles.steps}>
          <li>✔️ New arrivals</li>
          <li>✔️ Seasonal offers</li>
          <li>✔️ Exclusive furniture bundles</li>
          <li>✔️ Personalized recommendations</li>
        </ul>
         <p className={styles.contact}>
                  📧 <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a><br />
                  📞 <a href="https://wa.me/919897268972" target="_blank" rel="noopener noreferrer">+91 9897268972 (WhatsApp)</a><br />
                  🌐 <a href="https://www.sixpine.in" target="_blank" rel="noopener noreferrer">www.sixpine.in</a>
                </p>
      </section>

      <footer className={styles.footer}>
        Sixpine App – Crafting Comfort, Anytime. Anywhere.
      </footer>
    </div>
  );
}
