import React from 'react';
import styled from 'styled-components';

interface ProgressModalProps {
  isOpen: boolean;
  progress: number;
  currentStep: string;
  additionalInfo?: string;
}

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
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  color: #334155;
  text-align: center;
  font-size: 18px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressBarFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: #552a47;
  border-radius: 6px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #334155;
`;

const StepText = styled.div`
  text-align: center;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
`;

const AdditionalInfo = styled.div`
  text-align: center;
  color: #64748b;
  font-size: 12px;
  margin-top: 8px;
`;

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, progress, currentStep, additionalInfo }) => {
  if (!isOpen) return null;
  
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>Exporting PDF</ModalHeader>
        <ProgressBarContainer>
          <ProgressBarFill width={normalizedProgress} />
        </ProgressBarContainer>
        <ProgressText>{normalizedProgress}%</ProgressText>
        <StepText>Current step: {currentStep}</StepText>
        {additionalInfo && <AdditionalInfo>{additionalInfo}</AdditionalInfo>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProgressModal;
