import styles from "../styles/About.module.css"

const About = () => {
  return (
    <div className={styles.main}>
      <section className={styles.aboutSixpine}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.colLg10}>
              <h2 className={styles.aboutSixpineTitle}>About Us</h2>
              <p className={styles.aboutSixpineText}>
                At Sixpine, we believe that furniture is not just about utility—it's about creating spaces where families connect, friends gather, and memories are made. With years of expertise in designing and manufacturing sofas, couches, and a wide range of furniture, we have grown into a trusted name for quality, durability, and comfort.
              </p>

              <h3 className={styles.aboutSixpineSubtitle}>Our Story</h3>
              <p className={styles.aboutSixpineText}>
                What started as a vision to bring thoughtfully designed, affordable furniture into every home has now become a brand recognized for craftsmanship and reliability. From our first sofa model to our current diverse collection, our journey has always been driven by one belief: great furniture should enrich lives.
              </p>
              <p className={styles.aboutSixpineText}>
                Every piece we produce is more than wood, fabric, and foam—it's a blend of innovation, artistry, and passion. Our team of skilled artisans, engineers, and designers works tirelessly to ensure that every product reflects the perfect balance of comfort, style, and long-lasting quality.
              </p>

              <h3 className={styles.aboutSixpineSubtitle}>What We Do</h3>
              <ul className={styles.aboutSixpineList}>
                <li>Sofas & Couches – From contemporary to classic, built for comfort and style.</li>
                <li>Living Room Furniture – Center tables, recliners, accent chairs, and more.</li>
                <li>Bedroom Furniture – Beds, wardrobes, side tables designed for function and aesthetics.</li>
                <li>Dining & Storage Solutions – Practical designs that complement modern lifestyles.</li>
              </ul>
              <p className={styles.aboutSixpineText}>
                Whether you're setting up a cozy apartment, a family home, or a professional space, Sixpine offers furniture that adapts beautifully to your needs.
              </p>

              <h3 className={styles.aboutSixpineSubtitle}>Our Philosophy</h3>
              <ul className={styles.aboutSixpineList}>
                <li>Superior Quality – We use premium raw materials and follow rigorous quality checks.</li>
                <li>Value for Money – By manufacturing in-house, we cut out middlemen and pass the savings directly to our customers.</li>
                <li>Innovative Design – Blending timeless styles with modern needs.</li>
                <li>Sustainability – Incorporating eco-friendly practices and materials wherever possible.</li>
              </ul>

              <h3 className={styles.aboutSixpineSubtitle}>Our Promise to You</h3>
              <p className={styles.aboutSixpineText}>
                At Sixpine, your satisfaction is our highest priority. From the moment you browse our collection to the time your furniture is delivered, we aim to provide a seamless, reliable, and delightful experience. Our after-sales service ensures you're never alone—because for us, the relationship doesn't end with a purchase; it begins there.
              </p>
              <p className={styles.aboutSixpineText}>
                We are proud to have earned the trust of thousands of customers who welcome Sixpine furniture into their homes every day. As we continue to grow, our promise remains the same: to create furniture that combines comfort, quality, and beauty—so your spaces truly feel like home.
              </p>

              <p className={styles.aboutSixpineSignature}>Sixpine – Crafting Comfort. Creating Homes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;