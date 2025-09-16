import React, { useState } from 'react';
import styled from 'styled-components';

interface ConsentScreenProps {
  surveyTitle?: string;
  logo?: string;
  consentText?: {
    purpose?: string;
    dataCollection?: string;
    dataUse?: string;
    confidentiality?: string;
    contact?: string;
  };
  privacyNoticeUrl?: string;
  onConsent: () => void;
}

const ConsentScreen: React.FC<ConsentScreenProps> = ({
  surveyTitle = 'Employee Engagement Survey',
  logo = '/bioptrics_fixed_black.png',
  consentText = {
    purpose: 'This survey is designed to gather feedback to improve our services and workplace environment.',
    dataCollection: 'We will collect your responses to the survey questions. If this survey is anonymous, no personally identifiable information will be linked to your responses.',
    dataUse: 'Your responses will be analyzed in aggregate to identify trends and areas for improvement. Individual responses will only be viewed by authorized research personnel.',
    confidentiality: 'Your responses will be kept confidential and will only be reported in aggregate form where individual responses cannot be identified.',
    contact: 'If you have questions about this survey or your rights as a participant, please contact our research team.'
  },
  privacyNoticeUrl = '#',
  onConsent
}) => {
  const [hasConsented, setHasConsented] = useState(false);
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasConsented(e.target.checked);
  };
  
  const handleContinue = () => {
    if (hasConsented) {
      onConsent();
    }
  };
  
  return (
    <ConsentContainer>
      <Header>
        <Logo src={logo} alt="Company Logo" />
        <Title>{surveyTitle}</Title>
      </Header>
      
      <ConsentCard>
        <AnonymityNotice>
          <Icon>🔒</Icon>
          <NoticeText>This survey is anonymous. Your responses cannot be linked back to you personally.</NoticeText>
        </AnonymityNotice>
        
        <SectionTitle>Informed Consent</SectionTitle>
        
        <ConsentText>
          Thank you for participating in this survey. Your participation is voluntary and you may withdraw at any time.
        </ConsentText>
        
        <ConsentSection>
          <SectionLabel>**Purpose**:</SectionLabel>
          <SectionContent>{consentText.purpose}</SectionContent>
        </ConsentSection>
        
        <ConsentSection>
          <SectionLabel>**Data Collection**:</SectionLabel>
          <SectionContent>{consentText.dataCollection}</SectionContent>
        </ConsentSection>
        
        <ConsentSection>
          <SectionLabel>**Data Use**:</SectionLabel>
          <SectionContent>{consentText.dataUse}</SectionContent>
        </ConsentSection>
        
        <ConsentSection>
          <SectionLabel>**Confidentiality**:</SectionLabel>
          <SectionContent>{consentText.confidentiality}</SectionContent>
        </ConsentSection>
        
        <ConsentSection>
          <SectionLabel>**Contact**:</SectionLabel>
          <SectionContent>{consentText.contact}</SectionContent>
        </ConsentSection>
        
        <CheckboxContainer>
          <Checkbox 
            type="checkbox" 
            id="consent-checkbox" 
            checked={hasConsented} 
            onChange={handleCheckboxChange} 
          />
          <CheckboxLabel htmlFor="consent-checkbox">
            I have read and understand the above information and consent to participate in this survey
          </CheckboxLabel>
        </CheckboxContainer>
        
        <FooterContainer>
          <PrivacyLink href={privacyNoticeUrl} target="_blank" rel="noopener noreferrer">
            For more information, please see our Privacy Notice
          </PrivacyLink>
          
          <ContinueButton 
            onClick={handleContinue} 
            disabled={!hasConsented}
          >
            Continue to Survey
          </ContinueButton>
        </FooterContainer>
      </ConsentCard>
    </ConsentContainer>
  );
};

// Styled components
const ConsentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #552A47;
  margin: 0;
`;

const ConsentCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 700px;
  width: 100%;
`;

const AnonymityNotice = styled.div`
  display: flex;
  align-items: center;
  background-color: #f2f9ee;
  border: 1px solid #8bc34a;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Icon = styled.span`
  font-size: 1.25rem;
  margin-right: 0.75rem;
`;

const NoticeText = styled.p`
  margin: 0;
  color: #333;
  font-size: 0.9rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1rem;
`;

const ConsentText = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: #333;
`;

const ConsentSection = styled.div`
  margin-bottom: 1rem;
`;

const SectionLabel = styled.p`
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #333;
`;

const SectionContent = styled.p`
  margin: 0;
  color: #555;
  line-height: 1.5;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 1.5rem 0;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  margin-right: 0.75rem;
`;

const CheckboxLabel = styled.label`
  line-height: 1.5;
  color: #333;
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const PrivacyLink = styled.a`
  color: #552A47;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ContinueButton = styled.button`
  background-color: #552A47;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #3d1e32;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export default ConsentScreen;
