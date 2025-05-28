import React from 'react';
import styled from 'styled-components';
import { SurveySectionItem } from '/imports/features/surveys/types/index';

const PreviewContainer = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5d6c7;
  margin-bottom: 24px;
`;

const PreviewHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const PreviewTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const PreviewDescription = styled.div`
  font-size: 15px;
  color: #666;
  line-height: 1.5;
`;

const PreviewInstructions = styled.div`
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 15px;
  color: #555;
  line-height: 1.5;
`;

const PreviewContent = styled.div`
  margin-bottom: 24px;
`;

const PreviewPlaceholder = styled.div`
  background: #f5f5f5;
  padding: 32px;
  border-radius: 8px;
  text-align: center;
  color: #888;
`;

interface SectionPreviewProps {
  section: SurveySectionItem;
}

export const SectionPreview: React.FC<SectionPreviewProps> = ({ section }) => {
  return (
    <PreviewContainer>
      <PreviewHeader>
        <PreviewTitle>{section.name}</PreviewTitle>
        {section.description && (
          <PreviewDescription>{section.description}</PreviewDescription>
        )}
      </PreviewHeader>
      
      {section.instructions && (
        <PreviewInstructions dangerouslySetInnerHTML={{ __html: section.instructions }} />
      )}
      
      <PreviewContent>
        <PreviewPlaceholder>
          <p>Question content would appear here</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>This section contains {section.questionIds?.length || 0} questions</p>
        </PreviewPlaceholder>
      </PreviewContent>
    </PreviewContainer>
  );
};

export default SectionPreview;
