import styles from './Help.module.css';

const SupportResources: React.FC = () => {
  // Resources data
  const resources = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      title: "Product Guides",
      description: "Detailed guides for assembly, installation, and use of our products.",
      link: "#"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      ),
      title: "Video Tutorials",
      description: "Step-by-step video instructions for product assembly and usage.",
      link: "#"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      title: "Community Forum",
      description: "Connect with other customers to share tips and get advice.",
      link: "#"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      title: "Buyer's Guides",
      description: "Comprehensive buying guides to help you make the right purchase.",
      link: "#"
    }
  ];

  return (
    <section className={styles.resourcesSection}>
      <div className={styles.containerFluid}>
        <h2 className={styles.sectionTitle}>Support Resources</h2>
        <p className={styles.sectionDescription}>
          Explore our collection of helpful resources to get the most out of your Sixpine products
        </p>
        
        <div className={styles.resourcesGrid}>
          {resources.map((resource, index) => (
            <div key={index} className={styles.resourceCard}>
              <div className={styles.resourceIcon}>{resource.icon}</div>
              <h3 className={styles.resourceTitle}>{resource.title}</h3>
              <p className={styles.resourceDescription}>{resource.description}</p>
              <a href={resource.link} className={styles.resourceLink}>
                Explore
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          ))}
        </div>
        
        <div className={styles.downloadSection}>
          <h3 className={styles.downloadTitle}>Download the Sixpine App</h3>
          <p className={styles.downloadDescription}>
            Get quick access to customer support, product manuals, and order tracking on your mobile device
          </p>
          <div className={styles.appButtons}>
            <a href="#" className={styles.appButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.94c1.5 0 6-6.33 6-11.94a6 6 0 0 0-12 0c0 5.61 4.5 11.94 6 11.94z"></path>
              </svg>
              <div className={styles.appButtonText}>
                <span className={styles.appButtonLabel}>Download on the</span>
                <span className={styles.appButtonStore}>App Store</span>
              </div>
            </a>
            <a href="#" className={styles.appButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <div className={styles.appButtonText}>
                <span className={styles.appButtonLabel}>GET IT ON</span>
                <span className={styles.appButtonStore}>Google Play</span>
              </div>
            </a>
          </div>
        </div>
        
        <div className={styles.feedbackSection}>
          <h3 className={styles.feedbackTitle}>Help Us Improve</h3>
          <p className={styles.feedbackDescription}>
            We're always looking to make our help center better. Share your feedback to help us improve.
          </p>
          <button className={styles.feedbackButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Share Feedback
          </button>
        </div>
      </div>
    </section>
  );
};

export default SupportResources;