import React from 'react';
import styles from './productdetails.module.css';

interface OfferInfoModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const OfferInfoModal: React.FC<OfferInfoModalProps> = ({ show, onClose, title, description }) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.offerModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖
        </button>
        <h2 className={styles.offerModalTitle}>{title}</h2>
        <p className={styles.offerModalDescription}>{description}</p>
      </div>
    </div>
  );
};

export default OfferInfoModal;

