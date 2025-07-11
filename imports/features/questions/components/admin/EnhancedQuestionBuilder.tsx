import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ReactQuill from 'react-quill';
import '../../../../ui/styles/quill-styles';
import 'react-quill/dist/quill.snow.css';
import { FaPlus, FaMinus, FaUndo, FaRedo, FaSave, FaEye, FaChevronDown, FaChevronUp, FaTrash, FaTimes, FaEllipsisV, FaInfoCircle, FaList, FaTags, FaEdit, FaCodeBranch, FaCog, FaClone, FaDownload, FaUser, FaVenusMars, FaGlobe, FaGraduationCap, FaBriefcase, FaUsers, FaMoneyBillAlt, FaUserFriends, FaLanguage, FaMobile, FaIndustry, FaRing, FaArrowLeft } from 'react-icons/fa';
import TagBuilder from './TagBuilder';
import ToggleSwitch from './ToggleSwitch';

// Import layouts
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { DashboardBg } from '/imports/shared/components';

// Import enhanced components
import QuestionBuilderDndProvider from './QuestionBuilderDndProvider';
import QuestionBuilderStateManager from './QuestionBuilderStateManager';
import QuestionBuilderAnswerOptions from './QuestionBuilderAnswerOptions';
import QuestionBuilderBranchingTab from './QuestionBuilderBranchingTab';
import QuestionBuilderPreview from './QuestionBuilderPreview';
import QuestionClassification from './QuestionClassification';
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
  description?: string; // Make description optional
  answerType: string;
  answers?: any[];
  required?: boolean;
  image?: string;
  labels?: string[];
  feedback?: string;
  feedbackType?: 'text' | 'file' | 'rating';
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
  [key: string]: any;
}

// Interface for managing multiple questions
interface QuestionSection {
  id: string;
  question: Question;
  isExpanded: boolean;
  isNew?: boolean;
}

/**
 * Enhanced Question Builder component with all new features integrated
 */
const EnhancedQuestionBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
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

  // State for loading and question data
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  // State for managing multiple questions
  const [questionSections, setQuestionSections] = useState<QuestionSection[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  
  // Track active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // State for template dropdown
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [showImportTemplate, setShowImportTemplate] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default empty question with Likert Scale options
  const emptyQuestion: Question = {
    text: '',
    description: '',
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
    labels: [],
    feedback: 'none',
    categories: [],
    themes: [],
    reusable: false,
    priority: 0,
    active: true,
    keywords: [],
    status: 'draft', // Default to draft status
    branchingLogic: {
      enabled: false,
      rules: [],
      defaultDestination: ''
    }
  };
  
  // Default empty question with Likert Scale options
  const defaultQuestion: Question = {
    text: '',
    description: '',
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
    labels: [],
    categories: [],
    themes: [],
    reusable: false,
    priority: 0,
    active: true,
    keywords: [],
    status: 'draft', // Default to draft status
    branchingLogic: {},
    customFields: []
  };
  
  // Get question data from database
  // Get the question data with proper version handling
  const { question, isReady, isEditMode } = useTracker(() => {
    let question = { ...defaultQuestion };
    let isReady = false;
    let isEditMode = !!id; // If we have an ID, we're in edit mode
    
    console.log('EnhancedQuestionBuilder: useTracker running, id:', id);
    
    if (id) {
      const questionsSub = Meteor.subscribe('questions.single', id);
      isReady = questionsSub.ready();
      console.log('EnhancedQuestionBuilder: subscription ready:', isReady);
      
      if (isReady) {
        const { Questions } = require('/imports/features/questions/api/questions');
        const questionDoc = Questions.findOne(id);
        console.log('EnhancedQuestionBuilder: questionDoc found:', !!questionDoc);
        
        if (questionDoc) {
          // Get the current version of the question
          const currentVersion = questionDoc.versions && questionDoc.versions.length > 0 ? 
            (questionDoc.versions.find(
              (v: any) => v.version === questionDoc.currentVersion
            ) || questionDoc.versions[questionDoc.versions.length - 1]) : null;
          
          console.log('EnhancedQuestionBuilder: currentVersion found:', !!currentVersion);
          
          if (currentVersion) {
            // Map the versioned question fields to the format expected by the builder
            // Log the current version data to debug category mapping
            console.log('Current version data:', currentVersion);
            
            question = {
              _id: questionDoc._id,
              text: currentVersion.questionText || '',
              description: currentVersion.description || '',
              answerType: currentVersion.responseType || 'text',
              answers: Array.isArray(currentVersion.options) ? currentVersion.options : [],
              required: currentVersion.required || true,
              image: currentVersion.image || '',
              labels: currentVersion.labels || [],
              feedback: currentVersion.feedbackType || 'none',
              // Ensure categoryTags is properly mapped to categories
              categories: Array.isArray(currentVersion.categoryTags) ? currentVersion.categoryTags : [],
              // Also set categoryId if it exists in the data
              categoryId: currentVersion.categoryId || undefined,
              categoryDetails: currentVersion.categoryDetails || '',
              themes: currentVersion.surveyThemes || [],
              reusable: currentVersion.isReusable || false,
              priority: currentVersion.priority || 0,
              active: currentVersion.isActive !== false, // Default to true if not explicitly set to false
              keywords: currentVersion.keywords || [],
              status: currentVersion.status || 'draft',
              branchingLogic: currentVersion.branchingLogic || {},
              customFields: currentVersion.customFields || [],
              // Add any other fields you need
            };
          }
        }
      }
    } else {
      // If there's no ID, we're creating a new question, so we're ready immediately
      isReady = true;
    }
    
    return { question, isReady, isEditMode };
  }, [id]);
  
  // Initialize question sections when data is ready
  useEffect(() => {
    console.log('Initialization effect running', { id, isReady, isEditMode });
    
    // For edit mode, we need to wait for data to be ready
    // For create mode, we can proceed immediately
    if (!isEditMode || (isEditMode && isReady)) {
      console.log('Initializing question builder', { isEditMode });
      
      // Create the initial section with the current question data
      const initialSection: QuestionSection = {
        id: id || `new-question-${Date.now()}`,
        question: { ...question }, // Create a new object to avoid reference issues
        isExpanded: true
      };
      
      // Set question sections if empty
      setQuestionSections(prev => {
        if (prev.length === 0) {
          console.log('Setting initial question section');
          return [initialSection];
        }
        return prev;
      });
      
      // Set active question ID if not already set
      setActiveQuestionId(prevId => {
        if (!prevId) return initialSection.id;
        return prevId;
      });
      
      // Always set loading to false when we've initialized
      setIsLoading(false);
    }
  }, [isReady, id, question, isEditMode]); // Include all dependencies
  
  // Track if we've already set up the fallback timeout
  const [fallbackTimeoutSet, setFallbackTimeoutSet] = useState(false);
  
  // Fallback timeout to prevent getting stuck at loading screen
  // This effect runs only once after the component mounts, not during reactive computations
  useEffect(() => {
    // Only set the timeout if we haven't already
    if (!fallbackTimeoutSet && isLoading) {
      setFallbackTimeoutSet(true);
      
      // Set a timeout to force loading to false after 5 seconds
      // This ensures we don't get stuck at the loading screen
      const timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, forcing initialization');
        setIsLoading(false);
        
        // If we don't have any question sections, create a default one
        setQuestionSections(prev => {
          if (prev.length === 0) {
            const defaultSection = {
              id: id || `new-question-${Date.now()}`,
              question: { ...defaultQuestion },
              isExpanded: true
            };
            return [defaultSection];
          }
          return prev;
        });
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, fallbackTimeoutSet]);
  
  // Save question to database with specified status
  const saveQuestion = async (questionData: Question, status?: 'draft' | 'published'): Promise<void> => {
    try {
      setIsSaving(true);
      const sectionId = activeQuestionId || '';
      const section = questionSections.find(s => s.id === sectionId);
      
      if (!section) return;
      
      // Format the question data for versioning
      // Map the question fields to the format expected by the server
      console.log('Saving question data:', questionData);
      
      const versionedData = {
        questionText: questionData.text,
        description: questionData.description,
        responseType: questionData.answerType,
        options: questionData.answers,
        required: questionData.required,
        image: questionData.image,
        labels: questionData.labels,
        feedbackType: questionData.feedback,
        categoryTags: questionData.categories,
        // Save the single category ID if present
        categoryId: questionData.categoryId,
        // Save category details if present
        categoryDetails: questionData.categoryDetails,
        surveyThemes: questionData.themes,
        isReusable: questionData.reusable,
        priority: questionData.priority,
        isActive: questionData.active,
        keywords: questionData.keywords,
        status: status || questionData.status,
        branchingLogic: questionData.branchingLogic,
        customFields: questionData.customFields || []
      };
      
      // In edit mode, we always want to update the existing question
      if (isEditMode || !section.id.startsWith('new-question-')) {
        try {
          // Update existing question
          await Meteor.callAsync('questions.update', section.id, versionedData);
          
          // Show success message
          setAlert({
            type: 'success',
            message: status === 'published' ? 
              'Question published successfully!' : 
              'Question updated successfully!'
          });
          
          // No longer navigate away after publishing - stay on the same page
          // The user can use the back button if they want to return to the questions list
        } catch (error: any) {
          console.error('Error updating question:', error);
          setAlert({
            type: 'error',
            message: `Error updating question: ${error.reason || error.message}`
          });
        }
      } else {
        // Insert new question
        const newId = await Meteor.callAsync('questions.insert', versionedData);
        
        // Update section with new ID and mark it as no longer a new question
        setQuestionSections(prev => prev.map(s => 
          s.id === sectionId ? { ...s, id: newId, isNew: false } : s
        ));
        
        setActiveQuestionId(newId);
        showSuccessAlert('Question created successfully!');
      }
      
      // Update local state with the new status
      if (status) {
        // Find the active section and update its question status
        const updatedSections = questionSections.map(s => {
          if (s.id === sectionId) {
            return {
              ...s,
              question: { ...s.question, status }
            };
          }
          return s;
        });
        setQuestionSections(updatedSections);
      }
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      console.error('Error saving question:', error);
      showErrorAlert(`Error: ${error instanceof Error ? error.message : 'Failed to save question'}`);
      throw error; // Re-throw to allow proper error handling
    }
  };
  
  // Add a new question section
  const addNewQuestion = () => {
    // Create a fresh new question with default Likert Scale options
    const newQuestion = { 
      ...emptyQuestion, 
      _id: generateTempId(),
      text: '',
      description: '',
      answerType: 'likert',
      answers: [
        { text: 'Strongly Disagree', value: 'Strongly Disagree' },
        { text: 'Disagree', value: 'Disagree' },
        { text: 'Neither Agree nor Disagree', value: 'Neither Agree nor Disagree' },
        { text: 'Agree', value: 'Agree' },
        { text: 'Strongly Agree', value: 'Strongly Agree' }
      ],
      reusable: false,
      priority: 0,
      active: true,
      keywords: [],
      branchingLogic: {},
      isAssessment: false,
      correctAnswers: [],
      points: 1
    };
    
    const newSection: QuestionSection = {
      id: `new-question-${Date.now()}`,
      question: newQuestion,
      isExpanded: true,
      isNew: true
    };
    
    setQuestionSections(prev => [...prev, newSection]);
    setActiveQuestionId(newSection.id);
  };
  
  // Toggle question section expansion
  const toggleQuestionSection = (sectionId: string) => {
    setQuestionSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded } 
        : section
    ));
  };
  
  // Set active question section
  const setActiveQuestion = (sectionId: string) => {
    setActiveQuestionId(sectionId);
  };
  
  // Remove question section
  const removeQuestionSection = async (sectionId: string) => {
    // If it's a saved question (not a new one), delete it from the database
    if (!sectionId.startsWith('new-question-')) {
      try {
        await Meteor.callAsync('questions.remove', sectionId);
      } catch (error) {
        console.error('Error removing question:', error);
      }
    }
    
    // Remove from state
    setQuestionSections(prev => prev.filter(section => section.id !== sectionId));
    
    // If we removed the active question, set another one as active
    if (activeQuestionId === sectionId) {
      const remainingSections = questionSections.filter(section => section.id !== sectionId);
      if (remainingSections.length > 0) {
        setActiveQuestionId(remainingSections[0].id);
      } else {
        // If no questions left, add a new empty one
        addNewQuestion();
      }
    }
  };
  
  // Publish question
  const publishQuestion = async (questionData: Question) => {
    try {
      if (!questionData._id) return;
      
      await Meteor.callAsync('questions.publish', questionData._id);
      return true;
    } catch (error) {
      console.error('Error publishing question:', error);
      return false;
    }
  };
  
  // Handle answer type change
  const handleAnswerTypeChange = (answerType: string, setQuestion: React.Dispatch<React.SetStateAction<Question>>) => {
    // Use a callback to ensure we're working with the latest state
    setQuestion(prev => {
      // Only update if the answer type actually changed
      if (prev.answerType === answerType) {
        return prev;
      }
      
      // Prepare default answers based on answer type
      let answers: any[] = [];
      
      // For Likert Scale, prefill with standard options
      if (answerType === 'likert') {
        answers = [
          { text: 'Strongly Disagree', value: 'Strongly Disagree' },
          { text: 'Disagree', value: 'Disagree' },
          { text: 'Neither Agree nor Disagree', value: 'Neither Agree nor Disagree' },
          { text: 'Agree', value: 'Agree' },
          { text: 'Strongly Agree', value: 'Strongly Agree' }
        ];
      }
      
      return {
        ...prev,
        answerType,
        answers
      };
    });
  };
  
  // Handle image upload
  const handleImageUpload = async (file: File, setQuestion: React.Dispatch<React.SetStateAction<Question>>) => {
    try {
      // Create a FormData object to upload the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Use Meteor method to upload the file
      Meteor.call('uploadQuestionImage', formData, (error: Error, result: { url: string }) => {
        if (error) {
          console.error('Error uploading image:', error);
          return;
        }
        
        // Update question with the image URL
        setQuestion(prev => ({
          ...prev,
          image: result.url
        }));
      });
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (setQuestion: React.Dispatch<React.SetStateAction<Question>>) => {
    setQuestion(prev => ({
      ...prev,
      image: ''
    }));
  };
  
  // Generate a temporary ID for new questions
  const generateTempId = () => {
    return 'temp_' + Math.random().toString(36).substring(2, 15);
  };

  // Type guard for error objects
  const isError = (error: unknown): error is Error => {
    return error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error);
  };

  // Get the active question section
  const activeSection = questionSections.find(section => section.id === activeQuestionId);
  
  // If we're loading and it's been less than 3 seconds since component mounted, show loading
  // Otherwise, proceed with default data to prevent getting stuck
  if (isLoading) {
    return <div className="loading-spinner">Loading question data...<br/><small>(If this takes too long, please refresh the page)</small></div>;
  }
  
  // If we have sections but no active section, set the first one as active
  if (!activeSection && questionSections.length > 0) {
    // Instead of returning loading, just set the active ID and continue
    // This will cause a re-render with the correct active section
    setTimeout(() => setActiveQuestionId(questionSections[0].id), 0);
    
    // Return a brief loading message, but we should never get stuck here
    return <div className="loading-spinner">Initializing editor...</div>;
  }
  
  // If we have no sections at all, create a default one
  if (questionSections.length === 0) {
    const defaultSection = {
      id: id || `new-question-${Date.now()}`,
      question: { ...defaultQuestion },
      isExpanded: true
    };
    
    // Set up the default section and continue rendering
    setTimeout(() => {
      setQuestionSections([defaultSection]);
      setActiveQuestionId(defaultSection.id);
    }, 0);
    
    return <div className="loading-spinner">Creating new question...</div>;
  }

  return (
    <AdminLayout>
      <DashboardBg>
        <QuestionBuilderDndProvider>
          <div className="enhanced-question-builder">
            {/* Alert component */}
            {alert && (
              <div
                style={{
                  position: 'fixed',
                  top: '20px',
                  right: '20px',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  background: alert.type === 'success' ? '#2ecc40' : '#e74c3c',
                  color: 'white',
                  zIndex: 1000,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minWidth: '250px',
                  maxWidth: '400px'
                }}
              >{alert.message}</div>
            )}
            {/* Only show the question-builder-sections in create mode */}
            {!isEditMode && (
              <div className="question-builder-sections">
                <div className="sections-header">
                  <h1>Add Question</h1>
                  <div className="bulk-action-buttons">
                    <button
                      className="save-all-button"
                      onClick={async () => {
                        try {
                          setIsSaving(true);
                          for (const questionSection of questionSections) {
                            await saveQuestion(questionSection.question, 'draft');
                            showSuccessAlert('All questions saved successfully!');
                          }
                        } catch (error) {
                          console.error('Error saving all questions:', error);
                          showErrorAlert('Error saving all questions. Please try again.');
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      title="Save All Questions"
                    >
                      <FaSave /> Save All
                    </button>
                    <button
                      className="publish-all-button"
                      onClick={async () => {
                        try {
                          setIsSaving(true);
                          for (const questionSection of questionSections) {
                            try {
                              await saveQuestion(questionSection.question, 'published');
                              showSuccessAlert('Question published successfully!');
                            } catch (error) {
                              // Error is already handled in saveQuestion
                            }
                          }
                          showSuccessAlert('All questions published successfully!');
                        } catch (error) {
                          console.error('Error publishing all questions:', error);
                          showErrorAlert('Error publishing all questions. Please try again.');
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      title="Publish All Questions"
                    >
                      <FaSave /> Publish All
                    </button>
                  </div>
                  <div className="sections-header-buttons">
                    <button className="add-question-button" onClick={addNewQuestion}>
                      + Add New Question
                    </button>
                  </div>
                </div>
                
                <div className="question-sections-list">
                  {/* Full view for create mode with multiple questions */}
                  {questionSections.map((section, index) => (
                    <div 
                      key={section.id} 
                      className={`question-section-item ${activeQuestionId === section.id ? 'active' : ''}`}
                      onClick={() => setActiveQuestion(section.id)}
                    >
                      <div className="question-section-header">
                        <span className="question-title">
                          {section.question.text || `Question ${index + 1}`}
                        </span>
                        <div className="question-actions">
                          <button 
                            className="toggle-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleQuestionSection(section.id);
                            }}
                          >
                            {section.isExpanded ? '▼' : '►'}
                          </button>
                          <button 
                            className="remove-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeQuestionSection(section.id);
                            }}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add a title bar for edit mode */}
            {isEditMode && (
              <div className="edit-mode-header">
                <div className="edit-mode-header-top">
                  <button 
                    className="back-button" 
                    onClick={() => navigate('/admin/questions')}
                  >
                    <FaArrowLeft /> Back to Questions
                  </button>
                  <h1>Edit Question</h1>
                </div>
                <div className="edit-mode-info">
                  <span>ID: {id}</span>
                </div>
              </div>
            )}
            
            {activeSection && (
              <QuestionBuilderStateManager
                initialQuestion={activeSection.question}
                onSave={async (q: Question) => {
                  // Save the question and prevent automatic creation of a new question
                  await saveQuestion(q);
                }}
              >
                {({
                  question,
                  setQuestion,
                  saveQuestion: saveQuestionState,
                  isSaving,
                  lastSaved,
                  canUndo,
                  canRedo,
                  undo,
                  redo
                }) => (
                  <>
                    <div className="question-builder-header">
                      <h2>{isEditMode ? 'Edit Question' : (activeSection.id.startsWith('new-question-') ? 'Create New Question' : 'Edit Question')}</h2>
                      
                      <div className="question-builder-actions">
                        <div className="undo-redo-actions">
                          <button
                            className="action-button"
                            onClick={undo}
                            disabled={!canUndo}
                            title="Undo (Ctrl+Z)"
                          >
                            <FaUndo />
                          </button>
                          <button
                            className="action-button"
                            onClick={redo}
                            disabled={!canRedo}
                            title="Redo (Ctrl+Y)"
                          >
                            <FaRedo />
                          </button>
                        </div>
                        
                        {/* Preview button moved to ellipsis dropdown */}
                        
                        <button
                          className="save-button"
                          onClick={() => saveQuestion(question, 'draft')}
                          disabled={isSaving}
                          title={isEditMode ? "Update Question" : "Save Question"}
                        >
                          <FaSave /> {isEditMode ? 'Update' : 'Save'}
                        </button>
                        
                        <button
                          className="save-button publish-button"
                          onClick={() => saveQuestion(question, 'published')}
                          disabled={isSaving}
                          title={isEditMode ? "Update & Publish Question" : "Publish Question"}
                        >
                          <FaSave /> {isEditMode ? 'Update & Publish' : 'Publish'}
                        </button>
                        
                        {isEditMode && (
                          <button
                            className="cancel-button"
                            onClick={() => navigate('/admin/questions')}
                            title="Cancel and return to questions list"
                          >
                            Cancel
                          </button>
                        )}
                        
                        <div className="template-dropdown-container" ref={dropdownRef}>
                          <button
                            className="template-dropdown-button"
                            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                            title="Template Options"
                          >
                            <FaEllipsisV />
                          </button>
                          
                          {showTemplateDropdown && (
                            <div className="template-dropdown-menu">
                              <button 
                                className="template-dropdown-item"
                                onClick={() => {
                                  setShowTemplateDropdown(false);
                                  setShowPreview(true);
                                }}
                              >
                                Preview
                              </button>
                              <button 
                                className="template-dropdown-item"
                                onClick={() => {
                                  setShowTemplateDropdown(false);
                                  setShowSaveAsTemplate(true);
                                }}
                              >
                                Save as Template
                              </button>
                              <button 
                                className="template-dropdown-item"
                                onClick={() => {
                                  setShowTemplateDropdown(false);
                                  setShowImportTemplate(true);
                                }}
                              >
                                Import Template
                              </button>
                              <button 
                                className="template-dropdown-item"
                                onClick={() => {
                                  setShowTemplateDropdown(false);
                                  navigate('/admin/questions/templates');
                                }}
                              >
                                View All Templates
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="question-builder-content">
                      <Tabs
                        selectedIndex={activeTab}
                        onSelect={index => setActiveTab(index)}
                        className="question-builder-tabs"
                      >
                        <TabList>
                          <Tab><FaInfoCircle /> Basic Information</Tab>
                          <Tab><FaList /> Answer Options</Tab>
                          <Tab><FaTags /> Classification</Tab>
                          <Tab><FaEdit /> Custom Fields</Tab>
                          <Tab><FaCodeBranch /> Branching Logic</Tab>
                          <Tab><FaCog /> Settings</Tab>
                        </TabList>
                        
                        {/* Basic Information Tab */}
                        <TabPanel>
                          <div className="tab-content">
                            <div className="form-group">
                              <label>Question Text <span className="required-asterisk">*</span></label>
                              <ReactQuill
                                value={question.text}
                                onChange={(value) => setQuestion(prev => ({ ...prev, text: value }))}
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
                            
                            <div className="form-group">
                              <label>Description</label>
                              <ReactQuill
                                value={question.description || ''}
                                onChange={(value) => setQuestion(prev => ({ ...prev, description: value }))}
                                modules={{
                                  toolbar: [
                                    ['bold', 'italic', 'underline'],
                                    ['link'],
                                    ['clean']
                                  ]
                                }}
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>Question Type <span className="required-asterisk">*</span></label>
                              <select
                                value={question.answerType}
                                onChange={(e) => handleAnswerTypeChange(e.target.value, setQuestion)}
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
                            
                            {/* Tag Builder */}
                            <div className="form-group">
                              <TagBuilder 
                                selectedTagIds={question.labels || []} 
                                onTagChange={(labels) => setQuestion(prev => ({ ...prev, labels }))}
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>Question Image</label>
                              <div className="image-upload-container">
                                {question.image ? (
                                  <div className="image-preview">
                                    <img src={question.image} alt="Question" />
                                    <button
                                      className="remove-image-button"
                                      onClick={() => handleRemoveImage(setQuestion)}
                                    >
                                      <FaTimes /> Remove
                                    </button>
                                  </div>
                                ) : (
                                  <div className="image-upload">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleImageUpload(file, setQuestion);
                                        }
                                      }}
                                    />
                                    <p>Drag an image here or click to browse</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="form-group checkbox-group">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) => setQuestion(prev => ({ ...prev, required: e.target.checked }))}
                                />
                                Required Question
                              </label>
                            </div>
                          </div>
                        </TabPanel>
                        
                        {/* Answer Options Tab */}
                        <TabPanel>
                          <div className="tab-content" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px' }}>
                            <QuestionBuilderAnswerOptions
                              answerType={question.answerType}
                              answers={question.answers || []}
                              onAnswersChange={(answers) => setQuestion(prev => ({ ...prev, answers }))}
                              disabled={question.disabled || false}
                              isAssessment={question.isAssessment || false}
                              onIsAssessmentChange={(isAssessment) => setQuestion(prev => ({ ...prev, isAssessment }))}
                              correctAnswers={question.correctAnswers || []}
                              onCorrectAnswersChange={(correctAnswers) => setQuestion(prev => ({ ...prev, correctAnswers }))}
                              points={question.points || 1}
                              onPointsChange={(points) => setQuestion(prev => ({ ...prev, points }))}
                            />
                          </div>
                        </TabPanel>
                        
                        {/* Classification Tab */}
                        <TabPanel>
                          <div className="tab-content">
                            <QuestionClassification
                              selectedCategoryIds={question.categories || []}
                              selectedThemeIds={question.themes || []}
                              selectedTagIds={question.labels || []}
                              keywords={question.keywords || []}
                              selectedCategoryId={question.categoryId}
                              categoryDetails={question.categoryDetails || ''}
                              onCategoryChange={(categories) => setQuestion(prev => ({ ...prev, categories }))}
                              onThemeChange={(themes) => setQuestion(prev => ({ ...prev, themes }))}
                              onTagChange={(labels) => setQuestion(prev => ({ ...prev, labels }))}
                              onKeywordsChange={(keywords) => setQuestion(prev => ({ ...prev, keywords }))}
                              onSingleCategoryChange={(categoryId) => setQuestion(prev => ({ ...prev, categoryId }))}
                              onCategoryDetailsChange={(details) => setQuestion(prev => ({ ...prev, categoryDetails: details }))}
                            />
                          </div>
                        </TabPanel>
                        
                        {/* Custom Fields Tab */}
                        <TabPanel>
                          <div className="tab-content">
                            <div className="custom-fields-container">
                              <h3>Question Custom Fields</h3>
                              <p className="custom-fields-description">Add custom fields to store additional information about this question.</p>
                              
                              {/* List of existing custom fields */}
                              {question.customFields && question.customFields.length > 0 ? (
                                <div className="custom-fields-list">
                                  {question.customFields.map((field: QuestionCustomField, index: number) => (
                                    <div key={field.id} className="custom-field-item">
                                      <div className="custom-field-inputs">
                                        <div className="custom-field-input-group">
                                          <input
                                            type="text"
                                            className="form-control field-name"
                                            placeholder="Field Name"
                                            value={field.name}
                                            onChange={(e) => {
                                              const updatedFields = [...(question.customFields || [])];
                                              updatedFields[index] = { ...field, name: e.target.value };
                                              setQuestion(prev => ({ ...prev, customFields: updatedFields }));
                                            }}
                                          />
                                          <textarea
                                            className="form-control field-value"
                                            placeholder="Field Value"
                                            value={field.value}
                                            rows={3}
                                            onChange={(e) => {
                                              const updatedFields = [...(question.customFields || [])];
                                              updatedFields[index] = { ...field, value: e.target.value };
                                              setQuestion(prev => ({ ...prev, customFields: updatedFields }));
                                            }}
                                          />
                                        </div>
                                        <button
                                          className="remove-field-button"
                                          onClick={() => {
                                            const updatedFields = [...(question.customFields || [])];
                                            updatedFields.splice(index, 1);
                                            setQuestion(prev => ({ ...prev, customFields: updatedFields }));
                                          }}
                                          title="Remove Field"
                                        >
                                          <FaTimes />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="no-custom-fields">No custom fields added yet.</div>
                              )}
                              
                              {/* Add new custom field button */}
                              <button
                                className="add-custom-field-button"
                                onClick={() => {
                                  const newField = {
                                    id: `field-${Date.now()}`,
                                    name: '',
                                    value: ''
                                  };
                                  setQuestion(prev => ({
                                    ...prev,
                                    customFields: [...(prev.customFields || []), newField]
                                  }));
                                }}
                              >
                                <FaPlus /> Add Custom Field
                              </button>
                            </div>
                          </div>
                        </TabPanel>
                        
                        {/* Branching Logic Tab */}
                        <TabPanel>
                          <div className="tab-content">
                            <QuestionBuilderBranchingTab
                              question={question}
                              onBranchingLogicChange={(branchingLogic) => 
                                setQuestion(prev => ({ ...prev, branchingLogic }))
                              }
                            />
                          </div>
                        </TabPanel>
                        
                        {/* Settings Tab */}
                        <TabPanel>
                          <div className="tab-content">
                            <div className="form-group">
                              <label>Feedback Collection</label>
                              <select
                                value={question.feedback || 'none'}
                                onChange={(e) => setQuestion(prev => ({ ...prev, feedback: e.target.value }))}
                                className="form-control"
                              >
                                <option value="none">No Feedback</option>
                                <option value="optional">Optional Feedback</option>
                                <option value="required">Required Feedback</option>
                                <option value="rating">Rating Feedback</option>
                                <option value="rating_comment">Rating with Comment</option>
                              </select>
                            </div>
                            
                            <div className="form-group toggle-group">
                              <ToggleSwitch
                                checked={question.reusable}
                                onChange={(checked) => setQuestion(prev => ({ ...prev, reusable: checked }))}
                                label="Reusable Question (can be used in multiple surveys)"
                              />
                            </div>
                            
                            <div className="form-group toggle-group">
                              <ToggleSwitch
                                checked={question.active === undefined ? true : question.active}
                                onChange={(checked) => setQuestion(prev => ({ ...prev, active: checked }))}
                                label="Active Question"
                              />
                            </div>
                            
                            <div className="form-group toggle-group">
                              <ToggleSwitch
                                checked={question.collectDemographics === undefined ? true : question.collectDemographics}
                                onChange={(checked) => setQuestion(prev => ({ ...prev, collectDemographics: checked }))}
                                label="Collect Demographics"
                              />
                            </div>
                            
                            {(question.collectDemographics === undefined || question.collectDemographics) && (
                              <div className="demographics-metrics-section">
                                <h4>Demographics Metrics</h4>
                                <p className="helper-text">Select which demographic data to collect when users answer this question:</p>
                                
                                <div className="demographics-list">
                                  {[
                                    { id: 'age_group', label: 'Age Group', icon: <FaUser /> },
                                    { id: 'gender', label: 'Gender', icon: <FaVenusMars /> },
                                    { id: 'location', label: 'Geographic Location', icon: <FaGlobe /> },
                                    { id: 'education', label: 'Education Level', icon: <FaGraduationCap /> },
                                    { id: 'employment', label: 'Employment Status', icon: <FaBriefcase /> },
                                    { id: 'household', label: 'Household Size', icon: <FaUsers /> },
                                    { id: 'income', label: 'Income Range', icon: <FaMoneyBillAlt /> },
                                    { id: 'ethnicity', label: 'Ethnicity', icon: <FaUserFriends /> },
                                    { id: 'language', label: 'Primary Language', icon: <FaLanguage /> },
                                    { id: 'device', label: 'Device Type', icon: <FaMobile /> },
                                    { id: 'industry', label: 'Industry', icon: <FaIndustry /> },
                                    { id: 'marital_status', label: 'Marital Status', icon: <FaRing /> },
                                    { id: 'role', label: 'Role', icon: <FaUserFriends /> },
                                  ].map(option => (
                                    <label key={option.id} className="demographic-checkbox">
                                      <input 
                                        type="checkbox" 
                                        checked={question.selectedDemographics?.includes(option.id) || false}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          setQuestion(prev => {
                                            const currentSelected = prev.selectedDemographics || [];
                                            if (isChecked && !currentSelected.includes(option.id)) {
                                              return { ...prev, selectedDemographics: [...currentSelected, option.id] };
                                            } else if (!isChecked) {
                                              return { ...prev, selectedDemographics: currentSelected.filter((item: string) => item !== option.id) };
                                            }
                                            return prev;
                                          });
                                        }}
                                      />
                                      <span className="checkbox-label">{option.icon} {option.label}</span>
                                    </label>
                                  ))}
                                </div>
                                
                                <div className="demographics-select-buttons">
                                  <button 
                                    type="button" 
                                    className="select-all-btn"
                                    onClick={() => {
                                      setQuestion(prev => ({
                                        ...prev,
                                        selectedDemographics: [
                                          'age_group', 'gender', 'location', 'education', 'employment',
                                          'household', 'income', 'ethnicity', 'language', 'device',
                                          'industry', 'marital_status'
                                        ]
                                      }));
                                    }}
                                  >
                                    Select All
                                  </button>
                                  <button 
                                    type="button" 
                                    className="clear-all-btn"
                                    onClick={() => {
                                      setQuestion(prev => ({ ...prev, selectedDemographics: [] }));
                                    }}
                                  >
                                    Clear All
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <div className="form-group">
                              <label>Priority</label>
                              <select
                                value={question.priority || 0}
                                onChange={(e) => setQuestion(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
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
                          
                      {showPreview && (
                        <EnhancedQuestionPreviewModal
                          isOpen={showPreview}
                          question={question as unknown as ApiQuestion}
                          onClose={() => setShowPreview(false)}
                        />
                      )}
                    
                      {showSaveAsTemplate && (
                        <SaveAsTemplateModal
                          isOpen={showSaveAsTemplate}
                          onClose={() => setShowSaveAsTemplate(false)}
                          question={question as unknown as import('/imports/features/questions/api/questions.methods.client').Question}
                          onSuccess={() => {
                            // Show success message or notification
                            showSuccessAlert('Template saved successfully!');
                          }}
                        />
                      )}
                    
                      {showImportTemplate && (
                        <QuestionTemplatesModal
                          isOpen={showImportTemplate}
                          onClose={() => setShowImportTemplate(false)}
                          onImport={(template) => {
                            setQuestion({
                              ...template.questionData,
                              _id: question._id // Keep the current question ID
                            } as unknown as Question);
                            setShowImportTemplate(false);
                          }}
                        />
                      )}
                  </div>
                  </>
                )}
              </QuestionBuilderStateManager>
            )}
          </div>
        </QuestionBuilderDndProvider>
      </DashboardBg>
    </AdminLayout>
  );
};

export default EnhancedQuestionBuilder;
