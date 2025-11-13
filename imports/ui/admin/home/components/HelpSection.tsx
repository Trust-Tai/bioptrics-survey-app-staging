import React from 'react';
import styled from 'styled-components';
import { useDynamicColors } from '../theme/useDynamicColors';

const HelpContainer = styled.section<{ bgColor: string }>`
  background: ${props => props.bgColor};
  border-radius: 12px;
  padding: 48px;
  margin-top: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2<{ color: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p<{ color: string }>`
  font-size: 16px;
  color: ${props => props.color};
  margin: 0 0 32px 0;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ 
  variant?: 'primary' | 'secondary' | 'outline';
  bgColor: string;
  hoverColor: string;
  textColor: string;
}>`
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: ${props => props.bgColor};
  color: ${props => props.textColor};
  
  &:hover {
    background: ${props => props.hoverColor};
  }
`;

const HelpSection: React.FC = () => {
  const colors = useDynamicColors();
  
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
    <HelpContainer bgColor={colors.peachBg}>
      <Title color={colors.textDark}>Need Help Getting Started?</Title>
      <Subtitle color={colors.textMedium}>
        Our team is here to support you every step of the way. Schedule a walkthrough or explore our resources.
      </Subtitle>
      
      <ButtonGroup>
        <Button 
          variant="primary" 
          bgColor={colors.blue}
          hoverColor={colors.hover.blue}
          textColor="white"
          onClick={handleScheduleDemo}
        >
          Schedule Demo
        </Button>
        <Button 
          variant="secondary" 
          bgColor={colors.orange}
          hoverColor={colors.hover.orange}
          textColor="white"
          onClick={handleViewResources}
        >
          View Resources
        </Button>
        <Button 
          variant="outline" 
          bgColor={colors.yellow}
          hoverColor={colors.hover.yellow}
          textColor={colors.textDark}
          onClick={handleContactSupport}
        >
          Contact Support
        </Button>
      </ButtonGroup>
    </HelpContainer>
  );
};

export default HelpSection;
