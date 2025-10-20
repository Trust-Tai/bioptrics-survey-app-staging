import React from 'react';
import styled from 'styled-components';
import { InsightAlertData } from '../../../types/dashboard.types';

const SectionContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  flex: 1;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '💡';
    font-size: 16px;
  }
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AlertItem = styled.div<{ severity: string }>`
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  }};
  background: ${props => {
    switch (props.severity) {
      case 'high': return '#fdf2f2';
      case 'medium': return '#fef9e7';
      case 'low': return '#ebf3fd';
      default: return '#f8f9fa';
    }
  }};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const AlertTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const AlertDescription = styled.p`
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const SeverityBadge = styled.span<{ severity: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  
  background: ${props => {
    switch (props.severity) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  }};
  color: white;
`;

interface InsightsAlertsProps {
  className?: string;
}

export const InsightsAlerts: React.FC<InsightsAlertsProps> = ({ className }) => {
  // Mock data - replace with real data from your backend
  const alertsData: InsightAlertData[] = [
    {
      id: '1',
      title: 'Policy 35 Below 50%',
      description: 'Equipment Maintenance policy needs immediate attention',
      severity: 'high',
      type: 'policy'
    },
    {
      id: '2',
      title: '3 Notices Expiring Soon',
      description: 'Q4 updates deadline approaching',
      severity: 'medium',
      type: 'notice'
    },
    {
      id: '3',
      title: 'Psychological WPS Declining',
      description: 'Down 8% from last assessment',
      severity: 'medium',
      type: 'psychological'
    }
  ];

  return (
    <SectionContainer className={className}>
      <SectionTitle>Insights & Alerts</SectionTitle>
      
      <AlertsList>
        {alertsData.map((alert) => (
          <AlertItem key={alert.id} severity={alert.severity}>
            <SeverityBadge severity={alert.severity}>
              {alert.severity}
            </SeverityBadge>
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </AlertItem>
        ))}
      </AlertsList>
    </SectionContainer>
  );
};
