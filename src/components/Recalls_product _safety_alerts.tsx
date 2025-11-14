import styles from '../styles/Recalls_product _safety_alerts.module.css';

const Safety = () => {
  return (
    <div className={styles.main}>
      <section className={styles.safetySection}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.col}>
              <h2 className={styles.heading}>Recalls & Product Safety Alerts</h2>
              <p className={styles.text}>
                At Sixpine, your safety and trust come first. We are committed to manufacturing high-quality furniture that meets international safety standards. In the rare event that an issue is identified with any of our products, we take immediate action to notify customers, issue recalls, and provide solutions.
              </p>
              <p className={styles.text}>
                This page is designed to keep our customers updated with the latest product safety alerts, recall information, and instructions.
              </p>

              <h3 className={styles.subheading}>Our Commitment to Safety</h3>
              <ul className={styles.list}>
                <li><b>Strict Quality Checks</b> – Every Sixpine product undergoes rigorous testing before reaching your home.</li>
                <li><b>Compliance with Standards</b> – We follow national and international safety guidelines for furniture manufacturing.</li>
                <li><b>Proactive Monitoring</b> – If a safety concern arises, we take swift corrective measures to protect our customers.</li>
                <li><b>Transparency First</b> – Customers have the right to know about any safety issues and the steps we are taking to fix them.</li>
              </ul>

              <h3 className={styles.subheading}>Current Recalls & Safety Alerts</h3>
              <p className={styles.text}>🔔 [No active recalls at this time.]</p>
              <p className={styles.text}>
                (This section will be updated immediately if any recall or safety issue arises.)
              </p>

              <h3 className={styles.subheading}>What To Do If Your Product Is Recalled</h3>
              <ol className={styles.list}>
                <li><b>Stop Using the Product Immediately</b> – For your safety, discontinue use until further notice.</li>
                <li><b>Check Recall Notice</b> – Read the specific details about the product issue.</li>
                <li><b>Contact Us</b> – Reach out to our customer care team for support, replacements, or repairs.</li>
                <li><b>Replacement or Refund</b> – Depending on the issue, we will provide a repair, replacement, or full refund at no additional cost.</li>
              </ol>

              <h3 className={styles.subheading}>Report a Safety Concern</h3>
              <p className={styles.text}>
                If you notice an issue with your Sixpine product that could pose a safety risk, please inform us right away. Your feedback helps us maintain the highest safety standards.
              </p>
              <p className={styles.contact}>
                📧 <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a><br />
                📞 <a href="https://wa.me/919897268972" target="_blank" rel="noopener noreferrer">+91 9897268972 (WhatsApp)</a><br />
                🌐 <a href="https://www.sixpine.in" target="_blank" rel="noopener noreferrer">www.sixpine.in</a>
              </p>

              <h3 className={styles.subheading}>Past Recalls (If Any)</h3>
              <p className={styles.text}>
                We maintain records of any past recalls or safety alerts for transparency. (Currently, no past recalls to report.)
              </p>

              <h3 className={styles.subheading}>Sixpine Promise</h3>
              <p className={styles.signature}>
                At Sixpine, your comfort matters—but your safety matters even more. We are committed to continuous improvement, responsible manufacturing, and immediate corrective action whenever needed.<br />
                <b>Sixpine – Crafting Comfort. Ensuring Safety.</b>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Safety;
