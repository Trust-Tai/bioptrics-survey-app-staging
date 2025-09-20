import React, { useState } from 'react';
import styled from 'styled-components';
import { FiLock } from 'react-icons/fi';
import HeaderBar from './HeaderBar';

interface ConsentScreenProps {
  surveyTitle?: string;
  logo?: string;
  averageTime?: string;
  consentText?: string; // Updated to accept HTML content
  consentConfig?: {
    title?: string;
    showAnonymityNotice: boolean;
    anonymityNoticeText: string;
    privacyNoticeUrl: string;
    privacyLinkText?: string;
    privacyInfoText?: string;
    continueButtonText?: string;
    checkboxText: string;
  };
  onConsent: () => void;
}

// Default consent text if none provided
const defaultConsentText = `
<p>Thank you for participating in this survey. Your participation is voluntary and you may withdraw at any time.</p>
<p><strong>Purpose:</strong> This survey is designed to gather feedback to improve our services and workplace environment.</p>
<p><strong>Data Collection:</strong> We will collect your responses to the survey questions. If this survey is anonymous, no personally identifiable information will be linked to your responses.</p>
<p><strong>Data Use:</strong> Your responses will be analyzed in aggregate to identify trends and areas for improvement. Individual responses will only be viewed by authorized research personnel.</p>
<p><strong>Confidentiality:</strong> Your responses will be kept confidential and will only be reported in aggregate form where individual responses cannot be identified.</p>
<p><strong>Contact:</strong> If you have questions about this survey or your rights as a participant, please contact our research team.</p>
`;

const ConsentScreen: React.FC<ConsentScreenProps> = ({
  surveyTitle = 'Employee Engagement Survey',
  logo = '/bioptrics_fixed_black.png',
  averageTime,
  consentText = defaultConsentText,
  consentConfig = {
    title: 'Informed Consent',
    showAnonymityNotice: true,
    anonymityNoticeText: 'This survey is anonymous. Your responses cannot be linked back to you personally.',
    privacyNoticeUrl: '#',
    privacyLinkText: 'Privacy Notice',
    privacyInfoText: 'For more information, please see our',
    continueButtonText: 'Continue to Survey',
    checkboxText: 'I have read and understand the above information and consent to participate in this survey'
  },
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
      <HeaderBar 
        surveyTitle={surveyTitle} 
        logo={logo}
        averageTime={averageTime}
      />
      
      <ContentWrapper>
        <ConsentCard>
          {consentConfig.showAnonymityNotice && (
            <AnonymityNotice>
              <Icon>
                <FiLock size={18} />
              </Icon>
              <NoticeText>{consentConfig.anonymityNoticeText}</NoticeText>
            </AnonymityNotice>
          )}
        
        <SectionTitle>{consentConfig.title}</SectionTitle>
        
        <div dangerouslySetInnerHTML={{ __html: consentText }} />
        
        <CheckboxContainer>
          <Checkbox 
            type="checkbox" 
            id="consent-checkbox" 
            checked={hasConsented} 
            onChange={handleCheckboxChange} 
          />
          <CheckboxLabel htmlFor="consent-checkbox">
            {consentConfig.checkboxText}
          </CheckboxLabel>
        </CheckboxContainer>
        
        <FooterContainer>
          <span>{consentConfig.privacyInfoText}  
          <PrivacyLink href={consentConfig.privacyNoticeUrl} target="_blank" rel="noopener noreferrer">
             {consentConfig.privacyLinkText}
          </PrivacyLink>
          </span>
          <ContinueButton 
            onClick={handleContinue} 
            disabled={!hasConsented}
          >
            {consentConfig.continueButtonText}
          </ContinueButton>
        </FooterContainer>
      </ConsentCard>
      </ContentWrapper>
    </ConsentContainer>
  );
};

// Styled components
const ConsentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  font-family: 'Jost', 'Inter', sans-serif;
     background: linear-gradient(180deg, #FFFFFF 0%, #F8F2F6 100%);
  width: 100%;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 80px 1rem 2rem 1rem;
  margin: 0 auto;
  max-width: 1200px;
`;

const ConsentCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.15);
  padding: 30px 25px;
  width: 800px;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const AnonymityNotice = styled.div`
  display: flex;
  align-items: center;
  background-color: rgb(168, 221, 71);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 20px 0;
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: #000;
`;

const NoticeText = styled.p`
  margin: 0;
  color: #000;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 600;
  color: rgb(34, 34, 34);
  margin: 20px 0;
  text-align: left;
  width: 100%;
  line-height: 1.2;
`;

const ConsentText = styled.p`
  margin-bottom: 20px;
  line-height: 26px;
  color: rgb(51, 51, 51);
  font-size: 16px;
  font-weight: 400;
  text-align: left;
  width: 100%;
  max-width: 600px;
`;

const ConsentSection = styled.div`
  margin-bottom: 20px;
  width: 100%;
  text-align: left;
`;

const SectionLabel = styled.span`
  font-weight: 600;
  margin: 0;
  color: rgb(51, 51, 51);
  font-size: 16px;
  text-align: left;
  display: inline;
  margin-right: 6px;
`;

const SectionContent = styled.span`
  margin: 0;
  color: rgb(51, 51, 51);
  line-height: 26px;
  font-size: 16px;
  font-weight: 400;
  text-align: left;
  display: inline;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 20px 0;
  padding-top: 20px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
   padding-bottom: 20px;
  width: 100%;
  justify-content: flex-start;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  margin-right: 0.75rem;
`;

const CheckboxLabel = styled.label`
  line-height: 1.5;
  color: rgb(102, 102, 102);
  font-size: 15px;
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const PrivacyLink = styled.a`
  color: #552A47;
  text-decoration: underline;
  font-size: 16px;
  font-weight: 600;
  padding-left: 5px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ContinueButton = styled.button`
  background-color: #552A47;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 40px;
  font-family: 'Inter', sans-serif;
  
  &:hover:not(:disabled) {
    background-color: #3d1e32;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export default ConsentScreen;
