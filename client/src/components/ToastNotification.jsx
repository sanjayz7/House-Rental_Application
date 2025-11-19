import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';

/**
 * Reusable Toast Notification Component
 * Usage: <ToastNotification show={show} message={message} variant={variant} onClose={onClose} />
 */
const ToastNotification = ({ 
  show, 
  message, 
  variant = 'success', 
  onClose, 
  duration = 5000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const positionStyles = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
  };

  const icons = {
    success: 'check-circle',
    danger: 'exclamation-triangle',
    warning: 'exclamation-circle',
    info: 'info-circle'
  };

  return (
    <Alert
      variant={variant}
      dismissible
      onClose={onClose}
      className="toast-notification"
      style={{
        position: 'fixed',
        zIndex: 9999,
        minWidth: '350px',
        maxWidth: '500px',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        animation: 'slideInRight 0.3s ease-out',
        ...positionStyles[position]
      }}
    >
      <div className="d-flex align-items-center">
        <i className={`fas fa-${icons[variant] || 'info-circle'} me-3`} style={{ fontSize: '1.5rem' }}></i>
        <div className="flex-grow-1">
          <strong className="d-block mb-1">{getAlertTitle(variant)}</strong>
          <span>{message}</span>
        </div>
      </div>
    </Alert>
  );
};

const getAlertTitle = (variant) => {
  const titles = {
    success: 'Success!',
    danger: 'Error!',
    warning: 'Warning!',
    info: 'Info'
  };
  return titles[variant] || 'Notification';
};

export default ToastNotification;

