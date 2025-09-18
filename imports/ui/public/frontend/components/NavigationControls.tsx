import React from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isLastQuestion?: boolean;
  previousSectionName?: string;
  nextSectionName?: string;
  color?: string;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onBack,
  onNext,
  backLabel = 'Previous',
  nextLabel = 'Next Question',
  isNextDisabled = false,
  isLastQuestion = false,
  previousSectionName,
  nextSectionName,
  color = '#552A47'
}) => {
  return (
    <ControlsContainer>
      <BackButton onClick={onBack}>
        <FiArrowLeft size={18} style={{ marginRight: '8px' }} />
        {previousSectionName ? `${previousSectionName}` : backLabel}
      </BackButton>
      
      <NextButton 
        onClick={onNext} 
        disabled={isNextDisabled}
        color={color}
      >
        {isLastQuestion ? 'Submit' : (nextSectionName ? `${nextSectionName}` : nextLabel)}
        <FiArrowRight size={18} style={{ marginLeft: '8px' }} />
      </NextButton>
    </ControlsContainer>
  );
};

// Styled components
const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  width: 100%;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
`;

const NextButton = styled.button<{ color: string; disabled: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${props => props.disabled ? '#d1d5db' : props.color};
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? '#d1d5db' : '#3d1e32'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
`;

export default NavigationControls;
