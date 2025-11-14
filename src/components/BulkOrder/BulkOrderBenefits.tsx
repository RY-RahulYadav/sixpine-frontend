import { useState, useEffect } from 'react';
import styles from './BulkOrderBenefits.module.css';
import { bulkOrderPageAPI } from '../../services/api';

interface Benefit {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface Testimonial {
  id: number;
  quote: string;
  authorName: string;
  authorPosition: string;
  authorInitials: string;
}

const defaultBenefits: Benefit[] = [
    {
      id: 1,
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Volume Discounts",
      description: "Special pricing with progressive discounts based on order quantity."
    },
    {
      id: 2,
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Quality Guarantee",
      description: "All bulk orders undergo enhanced quality assurance inspections."
    },
    {
      id: 3,
      title: "Flexible Scheduling",
      description: "Plan deliveries according to your project timeline and needs."
    }
  ];

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    quote: "The bulk order process was seamless, and the dedicated support team was exceptional in handling our corporate office setup requirements.",
    authorName: "Ankit Bhatia",
    authorPosition: "Facilities Manager, TechCorp India",
    authorInitials: "AB"
  },
  {
    id: 2,
    quote: "We furnished our entire hotel chain with Sixpine furniture. The quality, delivery timeline, and installation service exceeded our expectations.",
    authorName: "Priya Patel",
    authorPosition: "Procurement Director, Luxe Hotels",
    authorInitials: "PP"
  }
];

const BulkOrderBenefits = () => {
  const [benefits, setBenefits] = useState<Benefit[]>(defaultBenefits);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [benefitsTitle, setBenefitsTitle] = useState<string>('Why Choose Our Bulk Order Service');
  const [benefitsDescription, setBenefitsDescription] = useState<string>('Experience these exclusive advantages when you place bulk orders with Sixpine');
  const [testimonialsTitle, setTestimonialsTitle] = useState<string>('What Our Corporate Clients Say');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefitsContent = async () => {
      try {
        const response = await bulkOrderPageAPI.getBulkOrderPageContent('benefits');
        if (response.data && response.data.content) {
          setBenefits(response.data.content.benefits || defaultBenefits);
          setTestimonials(response.data.content.testimonials || defaultTestimonials);
          setBenefitsTitle(response.data.content.title || 'Why Choose Our Bulk Order Service');
          setBenefitsDescription(response.data.content.description || 'Experience these exclusive advantages when you place bulk orders with Sixpine');
          setTestimonialsTitle(response.data.content.testimonialsTitle || 'What Our Corporate Clients Say');
        }
      } catch (error) {
        console.error('Error fetching benefits content:', error);
        // Keep default content if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchBenefitsContent();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className={styles.benefitsSection}>
      <h2 className={styles.sectionTitle}>{benefitsTitle}</h2>
      <p className={styles.sectionDescription}>
        {benefitsDescription}
      </p>
      
      <div className={styles.benefitsGrid}>
        {benefits.map((benefit, index) => (
          <div key={index} className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.benefitTitle}>{benefit.title}</h3>
            <p className={styles.benefitDescription}>{benefit.description}</p>
          </div>
        ))}
      </div>
      
      <div className={styles.testimonialsSection}>
        <h3 className={styles.testimonialsTitle}>{testimonialsTitle}</h3>
        
        <div className={styles.testimonialCards}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                <p>"{testimonial.quote}"</p>
              </div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>{testimonial.authorInitials}</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{testimonial.authorName}</div>
                  <div className={styles.authorPosition}>{testimonial.authorPosition}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BulkOrderBenefits;