import React from 'react';
import styled from 'styled-components';
import { FaExclamationCircle } from 'react-icons/fa';

interface ResponseLimitMessageProps {
  survey: any;
  currentCount: number;
  limit: number;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 550px;
  text-align: center;
  width: 100%;
  margin: 0 auto;
`;

const Logo = styled.img`
  max-height: 80px;
  margin: 0 auto 20px;
  display: block;
`;

const Title = styled.h1`
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const LimitIcon = styled.div`
  color: #f39c12;
  margin: 20px auto;
  display: flex;
  justify-content: center;
`;

const Heading = styled.h2`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const Message = styled.p`
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
  text-align: center;
`;

const SecondaryMessage = styled.p`
  font-size: 14px;
  color: #777;
  margin-top: 30px;
  text-align: center;
`;

const ResponseCount = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin: 20px auto;
  font-size: 18px;
  color: #555;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  max-width: 300px;
  width: 100%;
`;

const Count = styled.span`
  font-weight: 600;
  color: #333;
`;

const ResponseLimitMessage: React.FC<ResponseLimitMessageProps> = ({ 
  survey, 
  currentCount, 
  limit 
}) => {
  return (
    <Container>
      <Card>
        {survey.logo && <Logo src={survey.logo} alt="Survey Logo" />}
        <Title>{survey.title || 'Survey'}</Title>
        
        <LimitIcon>
          <FaExclamationCircle size={48} />
        </LimitIcon>
        
        <Heading>Survey Response Limit Reached</Heading>
        
        <ResponseCount>
          <Count>{currentCount}</Count> of <Count>{limit}</Count> responses collected
        </ResponseCount>
        
        <Message>
          Thank you for your interest in this survey. We have reached the maximum number 
          of responses for this survey.
        </Message>
        
        <Message>
          The survey administrator has set a limit of {limit} responses, which has now been reached.
        </Message>
        
        <SecondaryMessage>
          Please contact the survey administrator if you have any questions or if you believe you should have access to this survey.
        </SecondaryMessage>
      </Card>
    </Container>
  );
};

export default ResponseLimitMessage;
