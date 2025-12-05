import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2 } from 'lucide-react';

interface TopicCardProps {
  topic: {
    _id?: string;
    id: string;
    title: string;
    description?: string;
    order: number;
  };
  moduleId: string;
  courseId: string;
  onDelete: (moduleId: string, topicId: string) => void;
  isEditing: boolean;
  editingTitle: string;
  onStartEdit: (topicId: string, currentTitle: string) => void;
  onFinishEdit: (moduleId: string, topicId: string) => void;
  onCancelEdit: () => void;
  onTitleChange: (title: string) => void;
}

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const TitleInput = styled.input`
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  padding: 4px 8px;
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: #3b82f6;
  }
`;

const TitleText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #3b82f6;
  }
`;

const Description = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #fef2f2;
    color: #dc2626;
  }
`;

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  moduleId,
  courseId,
  onDelete,
  isEditing,
  editingTitle,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
  onTitleChange,
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on edit input or delete button
    if (isEditing || (e.target as HTMLElement).closest('button')) {
      return;
    }
    
    const topicId = topic._id || topic.id;
    navigate(`/admin/lms/builder/${courseId}/topic/${moduleId}/${topicId}`);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onStartEdit(topic.id, topic.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onFinishEdit(moduleId, topic.id);
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(moduleId, topic.id);
  };

  return (
    <Card onClick={handleCardClick}>
      <LeftSection>
        <IconWrapper>
          <FileText size={16} />
        </IconWrapper>
        <TitleSection>
          {isEditing ? (
            <TitleInput
              type="text"
              value={editingTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => onFinishEdit(moduleId, topic.id)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <>
              <TitleText onClick={handleTitleClick} title="Click to edit">
                {topic.title}
              </TitleText>
              {topic.description && (
                <Description>{topic.description}</Description>
              )}
            </>
          )}
        </TitleSection>
      </LeftSection>
      
      <Actions>
        <DeleteButton onClick={handleDeleteClick} title="Delete topic">
          <Trash2 size={14} />
        </DeleteButton>
      </Actions>
    </Card>
  );
};
