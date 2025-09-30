import React from 'react';
import styled from 'styled-components';
import { FiMessageSquare, FiUser, FiBarChart2 } from 'react-icons/fi';

const ActivitySection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
`;

const ActivityMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 14px;
`;

interface AllActivityTabProps {
  isLoading: boolean;
}

// Sample activity data
const activityData = [
  {
    id: '1',
    icon: <FiMessageSquare size={16} />,
    title: 'New Response Submitted',
    meta: 'John D. • 2 hours ago'
  },
  {
    id: '2',
    icon: <FiUser size={16} />,
    title: 'Participant Started Survey',
    meta: 'Sarah M. • 3 hours ago'
  },
  {
    id: '3',
    icon: <FiBarChart2 size={16} />,
    title: 'Weekly Report Generated',
    meta: 'System • 1 day ago'
  },
  {
    id: '4',
    icon: <FiMessageSquare size={16} />,
    title: 'New Response Submitted',
    meta: 'Alex T. • 1 day ago'
  },
  {
    id: '5',
    icon: <FiUser size={16} />,
    title: 'Participant Abandoned Survey',
    meta: 'Michael R. • 2 days ago'
  },
  {
    id: '6',
    icon: <FiBarChart2 size={16} />,
    title: 'Survey Metrics Updated',
    meta: 'System • 3 days ago'
  }
];

const AllActivityTab: React.FC<AllActivityTabProps> = ({ isLoading }) => {
  if (isLoading) {
    return <LoadingIndicator>Loading activity data...</LoadingIndicator>;
  }

  return (
    <ActivitySection>
      <h3>Recent Activity</h3>
      <ActivityList>
        {activityData.map(activity => (
          <ActivityItem key={activity.id}>
            <ActivityIcon>
              {activity.icon}
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>{activity.title}</ActivityTitle>
              <ActivityMeta>{activity.meta}</ActivityMeta>
            </ActivityContent>
          </ActivityItem>
        ))}
      </ActivityList>
    </ActivitySection>
  );
};

export default AllActivityTab;
