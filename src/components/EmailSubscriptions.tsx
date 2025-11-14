
import { useState } from 'react';
import styles from '../styles/EmailSubscriptions.module.css';

interface Subscription {
  name: string;
  frequency: string;
}

const EmailSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('current'); 
  const [searchQuery, setSearchQuery] = useState('');

 
  const currentSubscriptions: Subscription[] = [];

  const allSubscriptions: Subscription[] = [
    { name: 'Weekly Deals Newsletter', frequency: 'Weekly' },
  
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Searching for:', searchQuery);
    
  };

  const handleSubscribe = (subscriptionName: string) => {
    console.log(`Subscribing to: ${subscriptionName}`);
   
    alert(`You've subscribed to the ${subscriptionName}!`);
  };

  return (
    <div className={styles.emailSubscriptionsContainer}>
      <div className={styles.breadcrumbs}>
        <a href="/your-account">Your Account</a> <span className={styles.separator}>›</span> <span className={styles.currentPage}>Your Email Subscriptions</span>
      </div>

      <div className={styles.header}>
        <h1>Your Email Subscriptions</h1>
        <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search all subscriptions"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button type="submit">Go</button>
        </form>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'current' ? styles.active : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Subscriptions
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'browseAll' ? styles.active : ''}`}
          onClick={() => setActiveTab('browseAll')}
        >
          Browse All Subscriptions
        </button>
        <div className={styles.tableHeaders}>
          <span className={styles.frequencyHeader}>Frequency</span>
          <span className={styles.subscriptionHeader}>Subscription</span>
        </div>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'current' ? (
          <div>
            {currentSubscriptions.length === 0 ? (
              <div className={styles.noSubscriptions}>No current subscriptions.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Frequency</th>
                    <th>Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubscriptions.map((sub, index) => (
                    <tr key={index}>
                      <td>{sub.frequency}</td>
                      <td>{sub.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className={styles.browseAllWrap}>
              <a href="#" className={styles.browseAllLink} onClick={(e) => { e.preventDefault(); setActiveTab('browseAll'); }}>
                Browse all E-mail subscriptions
              </a>
            </div>
          </div>
        ) : (
          <div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Frequency</th>
                  <th>Subscription</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {allSubscriptions.map((sub, index) => (
                  <tr key={index}>
                    <td>{sub.frequency}</td>
                    <td>{sub.name}</td>
                    <td>
                      <button
                        className={styles.subscribeButton}
                        onClick={() => handleSubscribe(sub.name)}
                      >
                        Subscribe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSubscriptions;