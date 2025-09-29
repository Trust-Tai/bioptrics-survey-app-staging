import React, { useState } from 'react';
import styled from 'styled-components';

interface TabProps {
  active: boolean;
}

const TabsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabsList = styled.div`
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabsActions = styled.div`
  display: flex;
  align-items: center;
  padding-left: 16px;
`;

const Tab = styled.div<TabProps>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#552a47' : '#64748b'};
  border-bottom: 2px solid ${props => props.active ? '#552a47' : 'transparent'};
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${props => props.active ? '#552a47' : '#334155'};
  }
`;

const TabIcon = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const TabContent = styled.div`
  margin-top: 16px;
`;

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface TabsContainerProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  headerActions?: React.ReactNode | ((activeTabId: string) => React.ReactNode);
}

const AllTabsContainer: React.FC<TabsContainerProps> = ({ tabs, defaultActiveTab, headerActions }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab || (tabs.length > 0 ? tabs[0].id : ''));

  return (
    <div>
      <TabsWrapper>
        <TabsList>
          {tabs.map(tab => (
            <Tab 
              key={tab.id} 
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon>{tab.icon}</TabIcon>
              {tab.label}
            </Tab>
          ))}
        </TabsList>
        {headerActions && (
          <TabsActions>
            {typeof headerActions === 'function' 
              ? headerActions(activeTab)
              : headerActions
            }
          </TabsActions>
        )}
      </TabsWrapper>
      <TabContent>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </TabContent>
    </div>
  );
};

export default AllTabsContainer;
