import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Dialog = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 440px;
  width: 90%;
  overflow: hidden;
  animation: ${slideUp} 0.3s ease-out;
`;

const Header = styled.div<{ variant: 'danger' | 'warning' | 'info' | 'success' }>`
  padding: 24px 24px 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #f3f4f6;
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const IconWrapper = styled.div<{ variant: 'danger' | 'warning' | 'info' | 'success' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => {
    switch (props.variant) {
      case 'danger': return '#fee2e2';
      case 'warning': return '#fef3c7';
      case 'info': return '#dbeafe';
      case 'success': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'danger': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'success': return '#10b981';
      default: return '#6b7280';
    }
  }};
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
`;

const Message = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
`;

const Footer = styled.div`
  padding: 16px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f9fafb;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 80px;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: #dc2626;
          color: white;
          
          &:hover {
            background: #b91c1c;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'primary':
        return `
          background: #3b82f6;
          color: white;
          
          &:hover {
            background: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: white;
          color: #6b7280;
          border: 1px solid #e5e7eb;
          
          &:hover {
            background: #f9fafb;
            border-color: #d1d5db;
          }
        `;
    }
  }}
`;

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 size={24} />;
      case 'warning':
        return <AlertTriangle size={24} />;
      case 'info':
        return <Info size={24} />;
      case 'success':
        return <CheckCircle size={24} />;
      default:
        return <Info size={24} />;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <Header variant={variant}>
          <IconWrapper variant={variant}>
            {getIcon()}
          </IconWrapper>
          <Content>
            <Title>{title}</Title>
            <Message>{message}</Message>
          </Content>
        </Header>
        <Footer>
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </Footer>
      </Dialog>
    </Overlay>
  );
};

// Hook for using confirm dialogs
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions>({
    title: '',
    message: '',
  });
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef.current?.(false);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
};
