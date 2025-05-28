import React from 'react';
import styled from 'styled-components';
import { FiEdit2, FiEye, FiGrid, FiBarChart2, FiUsers, FiSettings } from 'react-icons/fi';

const QuickActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f9f4f8;
  border: none;
  color: #552a47;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e9dfe7;
  }
  
  svg {
    font-size: 16px;
  }
`;

interface QuickActionsMenuProps {
  onEdit?: () => void;
  onPreview?: () => void;
  onAssignQuestions?: () => void;
  onViewAnalytics?: () => void;
  onManageParticipants?: () => void;
  onSettings?: () => void;
  showAll?: boolean;
}

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  onEdit,
  onPreview,
  onAssignQuestions,
  onViewAnalytics,
  onManageParticipants,
  onSettings,
  showAll = false
}) => {
  return (
    <QuickActionsContainer>
      {onEdit && (
        <QuickActionButton onClick={onEdit}>
          <FiEdit2 size={16} />
          Edit
        </QuickActionButton>
      )}
      
      {onPreview && (
        <QuickActionButton onClick={onPreview}>
          <FiEye size={16} />
          Preview
        </QuickActionButton>
      )}
      
      {onAssignQuestions && (
        <QuickActionButton onClick={onAssignQuestions}>
          <FiGrid size={16} />
          Assign Questions
        </QuickActionButton>
      )}
      
      {(showAll || onViewAnalytics) && onViewAnalytics && (
        <QuickActionButton onClick={onViewAnalytics}>
          <FiBarChart2 size={16} />
          Analytics
        </QuickActionButton>
      )}
      
      {(showAll || onManageParticipants) && onManageParticipants && (
        <QuickActionButton onClick={onManageParticipants}>
          <FiUsers size={16} />
          Participants
        </QuickActionButton>
      )}
      
      {(showAll || onSettings) && onSettings && (
        <QuickActionButton onClick={onSettings}>
          <FiSettings size={16} />
          Settings
        </QuickActionButton>
      )}
    </QuickActionsContainer>
  );
};

export default QuickActionsMenu;