import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface QuestionBuilderDndProviderProps {
  children: React.ReactNode;
}

/**
 * DndProvider wrapper for QuestionBuilder components
 * This component wraps the QuestionBuilder and its child components
 * with the DndProvider to enable drag and drop functionality
 */
const QuestionBuilderDndProvider: React.FC<QuestionBuilderDndProviderProps> = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};

export default QuestionBuilderDndProvider;
