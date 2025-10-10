import React from 'react';
import styled from 'styled-components';
import { FiAlertTriangle, FiLock, FiClock, FiXCircle } from 'react-icons/fi';

interface ModernSurveyErrorProps {
  message: string;
  title?: string;
  icon?: 'error' | 'lock' | 'clock' | 'closed';
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
`;

const ErrorCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
  padding: 50px 40px;
  width: 90%;
  max-width: 480px;
  text-align: center;
  animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #dc3545 0%, #ff8a80 100%);
  }
  
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 28px;
  color: #dc3545;
  font-size: 64px;
  display: flex;
  justify-content: center;
  animation: pulseIcon 2s infinite ease-in-out;
  
  @keyframes pulseIcon {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const ErrorTitle = styled.h2`
  font-size: 28px;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const ErrorMessage = styled.p`
  font-size: 18px;
  color: #666;
  margin: 0 0 30px 0;
  line-height: 1.6;
`;

const BackButton = styled.button`
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.15);
  
  &:hover {
    background: #1a252f;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(44, 62, 80, 0.25);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.15);
  }
`;

const ModernSurveyError: React.FC<ModernSurveyErrorProps> = ({ 
  message, 
  title = "Something went wrong",
  icon = "error"
 }) => {
  const handleGoBack = () => {
    window.history.back();
  };

  // No need for toggle functionality as we're always showing Survey Expired

  return (
    <ErrorContainer>
      <ErrorCard>
        <IconWrapper>
          {icon === 'lock' && <FiLock />}
          {icon === 'clock' && <FiClock />}
          {icon === 'closed' && <FiXCircle />}
          {icon === 'error' && <FiAlertTriangle />}
        </IconWrapper>
        <ErrorTitle>{title}</ErrorTitle>
        <ErrorMessage>{message}</ErrorMessage>
        {/* <BackButton onClick={handleGoBack}>
          Go Back
        </BackButton> */}
      </ErrorCard>
    </ErrorContainer>
  );
};

export default ModernSurveyError;
