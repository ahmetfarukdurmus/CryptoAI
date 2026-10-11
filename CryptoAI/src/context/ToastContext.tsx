import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Toast, ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState<string | undefined>();
  const [type, setType] = useState<ToastType>('success');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (msg: string, toastType: ToastType = 'success', toastTitle?: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setMessage(msg);
      setType(toastType);
      setTitle(toastTitle);
      setVisible(true);

      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, 3500);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={visible}
        message={message}
        title={title}
        type={type}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
