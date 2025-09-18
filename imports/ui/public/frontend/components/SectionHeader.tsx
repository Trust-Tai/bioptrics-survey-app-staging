import React from 'react';
import styled from 'styled-components';

interface SectionHeaderProps {
  title: string;
  description: string;
  progress: number; // percentage for this section
  color?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  progress,
  color = '#552A47'
}) => {
  return (
    <HeaderContainer color={color}>
      <Title>{title}</Title>
      <Description>{description}</Description>
      <ProgressContainer>
        <ProgressBar>
          <ProgressIndicator width={progress} color={color} />
        </ProgressBar>
        <ProgressText>{progress}% Completed</ProgressText>
      </ProgressContainer>
    </HeaderContainer>
  );
};

// Styled components
const HeaderContainer = styled.div<{ color: string }>`
  background-color: ${props => `${props.color}`};
  color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const Description = styled.p`
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
  line-height: 1.5;
  max-width: 468px;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressIndicator = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: white;
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
`;

export default SectionHeader;
