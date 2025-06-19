import React from 'react';
import styled from 'styled-components';
import { IconType } from 'react-icons';

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
  completedSurveys: {
    value: number;
    icon: IconType;
  };
  timeToComplete: {
    value: number;
    icon: IconType;
  };
}

interface KPIGridProps {
  data: KPIData;
  isLoading: boolean;
  isBlurred: boolean;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
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
  align-items: center;
  text-align: center;
  filter: ${props => props.isBlurred ? 'blur(4px)' : 'none'};
  transition: filter 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #552a47;
  font-size: 24px;
`;

const Value = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 4px;
`;

const Label = styled.div`
  font-size: 14px;
  color: #666;
`;

const LoadingPlaceholder = styled.div`
  height: 32px;
  width: 80px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 4px;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

const KPIGrid: React.FC<KPIGridProps> = ({ data, isLoading, isBlurred }) => {
  return (
    <Container>
      {/* Participation Rate */}
      <Card isBlurred={isBlurred}>
        <IconWrapper>
          <data.participationRate.icon />
        </IconWrapper>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <Value>{data.participationRate.value}%</Value>
        )}
        <Label>Participation Rate</Label>
      </Card>
      
      {/* Engagement Score */}
      <Card isBlurred={isBlurred}>
        <IconWrapper>
          <data.engagementScore.icon />
        </IconWrapper>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <Value>{data.engagementScore.value}/5</Value>
        )}
        <Label>Avg Engagement Score</Label>
      </Card>
      
      {/* Responses Count */}
      <Card isBlurred={isBlurred}>
        <IconWrapper>
          <data.responsesCount.icon />
        </IconWrapper>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <Value>{data.responsesCount.value}</Value>
        )}
        <Label>Total Responses</Label>
      </Card>
      
      {/* Completed Surveys */}
      <Card isBlurred={isBlurred}>
        <IconWrapper>
          <data.completedSurveys.icon />
        </IconWrapper>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <Value>{data.completedSurveys.value}</Value>
        )}
        <Label>Surveys Completed</Label>
      </Card>
      
      {/* Time to Complete */}
      <Card isBlurred={isBlurred}>
        <IconWrapper>
          <data.timeToComplete.icon />
        </IconWrapper>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <Value>{data.timeToComplete.value}</Value>
        )}
        <Label>Time to Complete (min)</Label>
      </Card>
    </Container>
  );
};

export default KPIGrid;
