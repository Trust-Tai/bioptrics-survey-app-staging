import React, { useState, useEffect } from 'react';
import { useUndoRedo } from './useUndoRedo';
import { useAutosave } from './useAutosave';
import { FaUndo, FaRedo, FaSave } from 'react-icons/fa';
import './QuestionBuilderStateManager.css';

interface Question {
  _id?: string;
  text: string;
  description?: string;
  answerType: string;
  answers?: any[];
  required?: boolean;
  image?: string;
  labels?: string[];
  feedback?: string;
  categories?: string[];
  themes?: string[];
  reusable?: boolean;
  priority?: number;
  active?: boolean;
  keywords?: string[];
  branchingLogic?: any;
  [key: string]: any;
}

interface QuestionBuilderStateManagerProps {
  initialQuestion: Question;
  onSave: (question: Question) => Promise<void>;
  children: (props: {
    question: Question;
    setQuestion: React.Dispatch<React.SetStateAction<Question>>;
    saveQuestion: () => Promise<void>;
    isSaving: boolean;
    lastSaved: Date | null;
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
  }) => React.ReactNode;
}

/**
 * State manager for QuestionBuilder that provides undo/redo and autosave functionality
 */
const QuestionBuilderStateManager: React.FC<QuestionBuilderStateManagerProps> = ({
  initialQuestion,
  onSave,
  children
}) => {
  // Initialize state with the initial question
  const [question, setQuestionState] = useState<Question>(initialQuestion);
  
  // Setup undo/redo functionality
  const {
    state: undoRedoState,
    set,
    update,
    canUndo,
    canRedo,
    undo,
    redo
  } = useUndoRedo<Question>(initialQuestion);

  // Keep question state and undo/redo state in sync
  // Using a ref to track if this is the initial render
  const isInitialRender = React.useRef(true);
  
  useEffect(() => {
    // Skip the first render to prevent initial update
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Use the update function to add to history
    // Only update if the question has actually changed
    const questionStr = JSON.stringify(question);
    const undoRedoStateStr = JSON.stringify(undoRedoState);
    
    if (questionStr !== undoRedoStateStr) {
      update(question);
    }
  }, [question, update, undoRedoState]);
  
  // This effect is no longer needed as we handle both in the effect above
  // The previous implementation caused an infinite loop

  // Custom setter that updates both states
  const setQuestion = (updater: React.SetStateAction<Question>) => {
    setQuestionState(updater);
  };

  // Save function that will be passed to the autosave hook and children
  const saveQuestion = async () => {
    if (!question) return;
    
    try {
      await onSave(question);
      return true;
    } catch (error) {
      console.error('Error saving question:', error);
      return false;
    }
  };

  // Setup autosave - disabled by default to prevent blank screen issues when changing URLs
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState<boolean>(false);
  
  const {
    save,
    isSaving,
    lastSaved,
    error: autosaveError
  } = useAutosave({
    data: question,
    onSave: async (data) => {
      await saveQuestion();
    },
    debounceMs: 2000,
    interval: 60000,
    enabled: isAutosaveEnabled
  });

  return (
    <div className="question-builder-state-manager">
      {children({
        question,
        setQuestion,
        saveQuestion: save,
        isSaving,
        lastSaved,
        canUndo,
        canRedo,
        undo,
        redo
      })}
    </div>
  );
};

export default QuestionBuilderStateManager;
