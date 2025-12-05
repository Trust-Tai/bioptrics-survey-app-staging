import React from 'react';
import styled from 'styled-components';
import type { CalloutBlock as CalloutBlockType } from '../../types/contentBlocks';

const CalloutContainer = styled.div<{ 
  calloutType: string; 
  variant: string;
}>`
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  
  ${props => {
    const colors = getCalloutColors(props.calloutType);
    
    if (props.variant === 'filled') {
      return `
        background: ${colors.background};
        border: 1px solid ${colors.border};
        color: ${colors.text};
      `;
    } else if (props.variant === 'outlined') {
      return `
        background: #ffffff;
        border: 2px solid ${colors.border};
        color: ${colors.text};
      `;
    } else {
      // bordered (default)
      return `
        background: ${colors.lightBg};
        border-left: 4px solid ${colors.border};
        border-right: 1px solid ${colors.lightBorder};
        border-top: 1px solid ${colors.lightBorder};
        border-bottom: 1px solid ${colors.lightBorder};
        color: ${colors.text};
      `;
    }
  }}
`;

const IconWrapper = styled.div<{ calloutType: string }>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${props => getCalloutColors(props.calloutType).icon};
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const CalloutTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.4;
`;

const CalloutContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  
  p {
    margin: 0 0 8px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: 0 0 8px 0;
    padding-left: 20px;
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

interface CalloutBlockProps {
  block: CalloutBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

const getCalloutColors = (type: string) => {
  switch (type) {
    case 'info':
      return {
        background: '#dbeafe',
        lightBg: '#eff6ff',
        border: '#3b82f6',
        lightBorder: '#bfdbfe',
        text: '#1e40af',
        icon: '#3b82f6',
      };
    case 'success':
      return {
        background: '#d1fae5',
        lightBg: '#ecfdf5',
        border: '#10b981',
        lightBorder: '#a7f3d0',
        text: '#065f46',
        icon: '#10b981',
      };
    case 'warning':
      return {
        background: '#fef3c7',
        lightBg: '#fffbeb',
        border: '#f59e0b',
        lightBorder: '#fde68a',
        text: '#92400e',
        icon: '#f59e0b',
      };
    case 'error':
      return {
        background: '#fee2e2',
        lightBg: '#fef2f2',
        border: '#ef4444',
        lightBorder: '#fecaca',
        text: '#991b1b',
        icon: '#ef4444',
      };
    default:
      return {
        background: '#e5e7eb',
        lightBg: '#f9fafb',
        border: '#6b7280',
        lightBorder: '#d1d5db',
        text: '#374151',
        icon: '#6b7280',
      };
  }
};

const getCalloutIcon = (type: string) => {
  switch (type) {
    case 'info':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      );
    case 'success':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      );
    case 'warning':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      );
    case 'error':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      );
    default:
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      );
  }
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ block }) => {
  const { settings } = block;
  const calloutType = settings?.calloutType || 'info';
  const variant = settings?.variant || 'bordered';
  const title = settings?.title;
  const content = settings?.content;
  const showIcon = settings?.showIcon !== false;

  if (!title && !content) {
    return (
      <EmptyState>
        <EmptyIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </EmptyIcon>
        <EmptyText>No callout content</EmptyText>
        <EmptySubtext>Click edit to add a message</EmptySubtext>
      </EmptyState>
    );
  }

  return (
    <CalloutContainer calloutType={calloutType} variant={variant}>
      {showIcon && (
        <IconWrapper calloutType={calloutType}>
          {getCalloutIcon(calloutType)}
        </IconWrapper>
      )}
      
      <ContentWrapper>
        {title && <CalloutTitle>{title}</CalloutTitle>}
        {content && (
          <CalloutContent
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        )}
      </ContentWrapper>
    </CalloutContainer>
  );
};
