import React from 'react';
import styled from 'styled-components';
import { PolicyComplianceData } from '../../../types/dashboard.types';
import { StatusBadge } from '../../shared/StatusBadge';
import { ProgressBar } from '../../shared/ProgressBar';
import { Button } from '../../shared/Button';

interface PolicyCardProps {
  data: PolicyComplianceData;
}

const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const ProgressSection = styled.div`
  margin: 16px 0;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const ProgressValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  position: relative;
`;

const TrendIndicator = styled.div<{ isPositive: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.isPositive ? '#00b894' : '#e74c3c'};
  background: ${props => props.isPositive ? '#00b89410' : '#e74c3c10'};
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
  width: fit-content;
  margin-left: auto;
  
  &::before {
    content: ${props => props.isPositive ? '"▲"' : '"▼"'};
    font-size: 8px;
  }
`;

const TeamInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
`;

const TeamIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666;
`;

export const PolicyCard: React.FC<PolicyCardProps> = ({ data }) => {
  const getProgressColor = (status: string, progress: number) => {
    if (status === 'at-risk') return '#e74c3c';
    if (status === 'needs-attention') return '#f39c12';
    return '#27ae60';
  };

  return (
    <CardContainer>
      <Header>
        <TitleSection>
          <Title>{data.title}</Title>
          <Subtitle>{data.subtitle}</Subtitle>
        </TitleSection>
        <StatusBadge status={data.status} size="small" />
      </Header>

      <ProgressSection>
        <ProgressHeader>
          <ProgressLabel>{data.progress}% Complete</ProgressLabel>
          {data.trend && (
            <TrendIndicator isPositive={data.trend.isPositive}>
              {data.trend.value}
            </TrendIndicator>
          )}
        </ProgressHeader>
        <ProgressBar
          progress={data.progress}
          height="12px"
          fillColor={getProgressColor(data.status, data.progress)}
        />
      </ProgressSection>

      <Footer>
        <TeamInfo>
          <TeamIcon>👥</TeamIcon>
          {data.team}
        </TeamInfo>
        <Button variant="ghost" size="small">
          View Details
        </Button>
      </Footer>
    </CardContainer>
  );
};
