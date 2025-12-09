import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, GripVertical } from 'lucide-react';

interface TopicCardProps {
  topic: {
    _id?: string;
    id: string;
    title: string;
    description?: string;
    order: number;
    estimatedMinutes?: number;
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
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #fafafa;
  }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  color: #d1d5db;
  cursor: grab;
  
  &:hover {
    color: #9ca3af;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #dbeafe;
  border-radius: 8px;
  color: #3b82f6;
  flex-shrink: 0;
`;

const ContentSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TitleInput = styled.input`
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 4px;
  padding: 4px 8px;
  
  &:focus {
    outline: none;
  }
`;

const TitleText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #3b82f6;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .dot {
    color: #d1d5db;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ObjectivesTag = styled.span`
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #d1d5db;
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

  const estimatedTime = topic.estimatedMinutes || 5;

  return (
    <Card onClick={handleCardClick}>
      <DragHandle onClick={(e) => e.stopPropagation()}>
        <GripVertical size={18} />
      </DragHandle>
      <IconWrapper>
        <FileText size={18} />
      </IconWrapper>
      <ContentSection>
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
              Topic {topic.order}: {topic.title}
            </TitleText>
            <MetaInfo>
              <span>Content</span>
              <span className="dot">·</span>
              <span>~{estimatedTime} min</span>
              <span className="dot">·</span>
              <span>Required</span>
            </MetaInfo>
          </>
        )}
      </ContentSection>
      
      <RightSection>
        <DeleteButton onClick={handleDeleteClick} title="Delete topic">
          <Trash2 size={16} />
        </DeleteButton>
      </RightSection>
    </Card>
  );
};
