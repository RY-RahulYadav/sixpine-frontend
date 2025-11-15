import styles from '../styles/sixpineApp.module.css';
import { useFooterSettings } from '../hooks/useFooterSettings';

const Careers = () => {
  const { whatsAppNumber, displayPhoneNumber } = useFooterSettings();
  return (
    <div className={styles.Appcontainer}>
      <h1 className={styles.heading}>Careers Page</h1>
      <p className={styles.intro}>Careers at Sixpine</p>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Careers at Sixpine</h2>
        <p className={styles.intro}>
                At Sixpine, we are not just building furniture—we are building futures. From sofas and couches to complete home furniture solutions, our mission is to craft comfort and create homes for thousands of families across India. Behind every product we design and manufacture stands a passionate team that believes in innovation, ownership, and customer delight.
              </p>
        <p className={styles.intro}>
          We're growing rapidly, and we're looking for talented individuals who want to be part of a company that's shaping the future of furniture. If you're driven by passion, creativity, and a desire to make an impact, Sixpine is the place for you.
              </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Why Choose a Career at Sixpine?</h2>
        <p className={styles.intro}>
          At Sixpine, we believe that great people build great products. Much like the world's most trusted global companies, our culture is defined by:
              </p>
              <ul className={styles.list}>
          <li>🚀 <strong>Ownership & Growth</strong> – We give our people the freedom to take ownership of their work. Your ideas, innovations, and decisions directly influence the customer experience and the company's growth.</li>
          <li>💡 <strong>Innovation in Action</strong> – From introducing modern sofa designs to exploring sustainable materials, we encourage experimentation and new thinking in every department.</li>
          <li>❤️ <strong>Customer Obsession</strong> – Our customers are at the center of everything we do. Whether you work in design, operations, or sales, your ultimate goal is to make homes more comfortable and beautiful.</li>
          <li>🌍 <strong>Diversity & Inclusion</strong> – We thrive on different perspectives and believe that diverse teams drive stronger results. Everyone is valued, respected, and given equal opportunity to succeed.</li>
          <li>📈 <strong>Continuous Learning</strong> – Your career at Sixpine is a journey of growth. We offer mentorship, hands-on training, and leadership opportunities to help you unlock your full potential.</li>
              </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Areas You Can Join</h2>
        <p className={styles.intro}>
               We offer exciting opportunities across multiple functions:
              </p>
        <ul className={styles.steps}>
          <li><strong>Design & Product Development</strong> – Bring creativity to life by designing furniture that combines style, comfort, and functionality.</li>
          <li><strong>Manufacturing & Operations</strong> – Work on the shop floor to ensure our products meet world-class quality standards with efficiency and precision.</li>
          <li><strong>Sales & Customer Experience</strong> – Be the face of Sixpine—help customers discover the perfect furniture for their homes and ensure their journey is smooth and delightful.</li>
          <li><strong>Marketing & Branding</strong> – Shape how the world sees Sixpine. From digital campaigns to storytelling, connect our products to millions of households.</li>
          <li><strong>Corporate & Support Roles</strong> – Contribute to Finance, HR, IT, and Logistics—building the backbone of our growing organization.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Life at Sixpine</h2>
        <p className={styles.intro}>
          At Sixpine, work is more than just a job—it's a community. Our culture is built on respect, collaboration, and recognition.
        </p>
        <ul className={styles.steps}>
          <li><strong>Team Spirit</strong> – We work together, celebrate wins, and support each other through challenges.</li>
          <li><strong>Work-Life Balance</strong> – We believe productivity comes with balance, so we foster an environment where work fits into life, not the other way around.</li>
          <li><strong>Recognition & Rewards</strong> – Performance is valued, and contributions are celebrated at every level.</li>
          <li><strong>Sustainability & Responsibility</strong> – We are committed to making furniture responsibly and reducing our impact on the environment.</li>
              </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Hiring Process</h2>
        <p className={styles.intro}>
          We like to keep our hiring process simple, transparent, and candidate-friendly.
              </p>
        <ul className={styles.steps}>
          <li><strong>1. Application</strong> – Submit your resume through our Careers page or email.</li>
          <li><strong>2. Screening</strong> – Our HR team reviews your profile and experience.</li>
          <li><strong>3. Interview Rounds</strong> – Depending on the role, you'll meet with hiring managers and team members.</li>
          <li><strong>4. Offer & Onboarding</strong> – Once selected, you'll be welcomed into the Sixpine family with a smooth onboarding experience.</li>
              </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Join Us</h2>
        <p className={styles.intro}>
          At Sixpine, you won't just build furniture—you'll build a career. Whether you are a fresh graduate looking for your first opportunity or an experienced professional seeking a new challenge, we have a place for you.
              </p>
        <p className={styles.intro}>
          <strong>👉 Explore our current openings and take the first step toward becoming part of our journey.</strong>
        </p>
        <footer className={styles.footer}>
          Sixpine Careers – Build More Than Furniture. Build Your Future.
        </footer>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Media Contact</h2>
        <p className={styles.contact}>
          Sixpine <br />
          📧 <a href="mailto:skwoodcity@gmail.com">skwoodcity@gmail.com</a> <br />
          📞 <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer">{displayPhoneNumber} (WhatsApp)</a> <br />
          🌐 <a href="https://www.sixpine.in" target="_blank" rel="noopener noreferrer">www.sixpine.in</a>
        </p>
      </section>
    </div>
  );
};

export default Careers;
