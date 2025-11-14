import styles from "../styles/feedback.module.css";

const Feedback = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Enter Your Packaging Feedback</h2>
      <p className={styles.subtitle}>
        About packaging and packaging programs for Sixpine.
      </p>

      <div className={styles.content}>
        <h3 className={styles.sectionTitle}>
          Sixpine Smart &amp; Sustainable Packaging Program
        </h3>
        <p>
          At Sixpine, we are committed to providing the best packaging experience
          for our customers. We actively listen to customer feedback to discover
          new ways to reduce waste, enhance product packaging from our
          manufacturing partners, and improve the materials we use in our
          fulfillment process under our Smart &amp; Sustainable Packaging
          Program.
        </p>
        <p>
          We gather insights through customer service, returns, and reviews to
          deliver the best possible experience while minimizing excess packaging.
          One of the biggest challenges in e-commerce packaging is keeping it
          compact without compromising product safety. With this in mind,
          Sixpine works closely with manufacturers to redesign and optimize
          packaging, reduce waste across the supply chain, and ensure products
          reach customers safely and undamaged.
        </p>

        <h3 className={styles.sectionTitle}>
          Concerned About Damaged Delivery or Packaging Issues?
        </h3>
        <p>
          While our goal is to minimize packaging and still guarantee safe
          delivery, we acknowledge that issues can occasionally occur. If you
          receive a damaged order, please contact us and share your feedback. We
          use this information to evaluate both the manufacturer’s packaging and
          the packaging methods we apply in our fulfillment centers. Based on
          these insights, we continuously improve packaging, and in some cases,
          may temporarily stop selling an item until packaging improvements are
          made to ensure the best customer experience.
        </p>
      </div>

      {/* Feedback Box */}
      <div className={styles.feedbackBox}>
        <p className={styles.feedbackQuestion}>Was this information helpful?</p>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnYes}`}>Yes</button>
          <button className={`${styles.btn} ${styles.btnNo}`}>No</button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
