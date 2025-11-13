import React from 'react';
import styled from 'styled-components';
import { colors } from '../theme/colors';

const HelpContainer = styled.section`
  background: ${colors.peachBg};
  border-radius: 12px;
  padding: 48px;
  margin-top: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textDark};
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${colors.textMedium};
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
        background: ${colors.blue};
        color: white;
        
        &:hover {
          background: ${colors.hover.blue};
        }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background: ${colors.orange};
        color: white;
        
        &:hover {
          background: ${colors.hover.orange};
        }
      `;
    } else {
      return `
        background: ${colors.yellow};
        color: ${colors.textDark};
        border: none;
        
        &:hover {
          background: ${colors.hover.yellow};
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
