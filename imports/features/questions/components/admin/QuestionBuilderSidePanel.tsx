import React, { useRef, useState, useEffect } from 'react';
import AnswerTypeSelector from './AnswerTypeSelector';
import { notificationManager } from '/imports/shared/components/GlobalNotification';
import { createPortal } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components';
import { FaTimes, FaInfoCircle, FaCog, FaCloudUploadAlt, FaHistory, FaExclamationTriangle, FaSpinner, FaCheck } from 'react-icons/fa';
// import TagBuilder from './TagBuilder';
// import FolderSelector from './FolderSelector';
// import ToggleSwitch from './ToggleSwitch';
import VersionHistoryModal from './VersionHistoryModal';
import LoadingButton from '/imports/shared/components/LoadingButton';

// Import enhanced components
import QuestionBuilderDndProvider from './QuestionBuilderDndProvider';
// import QuestionBuilderStateManager from './QuestionBuilderStateManager';
import QuestionBuilderAnswerOptions from './QuestionBuilderAnswerOptions';
// import QuestionBuilderBranchingTab from './QuestionBuilderBranchingTab';
// import QuestionBuilderPreview from './QuestionBuilderPreview';
// import EnhancedQuestionPreviewModal from './EnhancedQuestionPreviewModal';
// import SaveAsTemplateModal from './SaveAsTemplateModal';
// import QuestionTemplatesModal from './QuestionTemplatesModal';

// Import Question type from API
// import { Question as ApiQuestion } from '/imports/features/questions/api/questions.methods.client';

// Import styles
import './EnhancedQuestionBuilder.css';
import 'react-tabs/style/react-tabs.css';

// Define interfaces - extending the API Question type with our additional fields
// Define our own CustomField interface for the question builder
interface QuestionCustomField {
  id: string;
  name: string;
  value: string;
}

// Extend the API Question type with our additional fields
interface Question {
  _id?: string;
  text: string;
  description?: string;
  answerType: string;
  answers: any[]; // Make answers required to fix TypeScript error
  required: boolean; // Make required non-optional to fix TypeScript error
  image: string; // Make image non-optional to fix TypeScript error
  labels?: string[];
  feedback?: string;
  feedbackType?: 'text' | 'file' | 'rating';
  folderId?: string | null; // Folder ID for organizing questions
  categories?: string[];
  categoryId?: string; // Single primary category
  categoryDetails?: string; // Details about the selected category
  themes?: string[];
  reusable?: boolean;
  tags?: string[];
  priority?: number;
  active?: boolean;
  keywords?: string[];
  branchingLogic?: any;
  customFields?: QuestionCustomField[];
  status?: 'draft' | 'published'; // Question status: draft or published
  isAssessment?: boolean; // Flag to indicate if this question should be scored
  correctAnswers?: any[]; // Array of correct answers for assessment questions
  points?: number; // Optional points value for weighted scoring
  estimatedTimeSeconds?: number; // Estimated time to answer the question in seconds
  showEmojis?: boolean; // Controls whether to show emojis for Likert questions
  [key: string]: any;
}

// Interface for managing multiple questions
interface QuestionSection {
  id: string;
  question: Question;
  isExpanded: boolean;
  isNew?: boolean;
}

// Props for the side panel component
interface QuestionBuilderSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: string;
  context?: 'questionBank' | 'surveyBuilder'; // To indicate where it's being used
  onQuestionCreated?: (questionId: string) => void; // Callback for survey builder
  onQuestionSaved?: (questionId: string) => void; // General callback
  surveyId?: string; // ID of the survey when used in survey builder context
  readOnly?: boolean; // Whether the panel is in read-only mode (for viewing history)
  versionData?: any; // Version data to display when in read-only mode
}

// Side panel styles
const sidePanelStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000, /* Increased z-index to be higher than QuestionSelector */
    transition: 'opacity 0.3s ease-in-out',
  },
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '90%',
    maxWidth: '1000px',
    height: '100%',
    backgroundColor: '#fff',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.2)',
    zIndex: 2001,
    overflowY: 'auto',
    transition: 'transform 0.3s ease-in-out',
    padding: '20px',
  },
  closeButton: {
    position: 'absolute',
    top: '25px',
    right: '15px',
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer',
    zIndex: 1002,
    transition: 'background 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingRight: '40px',
  }
};

