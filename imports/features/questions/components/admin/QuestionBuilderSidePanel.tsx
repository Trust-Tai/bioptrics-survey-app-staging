import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ReactQuill from 'react-quill';
import '../../../../ui/styles/quill-styles';
import 'react-quill/dist/quill.snow.css';
import { FaPlus, FaMinus, FaUndo, FaRedo, FaSave, FaEye, FaChevronDown, FaChevronUp, FaTrash, FaTimes, FaEllipsisV, FaInfoCircle, FaList, FaEdit, FaCodeBranch, FaCog, FaClone, FaDownload, FaUser, FaVenusMars, FaGlobe, FaGraduationCap, FaBriefcase, FaUsers, FaMoneyBillAlt, FaUserFriends, FaLanguage, FaMobile, FaIndustry, FaRing, FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';
import TagBuilder from './TagBuilder';
import FolderSelector from './FolderSelector';
import ToggleSwitch from './ToggleSwitch';

// Import enhanced components
import QuestionBuilderDndProvider from './QuestionBuilderDndProvider';
import QuestionBuilderStateManager from './QuestionBuilderStateManager';
import QuestionBuilderAnswerOptions from './QuestionBuilderAnswerOptions';
import QuestionBuilderBranchingTab from './QuestionBuilderBranchingTab';
import QuestionBuilderPreview from './QuestionBuilderPreview';
import EnhancedQuestionPreviewModal from './EnhancedQuestionPreviewModal';
import SaveAsTemplateModal from './SaveAsTemplateModal';
import QuestionTemplatesModal from './QuestionTemplatesModal';

// Import Question type from API
import { Question as ApiQuestion } from '/imports/features/questions/api/questions.methods.client';

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
  description: string; // Make description required to fix TypeScript error
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

/**
 * Question Builder Side Panel component
 * Wraps the existing question builder functionality in a side panel
 */
export const QuestionBuilderSidePanel: React.FC<QuestionBuilderSidePanelProps> = ({ 
  isOpen, 
  onClose, 
  questionId, 
  context = 'questionBank', // Default to questionBank context
  onQuestionCreated,
  onQuestionSaved 
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
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

  // Handle escape key to close panel
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent body scrolling when panel is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle clicks outside the panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && isOpen) {
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
    },
    isExpanded: true,
    isNew: true,
  });
  
  // State for questions
  const [questions, setQuestions] = useState<QuestionSection[]>([getDefaultQuestion()]);
  // Add state to track if data is fully loaded and ready to display
  const [dataLoaded, setDataLoaded] = useState(false);

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
          active: currentVersionData.active === undefined ? true : !!currentVersionData.active,
          priority: currentVersionData.priority || 0,
          feedback: currentVersionData.feedback || 'none',
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
  
  // Log the editing document whenever it changes
  useEffect(() => {
    if (editingDoc) {
      console.log('Editing document from collection:', editingDoc);
    }
  }, [editingDoc]);
  
  // Debug log when panel opens/closes or questionId changes
  useEffect(() => {
    console.log('Panel state changed:', { isOpen, questionId });
  }, [isOpen, questionId]);
  
  // Track loading state
  const isLoading = useTracker(() => {
    const loading = questionId && !questionSub.ready();
    console.log('QuestionBuilderSidePanel loading state:', { questionId, isSubscriptionReady: questionSub.ready(), loading });
    return loading;
  }, [questionId, questionSub.ready()]);
  
  // Effect to reset when panel is closed
  useEffect(() => {
    if (!isOpen) {
      console.log('Panel closed - resetting state');
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

  // Handle saving the question
  const handleSaveQuestion = async () => {
    try {
      const userId = Meteor.userId();
      if (!userId) {
        showErrorAlert('You must be logged in to save questions');
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
        active: currentQuestion.active === undefined ? true : !!currentQuestion.active,
        priority: currentQuestion.priority || 0,
        feedback: currentQuestion.feedback || 'none',
      };
      
      // Map the question to the version format expected by the API
      const questionVersion = mapQuestionToVersion(questionToSave, userId);
      
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
      
      // Handle different contexts
      const savedQuestionId = result || currentQuestion._id || '';
      
      if (context === 'surveyBuilder') {
        // For survey builder, call the onQuestionCreated callback with the question ID
        if (typeof onQuestionCreated === 'function') {
          onQuestionCreated(savedQuestionId);
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
    }
  };

  // Handle publishing the question
  const handlePublishQuestion = async () => {
    try {
      const userId = Meteor.userId();
      if (!userId) {
        showErrorAlert('You must be logged in to publish questions');
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
        active: currentQuestion.active === undefined ? true : !!currentQuestion.active,
        priority: currentQuestion.priority || 0,
        feedback: currentQuestion.feedback || 'none',
      };
      
      // Map the question to the version format expected by the API
      const questionVersion = mapQuestionToVersion(questionToPublish, userId);
      
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
      
      // Handle different contexts similar to save function
      const publishedQuestionId = result || currentQuestion._id || '';
      
      if (context === 'surveyBuilder') {
        // For survey builder, call the onQuestionCreated callback with the question ID
        if (typeof onQuestionCreated === 'function') {
          onQuestionCreated(publishedQuestionId);
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
    }
  };

  // If the panel is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  // Create portal for the side panel
  return createPortal(
    <div>
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
          onClick={onClose}
          aria-label="Close panel"
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        >
          <FaTimes style={{ color: '#444' }} />  
        </button>
        
        {/* Panel header */}
        <div style={sidePanelStyles.header as React.CSSProperties}>
          <h2>{questionId ? 'Edit Question' : 'Create New Question'}</h2>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {/* Save Draft button is hidden as requested */}
            
            {/* Publish Button - Saves, publishes, and closes panel */}
            <div style={{ position: 'relative' }} title="Save, publish to question bank, and close panel">
              <button
                onClick={handlePublishQuestion}
                style={{
                  background: '#552a47', /* Brand color */
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isLoading ? 0.7 : 1,
                }}
                disabled={isLoading}
                onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = '#6e3a5d')} /* Darker shade for hover */
                onMouseOut={(e) => !isLoading && (e.currentTarget.style.background = '#552a47')}
              >
                {questionId ? 'Update' : 'Publish'}
              </button>
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
                {questionId ? 'Update and publish to question bank' : 'Publish to question bank and close'}
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
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
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
                <ReactQuill
                  theme="snow"
                  value={questions[0].question.text}
                  onChange={(value) => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.text = value;
                    setQuestions(updatedQuestions);
                  }}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                />
              </div>
              
              {/* Description field removed as requested */}
              
              {/* Question Type Dropdown */}
              <div className="form-group">
                <label>Question Type <span className="required-asterisk">*</span></label>
                <select
                  value={questions[0].question.answerType}
                  onChange={(e) => {
                    const newAnswerType = e.target.value;
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.answerType = newAnswerType;
                    
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
                  className="form-control"
                >
                  <option value="radio">Single Choice (Radio)</option>
                  <option value="checkbox">Multiple Choice (Checkbox)</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text</option>
                  <option value="rating">Rating Scale</option>
                  <option value="likert">Likert Scale</option>
                  <option value="ranking">Ranking</option>
                  <option value="date">Date</option>
                  <option value="file">File Upload</option>
                </select>
              </div>
              
              {/* Answer Options - Moved from Answer Options tab */}
              <div className="form-group answer-options-section">
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
              </div>
              
              {/* Tag Builder */}
              <div className="form-group">
                <TagBuilder 
                  selectedTagIds={questions[0].question.labels || []} 
                  onTagChange={(labels) => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.labels = labels;
                    // Make sure to update both labels and tags fields for backward compatibility
                    updatedQuestions[0].question.tags = labels;
                    setQuestions(updatedQuestions);
                    console.log('Tags updated:', labels);
                  }}
                />
              </div>
              
              {/* Folder Selector */}
              <div className="form-group">
                <FolderSelector
                  selectedFolderId={questions[0].question.folderId || null}
                  onFolderChange={(folderId) => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.folderId = folderId;
                    setQuestions(updatedQuestions);
                    console.log('Folder updated:', folderId);
                  }}
                />
              </div>
              
              {/* Question Image moved to Advanced tab */}
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!questions[0].question.required}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[0].question.required = e.target.checked;
                      setQuestions(updatedQuestions);
                    }}
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
                  {questions[0].question.image ? (
                    <div className="image-preview" style={{ position: 'relative' }}>
                      <img 
                        src={questions[0].question.image} 
                        alt="Question" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          display: 'block',
                          margin: '0 auto',
                          borderRadius: '4px'
                        }} 
                      />
                      <button
                        className="remove-image-button"
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px'
                        }}
                        onClick={() => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[0].question.image = '';
                          setQuestions(updatedQuestions);
                          showSuccessAlert('Image removed successfully');
                        }}
                      >
                        <FaTimes /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload" style={{
                      border: '2px dashed #ccc',
                      borderRadius: '4px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f9f9f9',
                      position: 'relative'
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Show loading state
                            showSuccessAlert('Uploading image...');
                            
                            // Create a FormData object to upload the file
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            // Convert FormData to base64 string for Meteor method
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = () => {
                              const base64data = reader.result;
                              
                              // Use Meteor method to upload the file
                              Meteor.call('uploadQuestionImage', { file: base64data, name: file.name }, (error: Error, result: { url: string }) => {
                                if (error) {
                                  console.error('Error uploading image:', error);
                                  showErrorAlert(`Error uploading image: ${error.message || 'Unknown error'}`);
                                  return;
                                }
                                
                                // Update question with the image URL
                                const updatedQuestions = [...questions];
                                updatedQuestions[0].question.image = result.url;
                                setQuestions(updatedQuestions);
                                showSuccessAlert('Image uploaded successfully!');
                              });
                            };
                            
                            reader.onerror = (error) => {
                              console.error('Error reading file:', error);
                              showErrorAlert('Error reading file. Please try again.');
                            };
                          }
                        }}
                      />
                      <FaCloudUploadAlt style={{ fontSize: '32px', color: '#888', marginBottom: '10px' }} />
                      <p style={{ margin: '0', color: '#666' }}>Drag an image here or click to browse</p>
                      <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888' }}>Supported formats: JPG, PNG, GIF</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Feedback Collection</label>
                <select
                  value={questions[0].question.feedback || 'none'}
                  onChange={(e) => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.feedback = e.target.value;
                    setQuestions(updatedQuestions);
                  }}
                  className="form-control"
                >
                  <option value="none">No Feedback</option>
                  <option value="optional">Optional Feedback</option>
                  <option value="required">Required Feedback</option>
                  <option value="rating">Rating Feedback</option>
                  <option value="rating_comment">Rating with Comment</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Estimated Time to Answer</label>
                <div className="estimated-time-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={Math.floor((questions[0].question.estimatedTimeSeconds || 30) / 60)}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value);
                        if (!isNaN(mins) && mins >= 0) {
                          const secs = (questions[0].question.estimatedTimeSeconds || 30) % 60;
                          const totalSecs = (mins * 60) + secs;
                          const updatedQuestions = [...questions];
                          updatedQuestions[0].question.estimatedTimeSeconds = totalSecs;
                          setQuestions(updatedQuestions);
                        }
                      }}
                      className="form-control"
                      style={{ width: '70px' }}
                    />
                    <span style={{ margin: '0 5px' }}>min</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={(questions[0].question.estimatedTimeSeconds || 30) % 60}
                      onChange={(e) => {
                        const secs = parseInt(e.target.value);
                        if (!isNaN(secs) && secs >= 0 && secs < 60) {
                          const mins = Math.floor((questions[0].question.estimatedTimeSeconds || 30) / 60);
                          const totalSecs = (mins * 60) + secs;
                          const updatedQuestions = [...questions];
                          updatedQuestions[0].question.estimatedTimeSeconds = totalSecs;
                          setQuestions(updatedQuestions);
                        }
                      }}
                      className="form-control"
                      style={{ width: '70px' }}
                    />
                    <span style={{ margin: '0 5px' }}>sec</span>
                  </div>
                </div>
                <small className="form-text text-muted">
                  Set the estimated time it takes to answer this question. This helps in calculating the total survey completion time.
                </small>
              </div>
              
              <div className="form-group toggle-group">
                <ToggleSwitch
                  checked={!!questions[0].question.reusable}
                  onChange={() => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.reusable = !updatedQuestions[0].question.reusable;
                    setQuestions(updatedQuestions);
                  }}
                  label="Reusable Question (can be used in multiple surveys)"
                />
              </div>
              
              <div className="form-group toggle-group">
                <ToggleSwitch
                  checked={questions[0].question.active === undefined ? true : !!questions[0].question.active}
                  onChange={() => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.active = !updatedQuestions[0].question.active;
                    setQuestions(updatedQuestions);
                  }}
                  label="Active Question"
                />
              </div>
              
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={questions[0].question.priority || 0}
                  onChange={(e) => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[0].question.priority = parseInt(e.target.value, 10);
                    setQuestions(updatedQuestions);
                  }}
                  className="form-control"
                >
                  <option value="0">Normal</option>
                  <option value="1">High</option>
                  <option value="2">Critical</option>
                </select>
              </div>
            </div>
          </TabPanel>


        </Tabs>
      )}
      </div>
    </div>,
    document.body
  );
};

export default QuestionBuilderSidePanel;
