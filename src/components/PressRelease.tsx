import styles from '../styles/PressRelease.module.css';

const PressRelease = () => {
  return (
    <div className={styles.main}>
      <section className={styles.pressSection}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.col}>
              <h2 className={styles.heading}>Press Release</h2>
              <p className={styles.subtext}>For Immediate Release</p>

              <h3 className={styles.title}>
                Sixpine Announces Expansion in Furniture Manufacturing, Launches Premium Sofa & Home Living Collection
              </h3>

              <p className={styles.text}>
                [Saharanpur, UP] – [12-03-2025] – Sixpine, India’s fast-growing manufacturer of sofas, couches, and complete home furniture solutions, today announced the launch of its new premium sofa collection and the expansion of its state-of-the-art manufacturing facility. This milestone reflects the company’s mission to deliver world-class furniture with unmatched quality, comfort, and affordability to households across India.
              </p>

              <p className={styles.text}>
                With the furniture industry witnessing unprecedented growth fueled by rising urban lifestyles and increased demand for functional-yet-stylish home products, Sixpine is positioning itself as a customer-first, innovation-driven brand.
              </p>

              <blockquote className={styles.quote}>
                “At Sixpine, our philosophy is simple: homes deserve furniture that is built to last and designed to inspire,” said Founder & CEO of Sixpine. “Our new sofa collection and manufacturing expansion highlight our dedication to blending craftsmanship with innovation, while keeping affordability at the core. We want every customer to feel at home with Sixpine.”
              </blockquote>

              <h3 className={styles.subheading}>New Launch Highlights</h3>
              <ul className={styles.list}>
                <li><b>Contemporary Sofas & Couches</b> – Modern designs tailored for Indian homes, balancing elegance with everyday comfort.</li>
                <li><b>Eco-Conscious Manufacturing</b> – Use of responsibly sourced wood, high-quality fabrics, and eco-friendly production methods.</li>
                <li><b>Affordable Luxury</b> – Direct-from-manufacturer model eliminates middlemen, giving customers the best value without compromising quality.</li>
                <li><b>Customer-Centric Approach</b> – Rigorous testing, easy delivery, and strong after-sales support ensure trust and long-term satisfaction.</li>
              </ul>

              <h3 className={styles.subheading}>Industry Impact</h3>
              <p className={styles.text}>
                The Indian furniture market is projected to reach USD $1 billion by [2027], driven by rapid urbanization, online retail growth, and demand for modular, space-saving solutions. Sixpine is tapping into this growth by expanding its manufacturing capabilities, embracing digital platforms, and ensuring nationwide reach.
              </p>

              <h3 className={styles.subheading}>Commitment to Quality & Sustainability</h3>
              <p className={styles.text}>
                Sixpine’s products undergo stringent quality checks at every stage—from design and raw material sourcing to final assembly. The company is also investing in sustainable practices, including the use of recyclable fabrics, energy-efficient processes, and minimal-waste manufacturing.
              </p>

              <blockquote className={styles.quote}>
                “We’re not just manufacturing furniture; we’re creating experiences,” added Head of Operations at Sixpine. “Every sofa, every couch, every table is crafted with the belief that it will be part of a family’s everyday life for years to come.”
              </blockquote>

              <h3 className={styles.subheading}>About Sixpine</h3>
              <p className={styles.text}>
                Founded in 2024, Sixpine is a leading furniture manufacturing brand specializing in sofas, couches, and complete home living solutions. Guided by the vision of “Crafting Comfort, Creating Homes,” Sixpine is redefining how India buys and experiences furniture. With in-house design, direct-to-customer pricing, and a commitment to sustainability, Sixpine has earned the trust of thousands of customers across the country.
              </p>

              <h3 className={styles.subheading}>Media Contact</h3>
              <p className={styles.contact}>
                Sixpine <br />
                📧 <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a> <br />
                📞 <a href="https://wa.me/919897268972" target="_blank" rel="noopener noreferrer">+91 9897268972 (WhatsApp)</a> <br />
                🌐 <a href="https://www.sixpine.in" target="_blank" rel="noopener noreferrer">www.sixpine.in</a>
              </p>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PressRelease;
