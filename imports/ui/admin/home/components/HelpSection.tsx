import React from 'react';
import styled from 'styled-components';

const HelpContainer = styled.section`
  background: white;
  border-radius: 12px;
  padding: 48px;
  margin-top: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin: 0 0 32px 0;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => {
    if (props.variant === 'primary') {
      return `
        background: #5a8596;
        color: white;
        
        &:hover {
          background: #5a7d8c;
        }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background: #f5f7f8;
        color: #2c3e50;
        
        &:hover {
          background: #e8ecef;
        }
      `;
    } else {
      return `
        background: transparent;
        color: #6c757d;
        border: 1px solid #dee2e6;
        
        &:hover {
          border-color: #6b8e9d;
          color: #6b8e9d;
        }
      `;
    }
  }}
`;

const HelpSection: React.FC = () => {
  const handleScheduleDemo = () => {
    console.log('Schedule Demo clicked');
  };

  const handleViewResources = () => {
    console.log('View Resources clicked');
  };

  const handleContactSupport = () => {
    console.log('Contact Support clicked');
  };

  return (
    <HelpContainer>
      <Title>Need Help Getting Started?</Title>
      <Subtitle>
        Our team is here to support you every step of the way. Schedule a walkthrough or explore our resources.
      </Subtitle>
      
      <ButtonGroup>
        <Button variant="primary" onClick={handleScheduleDemo}>
          Schedule Demo
        </Button>
        <Button variant="secondary" onClick={handleViewResources}>
          View Resources
        </Button>
        <Button variant="outline" onClick={handleContactSupport}>
          Contact Support
        </Button>
      </ButtonGroup>
    </HelpContainer>
  );
};

export default HelpSection;
