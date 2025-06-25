import React, { useState, useEffect, useRef } from 'react';
import { FaEye } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FiSave, FiPlus, FiSettings, FiEye, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import '../../../ui/styles/quill-styles';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import DashboardBg from '../../../ui/admin/DashboardBg';
import { Layers, Layer } from '../../../api/layers';

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
  { id: 'tags', label: 'Tags', icon: 'FiTag' },
  // { id: 'demographics', label: 'Demographics', icon: 'FiUsers' },
  { id: 'themes', label: 'Themes', icon: 'FiTag' },
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
  const [survey, setSurvey] = useState<any>({ defaultSettings: { allowRetake: true } });
  const [sections, setSections] = useState<SurveySectionItem[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Initialize all demographic options as selected by default for new surveys
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>(
    !surveyId ? demographicOptions.map(opt => opt.value) : []
  );
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [previewTheme, setPreviewTheme] = useState<any>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [themeSearchQuery, setThemeSearchQuery] = useState<string>('');
  const [currentThemePage, setCurrentThemePage] = useState<number>(1);
  const themesPerPage = 10; // Number of themes to display per page
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Layer[]>([]);
  
  // Refs for Tom Select
  const tagSelectRef = useRef<HTMLSelectElement>(null);
  const tomSelectInstance = useRef<any>(null);
  
  // Subscribe to layers (tags) with location containing "Surveys"
  useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    
    if (subscription.ready()) {
      // Fetch all layers/tags that have "Surveys" in their location field
      // Include both active and inactive tags to prevent DOM errors when tags are deactivated
      const tags = Layers.find(
        { location: { $regex: 'Surveys', $options: 'i' } },
        { sort: { name: 1 } }
      ).fetch();
      
      setAvailableTags(tags);
    }
    
    return subscription.ready();
  }, []);
  
  // State for modals
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<SurveySectionItem | undefined>(undefined);
  
  // State for public URL and published status
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  // Removed showPublicUrl state as we no longer need the popup
  
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
      // Ensure defaultSettings exists to prevent null reference errors
      if (!currentSurvey.defaultSettings) {
        currentSurvey.defaultSettings = { allowRetake: true };
      }
      setSurvey(currentSurvey);
      
      // Initialize sections if they exist in the survey
      console.log('Survey sections data:', { 
        surveySections: currentSurvey.surveySections, 
        sections: currentSurvey.sections 
      });
      
      if (currentSurvey.surveySections && Array.isArray(currentSurvey.surveySections)) {
        console.log('Using surveySections:', currentSurvey.surveySections);
        setSections(currentSurvey.surveySections);
      } else if (currentSurvey.sections && Array.isArray(currentSurvey.sections)) {
        console.log('Using sections:', currentSurvey.sections);
        setSections(currentSurvey.sections);
      } else {
        console.log('No sections found in survey data');
      }
      
      // Check if the survey is already published and set the public URL
      console.log('Survey loaded:', currentSurvey);
      console.log('Is survey published?', currentSurvey.published);
      console.log('Survey share token:', currentSurvey.shareToken);
      
      // Check if the survey is published by either published flag or having a shareToken
      if (currentSurvey.published || currentSurvey.shareToken) {
        console.log('Survey is published, generating public URL');
        setIsPublished(true);
        const loadPublicUrl = async () => {
          try {
            // Try to generate an encrypted token for the survey
            const encryptedToken = await Meteor.callAsync('surveys.generateEncryptedToken', currentSurvey._id);
            const baseUrl = window.location.origin;
            const publicSurveyUrl = `${baseUrl}/public/${encryptedToken}`;
            console.log('Generated public URL with encrypted token:', publicSurveyUrl);
            setPublicUrl(publicSurveyUrl);
          } catch (error) {
            console.error('Error generating encrypted token:', error);
            // Fallback to shareToken if available
            if (currentSurvey.shareToken) {
              const baseUrl = window.location.origin;
              const publicSurveyUrl = `${baseUrl}/public/${currentSurvey.shareToken}`;
              console.log('Using fallback shareToken for URL:', publicSurveyUrl);
              setPublicUrl(publicSurveyUrl);
            }
          }
        };
        
        loadPublicUrl();
      }
      
      // Initialize questions if they exist in the survey
      console.log('Survey questions data:', { 
        sectionQuestions: currentSurvey.sectionQuestions 
      });
      
      if (currentSurvey.sectionQuestions && Array.isArray(currentSurvey.sectionQuestions)) {
        console.log('Found section questions:', currentSurvey.sectionQuestions.length);
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
      
      // Initialize tags if they exist in the survey
      if (currentSurvey.selectedTags && Array.isArray(currentSurvey.selectedTags)) {
        console.log('Loading saved tags from survey:', currentSurvey.selectedTags);
        setSelectedTags(currentSurvey.selectedTags);
        
        // If Tom Select is already initialized, update its value
        if (activeStep === 'tags' && tomSelectInstance.current) {
          setTimeout(() => {
            if (tomSelectInstance.current) {
              tomSelectInstance.current.setValue(currentSurvey.selectedTags);
              console.log('Set saved tags in Tom Select');
            }
          }, 100);
        }
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
  
  // Effect to handle changes in availableTags (when tags are activated/deactivated)
  useEffect(() => {
    if (tomSelectInstance.current && activeStep === 'tags') {
      // Get currently active tag IDs
      const activeTagIds = availableTags.filter(tag => tag.active).map(tag => tag._id);
      
      // Update the selected tags to remove any that are now inactive
      const updatedSelectedTags = selectedTags.filter(tagId => activeTagIds.includes(tagId));
      
      // Update state if needed
      if (updatedSelectedTags.length !== selectedTags.length) {
        setSelectedTags(updatedSelectedTags);
      }
      
      // Refresh the options in Tom Select
      tomSelectInstance.current.clear();
      tomSelectInstance.current.clearOptions();
      
      // Add only active tags
      availableTags.forEach(tag => {
        if (tag.active) {
          tomSelectInstance.current.addOption({
            value: tag._id,
            text: tag.name
          });
        }
      });
      
      // Set the filtered values
      tomSelectInstance.current.setValue(updatedSelectedTags, true);
    }
  }, [availableTags]);
  
  // Initialize Tom Select when Tags tab is active
  useEffect(() => {
    // Only initialize when the Tags tab is active and we have a valid reference
    if (activeStep === 'tags' && tagSelectRef.current && availableTags.length > 0) {
      // Skip initialization if Tom Select is already initialized with the same tags
      if (tomSelectInstance.current) {
        // Only update the values if they've changed
        const currentValues = tomSelectInstance.current.getValue();
        const currentValuesStr = currentValues.sort().join(',');
        const newValuesStr = [...selectedTags].sort().join(',');
        
        if (currentValuesStr !== newValuesStr) {
          console.log('Updating tag values without reinitializing');
          tomSelectInstance.current.setValue(selectedTags, true);
        }
        return;
      }
      
      console.log('Initializing Tom Select');
      
      // Create a configuration that allows multiple selection with proper remove button
      const config: any = {
        plugins: ['remove_button'],
        placeholder: 'Select tags...',
        create: false,
        maxItems: null, // Allow multiple selections
        sortField: { field: 'text', direction: 'asc' },
        // Remove dropdownParent to fix the insertBefore Node error
        // The dropdown will be appended to the select element's parent by default
        onChange: function(values: string[]) {
          // Only update state if values actually changed
          const currentValuesStr = values.sort().join(',');
          const existingValuesStr = [...selectedTags].sort().join(',');
          
          if (currentValuesStr !== existingValuesStr) {
            console.log('Tags changed:', values);
            setSelectedTags(values);
          }
        }
      };
      
      // Initialize Tom Select with options
      const ts = new TomSelect(tagSelectRef.current, config);
      tomSelectInstance.current = ts;
      
      // Clear any existing options and add the available tags
      ts.clearOptions();
      availableTags.forEach(tag => {
        // Only add active tags as selectable options
        if (tag.active) {
          ts.addOption({
            value: tag._id,
            text: tag.name
          });
        }
      });
      
      // Set initial values if any, but filter out any tags that might be inactive
      if (selectedTags.length > 0) {
        console.log('Setting initial tag values:', selectedTags);
        // Filter selectedTags to only include those that are active
        const activeTagIds = availableTags.filter(tag => tag.active).map(tag => tag._id);
        const activeSelectedTags = selectedTags.filter(tagId => activeTagIds.includes(tagId));
        
        // Update the selectedTags state if any inactive tags were removed
        if (activeSelectedTags.length !== selectedTags.length) {
          setSelectedTags(activeSelectedTags);
        }
        
        ts.setValue(activeSelectedTags, true); // Silent update
      }
      
      // Clean up Tom Select instance when component unmounts
      return () => {
        if (tomSelectInstance.current) {
          tomSelectInstance.current.destroy();
          tomSelectInstance.current = null;
        }
      };
    }
  }, [activeStep, availableTags]);
  
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
        setIsPublished(true);
        
        // Show success message
        showSuccessAlert('Survey published successfully!');
      } catch (tokenError: any) {
        // Fallback to shareToken if token generation fails
        if (updatedSurvey.shareToken) {
          const baseUrl = window.location.origin;
          const publicSurveyUrl = `${baseUrl}/public/${updatedSurvey.shareToken}`;
          
          setPublicUrl(publicSurveyUrl);
          setIsPublished(true);
          
          showSuccessAlert('Survey published successfully!');
        } else {
          showErrorAlert('Failed to generate secure token for the survey.');
        }
      }
    } catch (error: any) {
      showErrorAlert(`Error generating public URL: ${error.message}`);
    }
  };
  
  // Theme filtering and pagination
  const getFilteredAndPaginatedThemes = () => {
    // Filter themes based on search query
    const filteredThemes = surveyThemes.filter((theme: any) => {
      if (!themeSearchQuery) return true;
      
      const searchLower = themeSearchQuery.toLowerCase();
      return (
        (theme.name && theme.name.toLowerCase().includes(searchLower)) ||
        (theme.description && theme.description.toLowerCase().includes(searchLower))
      );
    });
    
    // Calculate pagination
    const indexOfLastTheme = currentThemePage * themesPerPage;
    const indexOfFirstTheme = indexOfLastTheme - themesPerPage;
    const paginatedThemes = filteredThemes.slice(indexOfFirstTheme, indexOfLastTheme);
    
    return {
      filteredThemes,
      paginatedThemes,
      totalPages: Math.ceil(filteredThemes.length / themesPerPage)
    };
  };
  
  // Handle theme page change
  const handleThemePageChange = (pageNumber: number) => {
    setCurrentThemePage(pageNumber);
  };
  
  // Theme preview functions
  const handlePreview = (theme: any) => {
    setPreviewTheme(theme);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewTheme(null);
  };

  // Theme preview component
  const ThemePreview = ({ theme }: { theme: any }) => {
    if (!theme) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: theme.backgroundColor || '#ffffff',
          borderRadius: 12,
          padding: 20,
          width: '80%',
          maxWidth: 800,
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          <button 
            onClick={closePreview}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #d1d5db',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: 20,
              cursor: 'pointer',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            ×
          </button>
          
          <div style={{
            backgroundColor: theme.primaryColor || theme.color || '#552a47',
            padding: '20px',
            borderRadius: '8px 8px 0 0',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#fff',
              margin: 0,
              fontFamily: theme.headingFont || 'Inter, sans-serif'
            }}>
              {theme.name} Theme Preview
            </h2>
          </div>
          
          <div style={{
            fontFamily: theme.bodyFont || 'Inter, sans-serif',
            color: theme.textColor || '#333'
          }}>
            <h3 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Sample Heading</h3>
            <p>This is how text will appear in your survey. The body font is {theme.bodyFont || 'default'} and the heading font is {theme.headingFont || 'default'}.</p>
            
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Sample Question</h4>
              <div style={{
                backgroundColor: '#f9f9f9',
                border: `1px solid ${theme.secondaryColor || '#ddd'}`,
                padding: 15,
                borderRadius: 8,
                marginBottom: 15
              }}>
                <p>How would you rate your experience?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button key={num} style={{
                      backgroundColor: num === 3 ? theme.secondaryColor || '#f0e6ff' : 'transparent',
                      color: num === 3 ? theme.primaryColor || '#552a47' : theme.textColor || '#333',
                      border: `1px solid ${theme.secondaryColor || '#ddd'}`,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
              <button style={{
                backgroundColor: 'transparent',
                color: theme.secondaryColor || '#552a47',
                border: `1px solid ${theme.secondaryColor || '#552a47'}`,
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: theme.bodyFont || 'Inter, sans-serif'
              }}>
                Previous
              </button>
              
              <button style={{
                backgroundColor: theme.primaryColor || theme.color || '#552a47',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: theme.bodyFont || 'Inter, sans-serif'
              }}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle saving the survey
  const handleSaveSurvey = async () => {
    try {
      setSaving(true);
      
      // Prepare survey data for saving
      // Log the current state of survey questions before saving
      console.log('Saving survey with questions:', surveyQuestions);
      
      // Find the complete theme object based on selectedTheme ID
      const selectedThemeObject = surveyThemes.find((theme: any) => theme._id === selectedTheme);
      console.log('[EnhancedSurveyBuilder] Selected theme object:', selectedThemeObject);
      
      // Prepare default settings with theme information
      const defaultSettings = {
        ...(survey?.defaultSettings || {}),
        // Store theme ID in themes array for backward compatibility
        themes: selectedTheme ? [selectedTheme] : [],
        // Store the complete theme object for direct access to attributes
        themeObject: selectedThemeObject ? {
          _id: selectedThemeObject._id,
          name: selectedThemeObject.name,
          primaryColor: selectedThemeObject.primaryColor || selectedThemeObject.color,
          secondaryColor: selectedThemeObject.secondaryColor,
          accentColor: selectedThemeObject.accentColor,
          backgroundColor: selectedThemeObject.backgroundColor || '#ffffff',
          textColor: selectedThemeObject.textColor || '#333333',
          headingFont: selectedThemeObject.headingFont || 'Inter, sans-serif',
          bodyFont: selectedThemeObject.bodyFont || 'Inter, sans-serif'
        } : null,
        // Also store themeId directly for easier access
        themeId: selectedTheme || 'default'
      };
      
      const surveyData = {
        ...survey,
        title: survey?.title || 'Untitled Survey',
        description: survey?.description || '',
        logo: survey?.logo || '',
        featuredImage: survey?.featuredImage || '',
        primaryColor: selectedThemeObject?.primaryColor || selectedThemeObject?.color || survey?.primaryColor || '#552a47',
        welcomeTitle: survey?.welcomeTitle || '',
        welcomeMessage: survey?.welcomeMessage || '',
        completionMessage: survey?.completionMessage || '',
        // Include the updated defaultSettings
        defaultSettings,
        // Use surveySections instead of sections to match the server-side property name
        surveySections: sections,
        sectionQuestions: surveyQuestions,
        // Include demographics, themes, categories, and tags
        selectedDemographics,
        selectedTheme,
        selectedCategories,
        selectedTags,
        updatedAt: new Date(),
      };
      
      console.log('Saving survey data with sections and questions:', {
        surveySections: sections,
        sectionQuestions: surveyQuestions
      });
      
      let savedSurveyId;
      
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
        {/* Theme preview modal */}
        {showPreview && previewTheme && <ThemePreview theme={previewTheme} />}
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
              {/* <p style={{ color: '#666' }}>
                {survey?.description || 'No description'}
              </p> */}
            </div>
            <div className="survey-builder-actions" style={{ 
              display: 'flex', 
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}>
              {/* Cancel Button */}
              <button 
                onClick={() => navigate('/admin/surveys')}
                className="action-button cancel-button"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #d1d1d1',
                  backgroundColor: '#f8f8f8',
                  color: '#333',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '100px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ebebeb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f8f8';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                Cancel
              </button>
              
              {/* Save Survey Button */}
              <button 
                onClick={handleSaveSurvey}
                disabled={saving}
                className="action-button save-button"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#552a47',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  minWidth: '140px',
                  boxShadow: '0 2px 4px rgba(85,42,71,0.3)'
                }}
                onMouseOver={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = '#6a3559';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(85,42,71,0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#552a47';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(85,42,71,0.3)';
                }}
              >
                <FiSave style={{ fontSize: '16px' }} /> {saving ? 'Saving...' : 'Save Survey'}
              </button>
              
              {/* Publish Button */}
              <button 
                onClick={handleGeneratePublicUrl}
                disabled={!survey?._id}
                className="action-button publish-button"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2ecc40',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: !survey?._id ? 'not-allowed' : 'pointer',
                  opacity: !survey?._id ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  minWidth: '100px',
                  boxShadow: '0 2px 4px rgba(46,204,64,0.3)'
                }}
                onMouseOver={(e) => {
                  if (survey?._id) {
                    e.currentTarget.style.backgroundColor = '#27ae60';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(46,204,64,0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#2ecc40';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(46,204,64,0.3)';
                }}
              >
                {isPublished ? 'Published' : 'Publish'}
              </button>
              
              {/* Copy URL Button - Only shows when publicUrl is available */}
              {publicUrl && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    showSuccessAlert('URL copied to clipboard!');
                  }}
                  className="action-button copy-url-button"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '2px solid #2ecc40',
                    backgroundColor: '#fff',
                    color: '#2ecc40',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '100px',
                    boxShadow: '0 2px 4px rgba(46,204,64,0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fff0';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(46,204,64,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(46,204,64,0.1)';
                  }}
                >
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
              )}
            </div>
            
            {/* Add responsive styles */}
            <style jsx>{`
              @media (max-width: 768px) {
                .survey-builder-actions {
                  flex-direction: column;
                  width: 100%;
                }
                .action-button {
                  width: 100%;
                  margin-bottom: 8px;
                }
              }
              
              @media (max-width: 480px) {
                .action-button {
                  font-size: 14px !important;
                  padding: 8px 16px !important;
                }
              }
            `}</style>
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
              
              {/* Questions tab has been removed */}
              
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
                          value={survey?.color || '#552a47'}
                          onChange={(e) => setSurvey({...survey, color: e.target.value})}
                          style={{ width: '50px', height: '40px', padding: '0' }}
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={survey?.color || '#552a47'}
                          onChange={(e) => setSurvey({...survey, color: e.target.value})}
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
                    
                    {/* Theme search input */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        background: '#f9f9f9'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="Search themes..."
                          value={themeSearchQuery}
                          onChange={(e) => {
                            setThemeSearchQuery(e.target.value);
                            setCurrentThemePage(1); // Reset to first page when searching
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '100%',
                            fontSize: 14
                          }}
                        />
                        {themeSearchQuery && (
                          <button
                            onClick={() => {
                              setThemeSearchQuery('');
                              setCurrentThemePage(1);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#666',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Filtered themes count */}
                    {getFilteredAndPaginatedThemes().filteredThemes.length > 0 ? (
                      <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
                        Showing {getFilteredAndPaginatedThemes().paginatedThemes.length} of {getFilteredAndPaginatedThemes().filteredThemes.length} themes
                      </div>
                    ) : (
                      <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
                        No themes match your search
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {getFilteredAndPaginatedThemes().paginatedThemes.map((theme: any) => {
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
                              justifyContent: 'space-between',
                              marginTop: 8
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
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreview(theme);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4,
                                    padding: '4px 8px',
                                    fontSize: 12,
                                    color: theme.color || '#552a47',
                                    background: 'transparent',
                                    border: `1px solid ${theme.color || '#552a47'}`,
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <FaEye size={12} /> Preview
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination controls */}
                    {getFilteredAndPaginatedThemes().totalPages > 1 && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        marginTop: 24,
                        gap: 8
                      }}>
                        {/* Previous page button */}
                        <button
                          onClick={() => handleThemePageChange(currentThemePage - 1)}
                          disabled={currentThemePage === 1}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: '1px solid #e5d6c7',
                            backgroundColor: currentThemePage === 1 ? '#f5f5f4' : '#fff',
                            color: currentThemePage === 1 ? '#a8a29e' : '#28211e',
                            cursor: currentThemePage === 1 ? 'not-allowed' : 'pointer',
                            fontSize: 14
                          }}
                        >
                          Previous
                        </button>
                        
                        {/* Page numbers with ellipsis */}
                        {Array.from({ length: getFilteredAndPaginatedThemes().totalPages }, (_, i) => i + 1)
                          .filter(pageNum => {
                            // Show current page, first and last pages, and pages around current page
                            return pageNum === 1 || 
                                  pageNum === getFilteredAndPaginatedThemes().totalPages || 
                                  (pageNum >= currentThemePage - 1 && pageNum <= currentThemePage + 1);
                          })
                          .map((pageNum, index, array) => {
                            // Add ellipsis if there are gaps
                            const showEllipsisBefore = index > 0 && pageNum > array[index - 1] + 1;
                            const showEllipsisAfter = index < array.length - 1 && pageNum < array[index + 1] - 1;
                            
                            return (
                              <React.Fragment key={pageNum}>
                                {showEllipsisBefore && (
                                  <span style={{ margin: '0 4px', color: '#a8a29e' }}>...</span>
                                )}
                                
                                <button
                                  onClick={() => handleThemePageChange(pageNum)}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: '1px solid #e5d6c7',
                                    backgroundColor: currentThemePage === pageNum ? '#552a47' : '#fff',
                                    color: currentThemePage === pageNum ? '#fff' : '#28211e',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: currentThemePage === pageNum ? 600 : 400
                                  }}
                                >
                                  {pageNum}
                                </button>
                                
                                {showEllipsisAfter && (
                                  <span style={{ margin: '0 4px', color: '#a8a29e' }}>...</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        
                        {/* Next page button */}
                        <button
                          onClick={() => handleThemePageChange(currentThemePage + 1)}
                          disabled={currentThemePage === getFilteredAndPaginatedThemes().totalPages}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: '1px solid #e5d6c7',
                            backgroundColor: currentThemePage === getFilteredAndPaginatedThemes().totalPages ? '#f5f5f4' : '#fff',
                            color: currentThemePage === getFilteredAndPaginatedThemes().totalPages ? '#a8a29e' : '#28211e',
                            cursor: currentThemePage === getFilteredAndPaginatedThemes().totalPages ? 'not-allowed' : 'pointer',
                            fontSize: 14
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeStep === 'tags' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">
                      {steps.find(step => step.id === activeStep)?.label}
                    </h2>
                  </div>
                  
                  <div style={{ padding: 20 }}>
                    <p style={{ marginBottom: 16, fontSize: 18 }}>
                      Select tags for your survey. Tags help categorize and filter your survey content.
                    </p>
                    
                    <div style={{ marginBottom: 20 }}>
                      <label htmlFor="survey-tags" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                        Survey Tags
                      </label>
                      <div className="tom-select-container" style={{ 
                        marginBottom: 16,
                        maxWidth: '600px',
                        position: 'relative',
                        zIndex: 1000,
                        overflow: 'visible'
                      }}>
                      {/* Add a style tag to ensure the dropdown menu is visible */}
                      <style>
                        {`
                          .ts-dropdown { 
                            z-index: 1001 !important; 
                            max-height: 300px !important;
                            overflow-y: auto !important;
                            position: absolute !important;
                          }
                          .survey-builder-panel { overflow: visible !important; }
                          .survey-builder-content { overflow: visible !important; }
                        `}
                      </style>
                        <select 
                          id="survey-tags"
                          multiple 
                          ref={tagSelectRef} 
                          style={{ width: '100%' }}
                        >
                          {availableTags.map((tag) => (
                            <option key={tag._id} value={tag._id}>{tag.name}</option>
                          ))}
                          {availableTags.length === 0 && (
                            <option value="" disabled>Loading tags...</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeStep === 'settings' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">Settings</h2>
                  </div>
                  
                  <div style={{ padding: 20 }}>
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#552a47', marginBottom: 16 }}>Response Settings</h3>
                      
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={survey?.defaultSettings?.allowRetake !== false}
                            onChange={() => {
                              // Ensure defaultSettings exists
                              const defaultSettings = survey.defaultSettings || {};
                              const currentValue = defaultSettings.allowRetake !== false;
                              const updatedSurvey = {
                                ...survey,
                                defaultSettings: {
                                  ...defaultSettings,
                                  allowRetake: !currentValue
                                }
                              };
                              setSurvey(updatedSurvey);
                            }}
                          />
                          Allow Survey Retake
                        </label>
                        <div style={{ marginLeft: 24, fontSize: 14, color: '#666', marginTop: 4 }}>
                          When enabled, users can restart the survey after completion
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeStep !== 'sections' && activeStep !== 'settings' && activeStep !== 'questions' && activeStep !== 'welcome' && (
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

        {/* Public URL Modal removed - now using inline Copy URL button */}
        
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
        
        {/* Theme preview modal */}
        {showPreview && previewTheme && <ThemePreview theme={previewTheme} />}
      </DashboardBg>
    </AdminLayout>
  );
};

export default EnhancedSurveyBuilder;
