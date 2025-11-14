
import React from 'react';
import { Link } from "react-router-dom";
import styles from "../styles/footer.module.css";

export default function Footer() {
  const scrollToTop = () => {
    // Try window first
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      // ignore
    }

    // Try document.scrollingElement and document root/body
    const candidates: (Element | null | undefined)[] = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.getElementById('root'),
      document.querySelector('.app-wrapper'),
      document.querySelector('.page-content'),
    ];

    for (const el of candidates) {
      if (!el) continue;
      // Some entries may be Document or Element — coerce to any for runtime use
      const anyEl: any = el;
      try {
        if (typeof anyEl.scrollTo === 'function') {
          anyEl.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          anyEl.scrollTop = 0;
        }
      } catch (e) {
        try {
          anyEl.scrollTop = 0;
        } catch {}
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Activate on Enter or Space to behave like a button for keyboard users
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <footer className={styles.footer}>
      {/* Back to top */}
      <div
        className={styles.backToTop}
        onClick={scrollToTop}
        role="button"
        tabIndex={0}
        aria-label="Back to top"
        onKeyDown={handleKeyDown}
      >
        Back to top
      </div>

      {/* Footer Links */}
      <div className={styles.footerLinks}>
        <div>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
              <li>About Us</li>
                <li>Offers & Discounts</li>
          
            <li>Blog / Furniture Guides</li>
              <li>Contact Us</li>
      
          
          </ul>
        </div>

        <div>
          <h3>Get to Know Us</h3>
          <ul>
            <li><Link to="/about">About Sixpine</Link></li>
            <li><Link to="/career">Careers</Link></li>
            <li><Link to="/press-release">Press Releases</Link></li>
          </ul>
        </div>

        <div>
          <h3>Connect with Us</h3>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Instagram</a></li>
          </ul>
        </div>

        <div>
          <h3>Make Money with</h3>
          <ul>
            <li><Link to="/global-selling">Sixpine Global Selling</Link></li>
         
            <li><Link to="/supply">Supply to Sixpine</Link></li>
             <li><Link to="/advertise">Advertise Your Products</Link></li>

          </ul>
        </div>

        <div>
          <h3>Customer Support</h3>
          <ul>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/products-details">Products Details</Link></li>
            <li><Link to="/warranty-policy">Warranty Policy</Link></li>
            <li>Payment Options</li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h3>Customer Service</h3>
          <ul>
            <li><Link to="/faqs">FAQ</Link></li>
            <li>Shipping</li>
            <li>Returns Centre</li>
            <li>Support Link to WhatsApp</li>
          </ul>
        </div>

        <div>
          <h3>Let Us Help You</h3>
          <ul>
            
            <li><Link to="/your-account"> Your Account </Link></li>
            <li> <Link to ="/recalls_product">Recalls & Product Safety Alert </Link> </li>
            <li> <Link to ="/purchaseProtection">100% Purchase Protection </Link></li>
            <li> <Link to ="/your-app">Download  Sixpine App 📱</Link></li>
          
            <li><Link to ="/help">Help</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.logo}>Sixpine Logo....</div>
        <div className={styles.languageSelector}>
          <select>
  <option>English</option>
  <option>Hindi</option>
  <option>French</option>
  <option>Spanish</option>
</select>

          <span>🌍 India</span>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyRight}>
        © 2025 Sixpine. All Rights Reserved.
      </div>
    </footer>
  );
}
