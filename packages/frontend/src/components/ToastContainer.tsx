import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';
import { ToastMessage } from './Toast';

/**
 * Container para exibir todas as notificações toast
 */
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast: ToastMessage) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.title}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;