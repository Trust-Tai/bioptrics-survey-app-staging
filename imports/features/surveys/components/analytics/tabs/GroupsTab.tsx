import React from 'react';
import styled from 'styled-components';

const ComingSoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ComingSoonIcon = styled.div`
  font-size: 48px;
  color: #552a47;
  margin-bottom: 16px;
  opacity: 0.7;
`;

const ComingSoonTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
`;

const ComingSoonText = styled.p`
  font-size: 16px;
  color: #64748b;
  max-width: 500px;
  margin: 0;
`;

interface GroupsTabProps {
  isLoading: boolean;
}

const GroupsTab: React.FC<GroupsTabProps> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <ComingSoonContainer>
        <div>Loading...</div>
      </ComingSoonContainer>
    );
  }

  return (
    <ComingSoonContainer>
      <ComingSoonIcon>👥</ComingSoonIcon>
      <ComingSoonTitle>Coming Soon</ComingSoonTitle>
      <ComingSoonText>
        The Groups analytics feature is currently under development. 
        This section will provide insights into demographic groups, 
        response patterns across different segments, and comparative analysis.
      </ComingSoonText>
    </ComingSoonContainer>
  );
};

export default GroupsTab;
