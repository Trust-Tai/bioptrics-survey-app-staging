import React from 'react';
import styled from 'styled-components';
import type { ButtonBlock as ButtonBlockType } from '../../types/contentBlocks';

const ButtonContainer = styled.div<{ alignment: string }>`
  width: 100%;
  display: flex;
  justify-content: ${props => {
    switch (props.alignment) {
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      case 'center': return 'center';
      default: return 'flex-start';
    }
  }};
`;

const StyledButton = styled.a<{ 
  buttonStyle: string; 
  buttonSize: string;
  bgColor: string;
  textColor: string;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  
  ${props => {
    // Size
    let size = '';
    switch (props.buttonSize) {
      case 'small':
        size = 'padding: 8px 16px; font-size: 13px;';
        break;
      case 'large':
        size = 'padding: 14px 28px; font-size: 16px;';
        break;
      case 'medium':
      default:
        size = 'padding: 10px 20px; font-size: 14px;';
        break;
    }
    
    // Style
    let style = '';
    switch (props.buttonStyle) {
      case 'secondary':
        style = `
          background: #6b7280;
          color: #ffffff;
          &:hover {
            background: #4b5563;
          }
        `;
        break;
      case 'outline':
        style = `
          background: transparent;
          color: ${props.bgColor};
          border-color: ${props.bgColor};
          &:hover {
            background: ${props.bgColor}10;
          }
        `;
        break;
      case 'ghost':
        style = `
          background: transparent;
          color: ${props.bgColor};
          &:hover {
            background: ${props.bgColor}10;
          }
        `;
        break;
      case 'primary':
      default:
        style = `
          background: ${props.bgColor};
          color: ${props.textColor};
          &:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
        `;
        break;
    }
    
    return size + style;
  }}

  svg {
    width: ${props => props.buttonSize === 'small' ? '14px' : props.buttonSize === 'large' ? '18px' : '16px'};
    height: ${props => props.buttonSize === 'small' ? '14px' : props.buttonSize === 'large' ? '18px' : '16px'};
  }

  &:active {
    transform: translateY(0);
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

interface ButtonBlockProps {
  block: ButtonBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'arrow-right':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
    case 'external':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    case 'download':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'check':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    default:
      return null;
  }
};

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ block }) => {
  const { settings } = block;
  const buttonText = settings?.buttonText;
  const buttonUrl = settings?.buttonUrl;
  const buttonStyle = settings?.buttonStyle || 'primary';
  const buttonSize = settings?.buttonSize || 'medium';
  const alignment = settings?.alignment || 'left';
  const target = settings?.openInNewTab ? '_blank' : '_self';
  const icon = settings?.icon;
  const iconPosition = settings?.iconPosition || 'right';
  const backgroundColor = settings?.backgroundColor || '#3b82f6';
  const textColor = settings?.textColor || '#ffffff';

  if (!buttonText) {
    return (
      <EmptyState>
        <EmptyIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" 
          />
        </EmptyIcon>
        <EmptyText>No button configured</EmptyText>
        <EmptySubtext>Click edit to add a call-to-action button</EmptySubtext>
      </EmptyState>
    );
  }

  return (
    <ButtonContainer alignment={alignment}>
      <StyledButton
        href={buttonUrl || '#'}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        buttonStyle={buttonStyle}
        buttonSize={buttonSize}
        bgColor={backgroundColor}
        textColor={textColor}
      >
        {icon && iconPosition === 'left' && getIcon(icon)}
        {buttonText}
        {icon && iconPosition === 'right' && getIcon(icon)}
      </StyledButton>
    </ButtonContainer>
  );
};
