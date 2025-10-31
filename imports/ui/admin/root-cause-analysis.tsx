import React from 'react';
import styled from 'styled-components';
import { 
  Plus,
  List,
  GitBranch,
  Search,
  FileText
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
`;

const Header = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: 16px;
  padding: 32px 24px;
  margin: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const HeaderText = styled.div`
  color: white;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: white;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
`;

const StartButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const Section = styled.div`
  margin-bottom: 48px;
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
`;

const MethodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MethodCard = styled.div<{ bgColor: string }>`
  background: ${props => props.bgColor};
  border-radius: 12px;
  padding: 24px;
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  flex: 1;
`;

const CardDescription = styled.p`
  font-size: 14px;
  margin: 0 0 20px 0;
  opacity: 0.95;
  line-height: 1.5;
`;

const StepsLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  opacity: 0.9;
`;

const StepsList = styled.ol`
  margin: 0 0 20px 0;
  padding-left: 20px;
  list-style-position: outside;
`;

const StepItem = styled.li`
  font-size: 13px;
  margin-bottom: 6px;
  opacity: 0.95;
  line-height: 1.4;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MethodButton = styled.button`
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: auto;
  
  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const EmptyState = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f5f7f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #6c757d;
`;

const EmptyMessage = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  color: #6c757d;
`;

// ============ MAIN COMPONENT ============
const RootCauseAnalysis: React.FC = () => {
  const methods = [
    {
      id: 1,
      icon: List,
      title: '5 Whys Analysis',
      description: 'Iteratively ask \'why\' to uncover root causes',
      bgColor: '#5a8596',
      steps: [
        'Define the problem',
        'Ask why it happened',
        'Repeat 4 more times',
        'Identify root cause'
      ]
    },
    {
      id: 2,
      icon: GitBranch,
      title: 'Fishbone Diagram',
      description: 'Visual cause-and-effect analysis',
      bgColor: '#be5f41',
      steps: [
        'Define the problem',
        'Identify categories',
        'Brainstorm causes',
        'Analyze relationships'
      ]
    },
    {
      id: 3,
      icon: Search,
      title: 'Fault Tree Analysis',
      description: 'Top-down deductive failure analysis',
      bgColor: '#a6a6a6',
      steps: [
        'Define top event',
        'Identify immediate causes',
        'Break down each cause',
        'Calculate probabilities'
      ]
    }
  ];

  return (
    <AdminLayout>
      <PageContainer>
        <Header>
          <HeaderContent>
            <HeaderText>
              <Title>Root Cause Analysis</Title>
              <Subtitle>Identify and address the underlying causes of issues</Subtitle>
            </HeaderText>
            <StartButton>
              <Plus size={18} />
              Start New Analysis
            </StartButton>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Select Analysis Method Section */}
          <Section>
            <SectionHeader>
              <SectionTitle>Select Analysis Method</SectionTitle>
              <SectionSubtitle>Choose the framework that best fits your situation</SectionSubtitle>
            </SectionHeader>

            <MethodGrid>
              {methods.map(method => {
                const IconComponent = method.icon;
                return (
                  <MethodCard key={method.id} bgColor={method.bgColor}>
                    <CardHeader>
                      <IconWrapper>
                        <IconComponent size={24} />
                      </IconWrapper>
                      <CardTitle>{method.title}</CardTitle>
                    </CardHeader>
                    <CardDescription>{method.description}</CardDescription>
                    <StepsLabel>STEPS</StepsLabel>
                    <StepsList>
                      {method.steps.map((step, index) => (
                        <StepItem key={index}>{step}</StepItem>
                      ))}
                    </StepsList>
                    <MethodButton>Use This Method →</MethodButton>
                  </MethodCard>
                );
              })}
            </MethodGrid>
          </Section>

          {/* Recent Analyses Section */}
          <Section>
            <SectionHeader>
              <SectionTitle>Recent Analyses</SectionTitle>
              <SectionSubtitle>Track your ongoing and completed root cause analyses</SectionSubtitle>
            </SectionHeader>

            <EmptyState>
              <EmptyIcon>
                <FileText size={32} />
              </EmptyIcon>
              <EmptyMessage>No analyses started yet</EmptyMessage>
              <EmptySubtext>Select a method above to begin your first root cause analysis</EmptySubtext>
            </EmptyState>
          </Section>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default RootCauseAnalysis;
