import React from 'react';
import styled from 'styled-components';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Mail, 
  Upload, 
  Clipboard,
  Bell,
  ChevronDown
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
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
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

const SendButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 24px;
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
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`;

const SectionIconWrapper = styled.div`
  color: #542a46;
  margin-top: 2px;
`;

const SectionHeaderText = styled.div`
  flex: 1;
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

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
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

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 15px;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #542a46;
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const SecondaryButton = styled.button`
  background: white;
  color: #2c3e50;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f7f8;
    border-color: #542a46;
  }
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const Dropdown = styled.div`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 15px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: #2c3e50;
  transition: border-color 0.2s;
  
  &:hover {
    border-color: #542a46;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #542a46;
    box-shadow: 0 4px 12px rgba(84, 42, 70, 0.1);
  }
`;

const FeatureIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: #f5f7f8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #542a46;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
`;

const FeatureDescription = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
`;

// ============ MAIN COMPONENT ============
const ChangeNotification: React.FC = () => {
  return (
    <AdminLayout>
      <PageContainer>
        <Header>
          <HeaderContent>
            <HeaderText>
              <Title>Change Notification Builder</Title>
              <Subtitle>Create and track organizational change communications</Subtitle>
            </HeaderText>
            <SendButton>
              <Bell size={18} />
              Send Notification
            </SendButton>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Section 1: Notification Content */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper>
                <FileText size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle>Notification Content</SectionTitle>
                <SectionSubtitle>Create your change notification message</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FormGroup>
              <Label>Subject Line</Label>
              <Input placeholder="Enter notification subject..." />
            </FormGroup>

            <FormGroup>
              <Label>Message</Label>
              <Textarea placeholder="Write your change notification message here..." />
            </FormGroup>

            <ButtonGroup>
              <SecondaryButton>
                <Upload size={16} />
                Upload Document
              </SecondaryButton>
              <SecondaryButton>
                <Clipboard size={16} />
                Paste from Clipboard
              </SecondaryButton>
            </ButtonGroup>
          </Section>

          {/* Section 2: Select Recipients */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper>
                <Users size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle>Select Recipients</SectionTitle>
                <SectionSubtitle>Choose who will receive this notification</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <DropdownWrapper>
              <Dropdown>
                <span>Specific Department</span>
                <ChevronDown size={18} />
              </Dropdown>
            </DropdownWrapper>
          </Section>

          {/* Section 3: Tracking & Verification */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper>
                <CheckCircle size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle>Tracking & Verification</SectionTitle>
                <SectionSubtitle>Set up read receipts and comprehension checks</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIconWrapper>
                  <Mail size={24} />
                </FeatureIconWrapper>
                <FeatureTitle>Read Receipt</FeatureTitle>
                <FeatureDescription>
                  Track who has opened the notification
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIconWrapper>
                  <CheckCircle size={24} />
                </FeatureIconWrapper>
                <FeatureTitle>Comprehension Check</FeatureTitle>
                <FeatureDescription>
                  Add quiz to verify understanding
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
          </Section>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default ChangeNotification;
