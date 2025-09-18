import React from 'react';
import styled from 'styled-components';
import { FiAlertCircle, FiX } from 'react-icons/fi';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  color?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  message,
  title = 'Please Note',
  color = '#552A47'
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} color={color}>
        <ModalHeader color={color}>
          <HeaderContent>
            <FiAlertCircle size={20} />
            <ModalTitle>{title}</ModalTitle>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <MessageText dangerouslySetInnerHTML={{ __html: message }} />
        </ModalBody>
        <ModalFooter>
          <ConfirmButton onClick={onClose} color={color}>
            OK
          </ConfirmButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled components
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
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div<{ color: string }>`
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.2s ease-out;
  overflow: hidden;
  border-top: 4px solid ${props => props.color};

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div<{ color: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: ${props => `${props.color}10`};
  color: ${props => props.color};
  border-bottom: 1px solid ${props => `${props.color}20`};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const MessageText = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
`;

const ConfirmButton = styled.button<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => {
      const hex = props.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.8)`;
    }};
  }
`;

export default NotificationModal;
