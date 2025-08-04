import React, { createContext, useState, useContext, ReactNode } from 'react';
import QuestionBuilderSidePanel from '../components/admin/QuestionBuilderSidePanel';

interface QuestionBuilderPanelContextType {
  isOpen: boolean;
  questionId: string | undefined;
  surveyId: string | undefined;
  readOnly: boolean;
  versionData: any | undefined;
  openPanel: (questionId?: string, surveyId?: string) => void;
  openVersionPanel: (versionData: any) => void;
  closePanel: () => void;
}

const QuestionBuilderPanelContext = createContext<QuestionBuilderPanelContextType | undefined>(undefined);

interface QuestionBuilderPanelProviderProps {
  children: ReactNode;
}

export const QuestionBuilderPanelProvider: React.FC<QuestionBuilderPanelProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [questionId, setQuestionId] = useState<string | undefined>(undefined);
  const [surveyId, setSurveyId] = useState<string | undefined>(undefined);
  const [readOnly, setReadOnly] = useState(false);
  const [versionData, setVersionData] = useState<any | undefined>(undefined);

  const openPanel = (id?: string, sId?: string) => {
    setQuestionId(id);
    setSurveyId(sId);
    setReadOnly(false);
    setVersionData(undefined);
    setIsOpen(true);
  };

  const openVersionPanel = (version: any) => {
    setQuestionId(undefined);
    setSurveyId(undefined);
    setReadOnly(true);
    setVersionData(version);
    setIsOpen(true);
  };

  const closePanel = () => {
    // Immediately clear all state and close the panel
    setQuestionId(undefined);
    setSurveyId(undefined);
    setReadOnly(false);
    setVersionData(undefined);
    setIsOpen(false);
  };

  return (
    <QuestionBuilderPanelContext.Provider value={{ isOpen, questionId, surveyId, readOnly, versionData, openPanel, openVersionPanel, closePanel }}>
      {children}
      <QuestionBuilderSidePanel 
        isOpen={isOpen} 
        onClose={closePanel} 
        questionId={questionId}
        surveyId={surveyId}
        context={surveyId ? 'surveyBuilder' : 'questionBank'}
        readOnly={readOnly}
        versionData={versionData}
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
