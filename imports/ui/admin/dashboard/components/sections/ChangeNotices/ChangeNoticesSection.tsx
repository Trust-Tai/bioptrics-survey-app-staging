import React from 'react';
import styled from 'styled-components';
import { NoticeCard } from './NoticeCard';
import { Button } from '../../shared/Button';
import { ChangeNoticeData } from '../../../types/dashboard.types';
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
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const NoticesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

interface ChangeNoticesSectionProps {
  className?: string;
}

export const ChangeNoticesSection: React.FC<ChangeNoticesSectionProps> = ({ className }) => {
  // Mock data - replace with real data from your backend
  const noticesData: ChangeNoticeData[] = [
    {
      id: '1',
      title: 'Q4 Safety Protocol Updates',
      category: 'Notice',
      progress: 92,
      understoodRate: 85,
      status: 'on-track'
    },
    {
      id: '2',
      title: 'New Equipment Guidelines',
      category: 'Notice',
      progress: 76,
      understoodRate: 72,
      status: 'on-track'
    },
    {
      id: '3',
      title: 'Facility Access Changes',
      category: 'Notice',
      progress: 54,
      understoodRate: 45,
      status: 'needs-attention'
    }
  ];

  const handleCreateNotice = () => {
    console.log('Create Notice clicked');
    // Add navigation or modal logic here
  };

  return (
    <SectionContainer className={className}>
      <SectionHeader>
        <SectionTitle>Change Notices & Memos</SectionTitle>
        <HeaderActions>
          <Button variant="primary" size="small" icon={<FaPlus />} onClick={handleCreateNotice}>
            Create Notice
          </Button>
        </HeaderActions>
      </SectionHeader>

      <NoticesGrid>
        {noticesData.map((notice) => (
          <NoticeCard key={notice.id} data={notice} />
        ))}
      </NoticesGrid>
    </SectionContainer>
  );
};
