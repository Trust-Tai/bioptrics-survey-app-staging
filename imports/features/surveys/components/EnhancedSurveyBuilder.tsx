import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FiSave, FiPlus, FiSettings, FiEye, FiChevronRight } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import '../../../ui/styles/quill-styles';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import DashboardBg from '../../../ui/admin/DashboardBg';

// Import our new components
import EnhancedSurveySection from './sections/EnhancedSurveySection';
import QuestionSelector from './sections/QuestionSelector';
import SectionEditor from './sections/SectionEditor';

// Import existing components we'll reuse
import SurveyBranchingLogic from '../../../ui/admin/SurveyBranchingLogic';
import SurveyNotifications from '../../../ui/admin/SurveyNotifications';
import SurveySharing from '../../../ui/admin/SurveySharing';

// Import collections
import { Questions } from '../../../features/questions/api/questions';
import { SurveyThemes } from '../../../features/survey-themes/api/surveyThemes';
import { WPSCategories } from '../../../features/wps-framework/api/wpsCategories';
import { Surveys } from '../../../features/surveys/api/surveys';

// Import types
import { SurveySectionItem, QuestionItem } from '../types';

// Import styles
import './EnhancedSurveyBuilder.css';

// Define the steps for the survey builder
const steps = [
  { id: 'welcome', label: 'Welcome Screen', icon: 'FiHome' },
  { id: 'sections', label: 'Sections', icon: 'FiLayers' },
  { id: 'questions', label: 'Questions', icon: 'FiList' },
  { id: 'demographics', label: 'Demographics', icon: 'FiUsers' },
  { id: 'themes', label: 'Themes', icon: 'FiTag' },
  { id: 'categories', label: 'Categories', icon: 'FiGrid' },
  { id: 'branching', label: 'Branching Logic', icon: 'FiGitBranch' },
  { id: 'completion', label: 'Completion', icon: 'FiCheckCircle' },
  { id: 'preview', label: 'Preview', icon: 'FiEye' },
  { id: 'publish', label: 'Publish', icon: 'FiSend' },
  { id: 'settings', label: 'Settings', icon: 'FiSettings' },
  { id: 'notifications', label: 'Notifications', icon: 'FiBell' },
];

// Spinner component for loading states
const Spinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    width: '100%',
  }}>
    <div style={{
      border: '6px solid #f3e9d7',
      borderTop: '6px solid #552a47',
      borderRadius: '50%',
      width: 56,
      height: 56,
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`@keyframes spin {0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);}}`}</style>
  </div>
);

