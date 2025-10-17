import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: string;
  shadow?: boolean;
  hover?: boolean;
}

const StyledCard = styled.div<{ padding?: string; shadow?: boolean; hover?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: ${props => props.padding || '24px'};
  box-shadow: ${props => props.shadow ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.03)'};
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  ${props => props.hover && `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
  `}
`;

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  onClick, 
  padding,
  shadow = true,
  hover = false
}) => {
  return (
    <StyledCard 
      className={className}
      onClick={onClick}
      padding={padding}
      shadow={shadow}
      hover={hover}
    >
      {children}
    </StyledCard>
  );
};
