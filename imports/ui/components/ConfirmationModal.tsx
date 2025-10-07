import React from 'react';
import styled from 'styled-components';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'info' | 'danger' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  icon,
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader type={type}>
          {icon && <IconContainer type={type}>{icon}</IconContainer>}
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <MessageText>{message}</MessageText>
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={onCancel}>{cancelText}</CancelButton>
          <ConfirmButton type={type} onClick={onConfirm}>{confirmText}</ConfirmButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div<{ type: string }>`
  padding: 20px;
  display: flex;
  align-items: center;
  background-color: ${props => {
    switch (props.type) {
      case 'warning': return '#fff4e5';
      case 'danger': return '#ffebee';
      case 'success': return '#e6f7ed';
      case 'info': return '#e3f2fd';
      default: return '#f8f9fa';
    }
  }};
`;

const IconContainer = styled.div<{ type: string }>`
  font-size: 24px;
  margin-right: 16px;
  color: ${props => {
    switch (props.type) {
      case 'warning': return '#ff9800';
      case 'danger': return '#d32f2f';
      case 'success': return '#0a8043';
      case 'info': return '#0288d1';
      default: return '#6c757d';
    }
  }};
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
`;

const ModalBody = styled.div`
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
`;

const MessageText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #495057;
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const CancelButton = styled(Button)`
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const ConfirmButton = styled(Button)<{ type: string }>`
  background-color: ${props => {
    switch (props.type) {
      case 'warning': return '#ff9800';
      case 'danger': return '#dc3545';
      case 'success': return '#28a745';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  }};
  color: white;
  
  &:hover {
    filter: brightness(90%);
  }
`;

export default ConfirmationModal;
