import React from 'react';
import styled from 'styled-components';
import { PolicyCard } from './PolicyCard';
import { Button } from '../../shared/Button';
import { PolicyComplianceData } from '../../../types/dashboard.types';
import { FaPlus } from 'react-icons/fa';

const SectionContainer = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '⚖️';
    font-size: 18px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const PolicyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

interface PolicyComplianceSectionProps {
  className?: string;
}

export const PolicyComplianceSection: React.FC<PolicyComplianceSectionProps> = ({ className }) => {
  // Mock data - replace with real data from your backend
  const policyData: PolicyComplianceData[] = [
    {
      id: '1',
      title: 'Policy 44: Workplace Safety Standards',
      subtitle: 'Policy',
      progress: 85,
      status: 'on-track',
      team: 'Safety Team',
      category: 'Policy',
      trend: {
        value: '+5%',
        isPositive: true
      }
    },
    {
      id: '2',
      title: 'Policy 12: Environmental Compliance',
      subtitle: 'Policy',
      progress: 72,
      status: 'on-track',
      team: 'EHS Team',
      category: 'Policy',
      trend: {
        value: '+1%',
        isPositive: true
      }
    },
    {
      id: '3',
      title: 'Policy 28: Emergency Procedures',
      subtitle: 'Policy',
      progress: 58,
      status: 'needs-attention',
      team: 'Operations',
      category: 'Policy',
      trend: {
        value: '-3%',
        isPositive: false
      }
    },
    {
      id: '4',
      title: 'Policy 35: Equipment Maintenance',
      subtitle: 'Policy',
      progress: 42,
      status: 'at-risk',
      team: 'Maintenance',
      category: 'Policy',
      trend: {
        value: '-2%',
        isPositive: false
      }
    }
  ];

  const handleCreateRequest = () => {
    console.log('Create Request clicked');
    // Add navigation or modal logic here
  };

  return (
    <SectionContainer className={className}>
      <SectionHeader>
        <SectionTitle>Policy Compliance</SectionTitle>
        <HeaderActions>
          <Button variant="primary" size="small" icon={<FaPlus />} onClick={handleCreateRequest}>
            Create Request
          </Button>
        </HeaderActions>
      </SectionHeader>

      <PolicyGrid>
        {policyData.map((policy) => (
          <PolicyCard key={policy.id} data={policy} />
        ))}
      </PolicyGrid>
    </SectionContainer>
  );
};
