import { useState } from 'react';
import styles from '../styles/FAQs.module.css';

const faqCategories = [
  { name: 'Orders', icon: '📦', count: 5 },
  { name: 'Shipping', icon: '🚚', count: 4 },
  { name: 'Payments', icon: '💳', count: 3 },
];

const faqItems = [
  {
    id: 1,
    category: 'Orders',
    q: 'How do I place an order?',
    a: 'Browse products, add items to your cart, and proceed to checkout. During checkout you can review your order, enter shipping details and complete payment using the available payment options. You will receive a confirmation email once your order is placed successfully.'
  },
  {
    id: 2,
    category: 'Shipping',
    q: 'What are the shipping options and delivery times?',
    a: 'Shipping options vary by seller and product. At checkout you will see available shipping methods along with estimated delivery windows. Expedited shipping is available for many items. Standard delivery typically takes 5-7 business days, while express delivery is 2-3 business days.'
  },
  {
    id: 3,
    category: 'Returns',
    q: 'How do I return or exchange an item?',
    a: 'To return or exchange an item, go to Your Orders, select the order, and choose the return or exchange option. Follow the instructions and include any requested photos or details. If you need help, contact customer support. Returns are accepted within 30 days of delivery for most items.'
  },
  {
    id: 4,
    category: 'Orders',
    q: 'How can I track my order?',
    a: 'After your order ships you will receive a confirmation with tracking information. You can also check order status and tracking from Your Orders in your account. Real-time tracking updates are available 24/7 through our website and mobile app.'
  },
  {
    id: 5,
    category: 'Orders',
    q: 'How do I update my account information?',
    a: 'Go to Your Account to update your name, address, phone number, and payment methods. Keep your information current to avoid delivery issues. You can also manage your email preferences and communication settings from the account page.'
  },
  {
    id: 6,
    category: 'Payments',
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), UPI payments, net banking, and digital wallets. All transactions are secured with industry-standard encryption to protect your financial information.'
  },
  {
    id: 7,
    category: 'Shipping',
    q: 'Do you offer free shipping?',
    a: 'Yes! We offer free shipping on orders above ₹999. For orders below this amount, standard shipping charges apply based on your location and the weight of your items. Premium members enjoy free shipping on all orders.'
  },
  {
    id: 8,
    category: 'Returns',
    q: 'What is your return policy?',
    a: 'We offer a 30-day return policy on most items. Products must be in original condition with tags attached. Some items like personalized furniture or clearance items may not be eligible for returns. Please check the product page for specific return eligibility.'
  },
  {
    id: 9,
    category: 'Payments',
    q: 'Is it safe to use my credit card on your website?',
    a: 'Absolutely! We use SSL encryption and PCI DSS compliant payment gateways to ensure your payment information is completely secure. We never store your complete card details on our servers.'
  },
  {
    id: 10,
    category: 'Shipping',
    q: 'Can I change my delivery address after placing an order?',
    a: 'Yes, you can change your delivery address before the order is shipped. Please contact our customer support immediately with your order number and the new address. Once the order is dispatched, address changes may not be possible.'
  }
];

const FAQs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.faqPageContainer}>
      <div className={styles.faqWrapper}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h1 className={styles.mainTitle}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Find answers to common questions about our furniture, ordering process, shipping, and more.
          </p>
          <span className={styles.lastUpdated}>Last updated: October 13, 2025</span>
        </div>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Categories Section */}
        <div className={styles.categoriesSection}>
          <h2 className={styles.categoriesTitle}>Browse by Category</h2>
          <div className={styles.categoriesGrid}>
            <div 
              className={styles.categoryCard}
              onClick={() => setSelectedCategory('All')}
              style={selectedCategory === 'All' ? {borderColor: '#C4A484', backgroundColor: '#f0e5d8'} : {}}
            >
              <div className={styles.categoryIcon}>🏠</div>
              <div className={styles.categoryName}>All Topics</div>
              <div className={styles.categoryCount}>{faqItems.length} questions</div>
            </div>
            {faqCategories.map((category, idx) => (
              <div 
                key={idx} 
                className={styles.categoryCard}
                onClick={() => setSelectedCategory(category.name)}
                style={selectedCategory === category.name ? {borderColor: '#C4A484', backgroundColor: '#f0e5d8'} : {}}
              >
                <div className={styles.categoryIcon}>{category.icon}</div>
                <div className={styles.categoryName}>{category.name}</div>
                <div className={styles.categoryCount}>{category.count} questions</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Grid */}
        <div className={styles.faqGrid}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => (
              <details key={item.id} className={styles.faqCard}>
                <summary className={styles.faqQuestion}>
                  <span className={styles.questionText}>{item.q}</span>
                  <div className={styles.questionIcon}>+</div>
                </summary>
                <div className={styles.faqAnswer}>
                  <p className={styles.answerText}>{item.a}</p>
                </div>
              </details>
            ))
          ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#7f8c8d', fontSize: '1.1rem'}}>
              No questions found matching your search. Try different keywords.
            </div>
          )}
        </div>

        {/* Contact Section */}
        {/* <div className={styles.contactSection}>
          <h2 className={styles.contactTitle}>Still Have Questions?</h2>
          <p className={styles.contactText}>
            Our customer support team is here to help you. Reach out to us via email or phone, and we'll get back to you as soon as possible.
          </p>
          <div className={styles.contactButtons}>
            <a href="mailto:skwoodcity@gmail.com" className={styles.contactBtn}>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Email Us
            </a>
            <a href="tel:+919897268972" className={styles.contactBtn}>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92V19.92C22 20.52 21.52 21.01 20.92 21.01C9.39 21.01 2.99 14.61 2.99 3.08C2.99 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.05 8.71 5.94C8.87 6.31 8.76 6.76 8.44 7.04L6.9 8.22C8.07 10.86 10.13 12.92 12.77 14.09L13.95 12.55C14.23 12.23 14.68 12.12 15.05 12.28C15.94 12.64 16.91 12.83 17.91 12.83C18.51 12.83 18.99 13.31 18.99 13.91V16.91H22V16.92Z" 
                  stroke="currentColor" strokeWidth="2"/>
              </svg>
              Call Us
            </a>
            <a href="https://wa.me/9628209929" target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default FAQs;
