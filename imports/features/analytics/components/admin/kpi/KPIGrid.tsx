import React from 'react';
import styled from 'styled-components';
import { IconType } from 'react-icons';

/**
 * Interface for KPI data displayed in the grid
 */
export interface KPIData {
  participationRate: {
    value: number;
    icon: IconType;
  };
  engagementScore: {
    value: string | number;
    icon: IconType;
  };
  responsesCount: {
    value: number;
    icon: IconType;
  };
  daysRemaining: {
    value: number;
    icon: IconType;
  };
}

/**
 * Props for the KPIGrid component
 */
export interface KPIGridProps {
  data: KPIData;
  isLoading: boolean;
  isBlurred: boolean;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ isBlurred: boolean }>`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  filter: ${props => props.isBlurred ? 'blur(4px)' : 'none'};
  pointer-events: ${props => props.isBlurred ? 'none' : 'auto'};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.div`
  color: #666;
  font-size: 14px;
  font-weight: 500;
`;

const IconContainer = styled.div`
  color: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(85, 42, 71, 0.1);
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #1c1c1c;
  margin-top: auto;
`;

const ChangeIndicator = styled.div<{ isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.isPositive ? '#28a745' : '#dc3545'};
  margin-top: 4px;
`;

const LoadingPlaceholder = styled.div`
  height: 28px;
  background: #f0f0f0;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

/**
 * KPIGrid component for displaying key performance indicators in a grid layout
 * Shows participation rate, engagement score, response count, and days remaining
 */
const KPIGrid: React.FC<KPIGridProps> = ({ data, isLoading, isBlurred }) => {
  return (
    <Container>
      <Card isBlurred={isBlurred}>
        <CardHeader>
          <Title>Participation Rate</Title>
          <IconContainer>
            {data.participationRate.icon && <data.participationRate.icon />}
          </IconContainer>
        </CardHeader>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <Value>{data.participationRate.value}%</Value>
            <ChangeIndicator isPositive={true}>
              +2.5% from last month
            </ChangeIndicator>
          </>
        )}
      </Card>
      
      <Card isBlurred={isBlurred}>
        <CardHeader>
          <Title>Engagement Score</Title>
          <IconContainer>
            {data.engagementScore.icon && <data.engagementScore.icon />}
          </IconContainer>
        </CardHeader>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <Value>{data.engagementScore.value}</Value>
            <ChangeIndicator isPositive={true}>
              +0.3 from last month
            </ChangeIndicator>
          </>
        )}
      </Card>
      
      <Card isBlurred={isBlurred}>
        <CardHeader>
          <Title>Total Responses</Title>
          <IconContainer>
            {data.responsesCount.icon && <data.responsesCount.icon />}
          </IconContainer>
        </CardHeader>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <Value>{data.responsesCount.value}</Value>
            <ChangeIndicator isPositive={true}>
              +45 from last month
            </ChangeIndicator>
          </>
        )}
      </Card>
      
      <Card isBlurred={isBlurred}>
        <CardHeader>
          <Title>Days Remaining</Title>
          <IconContainer>
            {data.daysRemaining.icon && <data.daysRemaining.icon />}
          </IconContainer>
        </CardHeader>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <Value>{data.daysRemaining.value}</Value>
            <ChangeIndicator isPositive={false}>
              Current survey period
            </ChangeIndicator>
          </>
        )}
      </Card>
    </Container>
  );
};

export default KPIGrid;
