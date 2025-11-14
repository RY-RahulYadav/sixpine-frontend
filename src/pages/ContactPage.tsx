import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/contact.css';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';

const ContactPage: React.FC = () => {
  const handleStartChatting = () => {
    // You can integrate with a chat service like Intercom, Tawk.to, or Zendesk
    alert('Opening chat...');
    // Example: window.open('https://wa.me/919189726897', '_blank');
  };

  const handleCallMe = () => {
    // Open phone dialer
    window.location.href = 'tel:+919189726897';
  };

  const handleWhatsApp = () => {
    // Open WhatsApp with pre-filled message
    const message = encodeURIComponent('Hi, I would like to inquire about my order.');
    window.open(`https://wa.me/919189726897?text=${message}`, '_blank');
  };

  return (
    <>
      <Navbar />
       <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
      <div className="page-content">
        <div className="contact-page-container">
          <div className="contact-content">
            <h1 className="contact-title">Want to chat now or get a call from us?</h1>
            
            <div className="contact-options">
              {/* Chat Option */}
              <div className="contact-card">
                <div className="contact-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.2L4 17.2V4H20V16Z" fill="#333"/>
                  </svg>
                </div>
                <div className="contact-card-content">
                  <h3 className="contact-card-title">Chat right now</h3>
                  <p className="contact-card-description">
                    Our messaging assistant can quickly solve many issues or direct you to the right person or place.
                  </p>
                  <p className="contact-card-note">Instant chat and always available.</p>
                  <button className="contact-button" onClick={handleStartChatting}>
                    Start chatting
                  </button>
                </div>
              </div>

              {/* Call Option */}
              <div className="contact-card">
                <div className="contact-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="#333"/>
                  </svg>
                </div>
                <div className="contact-card-content">
                  <h3 className="contact-card-title">Have us call you</h3>
                  <p className="contact-card-description">
                    We'll first get a few details about your issue and then someone will call you right away.
                  </p>
                  <button className="contact-button contact-button-outline" onClick={handleCallMe}>
                    Call me
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp Section */}
            <div className="whatsapp-section">
              <p className="whatsapp-text">
                or directly WhatsApp us at{' '}
                <button className="whatsapp-link" onClick={handleWhatsApp}>
                  +919189726897
                </button>{' '}
                with order details
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