// Main EnhancedSurveyBuilder component
const EnhancedSurveyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  
  // State for the survey builder
  const [activeStep, setActiveStep] = useState('welcome');
  const [survey, setSurvey] = useState<any>(null);
  const [sections, setSections] = useState<SurveySectionItem[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // State for modals
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<SurveySectionItem | undefined>(undefined);
  
  // Use Meteor's reactive data system to load questions and survey data
  const { isLoading, allQuestions } = useTracker(() => {
    // Subscribe to all questions
    const questionsSub = Meteor.subscribe('questions.all');
    const themesSub = Meteor.subscribe('surveyThemes.all');
    const categoriesSub = Meteor.subscribe('wpsCategories.all');
    
    // Only subscribe to the survey if we have a surveyId
    let surveysSub = { ready: () => true }; // Default to ready if no surveyId
    let currentSurvey = null;
    
    if (surveyId) {
      surveysSub = Meteor.subscribe('surveys.single', surveyId);
      // Fetch the current survey if we have an ID
      currentSurvey = surveysSub.ready() ? Surveys.findOne(surveyId) : null;
    }
    
    const isLoading = !questionsSub.ready() || !surveysSub.ready() || !themesSub.ready() || !categoriesSub.ready();
    
    // Fetch all available questions
    const allQuestions = Questions.find({}, { sort: { createdAt: -1 } }).fetch();
    
    if (currentSurvey && !isLoading) {
      // Update survey state when data is ready
      setSurvey(currentSurvey);
      
      // Initialize sections if they exist in the survey
      if (currentSurvey.surveySections && Array.isArray(currentSurvey.surveySections)) {
        setSections(currentSurvey.surveySections);
      } else if (currentSurvey.sections && Array.isArray(currentSurvey.sections)) {
        setSections(currentSurvey.sections);
      }
      
      // Initialize questions if they exist in the survey
      if (currentSurvey.sectionQuestions && Array.isArray(currentSurvey.sectionQuestions)) {
        // Make sure all required fields are present
        const validatedQuestions = currentSurvey.sectionQuestions.map(q => {
          // Create a properly typed QuestionItem
          const questionItem: QuestionItem = {
            id: q.id || '',
            text: q.text || '',
            type: q.type || 'text',
            status: q.status === 'draft' ? 'draft' : 'published',
            sectionId: q.sectionId,
            order: q.order
          };
          return questionItem;
        });
        setSurveyQuestions(validatedQuestions);
      }
    }
    
    return {
      isLoading,
      allQuestions: allQuestions.map(q => {
        // Get the current version of the question
        const currentVersion = q.versions?.[q.currentVersion - 1] || {};
        
        return {
          id: q._id || '',
          text: currentVersion.questionText || 'Untitled Question',
          type: currentVersion.responseType || 'text',
          status: 'published' as 'draft' | 'published', // Cast to the correct type
          sectionId: undefined, // Will be assigned when added to a section
        };
      }),
    };
  }, [surveyId]);
  
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
  
  // Handle saving the survey
  const handleSaveSurvey = async () => {
    try {
      setSaving(true);
      
      // Prepare survey data for saving
      const surveyData = {
        ...survey,
        title: survey?.title || 'Untitled Survey',
        description: survey?.description || '',
        logo: survey?.logo || '',
        featuredImage: survey?.featuredImage || '',
        primaryColor: survey?.primaryColor || '#552a47',
        surveySections: sections,
        sectionQuestions: surveyQuestions,
        updatedAt: new Date(),
      };
      
      let savedSurveyId;
      
      // If we have a surveyId, update the existing survey
      // Otherwise create a new one
      if (surveyId) {
        await Meteor.callAsync('surveys.update', surveyId, surveyData);
        savedSurveyId = surveyId;
        showSuccessAlert('Survey updated successfully!');
      } else {
        // Add creation date for new surveys
        const newSurveyData = {
          ...surveyData,
          createdAt: new Date(),
          createdBy: Meteor.userId() || 'anonymous',
          status: 'draft',
        };
        
        savedSurveyId = await Meteor.callAsync('surveys.saveDraft', newSurveyData);
        showSuccessAlert('Survey created successfully!');
        
        // Navigate to the edit page for the new survey
        navigate(`/admin/surveys/builder/${savedSurveyId}`);
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving survey:', error);
      showErrorAlert(`Error saving survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSaving(false);
    }
  };
  
  // Handle adding a new section
  const handleAddSection = () => {
    setCurrentSection(undefined);
    setShowSectionEditor(true);
  };
  
  // Handle editing a section
  const handleEditSection = (section: SurveySectionItem) => {
    setCurrentSection(section);
    setShowSectionEditor(true);
  };
  
  // Handle saving a section
  const handleSaveSection = (sectionData: SurveySectionItem) => {
    if (currentSection) {
      // Update existing section
      setSections(prev => prev.map(s => 
        s.id === sectionData.id ? sectionData : s
      ));
    } else {
      // Add new section
      setSections(prev => [...prev, sectionData]);
    }
  };
  
  // Handle deleting a section
  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section? This will remove all questions assigned to this section.')) {
      // Remove section
      setSections(prev => prev.filter(s => s.id !== sectionId));
      
      // Remove section ID from questions
      setSurveyQuestions(prev => prev.map(q => 
        q.sectionId === sectionId ? { ...q, sectionId: undefined } : q
      ));
    }
  };
  
  // Handle adding questions to a section
  const handleAddQuestion = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setShowQuestionSelector(true);
  };
  
  // Handle selecting questions in the question selector
  const handleSelectQuestions = (questionIds: string[], sectionId: string) => {
    // Update questions with the new section ID
    setSurveyQuestions(prev => prev.map(q => 
      questionIds.includes(q.id) ? { ...q, sectionId } : q
    ));
  };
  
  // Handle removing a question from a section
  const handleRemoveQuestion = (questionId: string, sectionId: string) => {
    setSurveyQuestions(prev => prev.map(q => 
      q.id === questionId && q.sectionId === sectionId ? { ...q, sectionId: undefined } : q
    ));
  };
  
  // Handle reordering questions within a section
  const handleReorderQuestion = (sectionId: string, oldIndex: number, newIndex: number) => {
    // Get questions for this section
    const sectionQuestions = surveyQuestions.filter(q => q.sectionId === sectionId);
    
    // Reorder the questions
    const reorderedQuestions = [...sectionQuestions];
    const [movedQuestion] = reorderedQuestions.splice(oldIndex, 1);
    reorderedQuestions.splice(newIndex, 0, movedQuestion);
    
    // Update the order property for each question
    const updatedQuestions = reorderedQuestions.map((q, index) => ({
      ...q,
      order: index,
    }));
    
    // Update the survey questions state
    setSurveyQuestions(prev => {
      const otherQuestions = prev.filter(q => q.sectionId !== sectionId);
      return [...otherQuestions, ...updatedQuestions];
    });
  };
  
  // Get questions that belong to a specific section
  const getQuestionsForSection = (sectionId: string) => {
    return surveyQuestions.filter(q => q.sectionId === sectionId);
  };
  
  // Get questions that are currently selected for a section
  const getSelectedQuestionIds = (sectionId: string) => {
    return surveyQuestions
      .filter(q => q.sectionId === sectionId)
      .map(q => q.id);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <DashboardBg>
          <Spinner />
        </DashboardBg>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <DashboardBg>
        <div className="survey-builder-container">
          {/* Alert message */}
          {alert && (
            <div className={`alert alert-${alert.type}`}>
              {alert.message}
            </div>
          )}
          
          {/* Header */}
          <div className="survey-builder-header">
            <div>
              <h1 className="survey-builder-title">
                {survey?.title || 'Untitled Survey'}
              </h1>
              <p style={{ color: '#666' }}>
                {survey?.description || 'No description'}
              </p>
            </div>
            <div className="survey-builder-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/admin/surveys')}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveSurvey}
                disabled={saving}
              >
                <FiSave /> {saving ? 'Saving...' : 'Save Survey'}
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="survey-builder-main">
            {/* Sidebar */}
            <div className="survey-builder-sidebar">
              <div className="survey-builder-step-list">
                {steps.map(step => (
                  <div 
                    key={step.id}
                    className={`survey-builder-step ${activeStep === step.id ? 'active' : ''}`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <div className="survey-builder-step-icon">
                      {step.id === 'sections' && <FiChevronRight />}
                    </div>
                    <div className="survey-builder-step-label">
                      {step.label}
                    </div>
                    <div className="survey-builder-step-indicator" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="survey-builder-content">
              {activeStep === 'sections' && (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <div>
                      <h2 className="survey-builder-panel-title">Survey Sections</h2>
                      <p className="survey-builder-panel-subtitle">
                        Create and manage sections for your survey
                      </p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={handleAddSection}
                    >
                      <FiPlus /> Add Section
                    </button>
                  </div>
                  
                  <div className="survey-sections-container">
                    {sections.length > 0 ? (
                      sections.map(section => (
                        <EnhancedSurveySection
                          key={section.id}
                          section={section}
                          questions={surveyQuestions.filter(q => q.sectionId === section.id)}
                          onEditSection={handleEditSection}
                          onDeleteSection={handleDeleteSection}
                          onAddQuestion={handleAddQuestion}
                          onRemoveQuestion={handleRemoveQuestion}
                          onReorderQuestion={handleReorderQuestion}
                        />
                      ))
                    ) : (
                      <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                        No sections created yet. Click "Add Section" to create your first section.
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeStep === 'questions' && (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <div>
                      <h2 className="survey-builder-panel-title">Survey Questions</h2>
                      <p className="survey-builder-panel-subtitle">
                        Manage all questions in your survey
                      </p>
                    </div>
                  </div>
                  
                  {/* Questions management UI will go here */}
                  <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                    Questions management is available in the Sections tab. Please use the Sections tab to add and manage questions.
                  </div>
                </div>
              )}
              
              {/* Welcome Screen */}
              {activeStep === 'welcome' && (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">Welcome Screen</h2>
                  </div>
                  
                  <div className="survey-builder-panel-content">
                    <div className="form-group">
                      <label htmlFor="surveyTitle">Title</label>
                      <input
                        type="text"
                        id="surveyTitle"
                        className="form-control"
                        value={survey?.title || ''}
                        onChange={(e) => setSurvey({...survey, title: e.target.value})}
                        placeholder="Enter survey title"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="surveyDescription">Description</label>
                      <div className="quill-editor-container">
                        <ReactQuill
                          theme="snow"
                          value={survey?.description || ''}
                          onChange={(content) => setSurvey({...survey, description: content})}
                          placeholder="Enter survey description"
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{'list': 'ordered'}, {'list': 'bullet'}],
                              ['link', 'image'],
                              ['clean']
                            ],
                          }}
                          formats={[
                            'header',
                            'bold', 'italic', 'underline', 'strike',
                            'list', 'bullet',
                            'link', 'image'
                          ]}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="surveyLogo">Logo</label>
                      <div className="file-upload-container">
                        <input
                          type="file"
                          id="surveyLogo"
                          className="file-input"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setSurvey({...survey, logo: event.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          accept="image/*"
                        />
                        <label htmlFor="surveyLogo" className="file-upload-button" style={{ color: '#ffffff' }}>
                          Choose Logo
                        </label>
                        <span className="file-name" style={{ color: '#ffffff' }}>
                          {survey?.logo ? 'Logo selected' : 'No file selected'}
                        </span>
                      </div>
                      {survey?.logo && (
                        <div className="image-preview">
                          <img 
                            src={survey.logo} 
                            alt="Logo Preview" 
                            style={{ maxWidth: '200px', maxHeight: '100px', marginTop: '10px' }} 
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="surveyFeaturedImage">Featured Image</label>
                      <div className="file-upload-container">
                        <input
                          type="file"
                          id="surveyFeaturedImage"
                          className="file-input"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setSurvey({...survey, featuredImage: event.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          accept="image/*"
                        />
                        <label htmlFor="surveyFeaturedImage" className="file-upload-button" style={{ color: '#ffffff' }}>
                          Choose Featured Image
                        </label>
                        <span className="file-name" style={{ color: '#ffffff' }}>
                          {survey?.featuredImage ? 'Featured image selected' : 'No file selected'}
                        </span>
                      </div>
                      {survey?.featuredImage && (
                        <div className="image-preview">
                          <img 
                            src={survey.featuredImage} 
                            alt="Featured Image Preview" 
                            style={{ maxWidth: '300px', maxHeight: '200px', marginTop: '10px' }} 
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="surveyPrimaryColor">Primary Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="color"
                          id="surveyPrimaryColor"
                          className="form-control color-picker"
                          value={survey?.primaryColor || '#552a47'}
                          onChange={(e) => setSurvey({...survey, primaryColor: e.target.value})}
                          style={{ width: '50px', height: '40px', padding: '0' }}
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={survey?.primaryColor || '#552a47'}
                          onChange={(e) => setSurvey({...survey, primaryColor: e.target.value})}
                          placeholder="#552a47"
                          style={{ width: '120px' }}
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setActiveStep('sections')}
                      >
                        Save and Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Other steps would be implemented here */}
              {activeStep !== 'sections' && activeStep !== 'questions' && activeStep !== 'welcome' && (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">
                      {steps.find(step => step.id === activeStep)?.label}
                    </h2>
                  </div>
                  
                  <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                    This section is under development. Please focus on creating sections and adding questions first.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Question Selector Modal */}
        <QuestionSelector
          isOpen={showQuestionSelector}
          onClose={() => setShowQuestionSelector(false)}
          questions={allQuestions}
          selectedQuestionIds={currentSectionId ? getSelectedQuestionIds(currentSectionId) : []}
          sectionId={currentSectionId || ''}
          onSelectQuestions={handleSelectQuestions}
        />
        
        {/* Section Editor Modal */}
        <SectionEditor
          isOpen={showSectionEditor}
          onClose={() => setShowSectionEditor(false)}
          section={currentSection}
          onSave={handleSaveSection}
        />
      </DashboardBg>
    </AdminLayout>
  );
};

export default EnhancedSurveyBuilder;
