import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const HeroContainer = styled.section`
  padding: 60px 0 40px 0;
`;

const WelcomeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(85, 42, 71, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--color-primary, #552a47);
  font-weight: 500;
`;

const Icon = styled.span`
  font-size: 16px;
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 20px 0;
  line-height: 1.2;
`;

const Description = styled.div`
  font-size: 16px;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 700px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const PrimaryButton = styled.button`
  background: var(--color-primary, #552a47);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #441f38;
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
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
    border-color: var(--color-primary, #552a47);
    color: var(--color-primary, #552a47);
  }
`;

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleViewDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleTakeTour = () => {
    console.log('Take a Tour clicked');
    // Add tour functionality here
  };

  return (
    <HeroContainer>
      <WelcomeBadge>
        <Icon>🏠</Icon>
        Welcome to Bioptrics Pulse
      </WelcomeBadge>
      
      <Title>Build a Culture Where Everyone Thrives</Title>
      
      <Description>
        Transform your workplace with data-driven insights and proven methodologies.
        <br />
        Each tool below guides you through best practices, making culture development simple and impactful.
      </Description>
      
      <ButtonGroup>
        <PrimaryButton onClick={handleViewDashboard}>View Dashboard</PrimaryButton>
        <SecondaryButton onClick={handleTakeTour}>
          <Icon>▶</Icon>
          Take a Tour
        </SecondaryButton>
      </ButtonGroup>
    </HeroContainer>
  );
};

export default HeroSection;
