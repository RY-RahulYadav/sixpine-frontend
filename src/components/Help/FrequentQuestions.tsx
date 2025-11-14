import { useState } from 'react';
import styles from './Help.module.css';

const FrequentQuestions: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // FAQ data
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and navigating to the 'Your Orders' section. Click on the order you want to track, and you'll be able to see its current status. You can also use the order number and your email to track your order from the 'Track Order' page without logging in."
    },
    {
      question: "What is your return policy?",
      answer: "Our standard return policy allows you to return most items within 30 days of delivery for a full refund. Items must be in their original condition, including packaging. Some products like furniture may have different return windows. Please note that custom or personalized items cannot be returned unless they arrive damaged or defective."
    },
    {
      question: "How can I cancel an order?",
      answer: "To cancel an order, go to 'Your Orders' in your account, select the order you wish to cancel, and click on the 'Cancel Items' button. If your order has not yet been shipped, it can be canceled without any charges. If the order has already been shipped, you may need to wait for it to arrive and then initiate a return."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we offer international shipping to over 100 countries. Shipping rates and delivery times vary depending on the destination. You can check the estimated delivery time and shipping cost during checkout before finalizing your order. Please note that international orders may be subject to import duties and taxes, which are the customer's responsibility."
    },
    {
      question: "How do I contact customer service?",
      answer: "Our customer service team can be reached through multiple channels: Live Chat on our website (available 24/7), email at support@sixpine.com, or phone at 1-800-SIXPINE (1-800-749-7463) between 8 AM - 10 PM (EST). For the fastest response, we recommend using our Live Chat feature. You can also visit our 'Contact Us' page for more options."
    },
    {
      question: "Is my personal information secure?",
      answer: "We take data security very seriously. All personal and payment information is encrypted using industry-standard SSL technology. We do not share your personal information with third parties except as necessary to fulfill your orders. For complete details on how we protect and use your information, please refer to our Privacy Policy."
    },
    {
      question: "How can I change or update my account information?",
      answer: "To update your account information, sign in to your account and go to the 'Account Settings' page. From there, you can update your personal details, change your password, manage your address book, and update payment methods. If you need assistance, our customer service team is always available to help."
    }
  ];

  return (
    <section className={styles.frequentQuestionsSection}>
      <div className={styles.containerNarrow}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <div 
                className={styles.faqQuestion} 
                onClick={() => toggleQuestion(index)}
              >
                <span>{faq.question}</span>
                <span className={styles.faqToggle}>
                  {activeIndex === index ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  )}
                </span>
              </div>
              <div 
                className={`${styles.faqAnswer} ${activeIndex === index ? styles.faqAnswerActive : ''}`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.viewMoreContainer}>
          <button className={styles.viewMoreButton}>
            View All FAQs
          </button>
        </div>
      </div>
    </section>
  );
};

export default FrequentQuestions;