import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ isExiting: boolean }>`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-in-out;
`;

const ToastContent = styled.div<{ type: 'success' | 'error' | 'warning' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  max-width: 480px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const IconWrapper = styled.div<{ type: 'success' | 'error' | 'warning' | 'info' }>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const MessageWrapper = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
`;

const Message = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  padding: 4px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
`;

interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'success',
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <XCircle size={24} />;
      case 'warning':
        return <AlertCircle size={24} />;
      case 'info':
        return <Info size={24} />;
      default:
        return <Info size={24} />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return '';
    }
  };

  return (
    <ToastContainer isExiting={isExiting}>
      <ToastContent type={type}>
        <IconWrapper type={type}>
          {getIcon()}
        </IconWrapper>
        <MessageWrapper>
          {(title || getDefaultTitle()) && (
            <Title>{title || getDefaultTitle()}</Title>
          )}
          <Message>{message}</Message>
        </MessageWrapper>
        <CloseButton onClick={handleClose}>
          <X size={18} />
        </CloseButton>
      </ToastContent>
    </ToastContainer>
  );
};

// Toast Manager for multiple toasts
interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

const ToastManagerContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
`;

interface ToastManagerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <ToastManagerContainer>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </ToastManagerContainer>
  );
};

// Hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title?: string,
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastData = {
      id,
      type,
      message,
      title,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string, title?: string, duration?: number) => {
    showToast('success', message, title, duration);
  };

  const error = (message: string, title?: string, duration?: number) => {
    showToast('error', message, title, duration);
  };

  const warning = (message: string, title?: string, duration?: number) => {
    showToast('warning', message, title, duration);
  };

  const info = (message: string, title?: string, duration?: number) => {
    showToast('info', message, title, duration);
  };

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
