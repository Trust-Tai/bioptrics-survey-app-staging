import React, { useState } from 'react';
import styled from 'styled-components';
import type { AccordionBlock as AccordionBlockType } from '../../types/contentBlocks';

const AccordionContainer = styled.div`
  width: 100%;
`;

const AccordionItemWrapper = styled.div<{ isLast: boolean }>`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: ${props => props.isLast ? '0' : '12px'};
  overflow: hidden;
  background: #ffffff;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
  }
`;

const AccordionHeader = styled.button<{ isOpen: boolean }>`
  width: 100%;
  padding: 16px 20px;
  background: ${props => props.isOpen ? '#f9fafb' : '#ffffff'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: #f9fafb;
  }
`;

const AccordionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  flex: 1;
`;

const AccordionIcon = styled.div<{ isOpen: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AccordionContent = styled.div<{ isOpen: boolean; height: number }>`
  max-height: ${props => props.isOpen ? `${props.height}px` : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const AccordionContentInner = styled.div`
  padding: 20px;
  border-top: 1px solid #e5e7eb;
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

interface AccordionBlockProps {
  block: AccordionBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

export const AccordionBlock: React.FC<AccordionBlockProps> = ({ block }) => {
  const { settings } = block;
  const panels = settings?.panels || [];
  const allowMultipleOpen = settings?.allowMultipleOpen || false;
  const defaultExpanded = settings?.defaultExpanded || [];

  // Initialize open state
  const [openPanels, setOpenPanels] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  // Track content heights for smooth animations
  const [contentHeights, setContentHeights] = useState<{ [key: string]: number }>({});

  const togglePanel = (panelId: string) => {
    setOpenPanels(prev => {
      const newOpenPanels = new Set(prev);
      
      if (newOpenPanels.has(panelId)) {
        // Close this panel
        newOpenPanels.delete(panelId);
      } else {
        // Open this panel
        if (!allowMultipleOpen) {
          // Close all other panels if multiple not allowed
          newOpenPanels.clear();
        }
        newOpenPanels.add(panelId);
      }
      
      return newOpenPanels;
    });
  };

  const measureContent = (panelId: string, element: HTMLDivElement | null) => {
    if (element) {
      setContentHeights(prev => ({
        ...prev,
        [panelId]: element.scrollHeight,
      }));
    }
  };

  if (panels.length === 0) {
    return (
      <AccordionContainer>
        <EmptyState>
          <EmptyIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </EmptyIcon>
          <EmptyText>No accordion panels</EmptyText>
          <EmptySubtext>Click edit to add collapsible sections</EmptySubtext>
        </EmptyState>
      </AccordionContainer>
    );
  }

  return (
    <AccordionContainer>
      {panels.map((panel: any, index: number) => {
        const isOpen = openPanels.has(panel.id);
        const contentHeight = contentHeights[panel.id] || 0;
        const isLast = index === panels.length - 1;

        return (
          <AccordionItemWrapper key={panel.id} isLast={isLast}>
            <AccordionHeader
              isOpen={isOpen}
              onClick={() => togglePanel(panel.id)}
              type="button"
            >
              <AccordionTitle>{panel.title || 'Untitled Section'}</AccordionTitle>
              <AccordionIcon isOpen={isOpen}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </AccordionIcon>
            </AccordionHeader>

            <AccordionContent isOpen={isOpen} height={contentHeight}>
              <AccordionContentInner
                ref={(el) => measureContent(panel.id, el)}
                dangerouslySetInnerHTML={{
                  __html: panel.content || '<p>No content</p>',
                }}
              />
            </AccordionContent>
          </AccordionItemWrapper>
        );
      })}
    </AccordionContainer>
  );
};