// Define styled components used in this file
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
`;

const CardMain = styled.div`
  padding: 16px;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid #eee;
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  color: #552a47;
  &:hover {
    color: #7b3d68;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin: 0;
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const ModalForm = styled.form`
  padding: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  margin-bottom: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const ChoiceRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const ChoiceInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const RemoveChoiceBtn = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  margin-left: 8px;
`;

const AddChoiceBtn = styled.button`
  background: none;
  border: 1px dashed #ddd;
  padding: 8px;
  width: 100%;
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  &:hover {
    background: #f9f9f9;
  }
`;

const SaveBtn = styled.button`
  background: #552a47;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #7b3d68;
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const ActiveTag = styled.span`
  background: #f4ebf1;
  color: #552a47;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

/**
 * Question Builder Side Panel component
 * Wraps the existing question builder functionality in a side panel
 */
const QuestionBuilderSidePanel: React.FC<QuestionBuilderSidePanelProps> = ({ 
  isOpen, 
  onClose, 
  questionId, 
  context = 'questionBank', // Default to questionBank context
  onQuestionCreated,
  onQuestionSaved,
  surveyId, // Add surveyId to the destructured props
  readOnly = false, // Whether the panel is in read-only mode
  versionData = null // Version data to display when in read-only mode
}) => {
  // Debug log for version data structure
  useEffect(() => {
    if (readOnly && versionData) {
      console.log('Version Data Structure:', Object.keys(versionData));
      console.log('Question Text from Version Data:', versionData.questionText);
    }
  }, [readOnly, versionData]);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef<boolean>(false); // Track scroll lock state
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'progress'; message: string; progress?: number } | null>(null);
  // Add state for version history modal
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);
  const [versionUpdateLoading, setVersionUpdateLoading] = useState(false);
  
  // Show success alert
  const showSuccessAlert = (message: string) => {
    setAlert({ type: 'success', message });
    setTimeout(() => setAlert(null), 3000);
  };
  
  // Show error alert
  const showErrorAlert = (message: string) => {
    setAlert({ type: 'error', message });
    setTimeout(() => setAlert(null), 4000);
  };
  
  // Show progress alert
  const showProgressAlert = (message: string, progress: number) => {
    setAlert({ type: 'progress', message, progress });
  };

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  
  // Separate effect for body scroll management to prevent conflicts
  useEffect(() => {
    console.log('Scroll lock effect triggered. isOpen:', isOpen, 'scrollLockRef.current:', scrollLockRef.current);
    
    if (isOpen && !scrollLockRef.current) {
      // Lock scrolling
      document.body.classList.add('panel-open');
      scrollLockRef.current = true;
      console.log('✅ SCROLL LOCKED - Added panel-open class');
    } else if (!isOpen && scrollLockRef.current) {
      // Unlock scrolling
      document.body.classList.remove('panel-open');
      scrollLockRef.current = false;
      console.log('✅ SCROLL UNLOCKED - Removed panel-open class');
    }
    
    // Cleanup function
    return () => {
      if (scrollLockRef.current) {
        document.body.classList.remove('panel-open');
        scrollLockRef.current = false;
        console.log('🧹 CLEANUP - Removed panel-open class');
      }
    };
  }, [isOpen]);

  // Handle clicks outside the panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Immediately check if the click is on an element with data-modal-container attribute
      const target = event.target as Element;
      if (target.closest('[data-modal-container="true"]')) {
        // If the click is inside a modal container, don't close the panel
        return;
      }
      
      // Check if the click target is inside any modal
      const isClickInsideModal = (target: Node): boolean => {
        // First check if the click is inside version history modal
        const versionHistoryElements = document.querySelectorAll('.version-history-modal-overlay, .version-history-modal-content');
        for (let i = 0; i < versionHistoryElements.length; i++) {
          if (versionHistoryElements[i].contains(target)) {
            return true;
          }
        }
        
        // Then check if the click is inside any button or interactive element inside a modal
        const modalButtons = document.querySelectorAll('button, input, select, a');
        for (let i = 0; i < modalButtons.length; i++) {
          const button = modalButtons[i];
          // Check if this button is inside a modal-like container
          let parent = button.parentElement;
          while (parent) {
            if (parent.classList && 
                (parent.classList.contains('modal') || 
                 parent.classList.contains('modal-content') || 
                 parent.getAttribute('role') === 'dialog' ||
                 parent.classList.contains('version-history-modal-content'))) {
              if (button.contains(target)) {
                return true;
              }
              break;
            }
            parent = parent.parentElement;
          }
        }
        
        // Check if the click is inside any modal by checking for common modal class names or attributes
        const modalElements = document.querySelectorAll('[role="dialog"], .modal, .modal-content');
        for (let i = 0; i < modalElements.length; i++) {
          if (modalElements[i].contains(target)) {
            return true;
          }
        }
        
        return false;
      };

      // Only close the panel if the click is outside the panel AND not inside any modal
      if (panelRef.current && 
          !panelRef.current.contains(event.target as Node) && 
          !isClickInsideModal(event.target as Node) && 
          isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Default empty question template
  const getDefaultQuestion = (): QuestionSection => ({
    id: `new-question-${Date.now()}`,
    question: {
      text: '',
      description: '', // Will be cast to string in the actual question object
      answerType: 'likert',
      answers: [
        { text: 'Strongly Disagree', value: 'Strongly Disagree' },
        { text: 'Disagree', value: 'Disagree' },
        { text: 'Neither Agree nor Disagree', value: 'Neither Agree nor Disagree' },
        { text: 'Agree', value: 'Agree' },
        { text: 'Strongly Agree', value: 'Strongly Agree' }
      ],
      required: true,
      image: '',
      status: 'draft',
      estimatedTimeSeconds: 30,
      folderId: null, // Default to no folder
      showEmojis: true, // Default to showing emojis for Likert questions
    },
    isExpanded: true,
    isNew: true,
  });
  
  // State for questions
  const [questions, setQuestions] = useState<QuestionSection[]>([getDefaultQuestion()]);
  // State for tracking form submission loading
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Add state to track if data is fully loaded and ready to display
  const [dataLoaded, setDataLoaded] = useState(false);
  // State for save to question bank toggle (default to false)
  const [saveToQuestionBank, setSaveToQuestionBank] = useState(false);
  // State for preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  // State for template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  // State for save as template modal
  const [showSaveAsTemplateModal, setShowSaveAsTemplateModal] = useState(false);
  
  // Subscribe to the specific question data if in edit mode
  const questionSub = useTracker(() => {
    if (questionId) {
      console.log('Subscribing to question data for ID:', questionId);
      // Reset dataLoaded state when subscription changes
      setDataLoaded(false);
      
      // Subscribe to all questions to ensure we have access to the data
      // This is a temporary fix to ensure we can access the question data
      const subscription = Meteor.subscribe('questions.all');
      console.log('Subscribed to all questions, ready:', subscription.ready());
      return subscription;
    }
    return { ready: (): boolean => true };
  }, [questionId]);
  
  // Fetch the editing question directly from the collection if in edit mode
  const editingDoc = useTracker(() => {
    if (questionId && questionSub.ready()) {
      try {
        // Import the Questions collection
        const { Questions } = require('/imports/features/questions/api/questions');
        
        // Debug the Questions collection
        console.log('Questions collection available:', !!Questions);
        
        // Find the question directly from the collection
        const question = Questions.findOne({ _id: questionId });
        console.log('Looking for question with ID:', questionId);
        console.log('Found question in collection:', question);
        
        if (!question) {
          console.error('Question not found in collection. Available questions:', Questions.find({}).count());
          
          // Attempt to fetch the question directly from the server as a fallback
          Meteor.call('questions.getById', questionId, (error: Meteor.Error | null, result: any) => {
            if (error) {
              console.error('Error fetching question from server:', error);
            } else if (result) {
              console.log('Got question from server method:', result);
              // Manually update the questions state with the fetched data
              processQuestionData(result);
            }
          });
        }
        
        return question;
      } catch (error) {
        console.error('Error fetching question from collection:', error);
        return null;
      }
    }
    return null;
  }, [questionId, questionSub.ready()]);
  
  // Helper function to process question data and update state
  const processQuestionData = (questionDoc: any) => {
    if (!questionDoc) return;
    
    try {
      console.log('Processing question data:', questionDoc);
      
      // Get the current version of the question
      const currentVersionIndex = questionDoc.currentVersion - 1;
      const currentVersionData = questionDoc.versions[currentVersionIndex];
      
      console.log('Current version data:', currentVersionData);
      
      // Update the saveToQuestionBank toggle state based on the question's saved value
      // If saveToQuestionBank is explicitly false, set it to false; otherwise default to true
      const questionSaveToQuestionBank = currentVersionData.saveToQuestionBank !== false;
      setSaveToQuestionBank(questionSaveToQuestionBank);
      console.log(`Setting saveToQuestionBank toggle to: ${questionSaveToQuestionBank}`);
      
      // Map the database question format to the form format
      const questionToEdit = {
        id: `edit-question-${questionId}`,
        question: {
          _id: questionId,
          text: currentVersionData.questionText || '',
          description: currentVersionData.description || '',
          answerType: currentVersionData.responseType || 'text',
          answers: Array.isArray(currentVersionData.options) ? currentVersionData.options : [],
          required: !!currentVersionData.required,
          image: currentVersionData.image || '',
          leftLabel: currentVersionData.leftLabel || '',
          rightLabel: currentVersionData.rightLabel || '',
          wpsCategoryIds: currentVersionData.categoryTags || [],
          surveyThemeIds: currentVersionData.surveyThemes || [],
          questionTagId: currentVersionData.questionTag || '',
          customFields: currentVersionData.customFields || [],
          collectFeedback: currentVersionData.collectFeedback || false,
          feedbackType: currentVersionData.feedbackType || 'text',
          feedbackPrompt: currentVersionData.feedbackPrompt || '',
          estimatedTimeSeconds: currentVersionData.estimatedTimeSeconds || 0,
          // Make sure to include all fields needed by the Tag Builder
          labels: currentVersionData.labels || [],
          tags: currentVersionData.labels || [], // Ensure tags field is also populated for backward compatibility
          categoryTags: currentVersionData.categoryTags || [],
          surveyThemes: currentVersionData.surveyThemes || [],
          keywords: currentVersionData.keywords || [],
          categoryId: currentVersionData.categoryId || '',
          categoryDetails: currentVersionData.categoryDetails || '',
          // Assessment mode fields
          isAssessment: !!currentVersionData.isAssessment,
          correctAnswers: currentVersionData.correctAnswers || [],
          points: currentVersionData.points || 1,
          // Settings fields
          reusable: !!currentVersionData.reusable,
          isActive: currentVersionData.isActive === undefined ? true : !!currentVersionData.isActive,
          priority: currentVersionData.priority || 0,
          feedback: currentVersionData.feedback || 'none',
          // Likert question display options
          showEmojis: currentVersionData.showEmojis === false ? false : true, // Default to true if undefined
        },
        isExpanded: true,
        isNew: false,
      };
      
      console.log('Mapped question data for form:', questionToEdit);
      
      // Set the questions data and mark as loaded
      setQuestions([questionToEdit]);
      
      // Set dataLoaded to true immediately to trigger re-render
      setDataLoaded(true);
      console.log('Question data fully loaded and ready to display');
    } catch (error) {
      console.error('Error processing question data:', error);
    }
  };
  
  // Track loading state
  const isLoading = useTracker(() => {
    const loading = questionId && !questionSub.ready();
    return loading;
  }, [questionId, questionSub.ready()]);
  
  // Effect to reset when panel is closed
  useEffect(() => {
    if (!isOpen) {
      // Reset to default when panel is closed
      setQuestions([getDefaultQuestion()]);
      setActiveTabIndex(0);
      setDataLoaded(false); // Reset data loaded state
    }
  }, [isOpen]);

  // Effect to load question data when editing or reset when creating new
  useEffect(() => {
    // Only process if panel is open
    if (!isOpen) return;
    
    // Reset to default empty question when panel opens for new question (no questionId)
    if (!questionId) {
      console.log('Creating new question - using default empty question');
      setQuestions([getDefaultQuestion()]);
      setActiveTabIndex(0); // Reset to first tab
      setDataLoaded(true); // Mark as loaded for new questions
    }
  }, [isOpen, questionId]);
  
  // Separate effect to handle loading question data when editingDoc changes
  useEffect(() => {
    // Only process if panel is open and we have questionId
    if (!isOpen || !questionId) return;
    
    // If we don't have editingDoc yet, show loading state
    if (!editingDoc) {
      console.log('Waiting for question data to load...');
      // Show loading state or empty form while waiting for data
      setQuestions([getDefaultQuestion()]);
      setDataLoaded(false); // Mark as not loaded yet
      return;
    }
    
    // Process the question data using our helper function
    processQuestionData(editingDoc);
    
  }, [isOpen, questionId, editingDoc]);

  // Handle saving the question (manual save button)
  const handleSaveQuestion = async () => {
    try {
      setIsSubmitting(true);
      const userId = Meteor.userId();
      if (!userId) {
        showErrorAlert('You must be logged in to save questions');
        setIsSubmitting(false);
        return;
      }

      // Get the current question data
      const currentQuestion = questions[0].question;
      
      // Log the data being saved for debugging
      console.log('Saving question data:', currentQuestion);
      
      // Import the necessary functions
      const { mapQuestionToVersion, saveQuestionsToDB } = await import('/imports/features/questions/api/questions.methods.client');
      
      // Extract correct answers from answer options if in assessment mode
      let correctAnswers = currentQuestion.correctAnswers || [];
      if (currentQuestion.isAssessment && ['radio', 'checkbox', 'dropdown'].includes(currentQuestion.answerType)) {
        // Extract correct answers from the answer options
        correctAnswers = (currentQuestion.answers || [])
          .filter(answer => answer.isCorrect)
          .map(answer => answer.text || answer.value);
      }
      
      // Ensure all fields are properly set before mapping
      const questionToSave = {
        ...currentQuestion,
        // Ensure required fields are properly set for TypeScript
        text: currentQuestion.text || '',
        description: currentQuestion.description || '',
        answerType: currentQuestion.answerType || 'text',
        answers: currentQuestion.answers || [],
        required: !!currentQuestion.required,
        image: currentQuestion.image || '',
        // Ensure tags field is also populated for backward compatibility
        tags: currentQuestion.labels || [],
        // Ensure assessment mode fields are properly set
        isAssessment: !!currentQuestion.isAssessment,
        correctAnswers: correctAnswers,
        points: currentQuestion.points || 1,
        // Ensure settings fields are properly set
        reusable: !!currentQuestion.reusable,
        isActive: currentQuestion.isActive === undefined ? true : !!currentQuestion.isActive,
        priority: currentQuestion.priority || 0,
        feedback: currentQuestion.feedback || 'none',
      };
      
      // When in questionBank context (All Questions page), always force save to question bank
      // Create a new variable that we can modify
      let effectiveSaveToQuestionBank = saveToQuestionBank;
      if (context === 'questionBank') {
        // Override effectiveSaveToQuestionBank to always be true in this context
        // This ensures questions created from All Questions page are always saved properly
        effectiveSaveToQuestionBank = true;
      }
      
      // Map the question to the version format expected by the API
      // Include saveToQuestionBank flag and surveyId if in survey builder context
      // Use type assertion to handle the customFields type mismatch
      const questionVersion = mapQuestionToVersion(questionToSave as any, effectiveSaveToQuestionBank, surveyId, userId);
      
      console.log(`Saving question with saveToQuestionBank=${effectiveSaveToQuestionBank}, surveyId=${surveyId || 'none'}`);
      
      // Check if we're trying to save a survey-specific question without a surveyId
      if (!effectiveSaveToQuestionBank && !surveyId) {
        showErrorAlert('Error saving question: surveyId is not defined');
        console.error('Cannot save survey-specific question without a surveyId');
        return;
      }
      
      // Log the mapped version for debugging
      console.log('Mapped question version for saving:', questionVersion);
      
      // Save the question to the database
      // Use the existing ID if we're editing a question
      const questionId = currentQuestion._id || null;
      const result = await saveQuestionsToDB(questionId, questionVersion);
      
      // Update the question ID if it's a new question
      if (!currentQuestion._id && result) {
        const updatedQuestions = [...questions];
        updatedQuestions[0].question._id = result;
        setQuestions(updatedQuestions);
      }

      showSuccessAlert('Question saved successfully!');
      // Also show global notification that persists after panel closes
      notificationManager.success('Question saved successfully!');
      setIsSubmitting(false);
      
      // Handle different contexts
      const savedQuestionId = result || currentQuestion._id || '';
      
      console.log('Question saved with context:', context);
      console.log('onQuestionCreated is a function?', typeof onQuestionCreated === 'function');
      
      if (context === 'surveyBuilder') {
        console.log('In surveyBuilder context, calling onQuestionCreated with ID:', savedQuestionId);
        // For survey builder, call the onQuestionCreated callback with the question ID
        if (typeof onQuestionCreated === 'function') {
          onQuestionCreated(savedQuestionId);
        } else {
          console.error('onQuestionCreated is not a function in surveyBuilder context');
          // Continue with panel close even if callback is not available
        }
        // Always close the panel in survey builder context
        onClose();
      } else if (typeof onQuestionSaved === 'function') {
        // General callback for any context
        onQuestionSaved(savedQuestionId);
      } else if (context === 'questionBank') {
        // In question bank context, we may want to keep the panel open for further editing
        // Only close if explicitly requested
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving question:', error);
      showErrorAlert(`Error saving question: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  // Handle publishing the question
  const handlePublishQuestion = async () => {
    try {
      setIsSubmitting(true);
      const userId = Meteor.userId();
      if (!userId) {
        showErrorAlert('You must be logged in to publish questions');
        setIsSubmitting(false);
        return;
      }

      // Get the current question data
      const currentQuestion = questions[0].question;
      
      // Log the data being published for debugging
      console.log('Publishing question data:', currentQuestion);
      
      // Import the necessary functions
      const { mapQuestionToVersion, publishQuestionsToDB } = await import('/imports/features/questions/api/questions.methods.client');
      
      // Ensure all fields are properly set before mapping
      const questionToPublish = {
        ...currentQuestion,
        // Ensure tags field is also populated for backward compatibility
        tags: currentQuestion.labels || [],
        // Ensure assessment mode fields are properly set
        isAssessment: !!currentQuestion.isAssessment,
        correctAnswers: currentQuestion.correctAnswers || [],
        points: currentQuestion.points || 1,
        // Ensure settings fields are properly set
        reusable: !!currentQuestion.reusable,
        isActive: currentQuestion.isActive === undefined ? true : !!currentQuestion.isActive,
        priority: currentQuestion.priority || 0,
        feedback: currentQuestion.feedback || 'none',
      };
      
      // When in questionBank context (All Questions page), always force save to question bank
      // Create a new variable that we can modify
      let effectiveSaveToQuestionBank = saveToQuestionBank;
      if (context === 'questionBank') {
        // Override effectiveSaveToQuestionBank to always be true in this context
        // This ensures questions created from All Questions page are always saved properly
        effectiveSaveToQuestionBank = true;
      }
      
      // Map the question to the version format expected by the API
      // Include saveToQuestionBank flag and surveyId if in survey builder context
      const questionVersion = mapQuestionToVersion(questionToPublish, effectiveSaveToQuestionBank, surveyId, userId);
      
      
      // Check if we're trying to save a survey-specific question without a surveyId
      if (!effectiveSaveToQuestionBank && !surveyId) {
        showErrorAlert('Error publishing question: surveyId is not defined');
        console.error('Cannot save survey-specific question without a surveyId');
        return;
      }
      
      // Log the mapped version for debugging
      console.log('Mapped question version for publishing:', questionVersion);
      
      // Publish the question to the database
      // Use the existing ID if we're editing a question
      const questionId = currentQuestion._id || null;
      const result = await publishQuestionsToDB(questionId, questionVersion);
      
      // Update the question ID if it's a new question
      if (!currentQuestion._id && result) {
        const updatedQuestions = [...questions];
        updatedQuestions[0].question._id = result;
        setQuestions(updatedQuestions);
      }

      showSuccessAlert('Question published successfully!');
      // Also show global notification that persists after panel closes
      notificationManager.success('Question published successfully!');
      setIsSubmitting(false);
      
      // Handle different contexts similar to save function
      const publishedQuestionId = result || currentQuestion._id || '';
      
      if (context === 'surveyBuilder') {
        console.log('In surveyBuilder context, calling onQuestionCreated with ID:', publishedQuestionId);
        console.log('onQuestionCreated is a function?', typeof onQuestionCreated === 'function');
        // For survey builder, call the onQuestionCreated callback with the question ID
        if (typeof onQuestionCreated === 'function') {
          onQuestionCreated(publishedQuestionId);
        } else {
          console.error('onQuestionCreated is not a function in surveyBuilder context');
          // Continue with panel close even if callback is not available
        }
        // Always close the panel in survey builder context
        onClose();
      } else if (typeof onQuestionSaved === 'function') {
        // General callback for any context
        onQuestionSaved(publishedQuestionId);
      } else {
        // In all other cases, close the panel
        onClose();
      }
    } catch (error: any) {
      console.error('Error publishing question:', error);
      showErrorAlert(`Error publishing question: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  // Handle reverting to a previous version
  const handleRevertVersion = async (versionNumber: number): Promise<void> => {
    try {
      if (!questionId) return;
      
      // Show progress alert
      showProgressAlert('Reverting to version ' + versionNumber + '...', 50);
      
      // Call the server method to revert the question
      await Meteor.callAsync('questions.revertToVersion', questionId, versionNumber);
      
      // Show success message
      showSuccessAlert('Question reverted to version ' + versionNumber);
      
      // Refresh the question data
      const { Questions } = await import('/imports/features/questions/api/questions');
      const refreshedQuestion = Questions.findOne({ _id: questionId });
      if (refreshedQuestion) {
        processQuestionData(refreshedQuestion);
      }
      
      // Notify parent component if provided
      if (onQuestionSaved) {
        onQuestionSaved(questionId);
      }
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error reverting question version:', error);
      showErrorAlert('Failed to revert: ' + (error.message || 'Unknown error'));
      return Promise.reject(error);
    }
  };
  
  // Handle updating version name
  const handleUpdateVersionName = async (versionNumber: number, versionName: string): Promise<void> => {
    try {
      if (!questionId) return;
      
      // Show progress alert
      showProgressAlert('Updating version name...', 50);
      
      // Call the server method to update the version name
      await Meteor.callAsync('questions.updateVersionName', questionId, versionNumber, versionName);
      
      // Show success message
      showSuccessAlert('Version name updated successfully');
      
      // Refresh the question data
      const { Questions } = await import('/imports/features/questions/api/questions');
      const refreshedQuestion = Questions.findOne({ _id: questionId });
      if (refreshedQuestion) {
        processQuestionData(refreshedQuestion);
      }
      
      // Notify parent component if provided
      if (onQuestionSaved) {
        onQuestionSaved(questionId);
      }
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error updating version name:', error);
      showErrorAlert('Failed to update version name: ' + (error.message || 'Unknown error'));
      return Promise.reject(error);
    }
  };

  // If the panel is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  // Create portal for the side panel
  return createPortal(
    <div data-testid="question-builder-side-panel">
      {/* Overlay */}
      <div style={{
        ...sidePanelStyles.overlay as React.CSSProperties,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
       }} />
      
      {/* Side Panel */}
      <div 
        ref={panelRef}
        style={{
          ...sidePanelStyles.panel as React.CSSProperties,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
       >
        {/* Close button */}
        <button 
          style={sidePanelStyles.closeButton as React.CSSProperties} 
          onClick={() => {
            onClose();
          }}
          aria-label="Close panel"
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        >
          <FaTimes style={{ color: '#444' }} />  
        </button>
        
        {/* Panel header */}
        <div style={sidePanelStyles.header as React.CSSProperties}>
          <h2>{readOnly ? 'View Question Version' : (questionId ? 'Edit Question' : 'Create New Question')}</h2>
          
          {readOnly && versionData ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                  onClick={() => {
                    // Only enable revert if this is not the current version
                    if (versionData.version !== versionData.currentVersion) {
                      setVersionUpdateLoading(true);
                      
                      // Debug the version data being passed
                      console.log('Reverting question with data:', {
                        questionId: versionData.questionId,
                        version: versionData.version,
                        versionData
                      });
                      
                      // Ensure we're passing a number for version
                      const versionNumber = parseInt(versionData.version.toString(), 10);
                      
                      // Use Meteor.call to invoke the server method with proper authentication
                      Meteor.call(
                        'questions.revertToVersion',
                        versionData.questionId,
                        versionNumber,
                        (error: Error | null, result: any) => {
                          setVersionUpdateLoading(false);
                          if (error) {
                            console.error('Revert error:', error);
                            showErrorAlert(`Error reverting to version ${versionNumber}: ${error.message}`);
                          } else {
                            console.log('Revert success:', result);
                            // Show success message but keep panel open
                            showSuccessAlert(`Successfully reverted to version ${versionNumber}. The question has been updated.`);
                            
                            // Update the version data to reflect that this is now the current version
                            // This will disable the revert button since it's now the current version
                            if (versionData) {
                              const updatedVersionData = {
                                ...versionData,
                                currentVersion: versionData.version
                              };
                              // Update the version data in state
                              setVersionData(updatedVersionData);
                            }
                          }
                        }
                      );
                    }
                  }}
                disabled={versionData.version === versionData.currentVersion || versionUpdateLoading}
                style={{
                  background: versionData.version === versionData.currentVersion ? '#e0e0e0' : '#552a47',
                  color: versionData.version === versionData.currentVersion ? '#888' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: versionData.version === versionData.currentVersion ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title={versionData.version === versionData.currentVersion ? 'This is the current version' : 'Revert to this version'}
              >
                <FaHistory /> {versionUpdateLoading ? 'Reverting...' : 'Revert'}
              </button>
            </div>
          ) : !readOnly && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
            {/* Only show the toggle in survey builder context */}
            {/* {context === 'surveyBuilder' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginTop: '10px', 
                marginBottom: '10px',
                padding: '8px',
                background: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <ToggleSwitch
                  checked={saveToQuestionBank}
                  onChange={() => setSaveToQuestionBank(!saveToQuestionBank)}
                  disabled={readOnly}
                  label={
                    <>
                      Save to Question Bank
                      <span style={{ 
                        marginLeft: '5px', 
                        fontSize: '12px', 
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        {saveToQuestionBank ? '(Available in all surveys)' : '(Only in this survey)'}
                      </span>
                    </>
                  }
                />
              </div>
            )} */}

            {/* Version History Button - Only show for existing questions */}
            {questionId && editingDoc?.versions && editingDoc.versions.length > 0 && (
              <button
                onClick={() => setShowVersionHistoryModal(true)}
                style={{
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 15px',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e0e0e0')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              >
                <FaHistory />
              </button>
            )}
            
            {/* Save Draft button is hidden as requested */}
            
            {/* Publish Button - Saves, publishes, and closes panel */}
            <div style={{ position: 'relative' }} title="Save, publish to question bank, and close panel">
              <LoadingButton
                onClick={context === 'surveyBuilder' ? handleSaveQuestion : handlePublishQuestion}
                isLoading={isSubmitting}
                loadingText={questionId ? 'Updating...' : 'Adding...'}
                disabled={isLoading}
                variant="primary"
                size="medium"
              >
                {questionId 
                  ? 'Update Question' 
                  : `Add ${context === 'surveyBuilder' && !saveToQuestionBank ? 'to Survey' : 'Question'}`}
              </LoadingButton>
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '0',
                background: '#333',
                color: '#fff',
                padding: '5px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                opacity: 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none',
              }} className="tooltip">
                {questionId 
                  ? `Update and ${saveToQuestionBank ? 'publish to question bank' : 'save only to this survey'}` 
                  : `${saveToQuestionBank ? 'Publish to question bank' : 'Save only to this survey'} and close`}
              </div>
            </div>
          </div>
        </div>
      
      {/* Alert message */}
        {alert && (
          <div style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: alert.type === 'success' ? '#2ecc40' : '#e74c3c',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            zIndex: 2000,
            boxShadow: '0 2px 12px #552a4733',
          }}>
            {alert.message}
          </div>
        )}

        {/* Debug info */}
      <div style={{ display: 'none' }}>
        Debug: isOpen={String(isOpen)}, questionId={questionId || 'none'}, 
        isLoading={String(isLoading)}, dataLoaded={String(dataLoaded)}, 
        hasEditingDoc={String(!!editingDoc)}
      </div>
      
      {/* Show loading indicator while data is being fetched */}
      {isLoading ? (
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '16px',
            color: '#552a47',
            fontWeight: 500
          }}>
            Loading question data...
          </div>
        </div>
      ) : !dataLoaded && questionId ? (
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '16px',
            color: '#552a47',
            fontWeight: 500
          }}>
            Preparing question data...
          </div>
        </div>
      ) : (
        /* Tabs for question builder */
        <Tabs
          selectedIndex={activeTabIndex}
          onSelect={(index) => setActiveTabIndex(index)}
          className="react-tabs question-builder-tabs"
        >
          <TabList className="react-tabs__tab-list question-builder-tab-list">
            <Tab className="react-tabs__tab" style={{ padding: '15px' }}><FaInfoCircle /> Basic Question</Tab>
            <Tab className="react-tabs__tab" style={{ padding: '15px' }}><FaCog /> Advanced</Tab>
          </TabList>

          {/* Basic Information Tab */}
          <TabPanel className="react-tabs__tab-panel">
            <div className="question-builder-section">
              <div className="form-group">
                <label>Question Text <span className="required-asterisk">*</span></label>
                {/* Display HTML content directly when in read-only mode with version data */}
                {readOnly && versionData ? (
                  <div 
                    className="read-only-question-text" 
                    dangerouslySetInnerHTML={{ __html: versionData.questionText || '' }}
                    style={{
                      borderRadius: '8px', 
                      padding: '10px', 
                      backgroundColor: '#f8f9fa', 
                      marginBottom: '10px' 
                    }}
                  />
                ) : (
                  <ReactQuill
                    theme="snow"
                    value={questions[0].question.text}
                    onChange={(value) => {
                      if (readOnly) return;
                      const updatedQuestions = [...questions];
                      updatedQuestions[0].question.text = value;
                      setQuestions(updatedQuestions);
                    }}
                    modules={{
                      toolbar: readOnly ? false : [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                    readOnly={readOnly}
                  />
                )}
              </div>
              
              {/* Description field removed as requested */}
              
              {/* Question Type Selector */}
              <div className="form-group">
                <label>Answer Type <span className="required-asterisk">*</span></label>
                <AnswerTypeSelector
                  selectedType={readOnly && versionData ? versionData.answerType : questions[0].question.answerType}
                  onChange={(newAnswerType) => {
                    if (readOnly) return;
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.answerType = newAnswerType;
                    
                    // Initialize showEmojis property for Likert questions
                    if (newAnswerType === 'likert') {
                      updatedQuestions[0].question.showEmojis = true; // Default to showing emojis
                    } else {
                      delete updatedQuestions[0].question.showEmojis; // Remove property for non-Likert questions
                    }
                    
                    // Set default answers based on the question type
                    switch (newAnswerType) {
                      case 'radio':
                      case 'checkbox':
                        updatedQuestions[0].question.answers = [
                          { text: 'Option 1', value: 'Option 1' },
                          { text: 'Option 2', value: 'Option 2' },
                          { text: 'Option 3', value: 'Option 3' }
                        ];
                        break;
                      case 'dropdown':
                        updatedQuestions[0].question.answers = [
                          { text: 'Select an option', value: '' },
                          { text: 'Option 1', value: 'Option 1' },
                          { text: 'Option 2', value: 'Option 2' },
                          { text: 'Option 3', value: 'Option 3' }
                        ];
                        break;
                      case 'rating':
                        updatedQuestions[0].question.answers = [
                          { text: '1', value: '1' },
                          { text: '2', value: '2' },
                          { text: '3', value: '3' },
                          { text: '4', value: '4' },
                          { text: '5', value: '5' }
                        ];
                        break;
                      case 'likert':
                        updatedQuestions[0].question.answers = [
                          { text: 'Strongly Disagree', value: 'Strongly Disagree' },
                          { text: 'Disagree', value: 'Disagree' },
                          { text: 'Neither Agree nor Disagree', value: 'Neither Agree nor Disagree' },
                          { text: 'Agree', value: 'Agree' },
                          { text: 'Strongly Agree', value: 'Strongly Agree' }
                        ];
                        break;
                      case 'ranking':
                        updatedQuestions[0].question.answers = [
                          { text: 'Item 1', value: 'Item 1' },
                          { text: 'Item 2', value: 'Item 2' },
                          { text: 'Item 3', value: 'Item 3' },
                          { text: 'Item 4', value: 'Item 4' }
                        ];
                        break;
                      default:
                        updatedQuestions[0].question.answers = [];
                        break;
                    }
                    
                    setQuestions(updatedQuestions);
                    
                    // Keep user on the Basic Information tab since Answer Options are now there
                    setActiveTabIndex(0); // Index 0 is the Basic Information tab
                  }}
                  disabled={readOnly}
                />
              </div>
              
              {/* Answer Options - Moved from Answer Options tab */}
              <div className="form-group answer-options-section">
                {readOnly && versionData ? (
                  <div className="read-only-answer-options">
                    {/* For text-based question types, show a message instead of options */}
                    {['text', 'textarea', 'date', 'file'].includes(versionData.responseType || versionData.answerType) ? (
                      <div className="read-only-message" style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                        {versionData.responseType === 'textarea' || versionData.answerType === 'textarea' ? 
                          'Long Text input field will be shown to respondents.' : 
                          versionData.responseType === 'text' || versionData.answerType === 'text' ? 
                          'Short Text input field will be shown to respondents.' :
                          versionData.responseType === 'date' || versionData.answerType === 'date' ? 
                          'Date picker will be shown to respondents.' :
                          'File upload field will be shown to respondents.'}
                      </div>
                    ) : (
                      /* For options-based question types, show the options */
                      <div style={{ marginTop: '10px' }}>
                        {(versionData.options || []).map((option: any, index: number) => (
                          <div key={index} style={{ 
                            padding: '8px 12px',
                            marginBottom: '8px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <span style={{ marginRight: '8px', color: '#666' }}>{index + 1}.</span>
                            <span>{option.text}</span>
                          </div>
                        ))}
                        {(versionData.options || []).length === 0 && (
                          <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', color: '#666' }}>
                            No options defined for this question.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <QuestionBuilderDndProvider>
                    <QuestionBuilderAnswerOptions
                      answerType={questions[0].question.answerType}
                      answers={questions[0].question.answers || []}
                      onAnswersChange={(answers) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[0].question = {
                          ...updatedQuestions[0].question,
                          answers
                        };
                        setQuestions(updatedQuestions);
                      }}
                      isAssessment={questions[0].question.isAssessment || false}
                      onIsAssessmentChange={(isAssessment) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[0].question = {
                          ...updatedQuestions[0].question,
                          isAssessment
                        };
                        setQuestions(updatedQuestions);
                      }}
                      correctAnswers={questions[0].question.correctAnswers || []}
                      onCorrectAnswersChange={(correctAnswers) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[0].question = {
                          ...updatedQuestions[0].question,
                          correctAnswers
                        };
                        setQuestions(updatedQuestions);
                      }}
                      points={questions[0].question.points || 1}
                      onPointsChange={(points) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[0].question = {
                          ...updatedQuestions[0].question,
                          points
                        };
                        setQuestions(updatedQuestions);
                      }}
                    />
                  </QuestionBuilderDndProvider>
                )}
              </div>

              {/* Question Display Options - Only shown for Likert questions */}
              {!readOnly && questions[0].question.answerType === 'likert' && (
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>Question Display Options</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '15px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>Show Emojis in This Question</div>
                      <div style={{ fontSize: 14, color: '#6c757d', marginTop: 4 }}>
                        When enabled, this Likert scale question will display emojis to represent different levels of agreement.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 10, color: questions[0].question.showEmojis ? '#6c757d' : '#552a47', fontWeight: questions[0].question.showEmojis ? 400 : 600 }}>Hide</span>
                      <div 
                        onClick={() => {
                          if (readOnly) return;
                          const newValue = !questions[0].question.showEmojis;
                          const updatedQuestions = [...questions];
                          updatedQuestions[0].question.showEmojis = newValue;
                          setQuestions(updatedQuestions);
                        }}
                        style={{ 
                          width: 50, 
                          height: 24, 
                          backgroundColor: questions[0].question.showEmojis ? '#552a47' : '#e0e0e0',
                          borderRadius: 12,
                          position: 'relative',
                          cursor: readOnly ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.3s',
                          display: 'inline-block',
                          opacity: readOnly ? 0.6 : 1
                        }}
                      >
                        <div 
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: 2,
                            left: questions[0].question.showEmojis ? 28 : 2,
                            transition: 'left 0.3s',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                          }}
                        />
                      </div>
                      <span style={{ marginLeft: 10, color: questions[0].question.showEmojis ? '#552a47' : '#6c757d', fontWeight: questions[0].question.showEmojis ? 600 : 400 }}>Show</span>
                    </div>
                  </div>
                </div>
              )}
              
             
              
              {/* Question Image moved to Advanced tab */}
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={readOnly && versionData ? !!versionData.required : !!questions[0].question.required}
                    onChange={(e) => {
                      if (readOnly) return;
                      const updatedQuestions = [...questions];
                      updatedQuestions[0].question.required = e.target.checked;
                      setQuestions(updatedQuestions);
                    }}
                    disabled={readOnly}
                  />
                  Required Question
                </label>
              </div>
              {/* Add spacing below Required Question */}
              <div style={{ marginBottom: '20px' }}></div>
            </div>
          </TabPanel>

          {/* Classification Tab removed as requested */}
          {/* Custom Fields Tab removed as requested */}
          {/* Answer Options Tab removed as requested */}

          {/* Advanced Tab */}
          <TabPanel className="react-tabs__tab-panel">
            <div className="question-builder-section">
              <div className="form-group">
                <label>Question Image</label>
                <div className="image-upload-container">
                  {(readOnly && versionData && versionData.image) || (!readOnly && questions[0].question.image) ? (
                    <div className="image-preview" style={{ position: 'relative' }}>
                      <img 
                        src={readOnly && versionData ? versionData.image : questions[0].question.image} 
                        alt="Question" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          display: 'block',
                          margin: '0 auto',
                          borderRadius: '4px'
                        }} 
                      />
                       {!readOnly && (
                        <button
                          className="remove-image-button"
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[0].question.image = '';
                            setQuestions(updatedQuestions);
                            showSuccessAlert('Image removed successfully!');
                          }}
                        >
                          <FaTimes />
                        </button>
                       )}
                      </div>
                    ) : (
                      <div 
                        className="image-upload-dropzone"
                        style={{
                          border: '2px dashed #ccc',
                          borderRadius: '4px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: readOnly ? 'default' : 'pointer',
                          position: 'relative' // Add position relative to contain absolute positioned children
                        }}
                      >
                        {!readOnly && (
                          <input
                            type="file"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer',
                              zIndex: 1 // Add z-index to ensure it's properly layered
                            }}
                            accept="image/jpeg,image/png,image/gif"
                            onChange={(e) => {
                              if (readOnly) return;
                              
                              const file = e.target.files?.[0];
                              if (file) {
                                // Show initial loading state with 0% progress
                                showProgressAlert('Uploading image...', 0);
                                
                                // Create a FormData object to upload the file
                                const formData = new FormData();
                                formData.append('file', file);
                                
                                // Convert FormData to base64 string for Meteor method
                                const reader = new FileReader();
                                reader.readAsDataURL(file);
                                
                                // Show progress during file reading
                                reader.onprogress = (event) => {
                                  if (event.lengthComputable) {
                                    const progress = Math.round((event.loaded / event.total) * 50); // First 50% for reading
                                    showProgressAlert('Reading image...', progress);
                                  }
                                };
                                
                                reader.onload = () => {
                                  const base64data = reader.result;
                                  
                                  // Show 50% progress when starting upload to server
                                  showProgressAlert('Uploading to server...', 50);
                                  
                                  // Simulate upload progress (since Meteor.call doesn't provide progress events)
                                  const progressInterval = setInterval(() => {
                                    setAlert(prevAlert => {
                                      if (prevAlert?.type === 'progress' && prevAlert.progress !== undefined) {
                                        const newProgress = Math.min(prevAlert.progress + 5, 90); // Cap at 90% until complete
                                        return { ...prevAlert, progress: newProgress };
                                      }
                                      return prevAlert;
                                    });
                                  }, 200);
                                  
                                  // Use Meteor method to upload the file
                                  Meteor.call('uploadQuestionImage', { file: base64data, name: file.name }, (err: Error, result: { url: string }) => {
                                    clearInterval(progressInterval);
                                    
                                    if (err) {
                                      console.error('Error uploading image:', err);
                                      showErrorAlert(`Error uploading image: ${err.message || 'Unknown error'}`);
                                      return;
                                    }
                                    
                                    // Show 100% progress briefly before success message
                                    showProgressAlert('Upload complete!', 100);
                                    
                                    // Update question with the image URL
                                    const updatedQuestions = [...questions];
                                    updatedQuestions[0].question.image = result.url;
                                    setQuestions(updatedQuestions);
                                    
                                    // Show success message after a brief delay
                                    setTimeout(() => {
                                      showSuccessAlert('Image uploaded successfully!');
                                    }, 500);
                                  });
                                };
                                
                                reader.onerror = () => {
                                  console.error('Error reading file');
                                  showErrorAlert('Error reading file. Please try again.');
                                };
                              }
                            }}
                          />
                        )}
                        <FaCloudUploadAlt style={{ fontSize: '32px', color: '#888', marginBottom: '10px' }} />
                        <p style={{ margin: '0', color: '#666' }}>{readOnly ? 'No image available' : 'Drag an image here or click to browse'}</p>
                        {!readOnly && (
                          <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888' }}>Supported formats: JPG, PNG, GIF</p>
                        )}
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </TabPanel>

        </Tabs>
      )}
      </div>
      
      {/* Version History Modal */}
      {showVersionHistoryModal && editingDoc?.versions && (
        <VersionHistoryModal
          versions={editingDoc.versions}
          currentVersion={editingDoc.currentVersion}
          onClose={() => setShowVersionHistoryModal(false)}
          onRevert={handleRevertVersion}
          onUpdateVersionName={handleUpdateVersionName}
          keepOpenOnView={true} /* Keep the modal open when viewing a version */
          questionId={questionId} /* Pass the current question ID */
        />
      )}
      </div>,
      document.body
      );
}

export default QuestionBuilderSidePanel;
