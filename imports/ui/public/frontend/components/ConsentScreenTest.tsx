import React, { useState } from 'react';
import ConsentScreen from './ConsentScreen';

const ConsentScreenTest: React.FC = () => {
  const [hasConsented, setHasConsented] = useState(false);
  
  const handleConsent = () => {
    setHasConsented(true);
    console.log('User has consented');
  };
  
  // Sample consent text with HTML formatting
  const consentText = `
    <p>Thank you for participating in this survey. Your participation is voluntary and you may withdraw at any time.</p>
    <p><strong>Purpose:</strong> This survey is designed to gather feedback to improve our services and workplace environment.</p>
    <p><strong>Data Collection:</strong> We will collect your responses to the survey questions. If this survey is anonymous, no personally identifiable information will be linked to your responses.</p>
    <p><strong>Data Use:</strong> Your responses will be analyzed in aggregate to identify trends and areas for improvement. Individual responses will only be viewed by authorized research personnel.</p>
    <p><strong>Confidentiality:</strong> Your responses will be kept confidential and will only be reported in aggregate form where individual responses cannot be identified.</p>
    <p><strong>Contact:</strong> If you have questions about this survey or your rights as a participant, please contact our research team.</p>
  `;
  
  // Sample consent configuration
  const consentConfig = {
    title: 'Informed Consent',
    showAnonymityNotice: true,
    anonymityNoticeText: 'This survey is anonymous. Your responses cannot be linked back to you personally.',
    privacyNoticeUrl: 'https://example.com/privacy',
    privacyLinkText: 'Privacy Notice',
    privacyInfoText: 'For more information, please see our',
    continueButtonText: 'Continue to Survey',
    checkboxText: 'I have read and understand the above information and consent to participate in this survey'
  };
  
  if (!hasConsented) {
    return (
      <ConsentScreen
        surveyTitle="Sample Survey"
        logo="/bioptrics_fixed_black.png"
        averageTime="5:30"
        consentText={consentText}
        consentConfig={consentConfig}
        onConsent={handleConsent}
      />
    );
  }
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Thank you for consenting!</h1>
      <p>You would now see the survey content.</p>
      <button 
        onClick={() => setHasConsented(false)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#552A47',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer'
        }}
      >
        Go back to consent screen
      </button>
    </div>
  );
};

export default ConsentScreenTest;
