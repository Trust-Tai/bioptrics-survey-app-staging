import React, { useState } from 'react';
import styled from 'styled-components';
import { Target, Award, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  position: relative;
  z-index: 1;
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

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 24px;
`;

const Section = styled.div`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 15px;
  color: #6c757d;
  margin: 0 0 32px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled.div<{ bgColor: string }>`
  background: ${props => props.bgColor};
  padding: 32px;
  color: white;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
`;

const CardDescription = styled.p`
  margin: 0;
  opacity: 0.95;
  font-size: 14px;
  line-height: 1.5;
`;

const CardContent = styled.div`
  padding: 24px 32px;
  background: white;
`;

const CriteriaLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #6c757d;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  padding: 6px 14px;
  background: #f5f7f8;
  color: #2c3e50;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
`;

const BuildSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const InputWrapper = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #6b8e9d;
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const BuildButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #6b8e9d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ============ MAIN COMPONENT ============
const AssessmentBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [assessmentName, setAssessmentName] = useState('');

  const handleTemplateSelect = (templateType: string) => {
    console.log('Template selected:', templateType);
    // Template selection - no redirect for now
  };

  const handleStartBuilding = () => {
    if (assessmentName.trim()) {
      console.log('Starting custom assessment:', assessmentName);
      // Custom assessment - no redirect for now
    }
  };

  return (
    <AdminLayout>
      <PageContainer>
        <Header>
          <HeaderContent>
            <Title>Assessment Builder</Title>
            <Subtitle>Create comprehensive assessments with automated scoring</Subtitle>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Choose Assessment Type Section */}
          <Section>
            <SectionTitle>Choose Assessment Type</SectionTitle>
            <SectionSubtitle>Select a framework to get started quickly</SectionSubtitle>
            
            <Grid>
              {/* Leadership Assessment */}
              <TemplateCard onClick={() => handleTemplateSelect('leadership')}>
                <CardHeader bgColor="#6b8e9d">
                  <IconWrapper>
                    <Target size={24} strokeWidth={2} />
                  </IconWrapper>
                  <CardTitle>Leadership Assessment</CardTitle>
                  <CardDescription>Evaluate leadership skills and effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <CriteriaLabel>KEY CRITERIA</CriteriaLabel>
                  <TagsContainer>
                    <Tag>Decision Making</Tag>
                    <Tag>Communication</Tag>
                    <Tag>Vision</Tag>
                    <Tag>Team Building</Tag>
                  </TagsContainer>
                </CardContent>
              </TemplateCard>

              {/* Performance Review */}
              <TemplateCard onClick={() => handleTemplateSelect('performance')}>
                <CardHeader bgColor="#6b8e9d">
                  <IconWrapper>
                    <Award size={24} strokeWidth={2} />
                  </IconWrapper>
                  <CardTitle>Performance Review</CardTitle>
                  <CardDescription>Comprehensive performance evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <CriteriaLabel>KEY CRITERIA</CriteriaLabel>
                  <TagsContainer>
                    <Tag>Goals Achievement</Tag>
                    <Tag>Quality of Work</Tag>
                    <Tag>Collaboration</Tag>
                    <Tag>Innovation</Tag>
                  </TagsContainer>
                </CardContent>
              </TemplateCard>

              {/* Competency Assessment */}
              <TemplateCard onClick={() => handleTemplateSelect('competency')}>
                <CardHeader bgColor="#c17a5f">
                  <IconWrapper>
                    <TrendingUp size={24} strokeWidth={2} />
                  </IconWrapper>
                  <CardTitle>Competency Assessment</CardTitle>
                  <CardDescription>Measure skill proficiency levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <CriteriaLabel>KEY CRITERIA</CriteriaLabel>
                  <TagsContainer>
                    <Tag>Technical Skills</Tag>
                    <Tag>Soft Skills</Tag>
                    <Tag>Job Knowledge</Tag>
                    <Tag>Adaptability</Tag>
                  </TagsContainer>
                </CardContent>
              </TemplateCard>

              {/* Team Effectiveness */}
              <TemplateCard onClick={() => handleTemplateSelect('team')}>
                <CardHeader bgColor="#c17a5f">
                  <IconWrapper>
                    <Users size={24} strokeWidth={2} />
                  </IconWrapper>
                  <CardTitle>Team Effectiveness</CardTitle>
                  <CardDescription>Assess team dynamics and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <CriteriaLabel>KEY CRITERIA</CriteriaLabel>
                  <TagsContainer>
                    <Tag>Collaboration</Tag>
                    <Tag>Communication</Tag>
                    <Tag>Conflict Resolution</Tag>
                    <Tag>Productivity</Tag>
                  </TagsContainer>
                </CardContent>
              </TemplateCard>
            </Grid>
          </Section>

          {/* Build From Scratch Section */}
          <Section>
            <SectionTitle>Or Build From Scratch</SectionTitle>
            <SectionSubtitle>Create a fully customized assessment</SectionSubtitle>
            
            <BuildSection>
              <InputWrapper>
                <Label>Assessment Name</Label>
                <Input
                  type="text"
                  placeholder="Enter assessment name..."
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleStartBuilding();
                    }
                  }}
                />
              </InputWrapper>
              <BuildButton 
                onClick={handleStartBuilding}
                disabled={!assessmentName.trim()}
              >
                Start Building
              </BuildButton>
            </BuildSection>
          </Section>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default AssessmentBuilder;
