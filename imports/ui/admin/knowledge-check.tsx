import React from 'react';
import styled from 'styled-components';
import { 
  Plus,
  Zap,
  BookOpen,
  Target,
  Award,
  Brain
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

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #542a46;
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const BuildButton = styled.button`
  width: 100%;
  background: #5a8596;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
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
const KnowledgeCheck: React.FC = () => {
  return (
    <AdminLayout>
      <PageContainer>
        <Header>
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
              <SectionTitle>Choose Check Type</SectionTitle>
              <SectionSubtitle>Select the format that best fits your needs</SectionSubtitle>
            </SectionHeader>

            <CheckTypeGrid>
              {/* Quick Quiz */}
              <CheckTypeCard bgColor="#5a8596">
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
              <CheckTypeCard bgColor="#5a8596">
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
              <CheckTypeCard bgColor="#be5f41">
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
              <CheckTypeCard bgColor="#be5f41">
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
              <SectionTitle>Or Build Custom Check</SectionTitle>
              <SectionSubtitle>Start from scratch with full control</SectionSubtitle>
            </SectionHeader>

            <CustomCheckForm>
              <FormGroup>
                <Label>Check Name</Label>
                <Input placeholder="e.g., Safety Procedures Quiz" />
              </FormGroup>

              <FormGroup>
                <Label>Number of Questions</Label>
                <Input type="number" placeholder="5" />
              </FormGroup>

              <BuildButton>Start Building</BuildButton>
            </CustomCheckForm>
          </Section>

          {/* Recent Knowledge Checks Section */}
          <Section>
            <SectionHeader>
              <SectionTitle>Recent Knowledge Checks</SectionTitle>
              <SectionSubtitle>View your latest checks and results</SectionSubtitle>
            </SectionHeader>

            <EmptyState>
              <EmptyIcon>
                <Brain size={32} />
              </EmptyIcon>
              <EmptyMessage>No checks created yet</EmptyMessage>
              <EmptySubtext>Create your first knowledge check to get started</EmptySubtext>
            </EmptyState>
          </Section>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default KnowledgeCheck;
