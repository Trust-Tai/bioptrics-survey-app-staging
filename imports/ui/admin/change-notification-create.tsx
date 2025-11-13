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

const SectionIconWrapper = styled.div<{ color: string }>`
  color: ${props => props.color};
  margin-top: 2px;
`;

const SectionHeaderText = styled.div`
  flex: 1;
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

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
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

const Textarea = styled.textarea<{ borderColor: string; focusBorderColor: string }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  font-size: 15px;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusBorderColor};
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

const SecondaryButton = styled.button<{ textColor: string; borderColor: string; hoverBgColor: string; hoverBorderColor: string }>`
  background: white;
  color: ${props => props.textColor};
  border: 1px solid ${props => props.borderColor};
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
    background: ${props => props.hoverBgColor};
    border-color: ${props => props.hoverBorderColor};
  }
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const Dropdown = styled.div<{ borderColor: string; textColor: string; hoverBorderColor: string }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  font-size: 15px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: ${props => props.textColor};
  transition: border-color 0.2s;
  
  &:hover {
    border-color: ${props => props.hoverBorderColor};
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

const FeatureCard = styled.div<{ borderColor: string; hoverBorderColor: string }>`
  background: white;
  border: 1px solid ${props => props.borderColor};
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.hoverBorderColor};
    box-shadow: 0 4px 12px rgba(50, 91, 155, 0.1);
  }
`;

const FeatureIconWrapper = styled.div<{ bgColor: string; iconColor: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.bgColor};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor};
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3<{ color: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 8px 0;
`;

const FeatureDescription = styled.p<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  margin: 0;
  line-height: 1.5;
`;

// ============ MAIN COMPONENT ============
const ChangeNotificationCreate: React.FC = () => {
  const navigate = useNavigate();
  const colors = useDynamicColors();

  const handleSend = () => {
    console.log('Send notification clicked');
    // Navigate back to dashboard after sending
    // navigate('/admin/change-notification');
  };

  return (
    <AdminLayout>
      <PageContainer bgColor={colors.white}>
        <Header primaryColor={colors.blue}>
          <HeaderContent>
            <HeaderText>
              <Title>Create Change Notification</Title>
              <Subtitle>Create and send organizational change communications</Subtitle>
            </HeaderText>
            <SendButton onClick={handleSend}>
              <Bell size={18} />
              Send Notification
            </SendButton>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Section 1: Notification Content */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper color={colors.blue}>
                <FileText size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle color={colors.textDark}>Notification Content</SectionTitle>
                <SectionSubtitle color={colors.textMedium}>Create your change notification message</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FormGroup>
              <Label color={colors.textDark}>Subject Line</Label>
              <Input 
                placeholder="Enter notification subject..." 
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              />
            </FormGroup>

            <FormGroup>
              <Label color={colors.textDark}>Message</Label>
              <Textarea 
                placeholder="Write your change notification message here..." 
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              />
            </FormGroup>

            <ButtonGroup>
              <SecondaryButton
                textColor={colors.textDark}
                borderColor={colors.borderGray}
                hoverBgColor={colors.grayLight}
                hoverBorderColor={colors.blue}
              >
                <Upload size={16} />
                Upload Document
              </SecondaryButton>
              <SecondaryButton
                textColor={colors.textDark}
                borderColor={colors.borderGray}
                hoverBgColor={colors.grayLight}
                hoverBorderColor={colors.blue}
              >
                <Clipboard size={16} />
                Paste from Clipboard
              </SecondaryButton>
            </ButtonGroup>
          </Section>

          {/* Section 2: Select Recipients */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper color={colors.blue}>
                <Users size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle color={colors.textDark}>Select Recipients</SectionTitle>
                <SectionSubtitle color={colors.textMedium}>Choose who will receive this notification</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <DropdownWrapper>
              <Dropdown
                borderColor={colors.borderGray}
                textColor={colors.textDark}
                hoverBorderColor={colors.blue}
              >
                <span>Specific Department</span>
                <ChevronDown size={18} />
              </Dropdown>
            </DropdownWrapper>
          </Section>

          {/* Section 3: Tracking & Verification */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper color={colors.blue}>
                <CheckCircle size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle color={colors.textDark}>Tracking & Verification</SectionTitle>
                <SectionSubtitle color={colors.textMedium}>Set up read receipts and comprehension checks</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FeatureGrid>
              <FeatureCard
                borderColor={colors.borderGray}
                hoverBorderColor={colors.blue}
              >
                <FeatureIconWrapper bgColor={`${colors.blue}26`} iconColor={colors.blue}>
                  <Mail size={24} />
                </FeatureIconWrapper>
                <FeatureTitle color={colors.textDark}>Read Receipt</FeatureTitle>
                <FeatureDescription color={colors.textMedium}>
                  Track who has opened the notification
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard
                borderColor={colors.borderGray}
                hoverBorderColor={colors.blue}
              >
                <FeatureIconWrapper bgColor={`${colors.blue}26`} iconColor={colors.blue}>
                  <CheckCircle size={24} />
                </FeatureIconWrapper>
                <FeatureTitle color={colors.textDark}>Comprehension Check</FeatureTitle>
                <FeatureDescription color={colors.textMedium}>
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

export default ChangeNotificationCreate;
