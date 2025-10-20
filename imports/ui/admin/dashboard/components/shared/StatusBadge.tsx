import React from 'react';
import styled from 'styled-components';

interface StatusBadgeProps {
  status: 'on-track' | 'needs-attention' | 'at-risk';
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

const Badge = styled.span<{ status: string; size: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${props => 
    props.size === 'small' ? '4px 8px' :
    props.size === 'large' ? '8px 16px' : '6px 12px'
  };
  border-radius: 6px;
  font-size: ${props => 
    props.size === 'small' ? '11px' :
    props.size === 'large' ? '14px' : '12px'
  };
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background-color: ${props => {
    switch (props.status) {
      case 'on-track':
        return '#d4edda';
      case 'needs-attention':
        return '#fff3cd';
      case 'at-risk':
        return '#f8d7da';
      default:
        return '#e9ecef';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'on-track':
        return '#155724';
      case 'needs-attention':
        return '#856404';
      case 'at-risk':
        return '#721c24';
      default:
        return '#495057';
    }
  }};
`;

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  size = 'medium' 
}) => {
  const displayText = text || status.replace('-', ' ');
  
  return (
    <Badge status={status} size={size}>
      {displayText}
    </Badge>
  );
};
