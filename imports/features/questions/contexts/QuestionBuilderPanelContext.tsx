import React, { createContext, useState, useContext, ReactNode } from 'react';
import QuestionBuilderSidePanel from '../components/admin/QuestionBuilderSidePanel';

interface QuestionBuilderPanelContextType {
  isOpen: boolean;
  questionId: string | undefined;
  openPanel: (questionId?: string) => void;
  closePanel: () => void;
}

const QuestionBuilderPanelContext = createContext<QuestionBuilderPanelContextType | undefined>(undefined);

interface QuestionBuilderPanelProviderProps {
  children: ReactNode;
}

export const QuestionBuilderPanelProvider: React.FC<QuestionBuilderPanelProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [questionId, setQuestionId] = useState<string | undefined>(undefined);

  const openPanel = (id?: string) => {
    setQuestionId(id);
    setIsOpen(true);
  };

  const closePanel = () => {
    // Immediately clear the question ID and close the panel
    setQuestionId(undefined);
    setIsOpen(false);
  };

  return (
    <QuestionBuilderPanelContext.Provider value={{ isOpen, questionId, openPanel, closePanel }}>
      {children}
      <QuestionBuilderSidePanel 
        isOpen={isOpen} 
        onClose={closePanel} 
        questionId={questionId} 
      />
    </QuestionBuilderPanelContext.Provider>
  );
};

export const useQuestionBuilderPanel = (): QuestionBuilderPanelContextType => {
  const context = useContext(QuestionBuilderPanelContext);
  if (context === undefined) {
    throw new Error('useQuestionBuilderPanel must be used within a QuestionBuilderPanelProvider');
  }
  return context;
};
