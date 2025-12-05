import React from 'react';
import styled from 'styled-components';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'default' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

const StyledBadge = styled.span<{ variant: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'warning':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'error':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      case 'info':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  children,
  className 
}) => (
  <StyledBadge variant={variant} className={className}>
    {children}
  </StyledBadge>
);
