import { useState } from 'react';
import styles from './BulkOrderFAQ.module.css';

const BulkOrderFAQ = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  
  // FAQ data
  const faqs = [
    {
      question: "What is the minimum order quantity for bulk orders?",
      answer: "The minimum order quantity varies by product category. Generally, our bulk orders start at 10 units for most furniture items. For specific products or custom orders, please contact our sales team for detailed information."
    },
    {
      question: "Do you offer discounts on bulk orders?",
      answer: "Yes, we offer tiered discounts based on order quantity. The discount percentage increases with larger orders. Additionally, we provide special corporate pricing for businesses with ongoing needs. Our sales team will provide a detailed quote based on your specific requirements."
    },
    {
      question: "What are the payment terms for bulk orders?",
      answer: "For bulk orders, we typically require a 50% advance payment to confirm the order, with the remaining balance due before shipment. For corporate clients with approved accounts, we offer Net 30 payment terms. We accept bank transfers, corporate credit cards, and digital payment methods."
    },
    {
      question: "How long does it take to fulfill bulk orders?",
      answer: "Fulfillment times depend on the product type, quantity, and customization requirements. Standard bulk orders typically ship within 2-4 weeks. For large corporate orders or custom furniture, the lead time may be 6-8 weeks. We'll provide a detailed timeline in your quote."
    },
    {
      question: "Do you offer installation services for bulk furniture orders?",
      answer: "Yes, we provide professional installation services for bulk orders. Our installation team can handle office setups, hotel furnishings, and other commercial projects. Installation fees are calculated based on the scope and complexity of the project, and will be included in your quote if requested."
    },
    {
      question: "Can I get samples before placing a bulk order?",
      answer: "Yes, we offer a sample program for corporate clients. You can request samples of materials, finishes, or even a full product unit for evaluation before placing a bulk order. There may be a nominal fee for samples, which is credited back when you place your bulk order."
    }
  ];
  
  return (
    <div className={styles.faqSection}>
      <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
      
      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`${styles.faqItem} ${openFAQ === index ? styles.active : ''}`}
          >
            <div 
              className={styles.faqQuestion}
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className={styles.faqToggle}>
                {openFAQ === index ? '−' : '+'}
              </span>
            </div>
            
            {openFAQ === index && (
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* <div className={styles.contactBox}>
        <h3>Still have questions?</h3>
        <p>Contact our bulk orders team directly.</p>
        <div className={styles.contactDetails}>
          <div className={styles.contactItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92V19.92C22 20.52 21.52 21.01 20.92 21.01C9.39 21.01 2.99 14.61 2.99 3.08C2.99 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.05 8.71 5.94C8.87 6.31 8.76 6.76 8.44 7.04L6.9 8.22C8.07 10.86 10.13 12.92 12.77 14.09L13.95 12.55C14.23 12.23 14.68 12.12 15.05 12.28C15.94 12.64 16.91 12.83 17.91 12.83C18.51 12.83 18.99 13.31 18.99 13.91V16.91H22V16.92Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>+91 123 456 7890</span>
          </div>
          
          <div className={styles.contactItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>bulk@sixpine.com</span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default BulkOrderFAQ;