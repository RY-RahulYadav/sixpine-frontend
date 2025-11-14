import { Link } from 'react-router-dom';
import styles from "../styles/yourAccount.module.css";

// React Icons
import {
  FaBoxOpen,
  FaLock,
  FaUserShield,
  FaMapMarkerAlt,
  FaCreditCard,
  FaHeadset,
} from "react-icons/fa";

interface YourAccountProps {
  logoutButton?: React.ReactNode;
}

const YourAccount: React.FC<YourAccountProps> = ({ logoutButton }) => {
  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className={styles.heading} style={{ margin: 0 }}>Your Account</h2>
        {logoutButton}
      </div>

      {/* FIRST SECTION */}
      <div className={styles.grid}>
        <Link to="/orders" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
          <FaBoxOpen className={styles.icon} />
          <h3>Your Orders</h3>
          <p>Track, return, or buy things again</p>
        </Link>

        <Link to="/login-security" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
          <FaLock className={styles.icon} />
          <h3>Login & Security</h3>
          <p>Edit login, name, and mobile number</p>
        </Link>

        <Link to="/membership" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
          <FaUserShield className={styles.icon} />
          <h3>Membership</h3>
          <p>View benefits and payment settings</p>
        </Link>

        <Link to="/your-addresses" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
          <FaMapMarkerAlt className={styles.icon} />
          <h3>Your Addresses</h3>
          <p>Edit addresses for orders and gifts</p>
        </Link>

        <Link to="/manage-payment" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
          <FaCreditCard className={styles.icon} />
          <h3>Payment Options</h3>
          <p>Edit or add payment option methods</p>
        </Link>

        <Link to="/contact" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
          <FaHeadset className={styles.icon} />
          <h3>Contact Us</h3>
          <p>Contact our customer care via phone or chat</p>
        </Link>
      </div>

      {/* LINE */}
      <hr className={styles.divider} />

      {/* SECOND SECTION */}
      <div className={styles.grid}>
        <div className={styles.card}>
          {/* <FaEnvelope className={styles.icon} /> */}
          <h3>Email alerts, messages and ads</h3>
          <p>
            <Link to="/advertising-preferece" style={{ textDecoration: 'none', color: 'inherit' }}>Advertising preferences</Link>
            <br />
            <Link to="/communication-preferences" style={{ textDecoration: 'none', color: 'inherit' }}>Communication Preferences</Link>
            <br />
          </p>
        </div>

       

        {/* <div className={styles.card}>
          <h3>More ways to pay</h3>
          <p>
            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Coupons</a>
          </p>
        </div> */}
{/* 
        <div className={styles.card}>
          <h3>Subscriptions</h3>
          <p>
            <Link to="/email-subscribe" style={{ textDecoration: 'none', color: 'inherit' }}>Email</Link>
            <br />
            <Link to="/memberships-subscriptions" style={{ textDecoration: 'none', color: 'inherit' }}>Memberships & Subscription</Link>
          </p>
        </div> */}

        {/* <div className={styles.card}>
          <h3>Shopping Programs</h3>
          <p>
            <Link to="/subscribe-save" style={{ textDecoration: 'none', color: 'inherit' }}>Subscribe & Save</Link>
          </p>
        </div> */}

        <div className={styles.card}>
          {/* <FaDatabase className={styles.icon} /> */}
          <h3>Manage your data</h3>
          <p>
            <Link to="/data-request" style={{ textDecoration: 'none', color: 'inherit' }}>Request your data</Link>
            <br />
            <Link to="/close-your-sixpine-account" style={{ textDecoration: 'none', color: 'inherit' }}>Close your account</Link>
            <br />
            <Link to="/privacy-policy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy Notice</Link>
          </p>
        </div>
        <div className={styles.card}>
          {/* <FaShoppingCart className={styles.icon} /> */}
          <h3>Ordering and shopping preferences</h3>
          <p>
            <Link to="/packaging-feedback" style={{ textDecoration: 'none', color: 'inherit' }}>Leave packaging feedback</Link>
            <br />
            {/* <Link to="/shopping-list" style={{ textDecoration: 'none', color: 'inherit' }}>Shopping Lists</Link>
            <br /> */}
            <Link to="/shopping-preferences" style={{ textDecoration: 'none', color: 'inherit' }}>Shopping Preferences</Link>
            <br />
          </p>
        </div>
      </div>
    </div>
  );
};

export default YourAccount;
