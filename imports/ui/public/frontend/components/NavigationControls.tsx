import React, { useCallback } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  isLastQuestion?: boolean;
  previousSectionName?: string;
  nextSectionName?: string;
  color?: string; // Kept for backward compatibility
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onBack,
  onNext,
  backLabel = 'Previous',
  nextLabel = 'Next Question',
  isNextDisabled = false,
  isBackDisabled = false,
  isLastQuestion = false,
  previousSectionName,
  nextSectionName,
  color = '#552A47' // Kept for backward compatibility
}) => {
  // Handle next button click with scroll to top for section navigation
  const handleNextClick = useCallback(() => {
    // Call the original onNext function
    onNext();
    
    // If this is a section navigation button, scroll to top after a delay
    if (nextLabel?.includes('Next Section')) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 300);
    }
  }, [onNext, nextLabel]);
  return (
    <ControlsContainer>
      <BackButton 
        onClick={onBack} 
        disabled={isBackDisabled}
      >
        <FiArrowLeft size={18} style={{ marginRight: '8px' }} />
        {previousSectionName ? `${previousSectionName}` : backLabel}
      </BackButton>
      
      <NextButton 
        onClick={handleNextClick} 
        disabled={isNextDisabled}
        className={nextLabel?.includes('Next Section') ? 'nextbuttonSectionFrontend' : ''}
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
  margin: 2rem auto 0;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  width: 100%;
  max-width: 800px;
`;

const BackButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: ${props => props.disabled ? '#d1d5db' : '#6b7280'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : '#f3f4f6'};
    color: ${props => props.disabled ? '#d1d5db' : '#374151'};
  }
`;

const NextButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${props => props.disabled ? '#d1d5db' : 'var(--primary-color, #552A47)'};
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? '#d1d5db' : 'var(--button-hover, #3d1e32)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
`;

export default NavigationControls;
