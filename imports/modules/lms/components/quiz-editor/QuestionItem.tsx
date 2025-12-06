import React from 'react';
import styled from 'styled-components';
import { GripVertical, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import type { QuizQuestion } from '../../api/quizzes';

interface QuestionItemProps {
  question: QuizQuestion;
  index: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const QuestionCard = styled.div<{ isDragging: boolean }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  opacity: ${props => props.isDragging ? 0.5 : 1};
  cursor: grab;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-color: #d1d5db;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const QuestionHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const DragHandle = styled.div`
  color: #9ca3af;
  display: flex;
  align-items: center;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const QuestionNumber = styled.span`
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
  min-width: 32px;
`;

const QuestionTypeBadge = styled.span<{ questionType: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.questionType) {
      case 'single-select':
        return `
          background: #e0e7ff;
          color: #4338ca;
        `;
      case 'multiple-choice':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'true-false':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'short-answer':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

const QuestionPoints = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    background: #fef2f2;
    color: #dc2626;
  }
`;

const QuestionText = styled.div`
  font-size: 14px;
  color: #111827;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.5;
`;

const QuestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
`;

const CorrectAnswerIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #059669;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
}) => {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single-select':
        return 'Single Select';
      case 'multiple-choice':
        return 'Multiple Choice';
      case 'true-false':
        return 'True/False';
      case 'short-answer':
        return 'Short Answer';
      default:
        return type;
    }
  };

  const getOptionsCount = () => {
    if ((question.type === 'single-select' || question.type === 'multiple-choice') && question.options) {
      const hasOther = question.allowOther ? ' + Other' : '';
      return `${question.options.length} options${hasOther}`;
    }
    if (question.type === 'true-false') {
      return '2 options';
    }
    return null;
  };

  return (
    <QuestionCard
      isDragging={isDragging}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <QuestionHeader>
        <QuestionHeaderLeft>
          <DragHandle>
            <GripVertical size={18} />
          </DragHandle>
          
          <QuestionNumber>Q{index + 1}</QuestionNumber>
          
          <QuestionTypeBadge questionType={question.type}>
            {getQuestionTypeLabel(question.type)}
          </QuestionTypeBadge>
        </QuestionHeaderLeft>
        
        <QuestionPoints>
          {question.points} {question.points === 1 ? 'point' : 'points'}
        </QuestionPoints>
        
        <QuestionActions>
          <ActionButton onClick={onEdit} title="Edit question">
            <Edit2 size={16} />
          </ActionButton>
          <DeleteButton onClick={onDelete} title="Delete question">
            <Trash2 size={16} />
          </DeleteButton>
        </QuestionActions>
      </QuestionHeader>
      
      <QuestionText>{question.question}</QuestionText>
      
      <QuestionMeta>
        {getOptionsCount() && <span>{getOptionsCount()}</span>}
        
        {question.correctAnswer && (
          <CorrectAnswerIndicator>
            <CheckCircle2 />
            <span>
              Correct: {
                Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(', ')
                  : question.correctAnswer
              }
            </span>
          </CorrectAnswerIndicator>
        )}
      </QuestionMeta>
    </QuestionCard>
  );
};
