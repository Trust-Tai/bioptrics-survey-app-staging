import React from 'react';
import { Meteor } from 'meteor/meteor';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './QuestionBuilder.quill.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import Select, { MultiValue, StylesConfig, ActionMeta } from 'react-select';

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

// Use the Question interface from the questions.methods.client module
type Question = QuestionType;

const QuestionBuilder: React.FC =  () => {
  const userId = Meteor.userId()!;
  // Get ?edit=... param from URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get('edit');
  // Alert state and helpers (matching WPSFramework)
  const [alert, setAlert] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
    setTimeout(() => setAlert(null), 3000);
  }
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
    setTimeout(() => setAlert(null), 5000);
  }

  // State for the question being built
  const [question, setQuestion] = React.useState<Question>({
    text: '',
    description: '',
    answerType: 'multiple_choice',
    answers: ['', ''],
    required: true,
    image: '',
    leftLabel: '',
    rightLabel: '',
    feedbackType: 'none',
    feedbackValue: '',
    wpsCategoryIds: [],
    surveyThemeIds: [],
    isReusable: true,
    priority: 1,
    isActive: true,
    keywords: [],
  });

  // State for the preview modal
  const [showPreview, setShowPreview] = React.useState(false);
  
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
  React.useEffect(() => {
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
              feedbackType: latestVersionAny.feedbackType || 'none',
              feedbackValue: latestVersionAny.feedbackValue || '',
            };
            
            // Use the mapped version and add document properties
            setQuestion({
              ...mappedVersion,
              // Add document-level properties with type safety - use type assertion
              // Cast questionDoc to any to avoid TypeScript errors with property access
              wpsCategoryIds: Array.isArray((questionDoc as any).wpsCategoryIds) ? (questionDoc as any).wpsCategoryIds : [],
              surveyThemeIds: Array.isArray((questionDoc as any).surveyThemeIds) ? (questionDoc as any).surveyThemeIds : [],
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
      feedbackType: e.target.value as 'none' | 'text' | 'rating' | 'file',
      feedbackValue: e.target.value === 'none' ? '' : prev.feedbackValue,
    }));
  };

  // Handle feedback value changes
  const handleFeedbackValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion((prev: Question) => ({ ...prev, feedbackValue: e.target.value as string }));
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

  return (
    <AdminLayout>
      <DashboardBg />
      <div className="question-builder-container">
        <div className="question-builder-header">
          <h1>{editId ? 'Edit Question' : 'Create New Question'}</h1>
          <div className="question-builder-actions">
            <button 
              className="preview-button"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
            <EllipsisMenu
              items={[
                { label: 'Save as Draft', onClick: () => handleSave(false) },
                { label: 'Save & Publish', onClick: () => handleSave(true) },
                { label: 'Cancel', onClick: () => navigate('/admin/question-bank') },
              ]}
            />
          </div>
        </div>

        {alert && (
          <div className={`alert ${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="question-builder-form">
          <div className="form-section">
            <h2>Question Text</h2>
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
          </div>

          <div className="form-section">
            <h2>Description / Help Text</h2>
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
          </div>

          <div className="form-section">
            <h2>Answer Type</h2>
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
          </div>

          {(question.answerType !== 'text' && 
            question.answerType !== 'long_text' && 
            question.answerType !== 'date' && 
            question.answerType !== 'file_upload') && (
            <div className="form-section">
              <h2>Answer Options</h2>
              
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
                  </div>
                  <div className="rating-label">
                    <label>Right Label:</label>
                    <input 
                      type="text" 
                      value={question.rightLabel} 
                      onChange={(e) => handleLabelChange('right', e.target.value)}
                      placeholder="e.g., Excellent"
                    />
                  </div>
                </div>
              )}
              
              {question.answers.map((answer: string, index: number) => (
                <div key={index} className="answer-option">
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
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              {(question.answerType === 'multiple_choice' || 
                question.answerType === 'checkbox' || 
                question.answerType === 'dropdown') && (
                <button 
                  className="add-answer" 
                  onClick={addAnswer}
                >
                  + Add Option
                </button>
              )}
            </div>
          )}

          <div className="form-section">
            <h2>Question Settings</h2>
            
            <div className="setting-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={question.required} 
                  onChange={handleRequiredChange}
                />
                Required Question
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
            </div>
            
            <div className="setting-group">
              <label>Feedback Type:</label>
              <select 
                value={question.feedbackType} 
                onChange={handleFeedbackTypeChange}
              >
                <option value="none">None</option>
                <option value="text">Text Comment</option>
                <option value="rating">Rating</option>
                <option value="file">File Upload</option>
              </select>
            </div>
            
            {question.feedbackType !== 'none' && (
              <div className="setting-group">
                <label>Feedback Prompt:</label>
                <input 
                  type="text" 
                  value={question.feedbackValue} 
                  onChange={handleFeedbackValueChange}
                  placeholder={
                    question.feedbackType === 'text' 
                      ? 'Please provide additional comments...' 
                      : question.feedbackType === 'rating'
                      ? 'How would you rate this aspect?' 
                      : 'Upload a file for evidence...'
                  }
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Categorization</h2>
            
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
            </div>
            
            <div className="setting-group">
              <label>Keywords (comma separated):</label>
              <input 
                type="text" 
                value={question.keywords?.join(', ')} 
                onChange={handleKeywordsChange}
                placeholder="leadership, communication, teamwork"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Advanced Settings</h2>
            
            <div className="setting-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={question.isReusable} 
                  onChange={handleReusableChange}
                />
                Available in Question Bank
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
            </div>
            
            <div className="setting-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={question.isActive} 
                  onChange={handleActiveChange}
                />
                Active
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="cancel-button"
              onClick={() => navigate('/admin/question-bank')}
            >
              Cancel
            </button>
            <button 
              className="save-draft-button"
              onClick={() => handleSave(false)}
            >
              Save as Draft
            </button>
            <button 
              className="publish-button"
              onClick={() => handleSave(true)}
            >
              Save & Publish
            </button>
          </div>
        </div>
      </div>
      
      {showPreview && (
        <QuestionPreviewModal
          question={question}
          onClose={() => setShowPreview(false)}
          open={showPreview}
        />
      )}
    </AdminLayout>
  );
};

export default QuestionBuilder;
