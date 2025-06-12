import React from 'react';
import styled from 'styled-components';
import { FiAlertTriangle } from 'react-icons/fi';

interface ModernSurveyErrorProps {
  message: string;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const ErrorCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 24px;
  color: #dc3545;
  font-size: 48px;
  display: flex;
  justify-content: center;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
`;

const BackButton = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #6d3a5e;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ModernSurveyError: React.FC<ModernSurveyErrorProps> = ({ message }) => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <ErrorContainer>
      <ErrorCard>
        <IconWrapper>
          <FiAlertTriangle />
        </IconWrapper>
        <ErrorTitle>Something went wrong</ErrorTitle>
        <ErrorMessage>{message}</ErrorMessage>
        <BackButton onClick={handleGoBack}>
          Go Back
        </BackButton>
      </ErrorCard>
    </ErrorContainer>
  );
};

export default ModernSurveyError;
