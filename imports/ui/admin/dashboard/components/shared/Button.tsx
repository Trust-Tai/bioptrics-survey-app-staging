import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const StyledButton = styled.button<{ 
  variant: string; 
  size: string; 
  hasIcon: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.hasIcon ? '8px' : '0'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 16px';
      case 'large': return '16px 24px';
      default: return '12px 20px';
    }
  }};
  
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '13px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #552a47 0%, #7a4e7a 100%);
          color: white;
          
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(85, 42, 71, 0.3);
          }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          
          &:hover:not(:disabled) {
            background: #e9ecef;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #552a47;
          border: 2px solid #552a47;
          
          &:hover:not(:disabled) {
            background: #552a47;
            color: white;
            transform: translateY(-1px);
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: #552a47;
          
          &:hover:not(:disabled) {
            background: rgba(85, 42, 71, 0.1);
          }
        `;
      default:
        return '';
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  icon,
  className
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      hasIcon={!!icon}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {icon}
      {children}
    </StyledButton>
  );
};
