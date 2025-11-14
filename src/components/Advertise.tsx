import styles from "../styles/Advertise.module.css";

export default function AdvertisePage() {
  return (
    <div className={styles.advertisePage}>
      {/* Header Section */}
      <section className={styles.section}>
        <h1 className={styles.title}>Advertise Your Products with Sixpine</h1>
        <p>
          At Sixpine, we don’t just create furniture—we also create opportunities. 
          With our growing brand presence in India and expanding global reach, we invite 
          manufacturers, sellers, and brands to showcase and advertise their products through our platform.
        </p>
        <p>
          Whether you’re launching a new collection, looking for brand visibility, 
          or targeting the right customers, advertising with Sixpine helps your products 
          reach thousands of homes every month.
        </p>
      </section>

      {/* Why Advertise */}
      <section className={styles.section}>
        <h2>Why Advertise with Sixpine?</h2>
        <ul className={styles.list}>
          <li>🎯 <strong>Targeted Audience</strong> – Reach customers actively shopping for home products.</li>
          <li>🤝 <strong>Brand Association</strong> – Partner with Sixpine’s trusted name.</li>
          <li>📢 <strong>Multi-Channel Promotion</strong> – Website, campaigns, catalogs, social media.</li>
          <li>🪧 <strong>Flexible Options</strong> – Sponsored listings, banners, co-branded campaigns.</li>
          <li>💰 <strong>Cost-Effective Marketing</strong> – Packages tailored to your needs.</li>
        </ul>
      </section>

      {/* Advertising Opportunities */}
      <section className={styles.section}>
        <h2>Advertising Opportunities</h2>
        <ol className={styles.list}>
          <li><strong>Featured Product Listings</strong> – Top of search/category results.</li>
          <li><strong>Homepage & Banner Ads</strong> – Highlighted on homepage/product pages.</li>
          <li><strong>Catalog & Brochure Promotions</strong> – Seasonal catalogs & brochures.</li>
          <li><strong>Social Media Collaborations</strong> – Campaigns across Instagram, FB, YouTube.</li>
          <li><strong>Bulk & B2B Promotions</strong> – Target wholesale & B2B buyers.</li>
        </ol>
      </section>

      {/* Who Can Advertise */}
      <section className={styles.section}>
        <h2>Who Can Advertise?</h2>
        <ul className={styles.list}>
          <li>Furniture & décor brands</li>
          <li>Home lifestyle & accessories sellers</li>
          <li>Upholstery, fabric, and material suppliers</li>
          <li>Home improvement & furnishing companies</li>
          <li>B2B bulk suppliers and distributors</li>
        </ul>
      </section>

      {/* Steps */}
      <section className={styles.section}>
        <h2>How to Get Started</h2>
        <ol className={styles.steps}>
          <li>📩 Contact Our Advertising Team – Share details & goals.</li>
          <li>📦 Choose Your Package – Based on budget & needs.</li>
          <li>🚀 Launch Campaigns – We help design & promote.</li>
          <li>📊 Track Results – Transparent reports on reach & clicks.</li>
        </ol>
      </section>

      {/* Footer */}
      <section className={styles.section}>
        <h2>Partner with Sixpine Today</h2>
        <p>
          Expand your reach, boost sales, and build brand recognition by advertising with Sixpine.
        </p>
        <p>📧 <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a></p>
        <p>📞 <a href="https://wa.me/919897268972" target="_blank" rel="noopener noreferrer">
          +91 9897268972 (WhatsApp)
        </a></p>
        <p>🌐 <a href="https://www.sixpine.in" target="_blank" rel="noopener noreferrer">
          www.sixpine.in
        </a></p>
      </section>
    </div>
  );
}
