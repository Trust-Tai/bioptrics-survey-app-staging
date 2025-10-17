import React from 'react';
import styled from 'styled-components';
import { SurveyCard } from './SurveyCard';
import { QuickStartSurveyData } from '../../../types/dashboard.types';

const SectionContainer = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '🚀';
    font-size: 18px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const SurveysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

interface QuickStartSectionProps {
  className?: string;
}

export const QuickStartSection: React.FC<QuickStartSectionProps> = ({ className }) => {
  // Mock data - replace with real data from your backend
  const surveysData: QuickStartSurveyData[] = [
    {
      id: '1',
      title: 'WPS Built Environment Survey',
      description: 'Assess physical workplace safety conditions',
      tags: ['WPS', 'Built Environment', 'Safety'],
      category: 'WPS'
    },
    {
      id: '2',
      title: 'Policy Acknowledgment Template',
      description: 'Quick policy compliance check',
      tags: ['Policy', 'Compliance'],
      category: 'Policy'
    },
    {
      id: '3',
      title: 'Change Notice Comprehension',
      description: 'Verify understanding of recent changes',
      tags: ['Change Notice', 'Read & Understood'],
      category: 'Change Notice'
    }
  ];

  return (
    <SectionContainer className={className}>
      <SectionHeader>
        <SectionTitle>Quick Start Surveys</SectionTitle>
        <SectionSubtitle>Pre-configured surveys ready to launch</SectionSubtitle>
      </SectionHeader>

      <SurveysGrid>
        {surveysData.map((survey) => (
          <SurveyCard key={survey.id} data={survey} />
        ))}
      </SurveysGrid>
    </SectionContainer>
  );
};
