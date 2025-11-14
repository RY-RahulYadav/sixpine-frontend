import React, { useState } from 'react';
import styles from './PaymentPreferenceModal.module.css';

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
  };
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

interface PaymentPreferenceModalProps {
  preference: PaymentPreference | null;
  savedCards: SavedCard[];
  addresses: Address[];
  onClose: () => void;
  onSave: (data: {
    preferred_method: string;
    preferred_card_token_id?: string;
  }) => void;
}

const PaymentPreferenceModal: React.FC<PaymentPreferenceModalProps> = ({
  preference,
  savedCards,
  addresses: _addresses,
  onClose,
  onSave
}) => {
  const [preferredMethod, setPreferredMethod] = useState(preference?.preferred_method || 'card');
  // Auto-select first card if payment method is card and no card is selected
  const selectedCardTokenId = preferredMethod === 'card' && savedCards.length > 0 
    ? (preference?.preferred_card_token_id || savedCards[0].token_id)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      preferred_method: preferredMethod,
    };

    if (preferredMethod === 'card' && selectedCardTokenId) {
      data.preferred_card_token_id = selectedCardTokenId;
    } else if (preferredMethod !== 'card') {
      // Clear card token if method is not card
      data.preferred_card_token_id = null;
    }

    onSave(data);
  };

  // const formatCardName = (card: SavedCard) => {
  //   const issuer = card.card.issuer || '';
  //   const network = card.card.network || '';
  //   const last4 = card.card.last4 || '';
  //   
  //   if (issuer && network) {
  //     return `${issuer} ${network} ending in ${last4}`;
  //   } else if (network) {
  //     return `${network} ending in ${last4}`;
  //   } else {
  //     return `Card ending in ${last4}`;
  //   }
  // };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Set Payment Preference</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Payment Method *</label>
            <select
              className={styles.select}
              value={preferredMethod}
              onChange={(e) => {
                setPreferredMethod(e.target.value);
              }}
              required
            >
              <option value="card">Credit/Debit Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="upi">UPI</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {preferredMethod === 'card' && savedCards.length === 0 && (
            <div className={styles.formGroup}>
              <p className={styles.helpText} style={{ color: '#b12704', marginTop: '4px' }}>
                No saved cards available.
              </p>
              <p className={styles.helpText}>
                Cards will be saved when you make a payment with "Save Card" option during checkout.
              </p>
            </div>
          )}

          <div className={styles.formGroup} style={{ marginTop: '24px', marginBottom: '20px' }}>
            <p className={styles.helpText} style={{ fontSize: '13px', lineHeight: '1.5', color: '#565959' }}>
              To update your delivery address or name, please visit your{' '}
              <a href="/your-addresses" className={styles.infoLink}>
                Addresses page
              </a>.
            </p>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Preference
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPreferenceModal;

