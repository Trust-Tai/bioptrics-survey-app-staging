import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi';

// Styled components
const Container = styled.div`
  margin-bottom: 20px;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ percent: number; color?: string }>`
  height: 100%;
  width: ${props => `${props.percent}%`};
  background: ${props => props.color || '#552a47'};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.div`
  margin-left: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  min-width: 50px;
  text-align: right;
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-top: 24px;
  padding: 0 12px;
`;

const StepLine = styled.div`
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
`;

const StepItem = styled.div<{ active?: boolean; completed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const StepIcon = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.completed ? '#e8f5e9' : props.active ? '#f5f0f5' : '#f5f5f5'};
  color: ${props => props.completed ? '#2e7d32' : props.active ? '#552a47' : '#999'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border: 2px solid ${props => props.completed ? '#2e7d32' : props.active ? '#552a47' : '#e0e0e0'};
  
  svg {
    font-size: 16px;
  }
`;

const StepLabel = styled.div<{ active?: boolean; completed?: boolean }>`
  font-size: 12px;
  font-weight: ${props => props.active || props.completed ? 600 : 400};
  color: ${props => props.completed ? '#2e7d32' : props.active ? '#552a47' : '#666'};
  text-align: center;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-top: 8px;
  
  svg {
    color: #999;
  }
`;

interface Section {
  id: string;
  name: string;
  isActive: boolean;
  completionPercentage: number;
  timeSpent?: number; // in seconds
  timeLimit?: number; // in minutes
}

interface SectionProgressIndicatorProps {
  sections: Section[];
  currentSectionIndex: number;
  showSteps?: boolean;
  showTimeInfo?: boolean;
  onSectionClick?: (sectionIndex: number) => void;
}

const SectionProgressIndicator: React.FC<SectionProgressIndicatorProps> = ({
  sections,
  currentSectionIndex,
  showSteps = true,
  showTimeInfo = true,
  onSectionClick
}) => {
  const currentSection = sections[currentSectionIndex];
  
  // Calculate overall progress
  const totalSections = sections.length;
  const completedSections = sections.filter(s => s.completionPercentage === 100).length;
  const overallProgress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
  
  // Format time spent
  const formatTime = (seconds?: number): string => {
    if (!seconds) return '0m';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };
  
  // Calculate time remaining if there's a time limit
  const getTimeRemaining = (section: Section): string => {
    if (!section.timeLimit) return 'No time limit';
    
    const timeSpentMinutes = section.timeSpent ? section.timeSpent / 60 : 0;
    const timeRemainingMinutes = Math.max(0, section.timeLimit - timeSpentMinutes);
    
    const minutes = Math.floor(timeRemainingMinutes);
    const seconds = Math.round((timeRemainingMinutes - minutes) * 60);
    
    return `${minutes}m ${seconds}s remaining`;
  };
  
  return (
    <Container>
      <ProgressContainer>
        <ProgressBar>
          <ProgressFill 
            percent={currentSection.completionPercentage} 
            color={currentSection.completionPercentage === 100 ? '#2e7d32' : '#552a47'} 
          />
        </ProgressBar>
        <ProgressLabel>{currentSection.completionPercentage}%</ProgressLabel>
      </ProgressContainer>
      
      {showTimeInfo && (
        <TimeInfo>
          <FiClock size={14} />
          <span>
            {currentSection.timeLimit 
              ? getTimeRemaining(currentSection)
              : `Time spent: ${formatTime(currentSection.timeSpent)}`
            }
          </span>
        </TimeInfo>
      )}
      
      {showSteps && (
        <>
          <StepLine />
          <StepsContainer>
            {sections.map((section, index) => (
              <StepItem 
                key={section.id} 
                active={index === currentSectionIndex}
                completed={section.completionPercentage === 100}
                onClick={() => onSectionClick && onSectionClick(index)}
                style={{ cursor: onSectionClick ? 'pointer' : 'default' }}
              >
                <StepIcon 
                  active={index === currentSectionIndex}
                  completed={section.completionPercentage === 100}
                >
                  {section.completionPercentage === 100 ? (
                    <FiCheckCircle />
                  ) : (
                    <FiCircle />
                  )}
                </StepIcon>
                <StepLabel 
                  active={index === currentSectionIndex}
                  completed={section.completionPercentage === 100}
                >
                  {section.name}
                </StepLabel>
              </StepItem>
            ))}
          </StepsContainer>
        </>
      )}
    </Container>
  );
};

export default SectionProgressIndicator;
