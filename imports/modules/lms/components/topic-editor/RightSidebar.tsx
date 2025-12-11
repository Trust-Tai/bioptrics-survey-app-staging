import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { Clock, Settings } from 'lucide-react';

// Pulse animation for highlighting sidebar
const pulseHighlight = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(6, 182, 212, 0.3);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
  }
`;

// Shake/vibrate animation
const shakeAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
`;

import { BlockLibrary } from '../BlockLibrary';
import { BlockSettingsPanel } from '../BlockSettingsPanel';
import type { ContentBlock } from '../../types/contentBlocks';

const SidebarContainer = styled.div<{ isHighlighted?: boolean }>`
  width: 400px;
  height: calc(100vh - 73px);
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 73px;
  left: 0;
  overflow: hidden;
  flex-shrink: 0;
  align-self: flex-start;
  transition: all 0.3s ease;
  
  ${props => props.isHighlighted && css`
    border-right: 3px solid #06b6d4;
    animation: 
      ${pulseHighlight} 0.8s ease-in-out 3,
      ${shakeAnimation} 0.5s ease-in-out 2;
    background: linear-gradient(to right, #ecfeff, white);
  `}
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

const SettingsContainer = styled.div`
  padding: 24px 20px;
`;

const SettingsSection = styled.div`
  margin-bottom: 24px;
`;

const SettingsSectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6b7280;
  }
`;

const SettingsLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const DurationInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DurationFieldGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DurationInput = styled.input`
  width: 60px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const DurationUnit = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const SaveIndicator = styled.span<{ visible: boolean }>`
  font-size: 12px;
  color: #10b981;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s;
  margin-left: 8px;
`;

interface RightSidebarProps {
  activeTab: 'outline' | 'content' | 'settings';
  onTabChange: (tab: 'outline' | 'content' | 'settings') => void;
  selectedBlock: ContentBlock | null;
  onAddBlock: (blockType: any) => void;
  onUpdateBlock: (settings: any) => void;
  onCloseSettings: () => void;
  course: any;
  module: any;
  topic: any;
  topicId?: string;
  highlightSidebar?: boolean;
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
  topicId,
  highlightSidebar,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Scroll to top when highlighted
  useEffect(() => {
    if (highlightSidebar && sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, [highlightSidebar]);

  // Auto-switch to Content tab when a block is NEWLY selected (for editing)
  const prevSelectedBlockRef = useRef<ContentBlock | null>(null);
  useEffect(() => {
    // Only switch tab if a NEW block was selected (not just tab change)
    if (selectedBlock && selectedBlock !== prevSelectedBlockRef.current && activeTab !== 'content') {
      onTabChange('content');
    }
    prevSelectedBlockRef.current = selectedBlock;
  }, [selectedBlock]);

  // Handle tab change - close block settings when switching away from Content
  const handleTabChange = (tab: 'outline' | 'content' | 'settings') => {
    if (tab !== 'content' && selectedBlock) {
      onCloseSettings(); // Clear selected block when leaving Content tab
    }
    onTabChange(tab);
  };

  // Duration state - separate hours and minutes
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(5);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  // Sync duration when topic changes - only update if values are different
  useEffect(() => {
    if (topic?.estimatedMinutes !== undefined) {
      const newHours = Math.floor(topic.estimatedMinutes / 60);
      const newMinutes = topic.estimatedMinutes % 60;
      // Only update if different to prevent unnecessary re-renders
      setHours(prev => prev !== newHours ? newHours : prev);
      setMinutes(prev => prev !== newMinutes ? newMinutes : prev);
    }
  }, [topic?.estimatedMinutes]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (savedIndicatorRef.current) {
        clearTimeout(savedIndicatorRef.current);
      }
    };
  }, []);

  const handleDurationChange = (newHours: number, newMinutes: number) => {
    const h = Math.max(0, Math.min(99, newHours || 0));
    const m = Math.max(0, Math.min(59, newMinutes || 0));
    setHours(h);
    setMinutes(m);
    
    const totalMins = h * 60 + m;
    const finalValue = Math.max(1, totalMins); // Minimum 1 minute
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Auto-save after 500ms
    saveTimeoutRef.current = setTimeout(() => {
      if (topicId) {
        Meteor.call('topics.update', topicId, { estimatedMinutes: finalValue }, (error: any) => {
          if (!error) {
            setShowSaved(true);
            // Clear previous indicator timeout
            if (savedIndicatorRef.current) {
              clearTimeout(savedIndicatorRef.current);
            }
            savedIndicatorRef.current = setTimeout(() => setShowSaved(false), 2000);
          }
        });
      }
    }, 500);
  };

  return (
    <SidebarContainer ref={sidebarRef} isHighlighted={highlightSidebar}>
      <TabNavigation>
        <TabButton
          isActive={activeTab === 'content'}
          onClick={() => handleTabChange('content')}
        >
          Content
        </TabButton>
        <TabButton
          isActive={activeTab === 'outline'}
          onClick={() => handleTabChange('outline')}
        >
          Outline
        </TabButton>
        <TabButton
          isActive={activeTab === 'settings'}
          onClick={() => handleTabChange('settings')}
        >
          Settings
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

        {activeTab === 'settings' && (
          <SettingsContainer>
            <SettingsSection>
              <SettingsSectionTitle>
                <Clock size={16} />
                Time & Duration
              </SettingsSectionTitle>
              
              <SettingsLabel>
                Estimated Duration
                <SaveIndicator visible={showSaved}>✓ Saved</SaveIndicator>
              </SettingsLabel>
              <DurationInputWrapper>
                <DurationFieldGroup>
                  <DurationInput
                    type="number"
                    value={hours}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0, minutes)}
                    min="0"
                    max="99"
                    placeholder="0"
                  />
                  <DurationUnit>hours</DurationUnit>
                </DurationFieldGroup>
                <DurationFieldGroup>
                  <DurationInput
                    type="number"
                    value={minutes}
                    onChange={(e) => handleDurationChange(hours, parseInt(e.target.value) || 0)}
                    min="0"
                    max="59"
                    placeholder="0"
                  />
                  <DurationUnit>min</DurationUnit>
                </DurationFieldGroup>
              </DurationInputWrapper>
            </SettingsSection>
          </SettingsContainer>
        )}
      </TabContent>
    </SidebarContainer>
  );
};
