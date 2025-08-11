import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const StyledButton = styled.button<{
  $variant: string;
  $size: string;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  /* Size variants */
  padding: ${props => 
    props.$size === 'small' ? '6px 12px' : 
    props.$size === 'large' ? '12px 24px' : 
    '8px 16px'
  };
  
  font-size: ${props => 
    props.$size === 'small' ? '0.875rem' : 
    props.$size === 'large' ? '1.125rem' : 
    '1rem'
  };
  
  /* Color variants */
  background-color: ${props => {
    switch(props.$variant) {
      case 'secondary': return '#f5f5f5';
      case 'danger': return '#f44336';
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#552a47'; // primary (default)
    }
  }};
  
  color: ${props => {
    switch(props.$variant) {
      case 'secondary': return '#333333';
      default: return '#ffffff';
    }
  }};
  
  border: ${props => props.$variant === 'secondary' ? '1px solid #dddddd' : 'none'};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  type = 'button',
  onClick,
  className,
  disabled,
  children,
  variant = 'primary',
  size = 'medium',
}) => {
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      className={className}
      disabled={disabled || isLoading}
      $variant={variant}
      $size={size}
    >
      {isLoading && <Spinner />}
      {isLoading && loadingText ? loadingText : children}
    </StyledButton>
  );
};

export default LoadingButton;
