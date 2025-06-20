import React from 'react';
import styled from 'styled-components';

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const LoaderCard = styled.div`
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

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  border: 4px solid rgba(85, 42, 71, 0.1);
  border-radius: 50%;
  border-top-color: #552a47;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: 500;
`;

const SubText = styled.p`
  font-size: 14px;
  color: #666;
  margin-top: 12px;
`;

const ModernSurveyLoader: React.FC = () => {
  return (
    <LoaderContainer>
      <LoaderCard>
        <Spinner />
        <LoadingText>Loading Survey</LoadingText>
        <SubText>Please wait while we prepare your survey experience...</SubText>
      </LoaderCard>
    </LoaderContainer>
  );
};

export default ModernSurveyLoader;
