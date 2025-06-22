import React from 'react';
import styled from 'styled-components';
import { FaThLarge, FaList } from 'react-icons/fa';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f1f3f5;
  border-radius: 6px;
  padding: 2px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: none;
  background-color: ${props => props.active ? '#fff' : 'transparent'};
  color: ${props => props.active ? '#552a47' : '#6c757d'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    color: ${props => props.active ? '#552a47' : '#495057'};
  }
`;

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <ToggleContainer>
      <ToggleButton 
        active={view === 'grid'} 
        onClick={() => onViewChange('grid')}
        title="Grid View"
      >
        <FaThLarge />
      </ToggleButton>
      <ToggleButton 
        active={view === 'list'} 
        onClick={() => onViewChange('list')}
        title="List View"
      >
        <FaList />
      </ToggleButton>
    </ToggleContainer>
  );
};

export default ViewToggle;
