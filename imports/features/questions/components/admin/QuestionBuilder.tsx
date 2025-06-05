import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import ReactQuill from 'react-quill';
import '../../../../ui/styles/quill-styles';
import './QuestionBuilder.quill.css';
import './QuestionBuilder.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import Select, { MultiValue, StylesConfig, ActionMeta } from 'react-select';
import { FaInfoCircle, FaCheck, FaTimes, FaPlus, FaEye, FaSave } from 'react-icons/fa';

// Import from features
import { Questions } from '../../api/questions';
import { saveQuestionsToDB, publishQuestionsToDB, mapQuestionToVersion, Question as QuestionType } from '/imports/features/questions/api/questions.methods.client';
import { WPSCategories } from '../../../wps-framework/api/wpsCategories';
import { SurveyThemes } from '../../../survey-themes/api/surveyThemes';

// Import from layouts
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';

// Import from shared components
import { EllipsisMenu, DashboardBg } from '/imports/shared/components';

// Import from local components
import QuestionPreviewModal from './QuestionPreviewModal';
import SaveAsTemplateModal from './SaveAsTemplateModal';
import QuestionTemplatesModal from './QuestionTemplatesModal';

// Use the Question interface from the questions.methods.client module
type Question = QuestionType;

const QuestionBuilder: React.FC = () => {
  const userId = Meteor.userId()!;
  // Get question ID from URL (either from path parameter or query parameter)
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const queryParams = new URLSearchParams(location.search);
  
  // Check for ID in path (/admin/questions/builder/:id) or query (?edit=id)
  const queryId = queryParams.get('edit');
  const editId = id || queryId;
  
  // Alert state and helpers
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
    setTimeout(() => setAlert(null), 3000);
  }
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
    setTimeout(() => setAlert(null), 5000);
  }

  // State for the question being built
  const [question, setQuestion] = useState<Question>({
    text: '',
    description: '',
    answerType: 'multiple_choice',
    answers: ['', ''],
    required: true,
    image: '',
    leftLabel: '',
    rightLabel: '',
    wpsCategoryIds: [],
    surveyThemeIds: [],
    isReusable: true,
    priority: 1,
    isActive: true,
    keywords: [],
    collectFeedback: false,
    feedbackType: 'text',
    feedbackPrompt: '',
  });

  // State for the preview modal
  const [showPreview, setShowPreview] = useState(false);
  // State for Save as Template modal
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  // State for Import Template modal
  const [showImportTemplate, setShowImportTemplate] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('basic');
  
  // State for form completion progress
  const [formProgress, setFormProgress] = useState(0);
  
  // Navigation
  const navigate = useNavigate();

  // Fetch WPS Categories and Survey Themes for dropdown selectors
  const { wpsCategories, surveyThemes, loading } = useTracker(() => {
    const categoriesHandle = Meteor.subscribe('wpsCategories.all');
    const themesHandle = Meteor.subscribe('surveyThemes.all');
    const isLoading = !categoriesHandle.ready() || !themesHandle.ready();
    
    return {
      wpsCategories: WPSCategories.find({}).fetch(),
      surveyThemes: SurveyThemes.find({}).fetch(),
      loading: isLoading,
    };
  }, []);

  // Load existing question if editing
  useEffect(() => {
    if (editId) {
      Meteor.subscribe('questions.single', editId, {
        onReady: () => {
          const questionDoc = Questions.findOne(editId);
          if (questionDoc) {
            // Get the latest version - use type assertion for version/versionNumber
            const latestVersion = questionDoc.versions.reduce((latest, current) => {
              // Cast to any to avoid TypeScript errors with property access
              const latestVersion = (latest as any).version || (latest as any).versionNumber || 0;
              const currentVersion = (current as any).version || (current as any).versionNumber || 0;
              return latestVersion > currentVersion ? latest : current;
            }, questionDoc.versions[0]);
            
            // Map DB properties to our component properties - use type assertion for property access
            const latestVersionAny = latestVersion as any;
            const mappedVersion = {
              text: latestVersionAny.questionText || latestVersionAny.text || '',
              description: latestVersionAny.description || '',
              answerType: latestVersionAny.responseType || latestVersionAny.answerType || 'multiple_choice',
              answers: latestVersionAny.options || latestVersionAny.answers || ['', ''],
              required: latestVersionAny.required !== undefined ? latestVersionAny.required : true,
              image: latestVersionAny.image || '',
              leftLabel: latestVersionAny.leftLabel || '',
              rightLabel: latestVersionAny.rightLabel || '',
              feedbackType: (['text','rating','file'].includes(latestVersionAny.feedbackType)) ? latestVersionAny.feedbackType : 'text',
              collectFeedback: typeof latestVersionAny.collectFeedback === 'boolean' ? latestVersionAny.collectFeedback : false,
              feedbackPrompt: latestVersionAny.feedbackPrompt || '',
            };
            
            // Use the mapped version and add document properties
            setQuestion({
              ...mappedVersion,
              // Add document-level properties with type safety - use type assertion
              // Cast questionDoc to any to avoid TypeScript errors with property access
              wpsCategoryIds: Array.isArray((questionDoc as any).wpsCategoryIds) ? (questionDoc as any).wpsCategoryIds : 
                              Array.isArray(latestVersionAny.categoryTags) ? latestVersionAny.categoryTags : [],
              surveyThemeIds: Array.isArray((questionDoc as any).surveyThemeIds) ? (questionDoc as any).surveyThemeIds : 
                              Array.isArray(latestVersionAny.surveyThemes) ? latestVersionAny.surveyThemes : [],
              questionTagId: (questionDoc as any).questionTagId || latestVersionAny.questionTag || 
                           (Array.isArray(latestVersionAny.questionTags) && latestVersionAny.questionTags.length > 0 ? 
                           latestVersionAny.questionTags[0] : undefined),
              customFields: Array.isArray((questionDoc as any).customFields) ? (questionDoc as any).customFields : 
                           Array.isArray(latestVersionAny.customFields) ? latestVersionAny.customFields : [],
              isReusable: typeof (questionDoc as any).isReusable === 'boolean' ? (questionDoc as any).isReusable : true,
              priority: typeof (questionDoc as any).priority === 'number' ? (questionDoc as any).priority : 1,
              isActive: typeof (questionDoc as any).isActive === 'boolean' ? (questionDoc as any).isActive : true,
              keywords: Array.isArray((questionDoc as any).keywords) ? (questionDoc as any).keywords : [],
              organizationId: typeof (questionDoc as any).organizationId === 'string' ? (questionDoc as any).organizationId : undefined,
            });
          }
        }
      });
    }
  }, [editId]);
  
  // Calculate form completion progress
  useEffect(() => {
    let completedFields = 0;
    let totalFields = 5; // Basic required fields: text, answerType, answers (if applicable), required, isActive
    
    // Check text field
    if (question.text && question.text.trim().length > 0) completedFields++;
    
    // Check answer type
    if (question.answerType) completedFields++;
    
    // Check answers if applicable
    if (['text', 'long_text', 'date', 'file_upload'].includes(question.answerType)) {
      completedFields++; // No answers needed for these types
    } else if (question.answers.every(a => a.trim().length > 0)) {
      completedFields++;
    }
    
    // Required field is always set
    completedFields++;
    
    // Active field is always set
    completedFields++;
    
    // Optional fields that add to progress if filled
    if (question.description && question.description.trim().length > 0) {
      totalFields++;
      completedFields++;
    }
    
    if (question.image && question.image.trim().length > 0) {
      totalFields++;
      completedFields++;
    }
    
    if (question.wpsCategoryIds && question.wpsCategoryIds.length > 0) {
      totalFields++;
      completedFields++;
    }
    
    if (question.surveyThemeIds && question.surveyThemeIds.length > 0) {
      totalFields++;
      completedFields++;
    }
    
    if (question.keywords && question.keywords.length > 0) {
      totalFields++;
      completedFields++;
    }
    
    const progress = Math.floor((completedFields / totalFields) * 100);
    setFormProgress(progress);
  }, [question]);

  // Handle text changes (rich text editor)
  const handleTextChange = (value: string) => {
    setQuestion((prev: Question) => ({ ...prev, text: value }));
  };

  // Handle description changes (rich text editor)
  const handleDescriptionChange = (value: string) => {
    setQuestion((prev: Question) => ({ ...prev, description: value }));
  };

  // Handle answer type changes
  const handleAnswerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    let newAnswers = [...question.answers];
    
    // Adjust answers array based on type
    if (newType === 'yes_no') {
      newAnswers = ['Yes', 'No'];
    } else if (newType === 'true_false') {
      newAnswers = ['True', 'False'];
    } else if (newType === 'likert_scale') {
      newAnswers = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
    } else if (newType === 'rating_scale') {
      newAnswers = ['1', '2', '3', '4', '5'];
    } else if (newType === 'multiple_choice' && newAnswers.length < 2) {
      newAnswers = ['', ''];
    }
    
    setQuestion((prev: Question) => ({ 
      ...prev, 
      answerType: newType,
      answers: newAnswers,
      leftLabel: newType === 'rating_scale' ? prev.leftLabel || 'Poor' : '',
      rightLabel: newType === 'rating_scale' ? prev.rightLabel || 'Excellent' : '',
    }));
  };

  // Handle answer option changes
  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...question.answers];
    newAnswers[index] = value;
    setQuestion((prev: Question) => ({ ...prev, answers: newAnswers }));
  };

  // Add a new answer option
  const addAnswer = () => {
    setQuestion((prev: Question) => ({ ...prev, answers: [...prev.answers, ''] }));
  };

  // Remove an answer option
  const removeAnswer = (index: number) => {
    if (question.answers.length <= 2) {
      showError('Questions must have at least 2 answer options');
      return;
    }
    const newAnswers = [...question.answers];
    newAnswers.splice(index, 1);
    setQuestion((prev: Question) => ({ ...prev, answers: newAnswers }));
  };

  // Handle required toggle
  const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion((prev: Question) => ({ ...prev, required: e.target.checked }));
  };

  // Handle image URL change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion((prev: Question) => ({ ...prev, image: e.target.value }));
  };

  // Handle label changes for rating scales
  const handleLabelChange = (side: 'left' | 'right', value: string) => {
    if (side === 'left') {
      setQuestion((prev: Question) => ({ ...prev, leftLabel: value }));
    } else {
      setQuestion((prev: Question) => ({ ...prev, rightLabel: value }));
    }
  };

  // Handle feedback type changes
  const handleFeedbackTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuestion((prev: Question) => ({ 
      ...prev, 
      feedbackType: (['text','rating','file'].includes(e.target.value)) ? e.target.value as 'text' | 'rating' | 'file' : 'text',
      collectFeedback: (['text','rating','file'].includes(e.target.value)), // Enable feedback if a type is chosen
    }));
  };

  
  // Handle WPS category selection
  const handleCategoryChange = (selected: MultiValue<unknown>, _actionMeta: ActionMeta<unknown>) => {
    const typedSelected = selected as MultiValue<{ value: string; label: string }>;
    setQuestion((prev: Question) => ({ 
      ...prev, 
      wpsCategoryIds: typedSelected.map(option => option.value) 
    }));
  };

  // Handle Survey theme selection
  const handleThemeChange = (selected: MultiValue<unknown>, _actionMeta: ActionMeta<unknown>) => {
    const typedSelected = selected as MultiValue<{ value: string; label: string }>;
    setQuestion((prev: Question) => ({ 
      ...prev, 
      surveyThemeIds: typedSelected.map(option => option.value) 
    }));
  };

  // Handle reusable toggle
  const handleReusableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion((prev: Question) => ({ ...prev, isReusable: e.target.checked }));
  };

  // Handle priority change
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuestion((prev: Question) => ({ ...prev, priority: parseInt(e.target.value) }));
  };

  // Handle active toggle
  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion((prev: Question) => ({ ...prev, isActive: e.target.checked }));
  };

  // Handle keywords changes
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywordsArray = e.target.value.split(',').map((k: string) => k.trim()).filter((k: string) => k);
    setQuestion((prev: Question) => ({ ...prev, keywords: keywordsArray }));
  };

  // Save the question
  const handleSave = async (publish = false) => {
    // Validate
    if (!question.text.trim()) {
      showError('Question text is required');
      return;
    }

    if (question.answerType !== 'text' && question.answerType !== 'long_text' && 
        question.answers.some(a => !a.trim())) {
      showError('All answer options must have text');
      return;
    }

    try {
      // Map our state structure to the DB structure
      const questionVersion = mapQuestionToVersion(question, userId);
      
      // Save to DB
      if (publish) {
        await publishQuestionsToDB(editId, questionVersion);
        showSuccess('Question published successfully');
      } else {
        await saveQuestionsToDB(editId, questionVersion);
        showSuccess('Question saved as draft');
      }
      
      // Redirect back to question bank after a short delay
      setTimeout(() => {
        navigate('/admin/question-bank');
      }, 1500);
    } catch (error) {
      console.error('Error saving question:', error);
      showError('Error saving question. Please try again.');
    }
  };

  // Custom styles for react-select
  const selectStyles: StylesConfig = {
    control: (provided) => ({
      ...provided,
      borderColor: '#ddd',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#aaa',
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#f0f7ff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#0066cc',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#0066cc',
      '&:hover': {
        backgroundColor: '#0066cc',
        color: 'white',
      }
    }),
  };

  // Helper function to render tooltip
  const renderTooltip = (text: string) => (
    <div className="tooltip">
      <span className="tooltip-icon"><FaInfoCircle /></span>
      <span className="tooltip-text">{text}</span>
    </div>
  );

  return (
  <AdminLayout>
    <DashboardBg>
      <div className="question-builder-container">
        <div className="question-builder-header">
          <h1>{editId ? 'Edit Question' : 'Create New Question'}</h1>
          <div className="question-builder-actions">
            <button className="action-btn" onClick={() => setShowPreview(true)}><FaEye /> Preview</button>
            <button className="action-btn" onClick={() => handleSave(false)}>Save as Draft</button>
            <button className="action-btn primary" onClick={() => handleSave(true)}>Save & Publish</button>
            <button className="action-btn" onClick={() => navigate('/admin/question-bank')}>Cancel</button>
            <EllipsisMenu
              items={[
                { label: 'Preview', onClick: () => setShowPreview(true) },
                { label: 'Save as Template', onClick: () => setShowSaveTemplate(true) },
                { label: 'Import from Template', onClick: () => setShowImportTemplate(true) },
              ]}
            />
          </div>
        </div>

        {alert && (
          <div className={`alert ${alert.type}`}>
            {alert.type === 'success' ? <FaCheck /> : <FaTimes />} {alert.message}
          </div>
        )}

        {/* Tabs navigation */}
        <div className="form-tabs">
          <div 
            className={`form-tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </div>
          <div 
            className={`form-tab ${activeTab === 'answers' ? 'active' : ''}`}
            onClick={() => setActiveTab('answers')}
          >
            Answer Options
          </div>
          <div 
            className={`form-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Question Settings
          </div>
          <div 
            className={`form-tab ${activeTab === 'categorization' ? 'active' : ''}`}
            onClick={() => setActiveTab('categorization')}
          >
            Categorization
          </div>
          <div 
            className={`form-tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Settings
          </div>
        </div>

        <div className="question-builder-form">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <>
              <div className="form-section card">
                <div className="card-header">
                  <h2>Question Text</h2>
                </div>
                <div className="card-body">
                  <ReactQuill 
                    value={question.text} 
                    onChange={handleTextChange}
                    placeholder="Enter your question here..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ],
                    }}
                  />
                  <div className="helper-text">
                    Write a clear, concise question that respondents can easily understand.
                  </div>
                </div>
              </div>

              <div className="form-section card">
                <div className="card-header">
                  <h2>Description / Help Text</h2>
                </div>
                <div className="card-body">
                  <ReactQuill 
                    value={question.description} 
                    onChange={handleDescriptionChange}
                    placeholder="Optional description or help text..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ],
                    }}
                  />
                  <div className="helper-text">
                    Add optional context or instructions to help respondents answer the question.
                  </div>
                </div>
              </div>

              <div className="form-section card">
                <div className="card-header">
                  <h2>Answer Type</h2>
                </div>
                <div className="card-body">
                  <select 
                    value={question.answerType}
                    onChange={handleAnswerTypeChange}
                    className="answer-type-select"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkbox">Checkbox (Multiple Selection)</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="yes_no">Yes/No</option>
                    <option value="true_false">True/False</option>
                    <option value="likert_scale">Likert Scale</option>
                    <option value="rating_scale">Rating Scale</option>
                    <option value="text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="date">Date</option>
                    <option value="file_upload">File Upload</option>
                  </select>
                  <div className="helper-text">
                    Select the most appropriate answer format for your question.
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Answer Options Tab */}
          {activeTab === 'answers' && (
            <div className="form-section card full-width">
              <div className="card-header">
                <h2>Answer Options</h2>
              </div>
              <div className="card-body">
                {(question.answerType === 'text' || 
                  question.answerType === 'long_text' || 
                  question.answerType === 'date' || 
                  question.answerType === 'file_upload') ? (
                  <div className="answer-options-container">
                    <p>This question type does not require predefined answer options.</p>
                    <div className="helper-text">
                      {question.answerType === 'text' && 'Respondents will provide a short text answer.'}
                      {question.answerType === 'long_text' && 'Respondents will provide a longer text response.'}
                      {question.answerType === 'date' && 'Respondents will select a date.'}
                      {question.answerType === 'file_upload' && 'Respondents will upload a file.'}
                    </div>
                  </div>
                ) : (
                  <>
                    {question.answerType === 'rating_scale' && (
                      <div className="rating-labels">
                        <div className="rating-label">
                          <label>Left Label:</label>
                          <input 
                            type="text" 
                            value={question.leftLabel} 
                            onChange={(e) => handleLabelChange('left', e.target.value)}
                            placeholder="e.g., Poor"
                          />
                          <div className="helper-text">Label for the lowest rating</div>
                        </div>
                        <div className="rating-label">
                          <label>Right Label:</label>
                          <input 
                            type="text" 
                            value={question.rightLabel} 
                            onChange={(e) => handleLabelChange('right', e.target.value)}
                            placeholder="e.g., Excellent"
                          />
                          <div className="helper-text">Label for the highest rating</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="answer-options-container">
                      {question.answers.map((answer: string, index: number) => (
                        <div key={index} className="answer-option">
                          <div className="answer-option-index">{index + 1}</div>
                          <input 
                            type="text" 
                            value={answer} 
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            disabled={question.answerType === 'yes_no' || 
                                      question.answerType === 'true_false' ||
                                      (question.answerType === 'likert_scale' && index < 5) ||
                                      (question.answerType === 'rating_scale' && index < 5)}
                          />
                          {(question.answerType === 'multiple_choice' || 
                            question.answerType === 'checkbox' || 
                            question.answerType === 'dropdown' ||
                            (question.answerType === 'likert_scale' && index >= 5) ||
                            (question.answerType === 'rating_scale' && index >= 5)) && (
                            <button 
                              className="remove-answer" 
                              onClick={() => removeAnswer(index)}
                              aria-label="Remove answer option"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {(question.answerType === 'multiple_choice' || 
                      question.answerType === 'checkbox' || 
                      question.answerType === 'dropdown') && (
                      <button 
                        className="add-answer" 
                        onClick={addAnswer}
                      >
                        <FaPlus /> Add Option
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Question Settings Tab */}
          {activeTab === 'settings' && (
            <div className="form-section card full-width">
              <div className="card-header">
                <h2>Question Settings</h2>
              </div>
              <div className="card-body">
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={question.required} 
                      onChange={handleRequiredChange}
                    />
                    Required Question
                    {renderTooltip('If checked, respondents must answer this question to proceed')}
                  </label>
                </div>
                
                <div className="setting-group">
                  <label>Image URL (optional):</label>
                  <input 
                    type="text" 
                    value={question.image} 
                    onChange={handleImageChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="helper-text">
                    Add an image to provide visual context for the question
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categorization Tab */}
          {activeTab === 'categorization' && (
            <div className="form-section card full-width">
              <div className="card-header">
                <h2>Categorization</h2>
              </div>
              <div className="card-body">
                <div className="setting-group">
                  <label>WPS Categories:</label>
                  <Select
                    isMulti
                    options={wpsCategories.map(cat => ({ 
                      value: cat._id, 
                      label: cat.name 
                    }))}
                    value={wpsCategories
                      .filter(cat => question.wpsCategoryIds?.includes(cat._id || ''))
                      .map(cat => ({ value: cat._id, label: cat.name }))}
                    onChange={handleCategoryChange}
                    placeholder="Select categories..."
                    styles={selectStyles}
                    isLoading={loading}
                  />
                  <div className="helper-text">
                    Assign WPS framework categories to organize questions by workplace safety areas
                  </div>
                </div>
                
                <div className="setting-group">
                  <label>Survey Themes:</label>
                  <Select
                    isMulti
                    options={surveyThemes.map(theme => ({ 
                      value: theme._id, 
                      label: theme.name 
                    }))}
                    value={surveyThemes
                      .filter(theme => question.surveyThemeIds?.includes(theme._id || ''))
                      .map(theme => ({ value: theme._id, label: theme.name }))}
                    onChange={handleThemeChange}
                    placeholder="Select themes..."
                    styles={selectStyles}
                    isLoading={loading}
                  />
                  <div className="helper-text">
                    Assign survey themes to group related questions together
                  </div>
                </div>
                
                <div className="setting-group">
                  <label>Keywords (comma separated):</label>
                  <input 
                    type="text" 
                    value={question.keywords?.join(', ')} 
                    onChange={handleKeywordsChange}
                    placeholder="leadership, communication, teamwork"
                  />
                  <div className="helper-text">
                    Add keywords to make this question easier to find in searches
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="form-section card full-width">
            <div className="card-header">
              <h2>Feedback</h2>
            </div>
            <div className="card-body">
              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={question.collectFeedback || false}
                    onChange={e => setQuestion(q => ({ ...q, collectFeedback: e.target.checked }))}
                  />
                  Collect feedback for this question
                  {renderTooltip('Enable this to allow respondents to provide feedback for this question.')}
                </label>
              </div>
              {question.collectFeedback && (
                <>
                  <div className="setting-group">
                    <label>Feedback Type:</label>
                    <select
                      value={question.feedbackType}
                      onChange={e => setQuestion(q => ({ ...q, feedbackType: e.target.value }))}
                    >
                      <option value="text">Text Comment</option>
                      <option value="rating">Rating</option>
                      <option value="file">File Upload</option>
                    </select>
                    <div className="helper-text">Choose the type of feedback to collect from respondents.</div>
                  </div>
                  <div className="setting-group">
                    <label>Feedback Prompt (optional):</label>
                    <input
                      type="text"
                      value={question.feedbackPrompt || ''}
                      onChange={e => setQuestion(q => ({ ...q, feedbackPrompt: e.target.value }))}
                      placeholder={
                        question.feedbackType === 'text'
                          ? 'Please provide additional comments...'
                          : question.feedbackType === 'rating'
                          ? 'How would you rate this aspect?'
                          : 'Upload a file for evidence...'
                      }
                    />
                    <div className="helper-text">Customize the prompt that respondents will see for feedback.</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Advanced Settings Tab */}
          {activeTab === 'advanced' && (
            <div className="form-section card full-width">
              <div className="card-header">
                <h2>Advanced Settings</h2>
              </div>
              <div className="card-body">
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={question.isReusable} 
                      onChange={handleReusableChange}
                    />
                    Available in Question Bank
                    {renderTooltip('If checked, this question can be reused in multiple surveys')}
                  </label>
                </div>
                
                <div className="setting-group">
                  <label>Priority:</label>
                  <select 
                    value={question.priority} 
                    onChange={handlePriorityChange}
                  >
                    <option value="1">High</option>
                    <option value="2">Medium</option>
                    <option value="3">Low</option>
                  </select>
                  <div className="helper-text">
                    Set the importance level of this question
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals: placed at root for correct overlay */}
        <SaveAsTemplateModal
          isOpen={showSaveTemplate}
          onClose={() => setShowSaveTemplate(false)}
          question={question}
          onSuccess={() => showSuccess('Template saved!')}
        />
        <QuestionTemplatesModal
          isOpen={showImportTemplate}
          onClose={() => setShowImportTemplate(false)}
          onImport={(template: { questionData: Question }) => {
            setShowImportTemplate(false);
            setQuestion({
              ...template.questionData,
              feedbackType: (['text','rating','file'].includes(template.questionData.feedbackType)) ? template.questionData.feedbackType as 'text' | 'rating' | 'file' : 'text',
            });
            showSuccess('Template imported!');
          }}
        />
        <QuestionPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          question={question}
        />
      </div>
      </DashboardBg>
      </AdminLayout>
  );
};

export default QuestionBuilder;
