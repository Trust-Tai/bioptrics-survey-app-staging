import React from 'react';
import styled from 'styled-components';
import { Brain, Plus, TrendingUp, Target, Zap, BookOpen, Award } from 'lucide-react';
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

const CreateButton = styled.button`
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

const SectionTitle = styled.h2<{ color: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  margin: 0;
`;

const CheckTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CheckTypeCard = styled.div<{ bgColor: string }>`
  background: ${props => props.bgColor};
  border-radius: 12px;
  padding: 24px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
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

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
`;

const CardDuration = styled.div`
  font-size: 13px;
  opacity: 0.9;
`;

const CardDescription = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.95;
  line-height: 1.5;
`;

const CardButton = styled.button`
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const CustomCheckForm = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-of-type {
    margin-bottom: 32px;
  }
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
  padding: 12px 16px;
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
  background: ${props => props.bgColor};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.hoverBgColor};
  }
`;

const EmptyState = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
`;

const EmptyIcon = styled.div<{ bgColor: string; iconColor: string }>`
  width: 64px;
  height: 64px;
  background: ${props => props.bgColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${props => props.iconColor};
`;

const EmptyMessage = styled.div<{ color: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.color};
  margin-bottom: 8px;
`;

const EmptySubtext = styled.div<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
`;

// ============ MAIN COMPONENT ============
const KnowledgeCheck: React.FC = () => {
  const colors = useDynamicColors();

  return (
    <AdminLayout>
      <PageContainer bgColor={colors.white}>
        <Header primaryColor={colors.yellow}>
          <HeaderContent>
            <HeaderText>
              <Title>Knowledge Check</Title>
              <Subtitle>Create quick checks to verify understanding and drive learning</Subtitle>
            </HeaderText>
            <CreateButton>
              <Plus size={18} />
              Create Check
            </CreateButton>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Choose Check Type Section */}
          <Section>
            <SectionHeader>
              <SectionTitle color={colors.textDark}>Choose Check Type</SectionTitle>
              <SectionSubtitle color={colors.textMedium}>Select the format that best fits your needs</SectionSubtitle>
            </SectionHeader>

            <CheckTypeGrid>
              {/* Quick Quiz */}
              <CheckTypeCard bgColor={colors.category.operations}>
                <CardTop>
                  <IconWrapper>
                    <Zap size={24} />
                  </IconWrapper>
                  <CardInfo>
                    <CardTitle>Quick Quiz</CardTitle>
                    <CardDuration>~5 min</CardDuration>
                  </CardInfo>
                </CardTop>
                <CardDescription>3-5 questions. Instant feedback</CardDescription>
                <CardButton>
                  Create Quick Quiz →
                </CardButton>
              </CheckTypeCard>

              {/* Knowledge Test */}
              <CheckTypeCard bgColor={colors.category.operations}>
                <CardTop>
                  <IconWrapper>
                    <BookOpen size={24} />
                  </IconWrapper>
                  <CardInfo>
                    <CardTitle>Knowledge Test</CardTitle>
                    <CardDuration>~5 min</CardDuration>
                  </CardInfo>
                </CardTop>
                <CardDescription>10-15 questions. comprehensive</CardDescription>
                <CardButton>
                  Create Knowledge Test →
                </CardButton>
              </CheckTypeCard>

              {/* Skill Check */}
              <CheckTypeCard bgColor={colors.category.culture}>
                <CardTop>
                  <IconWrapper>
                    <Target size={24} />
                  </IconWrapper>
                  <CardInfo>
                    <CardTitle>Skill Check</CardTitle>
                    <CardDuration>~7 min</CardDuration>
                  </CardInfo>
                </CardTop>
                <CardDescription>Scenario-based questions</CardDescription>
                <CardButton>
                  Create Skill Check →
                </CardButton>
              </CheckTypeCard>

              {/* Certification Check */}
              <CheckTypeCard bgColor={colors.category.culture}>
                <CardTop>
                  <IconWrapper>
                    <Award size={24} />
                  </IconWrapper>
                  <CardInfo>
                    <CardTitle>Certification Check</CardTitle>
                    <CardDuration>~10 min</CardDuration>
                  </CardInfo>
                </CardTop>
                <CardDescription>Pass/fail with certificate</CardDescription>
                <CardButton>
                  Create Certification Check →
                </CardButton>
              </CheckTypeCard>
            </CheckTypeGrid>
          </Section>

          {/* Build Custom Check Section */}
          <Section>
            <SectionHeader>
              <SectionTitle color={colors.textDark}>Or Build Custom Check</SectionTitle>
              <SectionSubtitle color={colors.textMedium}>Start from scratch with full control</SectionSubtitle>
            </SectionHeader>

            <CustomCheckForm>
              <FormGroup>
                <Label color={colors.textDark}>Check Name</Label>
                <Input 
                  placeholder="e.g., Safety Procedures Quiz" 
                  borderColor={colors.borderGray}
                  focusBorderColor={colors.yellow}
                />
              </FormGroup>

              <FormGroup>
                <Label color={colors.textDark}>Number of Questions</Label>
                <Input 
                  type="number" 
                  placeholder="5" 
                  borderColor={colors.borderGray}
                  focusBorderColor={colors.yellow}
                />
              </FormGroup>

              <BuildButton 
                bgColor={colors.yellow}
                hoverBgColor={colors.hover.yellow}
              >
                Start Building
              </BuildButton>
            </CustomCheckForm>
          </Section>

          {/* Recent Knowledge Checks Section */}
          <Section>
            <SectionHeader>
              <SectionTitle color={colors.textDark}>Recent Knowledge Checks</SectionTitle>
              <SectionSubtitle color={colors.textMedium}>View your latest checks and results</SectionSubtitle>
            </SectionHeader>

            <EmptyState>
              <EmptyIcon bgColor={colors.grayLight} iconColor={colors.textMedium}>
                <Brain size={32} />
              </EmptyIcon>
              <EmptyMessage color={colors.textDark}>No checks created yet</EmptyMessage>
              <EmptySubtext color={colors.textMedium}>Create your first knowledge check to get started</EmptySubtext>
            </EmptyState>
          </Section>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default KnowledgeCheck;
