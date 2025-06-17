import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle } from 'react-icons/fi';

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
}

interface ModernSurveyThankYouProps {
  survey: Survey;
  color?: string;
  onRestart?: () => void;
}

const ThankYouContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
  animation: fadeIn 0.6s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ThankYouCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: ${props => props.color || '#552a47'};
  }
  
  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const IconWrapper = styled.div<{ iconColor?: string }>`
  font-size: 80px;
  color: ${props => props.iconColor || '#552a47'};
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;
  
  @keyframes scaleIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @media (max-width: 768px) {
    font-size: 64px;
  }
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Message = styled.p`
  font-size: 18px;
  color: #555;
  margin: 0 0 32px 0;
  line-height: 1.6;
  max-width: 500px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Logo = styled.img`
  max-width: 160px;
  max-height: 60px;
  margin-top: 32px;
  opacity: 0.8;
`;

const ActionButton = styled.button<{ btnColor?: string }>`
  background: ${props => props.btnColor || '#552a47'};
  color: white;
  border: none;
  border-radius: 50px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
  
  &:hover {
    background: ${props => props.btnColor ? `${props.btnColor}dd` : '#6d3a5e'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ModernSurveyThankYou: React.FC<ModernSurveyThankYouProps> = ({ survey, color, onRestart }) => {
  const handleRestart = () => {
    // Call the onRestart callback if provided
    if (onRestart) {
      onRestart();
    }
  };

  return (
    <ThankYouContainer>
      <ThankYouCard color={color}>
        <IconWrapper iconColor={color}>
          <FiCheckCircle />
        </IconWrapper>
        
        <Title>Thank You!</Title>
        
        <Message>
          Your responses have been successfully submitted. We appreciate your time and feedback.
        </Message>
        
        <ActionButton 
          onClick={handleRestart}
          btnColor={color}
        >
          Restart Survey
        </ActionButton>
        
        {survey.logo && <Logo src={survey.logo} alt="Survey Logo" />}
      </ThankYouCard>
    </ThankYouContainer>
  );
};

export default ModernSurveyThankYou;
