import React from 'react';
import styles from './ManagePaymentMethods.module.css';

interface PaymentPreference {
  id?: number;
  preferred_method?: string;
  preferred_card_token_id?: string;
}

interface SavedCard {
  token_id: string;
  method: string;
  card: {
    last4: string;
    network: string;
    type: string;
    issuer: string;
    name: string;
    expiry_month: string;
    expiry_year: string;
  };
  created_at?: number;
}

interface Address {
  id: number;
  type: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface ManagePaymentMethodsProps {
  preference: PaymentPreference | null;
  savedCards?: SavedCard[];
  addresses?: Address[];
  onUpdateClick: () => void;
  onDeleteCard: (tokenId: string) => void;
}

const ManagePaymentMethods: React.FC<ManagePaymentMethodsProps> = ({
  preference,
  savedCards = [],
  addresses = [],
  onUpdateClick,
  onDeleteCard
}) => {
  const getPreferredAddress = () => {
    // Get default address from addresses API (same as Your Addresses page)
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.is_default);
      if (defaultAddr) {
        return `${defaultAddr.city}, ${defaultAddr.state}`;
      }
      // If no default, use first address
      if (addresses.length > 0) {
        return `${addresses[0].city}, ${addresses[0].state}`;
      }
    }
    return 'Not set';
  };

  const getDefaultAddressName = () => {
    // Get default address from addresses API (same as Your Addresses page)
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.is_default);
      if (defaultAddr) {
        return defaultAddr.full_name;
      }
      // If no default, use first address
      if (addresses.length > 0) {
        return addresses[0].full_name;
      }
    }
    return null;
  };

  const getPreferredMethod = () => {
    if (!preference?.preferred_method) {
      return 'Not set';
    }
    const methodMap: { [key: string]: string } = {
      'card': 'Credit/Debit Card',
      'netbanking': 'Net Banking',
      'upi': 'UPI',
      'cod': 'Cash on Delivery'
    };
    return methodMap[preference.preferred_method] || preference.preferred_method;
  };

  const getPreferredCard = () => {
    if (preference?.preferred_method === 'card' && preference.preferred_card_token_id && savedCards) {
      return savedCards.find(c => c.token_id === preference.preferred_card_token_id);
    }
    return null;
  };

  const formatCardName = (card: SavedCard) => {
    const issuer = card.card.issuer || '';
    const network = card.card.network || '';
    const type = card.card.type || 'Card';
    const last4 = card.card.last4 || '';
    
    if (issuer && network) {
      return `${issuer} ${network} ${type} ending in ${last4}`;
    } else if (network) {
      return `${network} ${type} ending in ${last4}`;
    } else {
      return `Card ending in ${last4}`;
    }
  };

  const preferredCard = getPreferredCard();
  const defaultAddressName = getDefaultAddressName();

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>Your Account &rsaquo; Manage Payment Methods</div>
      <h1 className={styles.heading}>Your Payment Options</h1>
      <div className={styles.description}>
        An overview of your payment methods, settings and subscriptions with Sixpine.
      </div>

      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>i</span>
        <span>
          <b>Default Purchase Preference</b><br />
          To improve your Sixpine purchasing experiences,{' '}
          <button onClick={onUpdateClick} className={styles.blueLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            set a preferred payment method
          </button>.
        </span>
      </div>

      <div className={styles.preferenceCard}>
        <div className={styles.preferenceHeader}>
          <span className={styles.preferenceTitle}>Your default purchase preference</span>
          <button onClick={onUpdateClick} className={styles.updateLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Update preference
          </button>
        </div>
        
        <div className={styles.addressLabel}>Address</div>
        <div className={styles.nicknameInline}>
          <span>{getPreferredAddress()}</span>
        </div>
      
        <div className={styles.preferenceRow}>
          <div className={styles.colNickname}>
            <div className={styles.colLabel}>Name</div>
            <div className={styles.nicknameInline}>
              {defaultAddressName ? (
                <span>{defaultAddressName}</span>
              ) : (
                <span style={{ color: '#565959' }}>Not set</span>
              )}
            </div>
          </div>

          <div className={styles.colPayment}>
            <div className={styles.paymentLabel}>PAYMENT METHOD</div>
            {preference?.preferred_method ? (
              <div style={{ fontSize: '15px', color: '#222', fontWeight: 500, marginTop: '2px' }}>
                {getPreferredMethod()}
                {preferredCard && (
                  <div style={{ fontSize: '13px', color: '#565959', marginTop: '4px' }}>
                    {formatCardName(preferredCard)}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={styles.paymentWarning}>
                  <span className={styles.redDot} /> Payment method required.
                </div>
                <button onClick={onUpdateClick} className={styles.setPrefLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Set a preference
                </button>
              </>
            )}
          </div>

          <div className={styles.colNote}>
            <div className={styles.preferenceNote}>
              Use this page to set your preferred payment method, shipping address, and shipping method.
            </div>
          </div>
        </div>
      </div>

      <div className={styles.savedCardsSection}>
        <div className={styles.savedCardsTitle}>Your saved credit and debit cards</div>
        {(!savedCards || savedCards.length === 0) ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#565959', border: '1px solid #d5d9d9', borderRadius: '8px' }}>
            <p>No saved cards yet.</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              Cards will be saved when you make a payment and choose to save your card during checkout.
            </p>
          </div>
        ) : (
          (savedCards || []).map(card => (
            <div key={card.token_id} className={styles.cardRow}>
              <div style={{ 
                width: '38px', 
                height: '24px', 
                background: card.card.network?.toLowerCase().includes('visa') ? '#1a1f71' : 
                           card.card.network?.toLowerCase().includes('master') ? '#eb001b' : '#ddd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {card.card.network?.substring(0, 4) || 'CARD'}
              </div>
              <div className={styles.cardDetails}>
                <div className={styles.cardName}>{formatCardName(card)}</div>
                <div className={styles.cardNickname}>
                  Expires: {card.card.expiry_month}/{card.card.expiry_year}
                  {preference?.preferred_card_token_id === card.token_id && (
                    <span style={{ marginLeft: '8px', color: '#007185', fontWeight: 500 }}>
                      (Preferred)
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.cardActions}>
                <button 
                  className={styles.removeBtn}
                  onClick={() => onDeleteCard(card.token_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagePaymentMethods;
