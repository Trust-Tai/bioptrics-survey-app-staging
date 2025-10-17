import React, { useState } from 'react';
import styled from 'styled-components';
import { FaInfoCircle } from 'react-icons/fa';
import { ChangeNoticeData } from '../../../types/dashboard.types';
import { StatusBadge } from '../../shared/StatusBadge';
import { ProgressBar } from '../../shared/ProgressBar';
import { Button } from '../../shared/Button';

interface NoticeCardProps {
  data: ChangeNoticeData;
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

const Category = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const ProgressSection = styled.div`
  margin: 16px 0;
`;

const ProgressHeader = styled.div`
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

const UnderstoodSection = styled.div`
  margin: 12px 0;
`;

const UnderstoodHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const UnderstoodLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const UnderstoodLabel = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: 500;
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

const UnderstoodValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #666;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

export const NoticeCard: React.FC<NoticeCardProps> = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const getProgressColor = (status: string, progress: number) => {
    if (status === 'at-risk') return '#e74c3c';
    if (status === 'needs-attention') return '#f39c12';
    return '#27ae60';
  };

  const getUnderstoodColor = (rate: number) => {
    if (rate >= 80) return '#27ae60';
    if (rate >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <CardContainer>
      <Header>
        <TitleSection>
          <Title>{data.title}</Title>
          <Category>{data.category}</Category>
        </TitleSection>
        <StatusBadge status={data.status} size="small" />
      </Header>

      <ProgressSection>
        <ProgressHeader>
          <ProgressLabel>{data.progress}% Complete</ProgressLabel>
        </ProgressHeader>
        <ProgressBar
          progress={data.progress}
          height="12px"
          fillColor={getProgressColor(data.status, data.progress)}
        />
      </ProgressSection>

      <UnderstoodSection>
        <UnderstoodHeader>
          <UnderstoodLabelContainer>
            <UnderstoodLabel>Understood Rate</UnderstoodLabel>
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
                Percentage of employees who have read and understood this notice
              </Tooltip>
            </InfoIconContainer>
          </UnderstoodLabelContainer>
          <UnderstoodValue>{data.understoodRate}%</UnderstoodValue>
        </UnderstoodHeader>
        <ProgressBar
          progress={data.understoodRate}
          height="8px"
          fillColor={getUnderstoodColor(data.understoodRate)}
        />
      </UnderstoodSection>

      <Footer>
        <Button variant="primary" size="small">
          View Details
        </Button>
      </Footer>
    </CardContainer>
  );
};
