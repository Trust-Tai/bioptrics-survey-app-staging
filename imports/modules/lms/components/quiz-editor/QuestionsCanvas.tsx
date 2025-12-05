import React from 'react';
import { Plus } from 'lucide-react';
import { QuestionItem } from './QuestionItem';
import { EmptyQuestionsState } from './EmptyQuestionsState';
import type { QuizQuestion } from '../../api/quizzes';
import {
  QuestionsSection,
  SectionHeader,
  SectionTitle,
  QuestionsList,
  AddQuestionButton,
} from '../../styles/quizEditor.styles';

interface QuestionsCanvasProps {
  questions: QuizQuestion[];
  draggedIndex: number | null;
  onAddQuestion: () => void;
  onEditQuestion: (question: QuizQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export const QuestionsCanvas: React.FC<QuestionsCanvasProps> = ({
  questions,
  draggedIndex,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <QuestionsSection>
      <SectionHeader>
        <SectionTitle>
          Questions {questions.length > 0 && `(${questions.length})`}
        </SectionTitle>
      </SectionHeader>

      {questions.length === 0 ? (
        <EmptyQuestionsState onAddFirstQuestion={onAddQuestion} />
      ) : (
        <>
          <QuestionsList>
            {questions.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                isDragging={draggedIndex === index}
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={(e) => onDrop(e, index)}
                onEdit={() => onEditQuestion(question)}
                onDelete={() => onDeleteQuestion(question.id)}
              />
            ))}
          </QuestionsList>
          
          <AddQuestionButton onClick={onAddQuestion}>
            <Plus size={20} />
            Add Question
          </AddQuestionButton>
        </>
      )}
    </QuestionsSection>
  );
};
