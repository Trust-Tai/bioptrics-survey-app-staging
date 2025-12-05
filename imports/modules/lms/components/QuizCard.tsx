import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Trash2 } from 'lucide-react';

interface QuizCardProps {
  quiz: {
    _id?: string;
    id: string;
    title: string;
    description?: string;
    order: number;
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
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: #f59e0b;
    box-shadow: 0 1px 3px rgba(245, 158, 11, 0.1);
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
  background: #fbbf24;
  border-radius: 6px;
  color: white;
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
  border: 1px solid #f59e0b;
  border-radius: 4px;
  padding: 4px 8px;
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: #f59e0b;
  }
`;

const TitleText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #f59e0b;
  }
`;

const Description = styled.p`
  font-size: 13px;
  color: #92400e;
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
  color: #92400e;
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

  return (
    <Card onClick={handleCardClick}>
      <LeftSection>
        <IconWrapper>
          <CheckCircle size={16} />
        </IconWrapper>
        <TitleSection>
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
                {quiz.title}
              </TitleText>
              {quiz.description && (
                <Description>{quiz.description}</Description>
              )}
            </>
          )}
        </TitleSection>
      </LeftSection>
      
      <Actions>
        <DeleteButton onClick={handleDeleteClick} title="Delete quiz">
          <Trash2 size={14} />
        </DeleteButton>
      </Actions>
    </Card>
  );
};
