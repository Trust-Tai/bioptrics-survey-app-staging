import { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useQuestionBuilderPanel } from '../../../features/questions/contexts/QuestionBuilderPanelContext';
import { QuestionItem } from './useSurveyData';

// Hook for managing question operations
export const useQuestionManagement = (
  surveyId?: string,
  surveyQuestions: QuestionItem[] = [],
  setSurveyQuestions: (questions: QuestionItem[]) => void,
  refreshSurveyData: () => void,
  trackContentChange: () => void
) => {
  // State for question editing
  const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionSectionId, setEditingQuestionSectionId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');

  // Get question builder panel context
  const { openPanel } = useQuestionBuilderPanel();

  // Handle adding questions to a section from question bank or to no section
  const handleAddQuestion = (sectionId: string | null) => {
    setCurrentSectionId(sectionId || '');
    
    // First, ensure we're subscribed to the questions.all publication with the current surveyId
    // This ensures we get both global questions and survey-specific questions for this survey
    if (surveyId) {
      Meteor.subscribe('questions.all', surveyId, {
        onReady: () => {
          console.log('Questions subscription ready for survey:', surveyId);
        },
        onError: (error: any) => {
          console.error('Error subscribing to questions:', error);
        }
      });
    }
  };

  // Handle creating a new question for a section or for the survey as a whole
  const handleCreateQuestion = (sectionId: string | null) => {
    setCurrentSectionId(sectionId || '');
    // Use context's openPanel method instead of local state
    // Pass the onQuestionCreated callback as the third parameter
    const onQuestionCreatedCallback = (questionId: string) => {
      console.log('Question created with ID:', questionId, 'Adding to section:', sectionId);
      
      // Add the new question to surveyQuestions
      const newQuestion: QuestionItem = {
        id: questionId,
        _id: questionId,
        text: 'New Question', // This will be updated when the question is saved
        type: 'text',
        status: 'draft',
        sectionId: sectionId || undefined,
        order: surveyQuestions.length
      };
      
      setSurveyQuestions(prev => [...prev, newQuestion]);
      
      // Refresh survey data to get the latest question details
      refreshSurveyData();
      
      // Track content change
      trackContentChange();
    };

    // Open the question builder panel
    openPanel('create', undefined, onQuestionCreatedCallback);
    setIsQuestionBuilderOpen(true);
  };

  // Handle editing a question
  const handleEditQuestion = (questionId: string, sectionId: string | null) => {
    // Set hasUnsavedChanges to true to ensure silentSave will actually save
    // This is handled by the parent component
    
    // Auto-save the survey silently before opening the question edit panel
    // This prevents loss of question selections when editing without saving first
    // This is handled by the parent component
    
    setEditingQuestionId(questionId);
    setEditingQuestionSectionId(sectionId);
    
    // Open the question builder panel for editing
    openPanel('edit', questionId);
    setIsQuestionBuilderOpen(true);
  };

  // Handle removing a question from a section or from no-section area
  const handleRemoveQuestion = (questionId: string, sectionId: string | null) => {
    // Completely remove the question from surveyQuestions
    setSurveyQuestions(prev => prev.filter(q => {
      if (sectionId === null) {
        // For questions without a section, only check the ID and that it has no sectionId
        return !(q.id === questionId && !q.sectionId);
      } else {
        // For questions in a section, check both ID and sectionId
        return !(q.id === questionId && q.sectionId === sectionId);
      }
    }));

    // Track content change
    trackContentChange();
  };

  // Handle reordering questions within a section
  const handleReorderQuestion = (sectionId: string, oldIndex: number, newIndex: number) => {
    // This function will be implemented with the survey order logic
    // For now, just track content change
    trackContentChange();
  };

  // Handle reordering questions in no-section area
  const handleReorderNoSectionQuestion = (oldIndex: number, newIndex: number) => {
    // This function will be implemented with the survey order logic
    // For now, just track content change
    trackContentChange();
  };

  // Handle moving question to a section
  const handleMoveQuestionToSection = (questionId: string, targetSectionId: string, targetIndex: number = -1) => {
    // Update the question's sectionId
    setSurveyQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, sectionId: targetSectionId }
        : q
    ));

    // Track content change
    trackContentChange();
  };

  // Handle moving question between sections
  const handleMoveQuestionBetweenSections = (questionId: string, sourceSectionId: string, targetSectionId: string, targetIndex: number = -1) => {
    // Update the question's sectionId
    setSurveyQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, sectionId: targetSectionId }
        : q
    ));

    // Track content change
    trackContentChange();
  };

  // Handle moving question to no-section area
  const handleMoveQuestionToNoSection = (questionId: string, sectionId: string, targetIndex: number = -1) => {
    // Remove sectionId from the question
    setSurveyQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, sectionId: undefined }
        : q
    ));

    // Track content change
    trackContentChange();
  };

  // Handle question created callback
  const handleQuestionCreated = (questionId: string) => {
    refreshSurveyData();
    trackContentChange();
  };

  // Handle closing question builder
  const handleCloseQuestionBuilder = () => {
    setIsQuestionBuilderOpen(false);
    setEditingQuestionId(null);
    setEditingQuestionSectionId(null);
  };

  return {
    // State
    isQuestionBuilderOpen,
    setIsQuestionBuilderOpen,
    editingQuestionId,
    setEditingQuestionId,
    editingQuestionSectionId,
    setEditingQuestionSectionId,
    currentSectionId,
    setCurrentSectionId,

    // Question management functions
    handleAddQuestion,
    handleCreateQuestion,
    handleEditQuestion,
    handleRemoveQuestion,
    handleReorderQuestion,
    handleReorderNoSectionQuestion,
    handleMoveQuestionToSection,
    handleMoveQuestionBetweenSections,
    handleMoveQuestionToNoSection,
    handleQuestionCreated,
    handleCloseQuestionBuilder,
  };
};






