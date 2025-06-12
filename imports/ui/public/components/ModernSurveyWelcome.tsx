import React from 'react';
import styled from 'styled-components';
import { FiArrowRight } from 'react-icons/fi';

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
}

interface ModernSurveyWelcomeProps {
  survey: Survey;
  onStart: () => void;
}

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  animation: fadeIn 0.6s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const WelcomeCard = styled.div<{ color?: string }>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WelcomeImageSection = styled.div<{ featuredImage?: string }>`
  background-image: ${props => props.featuredImage ? `url(${props.featuredImage})` : 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    min-height: 200px;
  }
`;

const WelcomeContentSection = styled.div<{ color?: string }>`
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 60px;
    background: ${props => props.color || '#552a47'};
  }
  
  @media (max-width: 768px) {
    padding: 32px;
  }
`;

const LogoSmall = styled.img`
  max-width: 120px;
  max-height: 60px;
  margin-bottom: 24px;
  object-fit: contain;
  position: relative;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: #222;
  margin: 0 0 24px 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Description = styled.div`
  font-size: 18px;
  color: #444;
  margin-bottom: 40px;
  line-height: 1.7;
  
  p {
    margin: 0 0 16px 0;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 32px;
  }
`;

const StartButton = styled.button<{ btnColor?: string }>`
  background: ${props => props.btnColor || '#552a47'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 17px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    filter: brightness(1.05);
  }
  
  &:active {
    transform: translateY(0);
    filter: brightness(0.95);
  }
  
  @media (max-width: 768px) {
    padding: 14px 28px;
    font-size: 16px;
    width: 100%;
    justify-content: center;
  }
`;

const SurveyInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 14px;
  color: #666;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ImageOverlayText = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  position: relative;
  z-index: 2;
  padding: 0 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const PrivacyNote = styled.p`
  font-size: 14px;
  color: #777;
  margin-top: 24px;
  max-width: 400px;
`;

const ModernSurveyWelcome: React.FC<ModernSurveyWelcomeProps> = ({ survey, onStart }) => {
  return (
    <WelcomeContainer>
      <WelcomeCard color={survey.color}>
        <WelcomeImageSection featuredImage={survey.featuredImage || survey.image}>
          <ImageOverlayText>
            {survey.title.split(' ').slice(0, 2).join(' ')}
          </ImageOverlayText>
        </WelcomeImageSection>
        
        <WelcomeContentSection color={survey.color}>
          {survey.logo && <LogoSmall src={survey.logo} alt={survey.title} />}
          
          <Title>{survey.title}</Title>
          
          {survey.description && (
            <Description dangerouslySetInnerHTML={{ __html: survey.description }} />
          )}
          
          <StartButton btnColor={survey.color} onClick={onStart}>
            Start Survey <FiArrowRight size={18} />
          </StartButton>
          
          <SurveyInfo>
            <InfoItem>
              <FiArrowRight size={14} /> Estimated time: 5-10 minutes
            </InfoItem>
          </SurveyInfo>
          
          <PrivacyNote>
            Your responses are anonymous and confidential.
          </PrivacyNote>
        </WelcomeContentSection>
      </WelcomeCard>
    </WelcomeContainer>
  );
};

export default ModernSurveyWelcome;
