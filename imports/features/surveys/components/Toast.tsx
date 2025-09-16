import React from 'react';

type AlertType = 'success' | 'error';

interface AlertData {
  type: AlertType;
  message: string;
}

interface ToastProps {
  alert: AlertData | null;
  onClose: () => void;
  variant?: 'brand' | 'emerald';
  zIndex?: number;
}

const Toast: React.FC<ToastProps> = ({ alert, onClose, variant = 'brand', zIndex = 1000 }) => {
  if (!alert) return null;

  const isSuccess = alert.type === 'success';

  const palette = variant === 'emerald'
    ? {
        successBg: '#10b981',
        errorBg: '#ef4444',
      }
    : {
        successBg: '#48bb78',
        errorBg: '#e53e3e',
      };

  const bg = isSuccess ? palette.successBg : palette.errorBg;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '12px 20px',
        borderRadius: 8,
        backgroundColor: bg,
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      {isSuccess ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      <span>{alert.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          marginLeft: 10,
          cursor: 'pointer',
          fontSize: 18,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;



