import React from 'react';

interface PaymentModalProps {
  show: boolean;
  type: 'success' | 'failed';
  message?: string;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ show, type, message, onClose }) => {
  if (!show) return null;

  const isSuccess = type === 'success';

  return (
    <>
      <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center py-4">
              <div className="mb-3">
                {isSuccess ? (
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '64px' }}></i>
                ) : (
                  <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '64px' }}></i>
                )}
              </div>
              <h4 className={`mb-3 ${isSuccess ? 'text-success' : 'text-danger'}`}>
                {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
              </h4>
              <p className="text-muted mb-4">
                {message || (isSuccess 
                  ? 'Your payment has been processed successfully. Your order has been placed.' 
                  : 'Your payment could not be processed. Please try again.')}
              </p>
              <button 
                className={`btn ${isSuccess ? 'btn-success' : 'btn-danger'} btn-lg px-5`}
                onClick={onClose}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;

