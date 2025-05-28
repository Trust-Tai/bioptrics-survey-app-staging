import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle } from 'react-icons/fi';

const ProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressBar = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background-color: #2ecc71;
  transition: width 0.3s ease;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const CompletionBadge = styled.div<{ isComplete?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.isComplete ? '#2ecc71' : '#f39c12'};
  background: ${props => props.isComplete ? 'rgba(46, 204, 113, 0.1)' : 'rgba(243, 156, 18, 0.1)'};
  padding: 4px 8px;
  border-radius: 4px;
`;

export interface SectionCompletionIndicatorProps {
  completionPercentage: number;
  questionCount?: number;
  showQuestionCount?: boolean;
}

const SectionCompletionIndicator: React.FC<SectionCompletionIndicatorProps> = ({
  completionPercentage,
  questionCount = 0,
  showQuestionCount = true
}) => {
  const isComplete = completionPercentage === 100;
  
  return (
    <>
      <ProgressContainer>
        <ProgressBar percent={completionPercentage} />
      </ProgressContainer>
      
      <StatsContainer>
        {showQuestionCount && (
          <div>Questions: {questionCount}</div>
        )}
        <CompletionBadge isComplete={isComplete}>
          {isComplete ? (
            <>
              <FiCheckCircle size={12} />
              Complete
            </>
          ) : (
            <>
              {completionPercentage}% Complete
            </>
          )}
        </CompletionBadge>
      </StatsContainer>
    </>
  );
};

export default SectionCompletionIndicator;
