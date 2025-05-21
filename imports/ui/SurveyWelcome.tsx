import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 2px 24px #e5d6e033;
  padding: 36px 24px 28px 24px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 600px) {
    padding: 48px 44px 36px 44px;
    max-width: 440px;
  }
`;

const Logo = styled.img`
  width: 140px;
  margin-bottom: 22px;
`;

const Illustration = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #fffbea;
  object-fit: cover;
  margin-bottom: 22px;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  font-weight: 800;
  color: #28211e;
  text-align: center;
  margin-bottom: 16px;

  @media (min-width: 600px) {
    font-size: 1.5rem;
  }
`;

const Description = styled.p`
  color: #6e5a67;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 28px;
  line-height: 1.5;
`;

const StartButton = styled.button<{ btncolor?: string }>`
  background: ${props => props.btncolor || '#552a47'};
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 14px 0;
  width: 100%;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 18px;
  cursor: pointer;
`;

const Privacy = styled.div`
  font-size: 0.92rem;
  color: #8a7a85;
  text-align: center;
  margin-top: 8px;
`;

interface SurveyWelcomeProps {
  onStart: () => void;
  previewData: {
    title: string;
    description: string;
    logo?: string;
    image?: string;
    color?: string;
  };
  disabled?: boolean;
}

const SurveyWelcome: React.FC<SurveyWelcomeProps> = ({ onStart, previewData, disabled }) => {
  console.log('[SurveyWelcome] rendered, disabled:', disabled, 'onStart:', typeof onStart);
  return (
    <Wrapper>
      <Card>
        <Logo src={previewData?.logo || "https://s28.q4cdn.com/380852864/files/design/logo.svg"} alt="newgold logo" />
        <Illustration src={previewData?.image || "/illustration.png"} alt="Survey Illustration" />
        <Title>{previewData?.title || "Welcome to the New Gold Employee Survey"}</Title>
        <Description>
          {previewData?.description ? (
            <span dangerouslySetInnerHTML={{ __html: previewData.description }} />
          ) : (
            <>Your feedback is important in helping us improve our workplace. This survey is anonymous and takes about 5-7 minutes to complete. Please answer honestly – we value your input.</>
          )}
        </Description>
        <StartButton
          btncolor={previewData?.color}
          onClick={e => {
            console.log('[SurveyWelcome] StartButton clicked, disabled:', disabled);
            if (onStart) onStart();
          }}
          disabled={!!disabled}
        >
          START SURVEY
        </StartButton>
        <Privacy>
          <span role="img" aria-label="info">ⓘ</span> Your responses are completely anonymous<br />and cannot be traced back to you
        </Privacy>
      </Card>
    </Wrapper>
  );
};

export default SurveyWelcome;