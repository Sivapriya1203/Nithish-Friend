import React, { useEffect } from 'react';
import { AlertIcon, CheckCircleIcon, CloseIcon } from './Icons.jsx';

export default function ToastNotification({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) {
    return null;
  }

  const isError = toast.type === 'error';

  return (
    <div className="toast-region" aria-live="polite" role="status">
      <div className={`toast-card ${isError ? 'is-error' : ''}`}>
        <div className="toast-content">
          {isError ? <AlertIcon size={18} /> : <CheckCircleIcon size={18} />}
          <span>{toast.message}</span>
        </div>
        <button
          type="button"
          className="toast-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  );
}
