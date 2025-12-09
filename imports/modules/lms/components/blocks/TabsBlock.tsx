import React, { useState } from 'react';
import styled from 'styled-components';
import type { TabsBlock as TabsBlockType } from '../../types/contentBlocks';

const TabsContainer = styled.div`
  width: 100%;
`;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: 12px 20px;
  background: ${props => props.isActive ? '#ffffff' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.isActive ? '#3b82f6' : 'transparent'};
  color: ${props => props.isActive ? '#3b82f6' : '#6b7280'};
  font-size: 14px;
  font-weight: ${props => props.isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: -2px;
  
  &:hover {
    color: ${props => props.isActive ? '#3b82f6' : '#374151'};
    background: ${props => props.isActive ? '#ffffff' : '#f9fafb'};
  }
`;

const TabContent = styled.div`
  padding: 24px 0;
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TabPanel = styled.div`
  color: #374151;
  line-height: 1.6;
  
  p {
    margin: 0 0 12px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: 0 0 12px 0;
    padding-left: 24px;
  }
  
  strong {
    font-weight: 600;
  }
  
  em {
    font-style: italic;
  }
`;

const TabImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
  
  &.image-top {
    margin-bottom: 16px;
  }
  
  &.image-bottom {
    margin-top: 16px;
  }
`;

const ContentText = styled.div`
  p {
    margin: 0 0 12px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
`;

const EmptyIcon = styled.svg`
  width: 48px;
  height: 48px;
  color: #9ca3af;
  margin: 0 auto 16px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
`;

const EmptySubtext = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

interface TabsBlockProps {
  block: TabsBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

export const TabsBlock: React.FC<TabsBlockProps> = ({ block }) => {
  const { settings } = block;
  const tabs = settings?.tabs || [];
  const defaultTab = settings?.defaultTab || (tabs[0]?.id);

  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  if (tabs.length === 0) {
    return (
      <TabsContainer>
        <EmptyState>
          <EmptyIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
          </EmptyIcon>
          <EmptyText>No tabs configured</EmptyText>
          <EmptySubtext>Click edit to add tabbed content</EmptySubtext>
        </EmptyState>
      </TabsContainer>
    );
  }

  const activeTabData = tabs.find((tab: any) => tab.id === activeTab) || tabs[0];

  return (
    <TabsContainer>
      <TabNavigation>
        {tabs.map((tab: any) => (
          <TabButton
            key={tab.id}
            isActive={tab.id === activeTab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label || 'Untitled Tab'}
          </TabButton>
        ))}
      </TabNavigation>

      <TabContent>
        <TabPanel>
          {/* Image at top */}
          {activeTabData?.imageUrl && activeTabData?.imagePosition !== 'bottom' && (
            <TabImage 
              src={activeTabData.imageUrl} 
              alt={activeTabData.imageAlt || activeTabData.label || 'Tab image'} 
              className="image-top"
            />
          )}
          
          {/* Content */}
          <ContentText
            dangerouslySetInnerHTML={{
              __html: activeTabData?.content || '<p>No content</p>',
            }}
          />
          
          {/* Image at bottom */}
          {activeTabData?.imageUrl && activeTabData?.imagePosition === 'bottom' && (
            <TabImage 
              src={activeTabData.imageUrl} 
              alt={activeTabData.imageAlt || activeTabData.label || 'Tab image'} 
              className="image-bottom"
            />
          )}
        </TabPanel>
      </TabContent>
    </TabsContainer>
  );
};
