import styles from '../styles/sixpineApp.module.css';

const About = () => {
  return (
    <div className={styles.Appcontainer}>
      <h1 className={styles.heading}>About Us</h1>
      <p className={styles.intro}>About Sixpine</p>

      <section className={styles.section}>
        <h2 className={styles.subheading}>About Sixpine</h2>
        <p className={styles.intro}>
                At Sixpine, we believe that furniture is not just about utility—it's about creating spaces where families connect, friends gather, and memories are made. With years of expertise in designing and manufacturing sofas, couches, and a wide range of furniture, we have grown into a trusted name for quality, durability, and comfort.
              </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Our Story</h2>
        <p className={styles.intro}>
                What started as a vision to bring thoughtfully designed, affordable furniture into every home has now become a brand recognized for craftsmanship and reliability. From our first sofa model to our current diverse collection, our journey has always been driven by one belief: great furniture should enrich lives.
              </p>
        <p className={styles.intro}>
                Every piece we produce is more than wood, fabric, and foam—it's a blend of innovation, artistry, and passion. Our team of skilled artisans, engineers, and designers works tirelessly to ensure that every product reflects the perfect balance of comfort, style, and long-lasting quality.
              </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>What We Do</h2>
        <p className={styles.intro}>
          We offer a comprehensive range of furniture solutions:
        </p>
        <ul className={styles.steps}>
          <li><strong>Sofas & Couches</strong> – From contemporary to classic, built for comfort and style.</li>
          <li><strong>Living Room Furniture</strong> – Center tables, recliners, accent chairs, and more.</li>
          <li><strong>Bedroom Furniture</strong> – Beds, wardrobes, side tables designed for function and aesthetics.</li>
          <li><strong>Dining & Storage Solutions</strong> – Practical designs that complement modern lifestyles.</li>
              </ul>
        <p className={styles.intro}>
                Whether you're setting up a cozy apartment, a family home, or a professional space, Sixpine offers furniture that adapts beautifully to your needs.
              </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Our Philosophy</h2>
        <ul className={styles.steps}>
          <li><strong>Superior Quality</strong> – We use premium raw materials and follow rigorous quality checks.</li>
          <li><strong>Value for Money</strong> – By manufacturing in-house, we cut out middlemen and pass the savings directly to our customers.</li>
          <li><strong>Innovative Design</strong> – Blending timeless styles with modern needs.</li>
          <li><strong>Sustainability</strong> – Incorporating eco-friendly practices and materials wherever possible.</li>
              </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Our Promise to You</h2>
        <p className={styles.intro}>
                At Sixpine, your satisfaction is our highest priority. From the moment you browse our collection to the time your furniture is delivered, we aim to provide a seamless, reliable, and delightful experience. Our after-sales service ensures you're never alone—because for us, the relationship doesn't end with a purchase; it begins there.
              </p>
        <p className={styles.intro}>
                We are proud to have earned the trust of thousands of customers who welcome Sixpine furniture into their homes every day. As we continue to grow, our promise remains the same: to create furniture that combines comfort, quality, and beauty—so your spaces truly feel like home.
              </p>
        <footer className={styles.footer}>
          Sixpine – Crafting Comfort. Creating Homes.
        </footer>
      </section>
    </div>
  );
};

export default About;