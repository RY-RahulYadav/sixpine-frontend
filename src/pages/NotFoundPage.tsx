import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import styles from '../styles/NotFoundPage.module.css';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
        <div className={styles.notFoundContainer}>
          <div className={styles.notFoundContent}>
            <div className={styles.errorCode}>404</div>
            <h1 className={styles.title}>Page Not Found</h1>
            <p className={styles.message}>
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <p className={styles.subMessage}>
              Don't worry, you can find everything you need on our homepage.
            </p>
            <div className={styles.actions}>
              <Link to="/" className={styles.homeButton}>
                <i className="bi bi-house-door me-2"></i>
                Go to Homepage
              </Link>
              <Link to="/products" className={styles.productsButton}>
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Browse Products
              </Link>
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

export default NotFoundPage;

