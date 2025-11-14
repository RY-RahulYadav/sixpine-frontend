import styles from './Help.module.css';

const ContactOptions: React.FC = () => {
  return (
    <section className={styles.contactSection}>
      <div className={styles.containerFluid}>
        <h2 className={styles.sectionTitle}>Get in Touch</h2>
        <p className={styles.sectionDescription}>
          Our customer service team is here to help. Choose your preferred method to reach us.
        </p>
        
        <div className={styles.contactCards}>
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className={styles.contactTitle}>Live Chat</h3>
            <p className={styles.contactDescription}>
              Connect with a support agent instantly through our live chat service.
            </p>
            <p className={styles.contactTimeInfo}>Available 24/7</p>
            <button className={styles.contactButton}>Start Chat</button>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3 className={styles.contactTitle}>Email Us</h3>
            <p className={styles.contactDescription}>
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <p className={styles.contactInfo}>support@sixpine.com</p>
            <button className={styles.contactButton}>Send Email</button>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3 className={styles.contactTitle}>Call Us</h3>
            <p className={styles.contactDescription}>
              Speak directly with our customer service representatives.
            </p>
            <p className={styles.contactInfo}>1-800-SIXPINE</p>
            <p className={styles.contactTimeInfo}>8 AM - 10 PM (EST), Mon-Sat</p>
            <button className={styles.contactButton}>Call Now</button>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 className={styles.contactTitle}>Help Center</h3>
            <p className={styles.contactDescription}>
              Browse our knowledge base for quick answers to common questions.
            </p>
            <button className={styles.contactButton}>Visit Help Center</button>
          </div>
        </div>
        
        <div className={styles.contactFormSection}>
          <h3 className={styles.formTitle}>Send Us a Message</h3>
          <form className={styles.contactForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Your Name</label>
                <input type="text" id="name" className={styles.formControl} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" className={styles.formControl} required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" className={styles.formControl} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Your Message</label>
              <textarea id="message" rows={5} className={styles.formControl} required></textarea>
            </div>
            <div className={styles.formSubmit}>
              <button type="submit" className={styles.submitButton}>Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactOptions;