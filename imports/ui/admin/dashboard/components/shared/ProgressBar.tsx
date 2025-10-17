import React from 'react';
import styled from 'styled-components';

interface ProgressBarProps {
  progress: number;
  height?: string;
  backgroundColor?: string;
  fillColor?: string;
  showPercentage?: boolean;
  className?: string;
}

const ProgressContainer = styled.div<{ height: string }>`
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  height: ${props => props.height};
  position: relative;
`;

const ProgressFill = styled.div<{ progress: number; fillColor: string }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.fillColor};
  border-radius: 8px;
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%);
    border-radius: 8px;
  }
`;

const PercentageText = styled.span`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 600;
  color: #666;
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = '8px',
  backgroundColor = '#f0f0f0',
  fillColor = '#27ae60',
  showPercentage = false,
  className
}) => {
  return (
    <ProgressContainer height={height} className={className}>
      <ProgressFill progress={progress} fillColor={fillColor} />
      {showPercentage && (
        <PercentageText>{progress}%</PercentageText>
      )}
    </ProgressContainer>
  );
};
