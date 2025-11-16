import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/Toast/ToastContainer';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import type { ConfirmationOptions } from '../components/ConfirmationModal/ConfirmationModal';
import type { Toast, ToastType } from '../components/Toast/Toast';

interface NotificationContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showConfirmation: (options: Omit<ConfirmationOptions, 'onConfirm' | 'onCancel'>) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmationOptions, setConfirmationOptions] = useState<ConfirmationOptions | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration || 5000);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration || 4000);
  }, [showToast]);

  const showConfirmation = useCallback(
    (options: Omit<ConfirmationOptions, 'onConfirm' | 'onCancel'>): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmationOptions({
          ...options,
          onConfirm: () => {
            setConfirmationOptions(null);
            resolve(true);
          },
          onCancel: () => {
            setConfirmationOptions(null);
            resolve(false);
          },
        });
      });
    },
    []
  );

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirmation,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmationModal
        show={confirmationOptions !== null}
        options={confirmationOptions}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

