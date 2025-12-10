import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Trash2, GripVertical } from 'lucide-react';

interface QuizCardProps {
  quiz: {
    _id?: string;
    id: string;
    title: string;
    description?: string;
    order: number;
    estimatedMinutes?: number;
  };
  moduleId: string;
  courseId: string;
  onDelete: (moduleId: string, quizId: string) => void;
  isEditing: boolean;
  editingTitle: string;
  onStartEdit: (quizId: string, currentTitle: string) => void;
  onFinishEdit: (moduleId: string, quizId: string) => void;
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
  color: #9ca3af;
  cursor: grab;
  
  &:hover {
    color: #6b7280;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fed7aa;
  border-radius: 8px;
  color: #ea580c;
  flex-shrink: 0;
`;

const ContentSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const TitleInput = styled.input`
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  background: white;
  border: 2px solid #f97316;
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
    color: #f97316;
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

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
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
    
    const quizId = quiz._id || quiz.id;
    navigate(`/admin/lms/builder/${courseId}/quiz/${quizId}`);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onStartEdit(quiz.id, quiz.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onFinishEdit(moduleId, quiz.id);
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(moduleId, quiz.id);
  };

  const estimatedTime = quiz.estimatedMinutes || 5;

  return (
    <Card onClick={handleCardClick}>
      <DragHandle onClick={(e) => e.stopPropagation()}>
        <GripVertical size={18} />
      </DragHandle>
      <IconWrapper>
        <HelpCircle size={18} />
      </IconWrapper>
      <ContentSection>
        {isEditing ? (
          <TitleInput
            type="text"
            value={editingTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => onFinishEdit(moduleId, quiz.id)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <>
            <TitleText onClick={handleTitleClick} title="Click to edit">
              Topic {quiz.order}: {quiz.title}
            </TitleText>
            <MetaInfo>
              <span>Quiz</span>
              <span className="dot">·</span>
              <span>~{estimatedTime} min</span>
            </MetaInfo>
          </>
        )}
      </ContentSection>
      
      <RightSection>
        <DeleteButton onClick={handleDeleteClick} title="Delete quiz">
          <Trash2 size={16} />
        </DeleteButton>
      </RightSection>
    </Card>
  );
};
