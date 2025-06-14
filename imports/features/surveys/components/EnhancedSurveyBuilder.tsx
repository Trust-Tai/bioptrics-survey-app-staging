import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FiSave, FiPlus, FiSettings, FiEye, FiChevronRight, FiTrash2 } from 'react-icons/fi';
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
import { SurveySectionItem } from '../types';

// Define QuestionItem interface locally to ensure TypeScript recognizes all properties
interface QuestionItem {
  id: string;
  text: string;
  type: string;
  status: 'draft' | 'published';
  sectionId?: string;
  order?: number;
  // Add missing properties that are used in the component
  _id?: string;
  versions?: any[];
  currentVersion?: number;
  questionText?: string;
  responseType?: string;
}

// Define the type for section questions to ensure TypeScript recognizes the status property
interface SectionQuestion {
  id: string;
  text: string;
  type: string;
  status?: 'draft' | 'published';
  sectionId?: string;
  order?: number;
}

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

// Define demographic options
const demographicOptions = [
  { value: 'location', label: 'Location' },
  { value: 'age', label: 'Age' },
  { value: 'gender', label: 'Gender' },
  { value: 'education', label: 'Education Level' },
  { value: 'employment', label: 'Employment Status' },
  { value: 'income', label: 'Income Range' },
  { value: 'ethnicity', label: 'Ethnicity' },
  { value: 'language', label: 'Primary Language' },
  { value: 'marital', label: 'Marital Status' },
  { value: 'household', label: 'Household Size' },
  { value: 'disability', label: 'Disability Status' },
  { value: 'veteran', label: 'Veteran Status' },
  { value: 'religion', label: 'Religious Affiliation' },
  { value: 'politics', label: 'Political Affiliation' }
];

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
  // Initialize all demographic options as selected by default for new surveys
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>(
    !surveyId ? demographicOptions.map(opt => opt.value) : []
  );
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // State for modals
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<SurveySectionItem | undefined>(undefined);
  
  // State for public URL
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [showPublicUrl, setShowPublicUrl] = useState(false);
  
  // Use Meteor's reactive data system to load questions and survey data
  const { isLoading, allQuestions, surveyThemes, wpsCategories } = useTracker(() => {
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
    
    // Helper function to extract question text from the current version
    const getQuestionText = (question: any): string => {
      if (!question) return 'Untitled Question';
      if (!question.versions || !Array.isArray(question.versions) || question.versions.length === 0) {
        return 'Untitled Question';
      }
      
      // Get the latest version (similar to AllQuestions.tsx)
      const currentVersion = question.currentVersion;
      const latestVersion = question.versions.find((v: any) => v.version === currentVersion) || 
                            question.versions[question.versions.length - 1];
      
      // Strip HTML tags from question text for cleaner display
      const questionText = latestVersion && latestVersion.questionText ? latestVersion.questionText : 'Untitled Question';
      return questionText.replace(/<\/?p>/g, '').replace(/<\/?[^>]+(>|$)/g, '');
    };

    // Fetch all available questions, themes, and categories
    const allQuestions = Questions.find({}, { sort: { createdAt: -1 } }).fetch().map(q => {
      // Get the latest version to extract the response type
      const currentVersion = q.currentVersion;
      const latestVersion = q.versions && Array.isArray(q.versions) ?
        (q.versions.find((v: any) => v.version === currentVersion) || 
        (q.versions.length > 0 ? q.versions[q.versions.length - 1] : null)) : null;
      
      // Create a properly typed QuestionItem
      const questionItem: QuestionItem = {
        id: q._id || '',
        text: getQuestionText(q),
        type: latestVersion?.responseType || 'text',
        status: 'published'
      };
      
      return questionItem;
    });
    const surveyThemes = SurveyThemes.find({}, { sort: { name: 1 } }).fetch();
    const wpsCategories = WPSCategories.find({}, { sort: { name: 1 } }).fetch();
    
    if (currentSurvey && !isLoading) {
      // Clean up the description by removing paragraph tags if they exist
      if (currentSurvey.description) {
        currentSurvey.description = currentSurvey.description.replace(/<p>/g, '').replace(/<\/p>/g, '');
      }
      
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
        const validatedQuestions = currentSurvey.sectionQuestions.map((q: SectionQuestion) => {
          // Find the full question document to get the proper text
          const fullQuestion = Questions.findOne(q.id);
          
          // Create a properly typed QuestionItem with all required fields
          const questionItem: QuestionItem = {
            id: q.id || '',
            text: fullQuestion ? getQuestionText(fullQuestion) : (q.text || 'Untitled Question'),
            type: q.type || 'text',
            status: q.status === 'draft' ? 'draft' : 'published',
            sectionId: q.sectionId,
            order: q.order
          };
          
          // For debugging
          console.log(`Question ${q.id} text:`, questionItem.text);
          
          return questionItem;
        });
        setSurveyQuestions(validatedQuestions);
      }
      
      // Initialize demographics if they exist in the survey
      if (currentSurvey.selectedDemographics && Array.isArray(currentSurvey.selectedDemographics)) {
        setSelectedDemographics(currentSurvey.selectedDemographics);
      } else {
        // For existing surveys without demographics, select all by default
        setSelectedDemographics(demographicOptions.map(opt => opt.value));
      }
      
      // Initialize theme if it exists in the survey
      if (currentSurvey.selectedTheme) {
        setSelectedTheme(currentSurvey.selectedTheme);
      }
      
      // Initialize categories if they exist in the survey
      if (currentSurvey.selectedCategories && Array.isArray(currentSurvey.selectedCategories)) {
        setSelectedCategories(currentSurvey.selectedCategories);
      }
    }
    
    return {
      isLoading,
      surveyThemes,
      wpsCategories,
      allQuestions: allQuestions.map(q => {
        // Get the current version of the question
        // Use nullish coalescing to handle undefined currentVersion
        const versionIndex = q.currentVersion != null ? q.currentVersion - 1 : 0;
        
        // Get the question version data
        const versions = q.versions || [];
        const currentVersion = versions[versionIndex] || versions[0] || {};
        
        // Extract the actual question text from the current version
        const questionText = currentVersion.questionText || '';
        
        // Create a properly typed QuestionItem
        const questionItem = {
          id: q._id || '',
          text: questionText || 'Untitled Question',
          type: currentVersion.responseType || 'text',
          status: 'published', // Explicitly set as published
          sectionId: undefined, // Will be assigned when added to a section
        } as QuestionItem; // Use type assertion to fix TypeScript error
        return questionItem;
      }),
    };
  }, [surveyId]);
  
  // Show success alert
  const showSuccessAlert = (message: string) => {
    setAlert({ type: 'success', message });
    setTimeout(() => setAlert(null), 5000);
  };
  
  // Show error alert
  const showErrorAlert = (message: string) => {
    setAlert({ type: 'error', message });
    setTimeout(() => setAlert(null), 5000);
  };
  
  // Handle generating a public URL for the survey
  const handleGeneratePublicUrl = async () => {
    try {
      if (!survey || !survey._id) {
        showErrorAlert('Please save the survey first before generating a public URL.');
        return;
      }
      
      // Call the server method to mark the survey as public
      const updatedSurvey = await Meteor.callAsync('surveys.makePublic', survey._id);
      
      if (!updatedSurvey) {
        showErrorAlert('Failed to make the survey public.');
        return;
      }
      
      try {
        // Generate an encrypted token for the survey ID
        const encryptedToken = await Meteor.callAsync('surveys.generateEncryptedToken', survey._id);
        
        // Generate the public URL using the encrypted token
        const baseUrl = window.location.origin;
        const publicSurveyUrl = `${baseUrl}/public/${encryptedToken}`;
        
        // Update state
        setPublicUrl(publicSurveyUrl);
        setShowPublicUrl(true);
        
        // Show success message
        showSuccessAlert('Secure public URL generated successfully!');
      } catch (tokenError: any) {
        // Fallback to shareToken if token generation fails
        if (updatedSurvey.shareToken) {
          const baseUrl = window.location.origin;
          const publicSurveyUrl = `${baseUrl}/public/${updatedSurvey.shareToken}`;
          
          setPublicUrl(publicSurveyUrl);
          setShowPublicUrl(true);
          
          showSuccessAlert('Public URL generated successfully (using legacy token).');
        } else {
          showErrorAlert('Failed to generate secure token for the survey.');
        }
      }
    } catch (error: any) {
      showErrorAlert(`Error generating public URL: ${error.message}`);
    }
  };
  
  // Handle saving the survey
  const handleSaveSurvey = async () => {
    try {
      setSaving(true);
      
      // Prepare survey data for saving
      // Clean up paragraph tags from description at save time
      const cleanDescription = survey?.description ? survey.description.replace(/<p>/g, '').replace(/<\/p>/g, '') : '';
      
      // Log the current state of survey questions before saving
      console.log('Saving survey with questions:', surveyQuestions);
      
      const surveyData = {
        ...survey,
        title: survey?.title || 'Untitled Survey',
        description: cleanDescription,
        logo: survey?.logo || '',
        featuredImage: survey?.featuredImage || '',
        primaryColor: survey?.primaryColor || '#552a47',
        surveySections: sections,
        sectionQuestions: surveyQuestions,
        // Include demographics, themes, and categories
        selectedDemographics: selectedDemographics,
        selectedTheme: selectedTheme,
        selectedCategories: selectedCategories,
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
      
      // Completely remove questions associated with this section
      setSurveyQuestions(prev => prev.filter(q => q.sectionId !== sectionId));
      
      // Also update the survey state to ensure changes are saved
      setSurvey((prevSurvey: any) => {
        if (!prevSurvey) return prevSurvey;
        
        return {
          ...prevSurvey,
          sectionQuestions: prevSurvey.sectionQuestions?.filter((q: any) => 
            q.sectionId !== sectionId
          ) || []
        };
      });
    }
  };
  
  // Helper function to get clean question text
  const extractQuestionText = (question: any): string => {
    if (!question) return 'Untitled Question';
    if (!question.versions || !Array.isArray(question.versions) || question.versions.length === 0) {
      return 'Untitled Question';
    }
    
    // Get the latest version (similar to AllQuestions.tsx)
    const currentVersion = question.currentVersion;
    const latestVersion = question.versions.find((v: any) => v.version === currentVersion) || 
                          question.versions[question.versions.length - 1];
    
    // Strip HTML tags from question text for cleaner display
    const questionText = latestVersion && latestVersion.questionText ? latestVersion.questionText : 'Untitled Question';
    return questionText.replace(/<\/?p>/g, '').replace(/<\/?[^>]+(>|$)/g, '');
  };
  
  // State to store refreshed questions for the question selector
  const [questionSelectorItems, setQuestionSelectorItems] = useState<QuestionItem[]>([]);
  
  // Handle adding questions to a section
  const handleAddQuestion = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    
    // Refresh question data before opening selector to ensure we have the latest question text
    const refreshedQuestions = Questions.find({}, { sort: { createdAt: -1 } }).fetch().map(q => {
      // Get the latest version to extract the response type and text
      const currentVersion = q.currentVersion;
      const latestVersion = q.versions && Array.isArray(q.versions) ?
        (q.versions.find((v: any) => v.version === currentVersion) || 
        (q.versions.length > 0 ? q.versions[q.versions.length - 1] : null)) : null;
      
      // Create a properly typed QuestionItem
      const questionItem: QuestionItem = {
        id: q._id || '',
        text: extractQuestionText(q), // Use our helper function to get clean question text
        type: latestVersion?.responseType || 'text',
        status: 'published'
      };
      
      console.log(`Question selector item: ${q._id} - ${questionItem.text}`);
      return questionItem;
    });
    
    // Update the question selector items
    setQuestionSelectorItems(refreshedQuestions);
    setShowQuestionSelector(true);
  };
  
  // Handle selecting questions in the question selector
  const handleSelectQuestions = (questionIds: string[], sectionId: string) => {
    console.log(`Adding questions to section ${sectionId}:`, questionIds);
    
    // Get currently selected questions for this section
    const currentSectionQuestions = surveyQuestions.filter(q => q.sectionId === sectionId);
    const currentSectionQuestionIds = currentSectionQuestions.map(q => q.id);
    
    // Find questions that need to be added (not already in the section)
    // Use questionSelectorItems if available, otherwise fall back to allQuestions
    const questionsSource = questionSelectorItems.length > 0 ? questionSelectorItems : allQuestions;
    
    // Get all selected questions from the source
    const selectedQuestions = questionsSource.filter(q => questionIds.includes(q.id));
    console.log('Selected questions:', selectedQuestions);
    
    // Create question items for ALL selected questions (not just new ones)
    // This ensures we have the complete set of questions for the section
    const sectionQuestionItems = selectedQuestions.map((q, index) => {
      // Create a properly typed QuestionItem
      const questionItem: QuestionItem = {
        id: q.id,
        text: q.text,
        type: q.type,
        sectionId: sectionId,
        order: index, // Reorder based on selection order
        status: q.status || 'published'
      };
      
      console.log(`Adding question to section: ${q.id} - ${q.text}`);
      return questionItem;
    });
    
    // Update survey questions - remove existing questions for this section and add the new set
    setSurveyQuestions(prev => {
      // Keep questions from other sections
      const otherSectionQuestions = prev.filter(q => q.sectionId !== sectionId);
      
      // Combine with the new section questions
      const updatedQuestions = [...otherSectionQuestions, ...sectionQuestionItems];
      console.log('Updated survey questions:', updatedQuestions);
      return updatedQuestions;
    });
    
    // Update the survey state to ensure changes are saved
    setSurvey((prevSurvey: any) => {
      if (!prevSurvey) return prevSurvey;
      
      // Get questions from other sections
      const otherSectionQuestions = prevSurvey.sectionQuestions?.filter((q: any) => 
        q.sectionId !== sectionId
      ) || [];
      
      // Create updated survey with the new section questions
      const updatedSurvey = {
        ...prevSurvey,
        sectionQuestions: [...otherSectionQuestions, ...sectionQuestionItems]
      };
      
      console.log('Updated survey:', updatedSurvey);
      return updatedSurvey;
    });
    
    // Close the question selector modal
    setShowQuestionSelector(false);
  };
  
  // Handle removing a question from a section
  const handleRemoveQuestion = (questionId: string, sectionId: string) => {
    // Completely remove the question from surveyQuestions
    setSurveyQuestions(prev => prev.filter(q => 
      !(q.id === questionId && q.sectionId === sectionId)
    ));
    
    // Also update the survey state to ensure changes are saved
    setSurvey((prevSurvey: any) => {
      if (!prevSurvey) return prevSurvey;
      
      return {
        ...prevSurvey,
        sectionQuestions: prevSurvey.sectionQuestions?.filter((q: any) => 
          !(q.id === questionId && q.sectionId === sectionId)
        ) || []
      };
    });
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
              <button 
                className="btn btn-success"
                onClick={handleGeneratePublicUrl}
                disabled={!survey?._id}
                style={{ marginLeft: '8px', backgroundColor: '#28a745', borderColor: '#28a745' }}
              >
                Publish
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
                  
                  <div style={{ padding: 20 }}>
                    {surveyQuestions.length > 0 ? (
                      <div>
                        <p style={{ marginBottom: 16, fontSize: 15, color: '#555' }}>
                          All questions added to your survey sections are listed below.
                        </p>
                        
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: 16,
                          marginTop: 16
                        }}>
                          {surveyQuestions.map((question, index) => {
                            // Find the section this question belongs to
                            const section = sections.find(s => s.id === question.sectionId);
                            
                            // Remove HTML tags from question text
                            const cleanQuestionText = question.text
                              .replace(/<\/?p>/g, '')
                              .replace(/<\/?[^>]+(>|$)/g, '');
                            
                            return (
                              <div 
                                key={question.id}
                                style={{
                                  padding: '18px',
                                  borderRadius: 8,
                                  border: '1px solid #e0e0e0',
                                  background: '#fff',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontWeight: 600, 
                                    fontSize: 15, 
                                    color: '#333',
                                    lineHeight: '1.4'
                                  }}>
                                    {cleanQuestionText}
                                  </div>
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 12,
                                    marginTop: 8
                                  }}>
                                    <div style={{ 
                                      fontSize: 13, 
                                      color: '#666',
                                      padding: '3px 8px',
                                      background: '#f5f5f5',
                                      borderRadius: 4
                                    }}>
                                      {question.type}
                                    </div>
                                    
                                    {section && (
                                      <div style={{ 
                                        fontSize: 13, 
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}>
                                        <span>Section:</span>
                                        <span style={{ fontWeight: 500, color: '#552a47' }}>{section.name}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="remove-button-container">
                                  <button 
                                    className="remove-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (question.sectionId) {
                                        handleRemoveQuestion(question.id, question.sectionId);
                                      }
                                    }}
                                    style={{ 
                                      padding: '6px 10px', 
                                      fontSize: 13,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 6,
                                      background: '#f8f8f8',
                                      border: '1px solid #ddd',
                                      borderRadius: 4,
                                      color: '#d63031',
                                      fontWeight: 500,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    aria-label="Remove question"
                                  >
                                    <FiTrash2 size={16} style={{ color: '#d63031' }} /> 
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                        No questions have been added to any sections yet. 
                        <div style={{ marginTop: 8 }}>
                          Go to the Sections tab to add sections and questions to your survey.
                        </div>
                      </div>
                    )}
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
                          onChange={(content) => {
                            // Just store the content as is during editing to improve performance
                            // We'll clean it up when saving
                            setSurvey({...survey, description: content});
                          }}
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
              {activeStep === 'demographics' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">Demographics Metrics</h2>
                  </div>
                  
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 15, color: '#555', margin: '0 0 16px 0' }}>
                      Select which demographic data to collect when users answer this survey. This information helps analyze survey results across different demographic groups.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {demographicOptions.map(opt => {
                        const isSelected = selectedDemographics.includes(opt.value);
                        return (
                          <div key={opt.value} style={{ marginBottom: 10 }}>
                            <label style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10, 
                              cursor: 'pointer',
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #e0e0e0',
                              background: isSelected ? '#f5edf3' : '#fff',
                              transition: 'all 0.2s',
                              boxShadow: isSelected ? '0 2px 8px rgba(85, 42, 71, 0.08)' : 'none'
                            }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedDemographics(
                                    isSelected
                                      ? selectedDemographics.filter(v => v !== opt.value)
                                      : [...selectedDemographics, opt.value]
                                  );
                                }}
                                style={{ 
                                  width: 18, 
                                  height: 18,
                                  accentColor: '#552a47'
                                }}
                              />
                              <span style={{ 
                                fontWeight: isSelected ? 600 : 500, 
                                fontSize: 15,
                                color: isSelected ? '#552a47' : '#333'
                              }}>
                                {opt.label}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                      <button 
                        onClick={() => setSelectedDemographics(demographicOptions.map(opt => opt.value))}
                        style={{
                          padding: '8px 16px',
                          background: '#f5edf3',
                          border: '1px solid #e5d6e2',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#552a47',
                          transition: 'all 0.2s'
                        }}
                      >
                        Select All
                      </button>
                      <button 
                        onClick={() => setSelectedDemographics([])}
                        style={{
                          padding: '8px 16px',
                          background: '#f0f0f0',
                          border: '1px solid #ddd',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#555',
                          transition: 'all 0.2s'
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeStep === 'themes' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">
                      {steps.find(step => step.id === activeStep)?.label}
                    </h2>
                  </div>
                  
                  <div style={{ padding: 20 }}>
                    <p style={{ marginBottom: 16, fontSize: 15 }}>
                      Select a theme for your survey. The theme will affect the appearance and feel of your survey.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {surveyThemes.map((theme: any) => {
                        const isSelected = selectedTheme === theme._id;
                        return (
                          <div 
                            key={theme._id} 
                            onClick={() => setSelectedTheme(theme._id)}
                            style={{ 
                              cursor: 'pointer',
                              borderRadius: 8,
                              border: `2px solid ${isSelected ? theme.color || '#552a47' : '#e0e0e0'}`,
                              background: isSelected ? '#f5edf3' : '#fff',
                              padding: '16px',
                              transition: 'all 0.2s',
                              boxShadow: isSelected ? '0 2px 8px rgba(85, 42, 71, 0.15)' : 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 12
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: '50%', 
                                background: theme.color || '#552a47',
                                border: '1px solid #e0e0e0'
                              }} />
                              <div style={{ 
                                fontWeight: isSelected ? 600 : 500, 
                                fontSize: 16,
                                color: isSelected ? '#552a47' : '#333'
                              }}>
                                {theme.name}
                              </div>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between'
                            }}>
                              <div style={{ 
                                fontSize: 14, 
                                color: '#666',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {theme.description || 'No description'}
                              </div>
                              <div style={{ 
                                width: 20, 
                                height: 20, 
                                borderRadius: '50%', 
                                border: `2px solid ${isSelected ? theme.color || '#552a47' : '#ddd'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fff'
                              }}>
                                {isSelected && (
                                  <div style={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    background: theme.color || '#552a47' 
                                  }} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : activeStep === 'categories' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">
                      {steps.find(step => step.id === activeStep)?.label}
                    </h2>
                  </div>
                  
                  <div style={{ padding: 20 }}>
                    <p style={{ marginBottom: 16, fontSize: 15 }}>
                      Select categories for your survey. Categories help organize and classify your survey content.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                      {wpsCategories.map((category: any) => {
                        const isSelected = selectedCategories.includes(category._id);
                        return (
                          <div 
                            key={category._id} 
                            onClick={() => {
                              const updatedCategories = isSelected
                                ? selectedCategories.filter((id: string) => id !== category._id)
                                : [...selectedCategories, category._id];
                              setSelectedCategories(updatedCategories);
                            }}
                            style={{ 
                              cursor: 'pointer',
                              borderRadius: 8,
                              border: `2px solid ${isSelected ? category.color || '#552a47' : '#e0e0e0'}`,
                              background: isSelected ? '#f5edf3' : '#fff',
                              padding: '16px',
                              transition: 'all 0.2s',
                              boxShadow: isSelected ? '0 2px 8px rgba(85, 42, 71, 0.15)' : 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 12
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: '4px', 
                                background: category.color || '#552a47',
                                border: '1px solid #e0e0e0'
                              }} />
                              <div style={{ 
                                fontWeight: isSelected ? 600 : 500, 
                                fontSize: 16,
                                color: isSelected ? '#552a47' : '#333'
                              }}>
                                {category.name}
                              </div>
                            </div>
                            
                            <div style={{ 
                              fontSize: 14, 
                              color: '#666',
                              marginTop: 5,
                              lineHeight: '1.4'
                            }}>
                              {category.description || 'No description'}
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'flex-end',
                              marginTop: 10
                            }}>
                              <div style={{ 
                                width: 20, 
                                height: 20, 
                                borderRadius: '4px', 
                                border: `2px solid ${isSelected ? category.color || '#552a47' : '#ddd'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fff'
                              }}>
                                {isSelected && (
                                  <div style={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '2px', 
                                    background: category.color || '#552a47' 
                                  }} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : activeStep !== 'sections' && activeStep !== 'questions' && activeStep !== 'welcome' && (
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

        {/* Public URL Modal */}
        {showPublicUrl && (
            <div className="modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="modal-content" style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '500px',
                maxWidth: '90%',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                <h3 style={{ marginTop: 0 }}>Public Survey URL</h3>
                <p>Share this URL with participants to allow them to take the survey:</p>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}>
                  <input 
                    type="text" 
                    value={publicUrl} 
                    readOnly 
                    style={{ 
                      flex: 1, 
                      border: 'none', 
                      outline: 'none',
                      padding: '4px'
                    }} 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      showSuccessAlert('URL copied to clipboard!');
                    }}
                    style={{
                      backgroundColor: '#552a47',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    Copy
                  </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setShowPublicUrl(false)}
                    style={{
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        
        {/* Question Selector Modal */}
        <QuestionSelector
          isOpen={showQuestionSelector}
          onClose={() => setShowQuestionSelector(false)}
          questions={questionSelectorItems.length > 0 ? questionSelectorItems : allQuestions}
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
