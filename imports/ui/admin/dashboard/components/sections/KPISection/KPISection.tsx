import React from 'react';
import styled from 'styled-components';
import { KPICard } from './KPICard';
import { KPICardData } from '../../../types/dashboard.types';
import { 
  FaShieldAlt, 
  FaBookOpen, 
  FaHeart, 
  FaExclamationTriangle 
} from 'react-icons/fa';

const SectionContainer = styled.div`
  margin-bottom: 0px;
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

interface KPISectionProps {
  className?: string;
}

export const KPISection: React.FC<KPISectionProps> = ({ className }) => {
  // Mock data - replace with real data from your backend
  const kpiData: KPICardData[] = [
    {
      title: 'Policy Compliance',
      value: '78%',
      trend: {
        value: '+5% vs last month',
        isPositive: true
      },
      icon: FaShieldAlt,
      color: '#be5f41'
    },
    {
      title: 'Change Notices Read',
      value: '85%',
      trend: {
        value: '+12% vs last month',
        isPositive: true
      },
      icon: FaBookOpen,
      color: '#be5f41'
    },
    {
      title: 'WPS Maturity Avg',
      value: '72%',
      trend: {
        value: '+3% vs last month',
        isPositive: true
      },
      icon: FaHeart,
      color: '#be5f41'
    },
    {
      title: 'Items At Risk',
      value: '3',
      trend: {
        value: '-2 vs last month',
        isPositive: true
      },
      icon: FaExclamationTriangle,
      color: '#be5f41'
    }
  ];

  const handleKPIClick = (title: string) => {
    console.log(`KPI clicked: ${title}`);
    // Add navigation or modal logic here
  };

  return (
    <SectionContainer className={className}>
      <KPIGrid>
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            data={kpi}
            onClick={() => handleKPIClick(kpi.title)}
          />
        ))}
      </KPIGrid>
    </SectionContainer>
  );
};
