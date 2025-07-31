import React, { memo } from 'react';
import EnhancedSurveySection from './EnhancedSurveySection';

// Define the props interface for the component
interface MemoizedSurveySectionProps {
  section: any;
  index: number;
  onEditSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
  draggingSectionIndex: number | null;
  dragOverSectionIndex: number | null;
  onAddQuestion: (sectionId: string) => void;
  onEditQuestion: (questionId: string, sectionId: string) => void;
  onDeleteQuestion: (questionId: string, sectionId: string) => void;
  onDragStartQuestion: (questionId: string, sectionId: string) => void;
  onDragOverQuestion: (questionId: string, sectionId: string) => void;
  onDropQuestion: () => void;
  draggingQuestionId: string | null;
  draggingQuestionSectionId: string | null;
  dragOverQuestionId: string | null;
  dragOverSectionId: string | null;
}

// Custom comparison function for memoization
const areEqual = (prevProps: MemoizedSurveySectionProps, nextProps: MemoizedSurveySectionProps) => {
  // Check if the section data has changed
  const prevSection = prevProps.section;
  const nextSection = nextProps.section;
  
  // Compare basic section properties
  const basicPropsEqual = 
    prevSection._id === nextSection._id &&
    prevSection.title === nextSection.title &&
    prevSection.description === nextSection.description &&
    prevSection.order === nextSection.order &&
    prevSection.isVisible === nextSection.isVisible &&
    prevSection.timeLimit === nextSection.timeLimit;
  
  if (!basicPropsEqual) return false;
  
  // Compare questions array length
  if (prevSection.questions?.length !== nextSection.questions?.length) return false;
  
  // Check if this section is involved in dragging operations
  const isDraggingRelated = 
    prevProps.draggingSectionIndex !== nextProps.draggingSectionIndex ||
    prevProps.dragOverSectionIndex !== nextProps.dragOverSectionIndex ||
    prevProps.draggingQuestionId !== nextProps.draggingQuestionId ||
    prevProps.draggingQuestionSectionId !== nextProps.draggingQuestionSectionId ||
    prevProps.dragOverQuestionId !== nextProps.dragOverQuestionId ||
    prevProps.dragOverSectionId !== nextProps.dragOverSectionId;
  
  if (isDraggingRelated) return false;
  
  // If this section contains the dragged question or is the target section, re-render
  const isRelatedToQuestionDrag = 
    (prevProps.section._id === prevProps.draggingQuestionSectionId) ||
    (prevProps.section._id === prevProps.dragOverSectionId) ||
    (nextProps.section._id === nextProps.draggingQuestionSectionId) ||
    (nextProps.section._id === nextProps.dragOverSectionId);
  
  if (isRelatedToQuestionDrag) return false;
  
  // Deep compare questions array if needed
  if (prevSection.questions && nextSection.questions) {
    for (let i = 0; i < prevSection.questions.length; i++) {
      const prevQuestion = prevSection.questions[i];
      const nextQuestion = nextSection.questions[i];
      
      if (
        prevQuestion.id !== nextQuestion.id ||
        prevQuestion.text !== nextQuestion.text ||
        prevQuestion.type !== nextQuestion.type ||
        prevQuestion.status !== nextQuestion.status ||
        prevQuestion.order !== nextQuestion.order
      ) {
        return false;
      }
    }
  }
  
  // If we get here, the sections are equal
  return true;
};

// Memoized component to prevent unnecessary re-renders
const MemoizedSurveySection = memo<MemoizedSurveySectionProps>((props) => {
  return <EnhancedSurveySection {...props} />;
}, areEqual);

export default MemoizedSurveySection;
