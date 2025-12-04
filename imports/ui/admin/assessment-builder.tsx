import React, { useState } from 'react';
import styled from 'styled-components';
import { Target, Award, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { useDynamicColors } from './home/theme/useDynamicColors';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div<{ bgColor: string }>`
  min-height: 100vh;
  background: ${props => props.bgColor};
`;

const Header = styled.div<{ primaryColor: string }>`
  background: linear-gradient(135deg, ${props => props.primaryColor} 0%, ${props => props.primaryColor}dd 100%);
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

const SectionTitle = styled.h2<{ color: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 8px 0;
`;

const SectionSubtitle = styled.p<{ color: string }>`
  font-size: 15px;
  color: ${props => props.color};
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

const TemplateCard = styled.div<{ borderColor?: string }>`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: ${props => props.borderColor || 'transparent'};
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

const CriteriaLabel = styled.div<{ color: string }>`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.color};
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span<{ bgColor: string; textColor: string }>`
  padding: 6px 14px;
  background: ${props => props.bgColor};
  color: ${props => props.textColor};
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

const Label = styled.label<{ color: string }>`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.color};
  margin-bottom: 8px;
`;

const Input = styled.input<{ borderColor: string; focusBorderColor: string }>`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusBorderColor};
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const BuildButton = styled.button<{ bgColor: string; hoverBgColor: string }>`
  width: 100%;
  padding: 16px;
  background: ${props => props.bgColor};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.hoverBgColor};
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
  const colors = useDynamicColors();

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

  // Helper function to get card color based on category
  const getCardColor = (category: 'culture' | 'operations' | 'benchmarking') => {
    return colors.category[category];
  };

  return (
    <AdminLayout>
      <PageContainer bgColor={colors.white}>
        <Header primaryColor={colors.orange}>
          <HeaderContent>
            <Title>Assessment Builder</Title>
            <Subtitle>Create comprehensive assessments with automated scoring</Subtitle>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Choose Assessment Type Section */}
          <Section>
            <SectionTitle color={colors.textDark}>Choose Assessment Type</SectionTitle>
            <SectionSubtitle color={colors.textMedium}>Select a framework to get started quickly</SectionSubtitle>
            
            <Grid>
              {/* Leadership Assessment */}
              <TemplateCard borderColor={getCardColor('culture')} onClick={() => handleTemplateSelect('leadership')}>
                <CardHeader bgColor={getCardColor('culture')}>
                  <IconWrapper>
                    <Target size={24} strokeWidth={2} />
                  </IconWrapper>
                  <CardTitle>Leadership Assessment</CardTitle>
                  <CardDescription>Evaluate leadership skills and effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <CriteriaLabel color={colors.textMedium}>KEY CRITERIA</CriteriaLabel>
                  <TagsContainer>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Decision Making</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Communication</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Vision</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Team Building</Tag>
                  </TagsContainer>
                </CardContent>
              </TemplateCard>

              {/* Performance Review */}
              <TemplateCard borderColor={getCardColor('culture')} onClick={() => handleTemplateSelect('performance')}>
                <CardHeader bgColor={getCardColor('culture')}>
                  <IconWrapper>
                    <Award size={24} strokeWidth={2} />
                  </IconWrapper>
                  <CardTitle>Performance Review</CardTitle>
                  <CardDescription>Comprehensive performance evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <CriteriaLabel color={colors.textMedium}>KEY CRITERIA</CriteriaLabel>
                  <TagsContainer>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Goals Achievement</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Quality of Work</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Collaboration</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Innovation</Tag>
                  </TagsContainer>
                </CardContent>
              </TemplateCard>

              {/* Competency Assessment */}
              <TemplateCard borderColor={getCardColor('benchmarking')} onClick={() => handleTemplateSelect('competency')}>
                <CardHeader bgColor={getCardColor('benchmarking')}>
                  <IconWrapper>
                    <TrendingUp size={24} strokeWidth={2} />
                  </IconWrapper>
                  <CardTitle>Competency Assessment</CardTitle>
                  <CardDescription>Measure skill proficiency levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <CriteriaLabel color={colors.textMedium}>KEY CRITERIA</CriteriaLabel>
                  <TagsContainer>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Technical Skills</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Soft Skills</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Job Knowledge</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Adaptability</Tag>
                  </TagsContainer>
                </CardContent>
              </TemplateCard>

              {/* Team Effectiveness */}
              <TemplateCard borderColor={getCardColor('operations')} onClick={() => handleTemplateSelect('team')}>
                <CardHeader bgColor={getCardColor('operations')}>
                  <IconWrapper>
                    <Users size={24} strokeWidth={2} />
                  </IconWrapper>
                  <CardTitle>Team Effectiveness</CardTitle>
                  <CardDescription>Assess team dynamics and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <CriteriaLabel color={colors.textMedium}>KEY CRITERIA</CriteriaLabel>
                  <TagsContainer>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Collaboration</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Communication</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Conflict Resolution</Tag>
                    <Tag bgColor={colors.grayLight} textColor={colors.textDark}>Productivity</Tag>
                  </TagsContainer>
                </CardContent>
              </TemplateCard>
            </Grid>
          </Section>

          {/* Build From Scratch Section */}
          <Section>
            <SectionTitle color={colors.textDark}>Or Build From Scratch</SectionTitle>
            <SectionSubtitle color={colors.textMedium}>Create a fully customized assessment</SectionSubtitle>
            
            <BuildSection>
              <InputWrapper>
                <Label color={colors.textDark}>Assessment Name</Label>
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
                  borderColor={colors.borderGray}
                  focusBorderColor={colors.orange}
                />
              </InputWrapper>
              <BuildButton 
                onClick={handleStartBuilding}
                disabled={!assessmentName.trim()}
                bgColor={colors.orange}
                hoverBgColor={colors.hover.orange}
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
