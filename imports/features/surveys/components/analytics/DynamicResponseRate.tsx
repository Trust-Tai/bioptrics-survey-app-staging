import React from 'react';
import styled from 'styled-components';
import { FaPercentage } from 'react-icons/fa';
import { useResponseRateData } from '../../hooks/useResponseRateData';

interface DynamicResponseRateProps {
  surveyId: string;
  className?: string;
}

const Card = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-top: 16px;
`;

const Header = styled.h3`
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f8f0f7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #552a47);
`;

const DataContainer = styled.div`
  flex: 1;
`;

const RateValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const TrendIndicator = styled.div<{ trend: 'positive' | 'negative' | 'neutral' }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => 
    props.trend === 'positive' ? '#4caf50' : 
    props.trend === 'negative' ? '#f44336' : 
    '#9e9e9e'
  };
  
  span {
    color: #64748b;
    font-weight: 400;
  }
`;

export const DynamicResponseRate: React.FC<DynamicResponseRateProps> = ({ surveyId, className }) => {
  const { rate, trend, isLoading, error } = useResponseRateData(surveyId);
  
  const formatTrend = (value: number) => {
    return value > 0 ? `+${value}` : value.toString();
  };
  
  return (
    <Card className={className}>
      <Header>Dynamic Response Rate</Header>
      <Content>
        <IconContainer>
          <FaPercentage size={24} />
        </IconContainer>
        <DataContainer>
          {isLoading ? (
            <RateValue>Loading...</RateValue>
          ) : error ? (
            <RateValue>Error loading data</RateValue>
          ) : (
            <>
              <RateValue>{rate}%</RateValue>
              <TrendIndicator trend={trend.direction}>
                {formatTrend(trend.value)}% <span>vs prev. period</span>
              </TrendIndicator>
            </>
          )}
        </DataContainer>
      </Content>
    </Card>
  );
};
