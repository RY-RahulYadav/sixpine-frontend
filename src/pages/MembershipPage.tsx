import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import '../styles/membership.css';

interface MembershipPlan {
  name: string;
  price: string;
  discount: string;
  freeAbove: string;
  priority: string;
  returnWindow: string;
  benefits: string;
}

const MembershipPage: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const plans: MembershipPlan[] = [
    {
      name: 'Basic',
      price: 'Free',
      discount: '×',
      freeAbove: 'Standard',
      priority: 'Standard (Email only)',
      returnWindow: '7 Days Return (Excluding Exchange & Select Items)',
      benefits: 'Access to all products',
    },
    {
      name: 'Silver',
      price: '₹299/month',
      discount: '5% OFF on all orders',
      freeAbove: 'Free above ₹999 (Standard)',
      priority: 'Priority (Email & Chat)',
      returnWindow: '10 Days Return + Free Return Pickup',
      benefits: 'Early access to new product, Birthday month special @',
    },
    {
      name: 'Gold',
      price: '₹699/month',
      discount: '10% OFF + Special Deals',
      freeAbove: 'Free on all orders (Standard)',
      priority: '24/7 Priority Support (Call, Email, Chat)',
      returnWindow: '15 Days Return + Free Return Pickup + Extended Warranty',
      benefits: 'Membership deals, Early access to special offers & free extra 6 months @',
    },
    {
      name: 'Platinum',
      price: '₹1499/month',
      discount: '15% OFF + Exclusive Coupons',
      freeAbove: 'Free Express Delivery (Same/Next Day in select cities)',
      priority: 'Dedicated Concierge Account',
      returnWindow: '30 Days Return + Free Return Pickup + Extended Warranty + Free extra product benefits @',
      benefits: 'VIP early access to limited edition products, Birthday & anniversary gifts, Exclusive events, Invite-only product launches @',
    },
  ];

  const faqs = [
    {
      question: 'Can I cancel my membership anytime?',
      answer: 'Yes, you can upgrade or downgrade your membership anytime from your account settings.',
    },
    {
      question: 'Will I be charged immediately if I cancel at any time without extra charges?',
      answer: 'Currently, only the Basic plan is free. Paid plans don\'t include a trial.',
    },
    {
      question: 'Do discounts apply to all products?',
      answer: 'Yes, discounts apply to all eligible products unless specifically excluded (e.g., limited edition or partner items).',
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Currently, only the Basic plan is free. Paid plans don\'t include a trial.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept Credit/Debit Cards, UPI, Net Banking, and Wallet payments.',
    },
    {
      question: 'Will I be charged automatically every month?',
      answer: 'Your subscription renews automatically unless you cancel it before the next billing date.',
    },
    {
      question: 'Do shipping benefits apply to all locations?',
      answer: 'Free express delivery benefits are available in select cities. For other locations, standard shipping applies.',
    },
    {
      question: 'What happens if I cancel mid-month to unused benefits?',
      answer: 'Unused benefits do not carry forward, so it\'s best to take advantage of them every month.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="mp-container">
        {/* Breadcrumb */}
        <div className="mp-breadcrumb">
          <span>Your account</span>
          <span className="mp-separator">›</span>
          <span className="mp-current">Membership</span>
        </div>

        {/* Page Title */}
        <h1 className="mp-title">Membership Plans</h1>

        {/* Membership Table */}
        <div className="mp-table-wrapper">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Price</th>
                <th>Discounts</th>
                <th>Shipping</th>
                <th>Support</th>
                <th>Return Policy</th>
                <th>Extra Benefits</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, index) => (
                <tr key={index} className={`mp-row ${plan.name.toLowerCase()}`}>
                  <td className="mp-plan-name">
                    <strong>{plan.name}</strong>
                  </td>
                  <td className="mp-price-cell">{plan.price}</td>
                  <td>{plan.discount}</td>
                  <td>{plan.freeAbove}</td>
                  <td>{plan.priority}</td>
                  <td>{plan.returnWindow}</td>
                  <td>{plan.benefits}</td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Options and Join Now Section */}
        <div className="mp-payment-join-wrapper">
          <div className="mp-payment-section">
            <h3 className="mp-payment-title">💳 Payment Options:</h3>
            <ul className="mp-payment-list">
              <li>Monthly, Quarterly or Annual Subscription</li>
              <li>Cancel anytime</li>
              <li>Platinum members enjoy the highest level of savings, fastest shipping and VIP treatment.</li>
            </ul>
          </div>
          
          <div className="mp-join-section">
            <button className="mp-join-btn">JOIN NOW</button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mp-faq-section">
          <h2 className="mp-faq-title">❓ Frequently Asked Questions</h2>
          <div className="mp-faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="mp-faq-item">
                <button
                  className="mp-faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="mp-faq-number">{index + 1}.</span>
                  <span className="mp-faq-text">{faq.question}</span>
                </button>
                {expandedFAQ === index && (
                  <div className="mp-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
         
        </div>
      </div>

      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default MembershipPage;
