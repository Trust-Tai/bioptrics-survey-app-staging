import React from 'react';
import styled from 'styled-components';
import { BlockLibrary } from '../BlockLibrary';
import { BlockSettingsPanel } from '../BlockSettingsPanel';
import type { ContentBlock } from '../../types/contentBlocks';

const SidebarContainer = styled.div`
  width: 400px;
  height: calc(100vh - 73px);
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 73px;
  right: 0;
  overflow: hidden;
  flex-shrink: 0;
  align-self: flex-start;
`;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: 16px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.isActive ? '#06b6d4' : 'transparent'};
  color: ${props => props.isActive ? '#111827' : '#6b7280'};
  font-size: 14px;
  font-weight: ${props => props.isActive ? '500' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
  
  &:hover {
    color: ${props => props.isActive ? '#111827' : '#374151'};
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

const OutlineContainer = styled.div`
  padding: 24px 20px;
`;

const ModuleSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ModuleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const TopicsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TopicItem = styled.div<{ isActive?: boolean; type?: 'topic' | 'quiz' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: ${props => props.isActive ? '#dbeafe' : 'transparent'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isActive ? '#dbeafe' : '#f3f4f6'};
  }
`;

const TopicDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const TopicText = styled.div<{ isActive?: boolean }>`
  font-size: 14px;
  color: ${props => props.isActive ? '#1e40af' : '#4b5563'};
  line-height: 1.4;
  
  span {
    color: ${props => props.isActive ? '#1e40af' : '#6b7280'};
  }
`;

interface RightSidebarProps {
  activeTab: 'outline' | 'content';
  onTabChange: (tab: 'outline' | 'content') => void;
  selectedBlock: ContentBlock | null;
  onAddBlock: (blockType: any) => void;
  onUpdateBlock: (settings: any) => void;
  onCloseSettings: () => void;
  course: any;
  module: any;
  topic: any;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  activeTab,
  onTabChange,
  selectedBlock,
  onAddBlock,
  onUpdateBlock,
  onCloseSettings,
  course,
  module,
  topic,
}) => {
  return (
    <SidebarContainer>
      <TabNavigation>
        <TabButton
          isActive={activeTab === 'content'}
          onClick={() => onTabChange('content')}
        >
          Content
        </TabButton>
        <TabButton
          isActive={activeTab === 'outline'}
          onClick={() => onTabChange('outline')}
        >
          Outline
        </TabButton>
      </TabNavigation>

      <TabContent>
        {activeTab === 'outline' && (
          <OutlineContainer>
            {/* Render all modules with their topics */}
            {course?.modules?.map((mod: any, modIndex: number) => (
              <ModuleSection key={mod._id}>
                <ModuleTitle>
                  Module #{modIndex + 1}: {mod.title}
                </ModuleTitle>
                
                <TopicsList>
                  {mod.topics?.map((top: any) => {
                    const isCurrentTopic = top._id === topic?._id;
                    const isQuiz = top.type === 'quiz' || top.title?.toLowerCase().includes('quiz');
                    
                    return (
                      <TopicItem 
                        key={top._id} 
                        isActive={isCurrentTopic}
                        type={isQuiz ? 'quiz' : 'topic'}
                      >
                        <TopicDot color={isQuiz ? '#3b82f6' : '#fb923c'} />
                        <TopicText isActive={isCurrentTopic}>
                          {isQuiz ? 'Quiz' : 'Topic'} #{top.order || 1}: <span>{top.title}</span>
                        </TopicText>
                      </TopicItem>
                    );
                  })}
                </TopicsList>
              </ModuleSection>
            ))}
            
            {/* Fallback: If course.modules is not available, show current module only */}
            {!course?.modules && module && (
              <ModuleSection>
                <ModuleTitle>
                  Module #{module.order || 1}: {module.title}
                </ModuleTitle>
                
                <TopicsList>
                  {module.topics?.map((top: any) => {
                    const isCurrentTopic = top._id === topic?._id;
                    const isQuiz = top.type === 'quiz' || top.title?.toLowerCase().includes('quiz');
                    
                    return (
                      <TopicItem 
                        key={top._id} 
                        isActive={isCurrentTopic}
                        type={isQuiz ? 'quiz' : 'topic'}
                      >
                        <TopicDot color={isQuiz ? '#3b82f6' : '#fb923c'} />
                        <TopicText isActive={isCurrentTopic}>
                          {isQuiz ? 'Quiz' : 'Topic'} #{top.order || 1}: <span>{top.title}</span>
                        </TopicText>
                      </TopicItem>
                    );
                  })}
                </TopicsList>
              </ModuleSection>
            )}
          </OutlineContainer>
        )}

        {activeTab === 'content' && (
          <>
            {selectedBlock ? (
              <BlockSettingsPanel
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onClose={onCloseSettings}
              />
            ) : (
              <BlockLibrary
                onAddBlock={onAddBlock}
                onClose={() => {}} // Sidebar stays open
              />
            )}
          </>
        )}
      </TabContent>
    </SidebarContainer>
  );
};
