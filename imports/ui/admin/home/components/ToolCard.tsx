import React from 'react';
import styled from 'styled-components';
import { ToolData } from '../data/toolsData';

interface ToolCardProps {
  tool: ToolData;
  onClick?: () => void;
}

const Card = styled.div`
  background: white;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 0px 2px;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(107, 142, 157, 0.3);
  }
`;

const CardHeader = styled.div<{ bgColor?: string }>`
  background: ${props => props.bgColor || '#6b8e9d'};
  padding: 32px;
  color: white;
  position: relative;
`;

const Badge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.25);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.3;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.95;
`;

const CardContent = styled.div`
  padding: 32px;
  background: white;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 28px;
  padding: 20px;
  background: #f5f7f8;
  border-radius: 8px;
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
`;

const StatValue = styled.div<{ isSuccessRate?: boolean }>`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1;
  color: ${props => props.isSuccessRate ? '#4caf50' : '#8ba5b0'};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
`;

const FeaturesSection = styled.div`
  margin-bottom: 24px;
  flex-grow: 1;
`;

const FeaturesTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  color: #2c3e50;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  font-size: 13px;
  margin-bottom: 8px;
  padding-left: 24px;
  position: relative;
  color: #5a6c7d;
  
  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    width: 18px;
    height: 18px;
    background: #6b8e9d;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: white;
  }
`;

const TimeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f7f8;
  border-radius: 6px;
`;

const TimeItem = styled.div`
  flex: 1;
  text-align: center;
`;

const TimeLabel = styled.div`
  font-size: 11px;
  margin-bottom: 6px;
  color: #6c757d;
  font-weight: 500;
`;

const TimeValue = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #2c3e50;
`;

const DeployButton = styled.button<{ bgColor?: string }>`
  background: ${props => props.bgColor || '#6b8e9d'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <Card onClick={onClick}>
      <CardHeader bgColor={tool.cardColor}>
        <Badge>{tool.badge}</Badge>
        <IconWrapper>{tool.icon}</IconWrapper>
        <Title>{tool.title}</Title>
        <Description>{tool.description}</Description>
      </CardHeader>
      
      <CardContent>
        <StatsContainer>
          <StatItem>
            <StatValue isSuccessRate={false}>{tool.stats.deployments}</StatValue>
            <StatLabel>Deployments</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue isSuccessRate={true}>{tool.stats.successRate}%</StatValue>
            <StatLabel>Success Rate</StatLabel>
          </StatItem>
        </StatsContainer>
        
        <FeaturesSection>
          <FeaturesTitle>KEY FEATURES</FeaturesTitle>
          <FeaturesList>
            {tool.features.map((feature, index) => (
              <FeatureItem key={index}>{feature}</FeatureItem>
            ))}
          </FeaturesList>
        </FeaturesSection>
        
        <div>
          <TimeInfo>
            <TimeItem>
              <TimeLabel>Setup Time</TimeLabel>
              <TimeValue>{tool.setupTime}</TimeValue>
            </TimeItem>
            <TimeItem>
              <TimeLabel>Time to Insights</TimeLabel>
              <TimeValue>{tool.timeToInsights}</TimeValue>
            </TimeItem>
          </TimeInfo>
          
          <DeployButton bgColor={tool.cardColor}>{tool.buttonText}</DeployButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;
