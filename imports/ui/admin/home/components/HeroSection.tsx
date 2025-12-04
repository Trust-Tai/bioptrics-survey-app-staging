import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDynamicColors } from '../theme/useDynamicColors';

const HeroContainer = styled.section`
  padding: 60px 0 40px 0;
`;

const WelcomeBadge = styled.div<{ bgColor: string; textColor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.bgColor};
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 24px;
  font-size: 14px;
  color: ${props => props.textColor};
  font-weight: 500;
`;

const Icon = styled.span`
  font-size: 16px;
`;

const Title = styled.h1<{ color: string }>`
  font-size: 42px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 20px 0;
  line-height: 1.2;
`;

const Description = styled.div<{ color: string }>`
  font-size: 16px;
  color: ${props => props.color};
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 700px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const PrimaryButton = styled.button<{ bgColor: string; hoverColor: string }>`
  background: ${props => props.bgColor};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: ${props => props.hoverColor};
  }
`;

const SecondaryButton = styled.button<{ textColor: string; borderColor: string; hoverBorderColor: string; hoverTextColor: string }>`
  background: transparent;
  color: ${props => props.textColor};
  border: 1px solid ${props => props.borderColor};
  border-radius: 6px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    border-color: ${props => props.hoverBorderColor};
    color: ${props => props.hoverTextColor};
  }
`;

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const colors = useDynamicColors();

  const handleViewDashboard = () => {
    navigate('/admin/home');
  };

  const handleTakeTour = () => {
    console.log('Take a Tour clicked');
    // Add tour functionality here
  };

  return (
    <HeroContainer>
      <WelcomeBadge bgColor={colors.orange} textColor={colors.white}>
        Welcome to Bioptrics Pulse
      </WelcomeBadge>
      
      <Title color={colors.textDark}>Build a Culture Where Everyone Thrives</Title>
      
      <Description color={colors.textMedium}>
        Transform your workplace with data-driven insights and proven methodologies.
        <br />
        Each tool below guides you through best practices, making culture development simple and impactful.
      </Description>
      
      <ButtonGroup>
        <PrimaryButton 
          bgColor={colors.blue} 
          hoverColor={colors.hover.blue}
          onClick={handleViewDashboard}
        >
          View Dashboard
        </PrimaryButton>
        <SecondaryButton 
          textColor={colors.textMedium}
          borderColor={colors.borderGray}
          hoverBorderColor={colors.blue}
          hoverTextColor={colors.blue}
          onClick={handleTakeTour}
        >
          <Icon>▶</Icon>
          Take a Tour
        </SecondaryButton>
      </ButtonGroup>
    </HeroContainer>
  );
};

export default HeroSection;
