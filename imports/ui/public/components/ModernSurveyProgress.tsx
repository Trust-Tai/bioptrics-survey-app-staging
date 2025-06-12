import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle } from 'react-icons/fi';

interface ModernSurveyProgressProps {
  progress: number;
  color?: string;
  currentStep?: number;
  totalSteps?: number;
}

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto 32px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressPercentage = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProgressBarWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 6px;
  background-color: #edf2f7;
  border-radius: 100px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number; color?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => 
    props.color ? 
    `linear-gradient(90deg, ${props.color}dd 0%, ${props.color} 100%)` : 
    'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)'
  };
  border-radius: 100px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  padding: 0 2px;
`;

const Step = styled.div<{ active: boolean; completed: boolean; color?: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => 
    props.completed ? 
    (props.color || '#8E54E9') : 
    (props.active ? '#aab7c4' : '#edf2f7')
  };
  transition: all 0.3s ease;
`;

const ModernSurveyProgress: React.FC<ModernSurveyProgressProps> = ({ 
  progress, 
  color, 
  currentStep = 1, 
  totalSteps = 5 
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  // Create step indicators
  const renderSteps = () => {
    // Only show indicators for actual questions (not welcome/thank-you screens)
    const actualQuestionCount = Math.max(0, totalSteps - 2);
    if (actualQuestionCount <= 1) return null;
    
    return (
      <StepIndicator>
        {Array.from({ length: actualQuestionCount }).map((_, index) => {
          // Adjust index to account for welcome screen
          const stepNumber = index + 2; // +2 because welcome is step 1
          return (
            <Step 
              key={index}
              active={stepNumber === currentStep}
              completed={stepNumber < currentStep}
              color={color}
            />
          );
        })}
      </StepIndicator>
    );
  };
  
  return (
    <ProgressContainer>
      <ProgressHeader>
        <ProgressLabel>
          {currentStep && totalSteps ? (
            <>Question {currentStep - 1} of {totalSteps - 2}</>
          ) : (
            'Survey Progress'
          )}
        </ProgressLabel>
        <ProgressPercentage>
          {normalizedProgress === 100 ? (
            <>
              <FiCheckCircle color={color || '#38b2ac'} />
              Complete
            </>
          ) : (
            <>{normalizedProgress}% complete</>
          )}
        </ProgressPercentage>
      </ProgressHeader>
      <ProgressBarWrapper>
        <ProgressFill width={normalizedProgress} color={color} />
      </ProgressBarWrapper>
      {renderSteps()}
    </ProgressContainer>
  );
};

export default ModernSurveyProgress;
