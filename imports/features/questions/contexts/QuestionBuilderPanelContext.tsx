import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Meteor } from 'meteor/meteor';
import QuestionBuilderSidePanel from '../components/admin/QuestionBuilderSidePanel';
import EditWarningModal from '../components/admin/EditWarningModal';

interface QuestionBuilderPanelContextType {
  isOpen: boolean;
  questionId: string | undefined;
  surveyId: string | undefined;
  readOnly: boolean;
  versionData: any | undefined;
  onQuestionCreated?: (questionId: string) => void;
  openPanel: (questionId?: string, surveyId?: string, onQuestionCreated?: (questionId: string) => void) => void;
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
  const [onQuestionCreated, setOnQuestionCreated] = useState<((questionId: string) => void) | undefined>(undefined);

  const [questionHasResponses, setQuestionHasResponses] = useState(false);
  const [responseCount, setResponseCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | undefined>(undefined);
  const [pendingSurveyId, setPendingSurveyId] = useState<string | undefined>(undefined);
  const [pendingCallback, setPendingCallback] = useState<((questionId: string) => void) | undefined>(undefined);
  const [doNotShowWarningAgain, setDoNotShowWarningAgain] = useState(() => {
    // Check if the user has previously chosen not to show the warning
    return localStorage.getItem('doNotShowEditWarning') === 'true';
  });

  const openPanel = async (id?: string, sId?: string, callback?: (questionId: string) => void) => {
    // If we're creating a new question (no id) or opening in survey context, open directly
    if (!id || sId) {
      setQuestionId(id);
      setSurveyId(sId);
      setReadOnly(false);
      setVersionData(undefined);
      
      // Ensure callback is properly set
      if (callback) {
        console.log('Setting onQuestionCreated callback in context');
        setOnQuestionCreated(() => callback); // Use function to ensure proper reference
      } else {
        console.log('No callback provided to openPanel');
        setOnQuestionCreated(undefined);
      }
      
      setIsOpen(true);
      return;
    }
    
    // For existing questions, check if they're used in responses
    try {
      console.log(`Checking if question ${id} is used in responses...`);
      const result = await Meteor.callAsync('questions.checkIfUsedInResponses', id);
      
      if (result && result.isUsed && !doNotShowWarningAgain) {
        console.log(`Question ${id} is used in ${result.count} responses, showing warning modal`);
        
        // Store the response info for the warning modal
        setQuestionHasResponses(true);
        setResponseCount(result.count);
        
        // Store the pending panel parameters
        setPendingQuestionId(id);
        setPendingSurveyId(sId);
        setPendingCallback(callback);
        
        // Show the warning modal
        setShowWarningModal(true);
      } else {
        console.log(`Question ${id} is not used in any responses or warning is disabled, opening panel directly`);
        
        // Continue with opening the panel directly
        setQuestionId(id);
        setSurveyId(sId);
        setReadOnly(false);
        setVersionData(undefined);
        
        // Ensure callback is properly set
        if (callback) {
          console.log('Setting onQuestionCreated callback in context');
          setOnQuestionCreated(() => callback);
        } else {
          console.log('No callback provided to openPanel');
          setOnQuestionCreated(undefined);
        }
        
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking question usage:', error);
      // If there's an error, still open the panel
      setQuestionId(id);
      setSurveyId(sId);
      setReadOnly(false);
      setVersionData(undefined);
      
      if (callback) {
        setOnQuestionCreated(() => callback);
      } else {
        setOnQuestionCreated(undefined);
      }
      
      setIsOpen(true);
    }
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

  // Handle continuing after warning
  const handleContinueAfterWarning = () => {
    setShowWarningModal(false);
    
    // Open the panel with the pending parameters
    setQuestionId(pendingQuestionId);
    setSurveyId(pendingSurveyId);
    setReadOnly(false);
    setVersionData(undefined);
    
    // Set the callback if provided
    if (pendingCallback) {
      setOnQuestionCreated(() => pendingCallback);
    } else {
      setOnQuestionCreated(undefined);
    }
    
    setIsOpen(true);
    
    // Clear pending state
    setPendingQuestionId(undefined);
    setPendingSurveyId(undefined);
    setPendingCallback(undefined);
  };
  
  // Handle do not remind again
  const handleDoNotRemindAgain = () => {
    setDoNotShowWarningAgain(true);
    localStorage.setItem('doNotShowEditWarning', 'true');
  };
  
  // Handle cancel
  const handleCancelWarning = () => {
    setShowWarningModal(false);
    
    // Clear pending state
    setPendingQuestionId(undefined);
    setPendingSurveyId(undefined);
    setPendingCallback(undefined);
  };

  return (
    <QuestionBuilderPanelContext.Provider value={{ isOpen, questionId, surveyId, readOnly, versionData, onQuestionCreated, openPanel, openVersionPanel, closePanel }}>
      {children}
      <QuestionBuilderSidePanel 
        isOpen={isOpen} 
        onClose={closePanel} 
        questionId={questionId}
        surveyId={surveyId}
        context={surveyId ? 'surveyBuilder' : 'questionBank'}
        readOnly={readOnly}
        versionData={versionData}
        onQuestionCreated={onQuestionCreated}
      />
      
      {/* Warning Modal */}
      <EditWarningModal
        isOpen={showWarningModal}
        onClose={handleCancelWarning}
        onContinue={handleContinueAfterWarning}
        onDoNotRemindAgain={handleDoNotRemindAgain}
        responseCount={responseCount}
        questionId={pendingQuestionId || ''}
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
