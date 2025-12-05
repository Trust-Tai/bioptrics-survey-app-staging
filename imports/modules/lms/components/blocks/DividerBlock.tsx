import React from 'react';
import styled from 'styled-components';
import type { DividerBlock as DividerBlockType } from '../../types/contentBlocks';

const DividerContainer = styled.div<{ spacing: string }>`
  width: 100%;
  padding: ${props => props.spacing} 0;
`;

const DividerLine = styled.hr<{ 
  dividerStyle: string;
  thickness: string;
  color: string;
}>`
  border: none;
  margin: 0;
  height: ${props => props.thickness};
  background: ${props => props.color};
  
  ${props => {
    switch (props.dividerStyle) {
      case 'dashed':
        return `
          background: transparent;
          border-top: ${props.thickness} dashed ${props.color};
        `;
      case 'dotted':
        return `
          background: transparent;
          border-top: ${props.thickness} dotted ${props.color};
        `;
      case 'double':
        return `
          height: calc(${props.thickness} * 3);
          background: transparent;
          border-top: ${props.thickness} solid ${props.color};
          border-bottom: ${props.thickness} solid ${props.color};
        `;
      case 'gradient':
        return `
          background: linear-gradient(to right, transparent, ${props.color}, transparent);
        `;
      default: // solid
        return '';
    }
  }}
`;

interface DividerBlockProps {
  block: DividerBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ block }) => {
  const { settings } = block;
  const dividerStyle = settings?.dividerStyle || 'solid';
  const color = settings?.color || '#e5e7eb';
  const thickness = settings?.thickness || '2px';
  const spacing = settings?.spacing || '16px';

  return (
    <DividerContainer spacing={spacing}>
      <DividerLine
        dividerStyle={dividerStyle}
        thickness={thickness}
        color={color}
      />
    </DividerContainer>
  );
};
