import React from 'react';
import { Plus } from 'lucide-react';
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  AddQuestionButton,
} from '../../styles/quizEditor.styles';

interface EmptyQuestionsStateProps {
  onAddFirstQuestion: () => void;
}

export const EmptyQuestionsState: React.FC<EmptyQuestionsStateProps> = ({
  onAddFirstQuestion,
}) => {
  return (
    <EmptyState>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
      <EmptyStateTitle>No questions yet</EmptyStateTitle>
      <EmptyStateText>
        Get started by adding your first question to this quiz
      </EmptyStateText>
      <AddQuestionButton onClick={onAddFirstQuestion}>
        <Plus size={20} />
        Add Your First Question
      </AddQuestionButton>
    </EmptyState>
  );
};
