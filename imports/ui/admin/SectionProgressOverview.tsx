import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import SectionCompletionIndicator from './SectionCompletionIndicator';
import QuickActionsMenu from './QuickActionsMenu';

const Container = styled.div`
  margin-bottom: 24px;
`;

const SectionCard = styled.div<{ isComplete?: boolean }>`
  background: ${props => props.isComplete ? '#f0f9f0' : '#fff'};
  border: 1px solid ${props => props.isComplete ? '#2ecc71' : '#e5d6c7'};
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 8px 0 12px 0;
`;

const OverviewTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0 0 16px 0;
`;

export interface SectionProgressOverviewProps {
  sections: Array<{
    id: string;
    name: string;
    description?: string;
    questionIds?: string[];
    completionPercentage?: number;
  }>;
  onEdit?: (sectionId: string) => void;
  onPreview?: (sectionId: string) => void;
  onAssignQuestions?: (sectionId: string) => void;
  onViewAnalytics?: (sectionId: string) => void;
}

const SectionProgressOverview: React.FC<SectionProgressOverviewProps> = ({
  sections,
  onEdit,
  onPreview,
  onAssignQuestions,
  onViewAnalytics
}) => {
  return (
    <Container>
      <OverviewTitle>Section Completion Progress</OverviewTitle>
      
      {sections.map(section => {
        const completionPercentage = section.completionPercentage || 0;
        const isComplete = completionPercentage === 100;
        const questionCount = section.questionIds?.length || 0;
        
        return (
          <SectionCard key={section.id} isComplete={isComplete}>
            <SectionHeader>
              <SectionTitle>
                {isComplete ? <FiCheckCircle color="#2ecc71" /> : <FiAlertCircle color="#f39c12" />}
                {section.name}
              </SectionTitle>
            </SectionHeader>
            
            {section.description && (
              <SectionDescription>{section.description}</SectionDescription>
            )}
            
            <SectionCompletionIndicator 
              completionPercentage={completionPercentage}
              questionCount={questionCount}
              showQuestionCount={true}
            />
            
            <QuickActionsMenu
              onEdit={onEdit ? () => onEdit(section.id) : undefined}
              onPreview={onPreview ? () => onPreview(section.id) : undefined}
              onAssignQuestions={onAssignQuestions ? () => onAssignQuestions(section.id) : undefined}
              onViewAnalytics={onViewAnalytics ? () => onViewAnalytics(section.id) : undefined}
            />
          </SectionCard>
        );
      })}
    </Container>
  );
};

export default SectionProgressOverview;
