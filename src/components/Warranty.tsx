import styles from '../styles/Privacy.module.css'

const Warranty = () => {
  return (
    <div className={styles.main}>
      <section className={styles.globalSection}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.col}>
              <h2 className={styles.heading}>Sixpine Warranty Policy</h2>

              <p className={styles.text}><b>Disclaimer:</b> In the event of any discrepancy or conflict, the English version will prevail over the translation.</p>

              <p className={styles.text}><b>Last updated:</b> April 25, 2025.</p>

              <p className={styles.text}>
                We stand behind the quality of the products sold on Sixpine. This Warranty Policy explains warranties offered by sellers and manufacturers as well as limited commitments provided by Sixpine for products sold directly by us.
              </p>

              <h3 className={styles.subheading}>Scope of Warranty</h3>
              <p className={styles.text}>
                Warranty coverage varies by product and seller. Unless otherwise specified, warranties cover defects in materials and workmanship under normal use for the period indicated on the product page.
              </p>

              <h3 className={styles.subheading}>Warranty Duration</h3>
              <p className={styles.text}>
                The warranty period is specified on each product page. Typical warranty durations range from 90 days to 24 months depending on the product category and manufacturer.
              </p>

              <h3 className={styles.subheading}>How to Make a Warranty Claim</h3>
              <p className={styles.text}>
                To start a warranty claim:
              </p>
              <ul className={styles.list}>
                <li>Locate your order number and product information.</li>
                <li>Contact customer support with a clear description and photos/videos of the defect.</li>
                <li>Provide proof of purchase when requested.</li>
                <li>Follow the return/repair instructions provided by the support team. We may authorize replacement, repair, or refund as appropriate.</li>
              </ul>

              <h3 className={styles.subheading}>Exclusions & Limitations</h3>
              <p className={styles.text}>
                Warranties do not cover:
              </p>
              <ul className={styles.list}>
                <li>Damage from misuse, abuse, accident, or improper handling.</li>
                <li>Normal wear and tear or cosmetic damage that does not affect functionality.</li>
                <li>Damage from unauthorized repair, modification, or use with incompatible accessories.</li>
              </ul>

              <h3 className={styles.subheading}>Seller vs Manufacturer Warranties</h3>
              <p className={styles.text}>
                Some items are sold by third-party sellers and carry warranties provided by those sellers or the manufacturer. If you purchase from a third-party seller, warranty claims will generally be handled by that seller or the manufacturer per their terms.
              </p>

              <h3 className={styles.subheading}>Consumer Remedies</h3>
              <p className={styles.text}>
                Depending on the situation and applicable law, remedies may include repair, replacement, refund, or other remedies as determined by our support team and the seller/manufacturer.
              </p>

              <h3 className={styles.subheading}>Grievance Officer</h3>
              <p className={styles.text}>
                <b>Sixpine</b><br />
                Email: <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a><br />
                Phone: <a href="tel:+919897268972">+919897268972</a><br />
                Address: Sixpine, Saharanpur-247001, India
              </p>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Warranty;
