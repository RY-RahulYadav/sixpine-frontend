import styles from "./homepagetext.module.css";

export default function HomepageText() {
  return (
    <div className={styles.Textcontainer}>
      {/* Hero Section */}
      <section className={styles.section}>
        <h1 className={styles.heading}>
          <strong>Buy Furniture Online at Sixpine – India’s One-Stop Furniture & Home Décor Destination</strong>
        </h1>
        <p>
          A home is where comfort lives, and furniture brings that comfort to life. Whether you’re
          setting up a new space or giving your interiors a refreshing makeover, Sixpine offers
          everything you need under one roof. From elegant wooden furniture to modern décor, our
          collection is designed to complement every style of living.
        </p>
        <p>
          At Sixpine, we provide a vast assortment of ready-made and customizable furniture online
          in India. Since 2024, we’ve been serving customers with high-quality pieces like sofas,
          dining tables, wardrobes, beds, and much more—crafted from premium materials. Alongside
          furniture, our exclusive home décor range features wall art, planters, photo frames,
          tableware, glassware, and kitchen organizers. Whether you prefer minimalistic, classic,
          or bold designs, Sixpine makes it easy to find furniture that blends seamlessly with your
          lifestyle.
        </p>
      </section>

      <hr />

      {/* Furniture Materials */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Discover Furniture Materials at Sixpine</strong>
        </h2>
        <p>
          Every home is unique, and so are the materials that bring furniture to life. Sixpine
          offers furniture crafted in a variety of premium woods and materials, each with its own
          charm:
        </p>
        <ul>
          <li><b>Sheesham Wood</b> – Rich-toned, dense, and durable, perfect for bedrooms and living rooms.</li>
          <li><b>Mango Wood</b> – Strong yet light in color, with striking natural grain patterns.</li>
          <li><b>Teak Wood</b> – Highly durable and moisture-resistant, ideal for both indoor and outdoor spaces.</li>
          <li><b>Engineered Wood</b> – Affordable, sleek, and versatile for budget-friendly home makeovers.</li>
          <li><b>Ash Wood</b> – Light-colored with a smooth finish, blending natural warmth with modern design.</li>
        </ul>
      </section>

      <hr />

      {/* Shop by Room */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Shop by Room – Furniture for Every Corner of Your Home</strong>
        </h2>
        <p>
          At Sixpine, we curate furniture that doesn’t just serve functionality but also transforms
          your space into a reflection of your style.
        </p>
        <ul>
          <li><b>Living Room</b> – Sofas, recliners, center tables, lounge chairs, rocking chairs, TV units, and sofa-cum-beds.</li>
          <li><b>Bedroom</b> – Beds with storage, wardrobes, dressing tables, bunk beds, mattresses, and cushions.</li>
          <li><b>Dining Room</b> – Dining tables, chairs, crockery units, folding dining sets, and sideboards.</li>
          <li><b>Study Room</b> – Compact study tables, ergonomic chairs, foldable desks, and bookshelves.</li>
          <li><b>Kids’ Room</b> – Playful and vibrant beds, wardrobes, and study tables.</li>
          <li><b>Office Furniture</b> – Ergonomic office chairs, workstations, executive tables, and office sofas.</li>
          <li><b>Outdoor Spaces</b> – Swing chairs, garden tables, planters, and pet houses.</li>
          <li><b>Entryway & Foyer</b> – Shoe racks, benches, and console tables to make the best first impression.</li>
          <li><b>Restaurant Furniture</b> – Hotel chairs, bar stools, trolleys, and tables for commercial needs.</li>
        </ul>
      </section>

      <hr />

      {/* Explore More */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Explore More at Sixpine – Beyond Furniture</strong>
        </h2>
        <p>Our vision is to make every home complete, which is why Sixpine also offers:</p>
        <ul>
          <li><b>Home Décor</b> – Wall mirrors, lamps, photo frames, carpets, and indoor plants to elevate your interiors.</li>
          <li><b>Home Furnishings</b> – Cushions, curtains, and premium fabrics for a cozy vibe.</li>
          <li><b>Lamps & Lights</b> – Chandeliers, table lamps, pendant lights, and designer indoor lighting.</li>
          <li><b>Outdoor Furniture</b> – Durable and stylish options for balconies, patios, and gardens.</li>
          <li><b>Mattresses</b> – High-quality latex, orthopedic, and foldable mattresses for restful sleep.</li>
          <li><b>Modular Kitchen</b> – Functional, space-saving modular designs for modern Indian homes.</li>
        </ul>
      </section>

      <hr />

      {/* Upholstery Options */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Upholstery Options at Sixpine</strong>
        </h2>
        <p>Choosing the right fabric adds character and comfort to your furniture. At Sixpine, you’ll find:</p>
        <ul>
          <li><b>Cotton</b> – Durable, eco-friendly, and easy to maintain.</li>
          <li><b>Velvet</b> – Luxurious, plush, and perfect for elegant living rooms.</li>
          <li><b>Leatherette</b> – Stylish, practical, and affordable alternative to leather.</li>
        </ul>
      </section>

      <hr />

      {/* Things to Consider */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Things to Consider Before Buying Furniture Online</strong>
        </h2>
        <p>Buying furniture online can be seamless if you keep a few things in mind:</p>
        <ul>
          <li><b>Material</b> – Understand durability and finish.</li>
          <li><b>Design</b> – Pick what matches your décor style.</li>
          <li><b>Color</b> – Ensure it complements your interiors.</li>
          <li><b>Size</b> – Measure your space and check dimensions for easy fit.</li>
          <li><b>Price</b> – Balance between affordability and quality.</li>
          <li><b>Reviews</b> – Learn from customer experiences.</li>
          <li><b>Warranty</b> – Check coverage details.</li>
          <li><b>Payment Security</b> – Shop from a trusted platform like Sixpine.</li>
        </ul>
      </section>

      <hr />

      {/* Furniture Care Tips */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Furniture Care Tips</strong>
        </h2>
        <ul>
          <li><b>Dust regularly</b> – with a soft cloth or vacuum brush.</li>
          <li><b>Clean monthly</b> – using mild water-vinegar spray and wipe dry.</li>
          <li><b>Use felt pads</b> – under furniture legs to prevent scratches.</li>
          <li><b>Professional inspection</b> – Call for long-term maintenance.</li>
        </ul>
      </section>

      <hr />

      {/* Why Choose Sixpine */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Why Choose Sixpine Furniture?</strong>
        </h2>
        <ul>
          <li><b>Durability & Functionality</b> – Built for years of use.</li>
          <li><b>Comfort & Style</b> – Designed to match every lifestyle.</li>
          <li><b>Low Maintenance</b> – Easy to care for, saving long-term costs.</li>
          <li><b>Cost-Effective Investment</b> – Premium designs at fair prices.</li>
        </ul>
      </section>

      <hr />

      {/* Experience Stores */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Sixpine Experience Stores – PAN India Presence</strong>
        </h2>
        <p>
          Sixpine has over 100+ experience stores across India, with many more opening soon. Visit
          us in person to explore the diversity of our collections, or shop online for convenience.
          Wherever you are, Sixpine is always nearby when you search for the best furniture shop
          near me.
        </p>
      </section>

      <hr />

      {/* Final Section */}
      <section className={styles.section}>
        <h2 className={styles.subHeading}>
          <strong>Shop Affordable, Premium Furniture at Sixpine</strong>
        </h2>
        <p>
          Buying furniture is no longer a compromise between price and quality. At Sixpine, we
          believe in offering both—premium designs at affordable prices. From living room to
          bedroom, from office to outdoors, every product is thoughtfully designed to bring joy and
          comfort to your home.
        </p>
        <p className={styles.highlight}>
          ✨ Discover Sixpine today – where quality meets affordability, and every home finds its perfect fit.
        </p>
      </section>
    </div>
  );
}
