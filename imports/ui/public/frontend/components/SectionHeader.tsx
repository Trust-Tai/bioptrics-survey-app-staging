import React from 'react';
import styled from 'styled-components';
import DocumentViewer from './DocumentViewer';

interface SectionHeaderProps {
  title: string;
  description: string;
  progress: number; // percentage for this section
  color?: string; // Kept for backward compatibility
  image?: string; // Add image property for section images
  document?: string; // Add document property for section documents (PDF/Word)
  documentName?: string; // Document filename
  documentType?: string; // Document MIME type (e.g., 'application/pdf')
  hideTitle?: boolean; // Add hideTitle prop to conditionally hide section title
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  progress,
  // color prop is kept for backward compatibility but not used directly
  color = '#552A47',
  image,
  document,
  documentName,
  documentType,
  hideTitle = false // Default to false, show title by default
}) => {
  if (hideTitle) {
    return null;
  }
  return (
    <HeaderContainer>
      {image && <SectionImage src={image} alt={title} />}
      {!hideTitle && <Title>{title}</Title>}
      <Description>{description}</Description>
      <ProgressContainer>
        <ProgressBar>
          <ProgressIndicator width={progress} />
        </ProgressBar>
        <ProgressText>{progress}% Completed</ProgressText>
      </ProgressContainer>
    </HeaderContainer>
  );
};

// Styled components
const HeaderContainer = styled.div`
  background-color: var(--primary-color, #552A47);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin: 0 auto 2rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  text-align: center;
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
  max-width: 600px;
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

const ProgressIndicator = styled.div<{ width: number }>`
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

const SectionImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
  margin-bottom: 1rem;
`;

export default SectionHeader;
