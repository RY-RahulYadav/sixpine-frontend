import styles from '../styles/supply.module.css';

const Supply = () => {
  return (
    <div className={styles.main}>
      <section className={styles.supplySection}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.col}>
              <h2 className={styles.heading}>Supply to Sixpine</h2>
              <p className={styles.text}>
                At Sixpine, we believe that strong partnerships build strong products. 
                As one of India’s fastest-growing sofa and furniture manufacturers, we are always looking to collaborate with trusted suppliers and partners who share our values of quality, reliability, and innovation.
              </p>
              <p className={styles.text}>
                By supplying to Sixpine, you become a part of our mission to craft comfortable, stylish, and sustainable furniture for homes in India and around the world.
              </p>

              <h3 className={styles.subheading}>Why Partner with Sixpine?</h3>
              <ul className={styles.list}>
                <li><b>Growing Brand, Expanding Reach</b> – Sixpine offers long-term business opportunities for suppliers across India and global markets.</li>
                <li><b>Transparent Partnerships</b> – Fair pricing, timely payments, and long-term relationships built on trust.</li>
                <li><b>Consistent Demand</b> – Our large-scale production ensures a steady flow of raw materials and components.</li>
                <li><b>Commitment to Quality</b> – Suppliers who meet high-quality standards are highly valued.</li>
                <li><b>Sustainability Focus</b> – Eco-friendly materials and responsible sourcing are encouraged.</li>
              </ul>

              <h3 className={styles.subheading}>What We Source</h3>
              <ul className={styles.list}>
                <li>Wood & Timber (sustainable and certified)</li>
                <li>Foam & Upholstery Materials</li>
                <li>Fabric & Leather (natural, synthetic, and eco-friendly options)</li>
                <li>Metal Components (frames, mechanisms, hardware)</li>
                <li>Finishes & Polishes</li>
                <li>Packaging Materials (eco-friendly preferred)</li>
                <li>Logistics & Transport Services</li>
              </ul>

              <h3 className={styles.subheading}>Who Can Apply?</h3>
              <ul className={styles.list}>
                <li>Manufacturers, wholesalers, and distributors of raw materials.</li>
                <li>Vendors offering bulk supplies for furniture manufacturing.</li>
                <li>Service providers (logistics, packaging, or related solutions).</li>
                <li>Export suppliers seeking long-term partnerships with an established brand.</li>
              </ul>

              <h3 className={styles.subheading}>How to Partner with Us</h3>
              <ol className={styles.list}>
                <li><b>Submit Your Details</b> – Share your company profile and product catalog.</li>
                <li><b>Quality Evaluation</b> – Our procurement team will review and test your materials.</li>
                <li><b>Trial Orders</b> – Selected suppliers may be invited for pilot supplies.</li>
                <li><b>Long-Term Agreement</b> – Successful partners will be onboarded as trusted Sixpine suppliers.</li>
              </ol>

              <h3 className={styles.subheading}>Become a Supplier</h3>
              <p className={styles.text}>
                If you are interested in supplying to Sixpine, we’d love to hear from you.
              </p>
              <p className={styles.contact}>
                📧 <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a><br />
                📞 <a href="https://wa.me/919897268972" target="_blank" rel="noopener noreferrer">+91 9897268972 (WhatsApp)</a><br />
                🌐 <a href="https://www.sixpine.in" target="_blank" rel="noopener noreferrer">www.sixpine.in</a>
              </p>
              <p className={styles.signature}>
                Sixpine – Together, Let’s Craft Comfort for the World.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Supply;
