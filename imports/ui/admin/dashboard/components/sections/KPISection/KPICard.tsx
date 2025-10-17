import React, { useState } from 'react';
import styled from 'styled-components';
import { FaInfoCircle } from 'react-icons/fa';
import { KPICardData } from '../../../types/dashboard.types';

interface KPICardProps {
  data: KPICardData;
  onClick?: () => void;
}

const CardContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: visible;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.color || 'linear-gradient(90deg, #552a47 0%, #7a4e7a 100%)'};
    border-radius: 16px 16px 0 0;
    z-index: 1;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const IconContainer = styled.div<{ color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${props => props.color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${props => props.color};
    font-size: 20px;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 160px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  flex: 1;
`;

const InfoIconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const InfoIcon = styled(FaInfoCircle)`
  font-size: 12px;
  color: #999;
  transition: color 0.2s ease;
  
  &:hover {
    color: #666;
  }
`;

const Tooltip = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: 100%;
  right: -10px;
  margin-bottom: 8px;
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: normal;
  max-width: 180px;
  min-width: 120px;
  z-index: 9999;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  line-height: 1.3;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 15px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #333;
  }
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
`;

const TrendContainer = styled.div<{ isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.isPositive ? '#00b894' : '#e74c3c'};
  margin-top: 4px;
  white-space: nowrap;
`;

const TrendIcon = styled.span<{ isPositive: boolean }>`
  font-size: 10px;
  
  &::before {
    content: ${props => props.isPositive ? '"▲"' : '"▼"'};
  }
`;

export const KPICard: React.FC<KPICardProps> = ({ data, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const IconComponent = data.icon;
  
  // Tooltip content based on the KPI type
  const getTooltipContent = (title: string) => {
    switch (title) {
      case 'Policy Compliance':
        return 'Percentage of policies that are fully compliant';
      case 'Change Notices Read':
        return 'Percentage of change notices read by employees';
      case 'WPS Maturity Avg':
        return 'Average maturity score for Whole Person Safety';
      case 'Items At Risk':
        return 'Number of items currently flagged as at risk';
      default:
        return 'Additional information about this metric';
    }
  };
  
  return (
    <CardContainer color={data.color} onClick={onClick}>
      <Header>
        <TitleContainer>
          <Title>{data.title}</Title>
          <InfoIconContainer
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
          >
            <InfoIcon />
            <Tooltip show={showTooltip}>
              {getTooltipContent(data.title)}
            </Tooltip>
          </InfoIconContainer>
        </TitleContainer>
        <IconContainer color={data.color}>
          <IconComponent />
        </IconContainer>
      </Header>
      
      <ValueContainer>
        <Value>{data.value}</Value>
        {data.trend && (
          <TrendContainer isPositive={data.trend.isPositive}>
            <TrendIcon isPositive={data.trend.isPositive} />
            {data.trend.value}
          </TrendContainer>
        )}
      </ValueContainer>
    </CardContainer>
  );
};
