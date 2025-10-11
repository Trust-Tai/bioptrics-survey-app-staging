import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useUrlChangeEffect } from '../../../hooks/useUrlChangeEffect';

// Default consent text for new surveys
const defaultConsentText = `
<p>Thank you for participating in this survey. Your participation is voluntary and you may withdraw at any time.</p>
<p><strong>Purpose:</strong> This survey is designed to gather feedback to improve our services and workplace environment.</p>
{{ ... }}
<p><strong>Data Collection:</strong> We will collect your responses to the survey questions. If this survey is anonymous, no personally identifiable information will be linked to your responses.</p>
<p><strong>Data Use:</strong> Your responses will be analyzed in aggregate to identify trends and areas for improvement. Individual responses will only be viewed by authorized research personnel.</p>
<p><strong>Confidentiality:</strong> Your responses will be kept confidential and will only be reported in aggregate form where individual responses cannot be identified.</p>
<p><strong>Contact:</strong> If you have questions about this survey or your rights as a participant, please contact our research team.</p>
`;
import styled from 'styled-components';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { FaEye } from 'react-icons/fa';
// Router imports already added above
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FiUser, FiCalendar, FiMessageSquare, FiDownload, FiBarChart2, FiSettings, FiPlus, FiX, FiCheck, FiTrash2, FiEdit, FiEdit2, FiChevronRight, FiChevronDown, FiChevronUp, FiSave, FiMove, FiUserPlus, FiUsers } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import '../../../ui/styles/quill-styles';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import DashboardBg from '../../../ui/admin/DashboardBg';
import { Layers, Layer } from '../../../api/layers';
import { FaUsers, FaTags, FaChartPie, FaHeart, FaClock, FaPercentage, FaCopy } from 'react-icons/fa';

// Import our new components
import EnhancedSurveySection from './sections/EnhancedSurveySection';
import QuestionSelector from './sections/QuestionSelector';
import SurveyQuestionsTab from './SurveyQuestionsTab';
import QuestionBuilderSidePanel from '../../../features/questions/components/admin/QuestionBuilderSidePanel';
import { useQuestionBuilderPanel } from '../../../features/questions/contexts/QuestionBuilderPanelContext';
import SectionEditor from './sections/SectionEditor';
import ResponsesTab from './ResponsesTab';
import { SurveyAnalytics } from '/imports/features/analytics/components/admin';
import SurveyAnalyticsTab from './analytics/SurveyAnalyticsTab';

import { SettingsTab } from './builder/tabs/SettingsTab/SettingsTab';
import AppearanceTab from './builder/tabs/AppearanceTab/AppearanceTab';
import BasicSurveyWelcomeSection from './builder/tabs/BasicSurveyWelcomeSection';
import SectionsTab from './builder/tabs/SectionsTab';
import AnalyticsTab from "./builder/tabs/AnalyticsTab"
import CollaborationTab from './builder/tabs/CollaborationTab/CollaborationTab';

// Import existing components we'll reuse
import SurveyBranchingLogic from '../../../ui/admin/SurveyBranchingLogic';
import SurveyNotifications from '../../../ui/admin/SurveyNotifications';
import SurveySharing from '../../../ui/admin/SurveySharing';

// Import collections
import { Questions } from '../../../features/questions/api/questions';
import { SurveyThemes } from '../../../features/survey-themes/api/surveyThemes';
import { WPSCategories } from '../../../features/wps-framework/api/wpsCategories';
import { Surveys } from '../../../features/surveys/api/surveys';
import { SurveyResponses } from '../../../features/surveys/api/surveyResponses';
import { IncompleteSurveyResponses } from '../../../features/surveys/api/incompleteSurveyResponses';

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

import SurveyHeaderSection from './builder/tabs/SurveyHeaderSection';
import ThemeCreationModal from './ThemeCreationModal';
import ThemePreview from './ThemePreview';
import Toast from './Toast';


// Define the steps for the survey builder
const steps = [
  { id: 'welcome', label: 'Survey Basics', icon: 'FiHome' },
  { id: 'questions', label: 'Questions', icon: 'FiHelpCircle' },
  // { id: 'sections', label: 'Questions', icon: 'FiLayers' },
  // { id: 'tags', label: 'Tags', icon: 'FiTag' },
  // { id: 'demographics', label: 'Demographics', icon: 'FiUsers' },
  { id: 'appearance', label: 'Appearance', icon: 'FiTag' },
  { id: 'responses', label: 'Responses', icon: 'FiMessageSquare' },
  { id: 'analytics', label: 'Analytics', icon: 'FiPieChart' },
  // { id: 'branching', label: 'Branching Logic', icon: 'FiGitBranch' },
  // { id: 'completion', label: 'Completion', icon: 'FiCheckCircle' },
  // { id: 'preview', label: 'Preview', icon: 'FiEye' },
  // { id: 'publish', label: 'Publish', icon: 'FiSend' },
  { id: 'collaboration', label: 'Collaboration', icon: 'FiUsers' },
  { id: 'settings', label: 'Settings', icon: 'FiSettings' },
  // { id: 'notifications', label: 'Notifications', icon: 'FiBell' },
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
// Helper function to calculate total questions in a survey
const getTotalQuestionCount = (survey: any): number => {
  if (!survey) return 1; // Default to 1 to avoid division by zero
  
  // If survey has sections, count questions across all sections
  if (survey.sections && Array.isArray(survey.sections)) {
    return survey.sections.reduce((total: number, section: any) => {
      return total + (section.questions?.length || 0);
    }, 0) || 1; // Default to 1 if no questions found
  }
  
  // If survey has questions directly (not in sections)
  if (survey.questions && Array.isArray(survey.questions)) {
    return survey.questions.length || 1;
  }
  
  return 1; // Default fallback
};

// Helper function to calculate progress percentage
const calculateProgress = (responses: any[], survey: any): number => {
  if (!responses || !Array.isArray(responses) || responses.length === 0) return 0;
  
  const totalQuestions = getTotalQuestionCount(survey);
  if (totalQuestions === 0) return 0;
  
  // For incomplete responses, we count the number of answered questions
  // Check if the answer/answers is not undefined, null, empty string, or empty array
  const answeredQuestions = responses.filter(response => {
    if (!response) return false;
    
    // Check for single answer field
    if (response.answer !== undefined && response.answer !== null) {
      // If it's a string, make sure it's not empty
      if (typeof response.answer === 'string') {
        return response.answer.trim() !== '';
      }
      return true; // Non-string answers are considered valid
    }
    
    // Check for multiple answers field
    if (Array.isArray(response.answers)) {
      // Make sure the array is not empty and contains valid values
      return response.answers.length > 0 && 
             response.answers.some((ans: any) => ans !== null && ans !== undefined && ans !== '');
    }
    
    return false; // No valid answer found
  }).length;
  
  return Math.min(Math.round((answeredQuestions / totalQuestions) * 100), 100);
};

// Helper function to find question details from survey data
const getQuestionDetails = (questionId: string, sectionId: string | undefined, surveyData: any) => {
  if (!surveyData) return { questionText: "Unknown Question", sectionName: "" };
  
  let questionText = "Unknown Question";
  let sectionName = "";
  
  // Approach 1: Check direct questions array
  if (surveyData.questions && Array.isArray(surveyData.questions)) {
    const question = surveyData.questions.find((q: any) => q._id === questionId);
    if (question) {
      questionText = question.text || question.title || "Unknown Question";
      return { questionText, sectionName };
    }
  }
  
  // Approach 2: Check sections with questions
  if (surveyData.sections && Array.isArray(surveyData.sections)) {
    for (const section of surveyData.sections) {
      if (sectionId && section._id === sectionId) {
        sectionName = section.title || section.name || "";
      }
      
      if (section.questions && Array.isArray(section.questions)) {
        const question = section.questions.find((q: any) => q._id === questionId);
        if (question) {
          questionText = question.text || question.title || "Unknown Question";
          if (!sectionName && section.title) {
            sectionName = section.title || section.name || "";
          }
          return { questionText, sectionName };
        }
      }
    }
  }
  
  // Approach 3: Check selectedQuestions object
  if (surveyData.selectedQuestions && typeof surveyData.selectedQuestions === 'object') {
    if (surveyData.selectedQuestions[questionId]) {
      const question = surveyData.selectedQuestions[questionId];
      questionText = question.text || question.title || "Unknown Question";
      return { questionText, sectionName };
    }
  }
  
  // Approach 4: Deep recursive search as last resort
  const findQuestionRecursive = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return null;
    
    // Check if current object is the question we're looking for
    if (obj._id === questionId) {
      return obj;
    }
    
    // Search in arrays
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = findQuestionRecursive(item);
        if (result) return result;
      }
    } else {
      // Search in object properties
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const result = findQuestionRecursive(obj[key]);
          if (result) return result;
        }
      }
    }
    
    return null;
  };
  
  const foundQuestion = findQuestionRecursive(surveyData);
  if (foundQuestion) {
    questionText = foundQuestion.text || foundQuestion.title || "Unknown Question";
  }
  
  return { questionText, sectionName };
};

// Styled components for response details
const ResponseDetailsContainer = styled.div`
  padding: 16px;
  background-color: #f9fafb;
  border-top: 1px solid #e2e8f0;
  margin-top: -1px;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const QuestionItem = styled.div`
  margin-bottom: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
`;

const SectionName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  padding: 8px 16px 0;
  background-color: #f1f5f9;
  flex-shrink: 0;
`;

const QuestionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin: 0;
  padding: 12px 16px;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
`;

const AnswerText = styled.div`
  font-size: 14px;
  color: #334155;
  background-color: #ffffff;
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  flex-grow: 1;
  overflow-wrap: break-word;
  line-height: 1.5;
`;

const ResponseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 16px;
  margin-bottom: 8px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }
`;

  // Styled components for response stats
  const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
    width: 100%;
  `;

  const StatCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
`;

const IconContainer = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: ${props => props.color + '15'};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 16px;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.div`
  color: #666;
  margin-top: 4px;
`;

interface EnhancedSurveyBuilderProps {
  surveyId?: string;
  showAnalytics?: boolean;
}

const EnhancedSurveyBuilder: React.FC<EnhancedSurveyBuilderProps> = ({ surveyId: propSurveyId, showAnalytics }): React.ReactNode => {
  const navigate = useNavigate();
  const { surveyId: paramSurveyId } = useParams<{ surveyId: string }>();
  const location = useLocation();
  
  // Get tab parameter from URL
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  // Use the prop if provided, otherwise fall back to the URL parameter
  const surveyId = propSurveyId || paramSurveyId;
  
  // Set up initial subscription to questions.all with the current surveyId
  // This ensures we get both global questions and survey-specific questions for this survey
  useEffect(() => {
    if (surveyId) {
      const subscription = Meteor.subscribe('questions.all', surveyId);
      
      return () => {
        if (subscription) {
          subscription.stop();
        }
      };
    }
  }, [surveyId]);
  
  // State for the survey builder
  const [expandedResponseIds, setExpandedResponseIds] = useState<string[]>([]);
  const [surveyData, setSurveyData] = useState<any>(null);
  // Set initial activeStep based on URL tab parameter or showAnalytics prop
  const [activeStep, setActiveStep] = useState(() => {
    if (tabParam && ['welcome', 'questions', 'sections', 'branching', 'appearance', 'responses', 'analytics', 'tags'].includes(tabParam)) {
      return tabParam;
    } else if (showAnalytics) {
      return 'analytics';
    } else {
      return 'welcome';
    }
  });
  // State for question editing
  const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionSectionId, setEditingQuestionSectionId] = useState<string | null>(null);
  // State for drag and drop sections and questions
  const [draggingSectionIndex, setDraggingSectionIndex] = useState<number | null>(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState<number | null>(null);
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [draggingQuestionSectionId, setDraggingQuestionSectionId] = useState<string | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [dragOverNoSection, setDragOverNoSection] = useState<boolean>(false);
  const [isLoadingResponses, setIsLoadingResponses] = useState<boolean>(false);
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [responseStats, setResponseStats] = useState<any>({
    totalResponses: 0,
    totalTags: 0,
    completionRate: 0,
    avgEngagement: 0,
    timeToComplete: 0,
    responseRate: 0
  });
  const [survey, setSurvey] = useState<any>({ defaultSettings: { allowRetake: true } });
  const [thankYouMessage, setThankYouMessage] = useState<string>('');
  const [thankYouTitle, setThankYouTitle] = useState<string>('Thank You!');
  const [thankYouDetails, setThankYouDetails] = useState<string>('Your responses have been successfully submitted. We appreciate your time and feedback.');
  const [thankYouIcon, setThankYouIcon] = useState<string>('');
  const [showThankYouPreview, setShowThankYouPreview] = useState<boolean>(false);
  const [thankYouBoxes, setThankYouBoxes] = useState<Array<{
    title: string;
    subtitle: string;
    icon: string;
    selected: boolean;
  }>>([{
    title: 'Total Responses',
    subtitle: 'Total number of questions answered',
    icon: 'clipboard-check',
    selected: true
  }, {
    title: 'Unanswered Questions',
    subtitle: 'Number of skipped or empty answers',
    icon: 'question-circle',
    selected: true
  }, {
    title: 'Completion',
    subtitle: 'Text showing that the survey was completed',
    icon: 'check-circle',
    selected: true
  }, {
    title: 'Time Taken',
    subtitle: 'How long the user took to complete the survey',
    icon: 'clock',
    selected: true
  }]);
  
  // Consent Screen state variables
  const [consentTitle, setConsentTitle] = useState<string>(survey?.consentScreen?.title || 'Informed Consent');
  const [consentText, setConsentText] = useState<string>(survey?.consentScreen?.consentText || defaultConsentText);
  const [privacyNoticeUrl, setPrivacyNoticeUrl] = useState<string>(survey?.consentScreen?.privacyNoticeUrl || '#');
  const [privacyLinkText, setPrivacyLinkText] = useState<string>(
    survey?.consentScreen?.privacyLinkText || 'Privacy Notice'
  );
  const [privacyInfoText, setPrivacyInfoText] = useState<string>(
    survey?.consentScreen?.privacyInfoText || 'For more information, please see our'
  );
  const [continueButtonText, setContinueButtonText] = useState<string>(
    survey?.consentScreen?.continueButtonText || 'Continue to Survey'
  );
  const [checkboxText, setCheckboxText] = useState<string>(
    survey?.consentScreen?.checkboxText || 
    'I have read and understand the above information and consent to participate in this survey'
  );
  const [showAnonymityNotice, setShowAnonymityNotice] = useState<boolean>(
    survey?.consentScreen?.showAnonymityNotice !== undefined ? 
    survey?.consentScreen?.showAnonymityNotice : true
  );
  const [anonymityNoticeText, setAnonymityNoticeText] = useState<string>(
    survey?.consentScreen?.anonymityNoticeText || 
    'This survey is anonymous. Your responses cannot be linked back to you personally.'
  );
  // Control whether to show the consent screen at all
  const [showConsentScreen, setShowConsentScreen] = useState<boolean>(
    survey?.consentScreen?.showConsentScreen !== undefined ? 
    survey?.consentScreen?.showConsentScreen : true
  );
  // Likert emoji display setting
  const [showLikertEmojis, setShowLikertEmojis] = useState<boolean>(
    survey?.showLikertEmojis !== undefined ? survey?.showLikertEmojis : true
  );
  const [sections, setSections] = useState<SurveySectionItem[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  const [surveyOrder, setSurveyOrder] = useState<any[]>([]);
  
  
  // Always default to the welcome tab (Survey Basics) for new surveys
  useEffect(() => {
    if (!surveyId) {
      setActiveStep('welcome');
    }
  }, [surveyId]);
  // Update showLikertEmojis state when survey data changes
useEffect(() => {
  if (survey?.showLikertEmojis !== undefined) {
    console.log('Updating showLikertEmojis from survey:', survey.showLikertEmojis);
    setShowLikertEmojis(survey.showLikertEmojis);
  }
}, [survey?.showLikertEmojis]);
  // Set activeStep based on URL tab parameter or showAnalytics prop
  useEffect(() => {
    if (tabParam && ['welcome', 'questions', 'sections', 'branching', 'appearance', 'responses', 'analytics', 'tags'].includes(tabParam)) {
      setActiveStep(tabParam);
    } else if (showAnalytics) {
      setActiveStep('analytics');
    }
  }, [tabParam, showAnalytics]);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [showRemoveLogoConfirm, setShowRemoveLogoConfirm] = useState(false);
  const [showRemoveFeaturedImageConfirm, setShowRemoveFeaturedImageConfirm] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [previewTheme, setPreviewTheme] = useState<any>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [themeSearchQuery, setThemeSearchQuery] = useState<string>('');
  const [currentThemePage, setCurrentThemePage] = useState<number>(1);
  const themesPerPage = 10; // Number of themes to display per page
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Layer[]>([]);
  const tagSelectRef = useRef<any>(null);
  
  // Theme modal state
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [newThemeName, setNewThemeName] = useState<string>('');
  const [newThemeColor, setNewThemeColor] = useState<string>('#552a47');
  const [newThemeSecondaryColor, setNewThemeSecondaryColor] = useState<string>('#8e44ad');
  const [newThemeAccentColor, setNewThemeAccentColor] = useState<string>('#9b59b6');
  const [newThemeDescription, setNewThemeDescription] = useState<string>('');
  const [newThemeWpsCategoryId, setNewThemeWpsCategoryId] = useState<string>('');
  const [newThemeAssignableTo, setNewThemeAssignableTo] = useState<string[]>(['questions', 'surveys']);
  const [newThemeKeywords, setNewThemeKeywords] = useState<string[]>([]);
  const [newThemePriority, setNewThemePriority] = useState<number>(0);
  // Active checkbox removed, but we'll keep the state as true by default
  const [newThemeIsActive, setNewThemeIsActive] = useState<boolean>(true);
  const [newThemeButtonStyle, setNewThemeButtonStyle] = useState<string>('rounded');
  const [newThemeQuestionStyle, setNewThemeQuestionStyle] = useState<string>('card');
  const [newThemeTemplateType, setNewThemeTemplateType] = useState<string>('Custom');
  const [newThemeHeadingFont, setNewThemeHeadingFont] = useState<string>('Inter');
  const [newThemeBodyFont, setNewThemeBodyFont] = useState<string>('Inter');
  const [newThemeHeaderStyle, setNewThemeHeaderStyle] = useState<string>('Solid');

  // Helper function to get total question count in a survey
  const getTotalQuestionCount = (survey: any): number => {
    if (!survey) return 0;
    
    let count = 0;
    
    // Count questions in sections
    if (survey.sections && Array.isArray(survey.sections)) {
      survey.sections.forEach((section: any) => {
        if (section.questions && Array.isArray(section.questions)) {
          count += section.questions.length;
        }
      });
    }
    
    // Count direct questions (non-sectioned surveys)
    if (survey.questions && Array.isArray(survey.questions)) {
      count += survey.questions.length;
    }
    
    return count;
  };
  
  // Calculate progress percentage
  const calculateProgress = (responses: any[], survey: any) => {
    if (!responses || !responses.length || !survey) return 0;
    
    const totalQuestions = getTotalQuestionCount(survey);
    if (totalQuestions === 0) return 0;
    
    const answeredQuestions = responses.length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };
  
  // Helper function to get question details
  const getQuestionDetails = (questionId: string, sectionId: string | undefined, surveyData: any) => {
    if (!surveyData) return { questionText: "Unknown Question", sectionName: "" };
    
    let questionText = "Unknown Question";
    let sectionName = "";
    
    // Try to find question in direct questions array
    if (surveyData.questions && Array.isArray(surveyData.questions)) {
      const question = surveyData.questions.find((q: any) => q._id === questionId);
      if (question) {
        questionText = question.text || question.title || "Unknown Question";
        return { questionText, sectionName };
      }
    }
    
    // Try to find question in sections
    if (surveyData.sections && Array.isArray(surveyData.sections)) {
      for (const section of surveyData.sections) {
        if (sectionId && section._id !== sectionId) continue;
        
        if (section.questions && Array.isArray(section.questions)) {
          const question = section.questions.find((q: any) => q._id === questionId);
          if (question) {
            questionText = question.text || question.title || "Unknown Question";
            sectionName = section.title || section.name || "";
            return { questionText, sectionName };
          }
        }
      }
    }
    
    // Try to find in selectedQuestions object
    if (surveyData.selectedQuestions && typeof surveyData.selectedQuestions === 'object') {
      for (const key in surveyData.selectedQuestions) {
        if (key === questionId) {
          const question = surveyData.selectedQuestions[key];
          questionText = question.text || question.title || "Unknown Question";
          return { questionText, sectionName };
        }
      }
    }
    
    // Deep search as a last resort
    const deepSearch = (obj: any, targetId: string): any => {
      if (!obj || typeof obj !== 'object') return null;
      
      if (obj._id === targetId) return obj;
      
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          for (const item of obj[key]) {
            const result = deepSearch(item, targetId);
            if (result) return result;
          }
        } else if (typeof obj[key] === 'object') {
          const result = deepSearch(obj[key], targetId);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    const foundQuestion = deepSearch(surveyData, questionId);
    if (foundQuestion) {
      questionText = foundQuestion.text || foundQuestion.title || "Unknown Question";
    }
    
    return { questionText, sectionName };
  };


  // Function to calculate engagement score based on response data

  // Function to calculate engagement score based on response data
  const calculateEngagementScore = (response: any): number => {
    // Default engagement score if no responses
    if (!response.responses || !Array.isArray(response.responses) || response.responses.length === 0) {
      return 0;
    }
    
    // Calculate engagement based on response completeness and time spent
    // For completed responses, we'll use a base score of 50
    // For each answer provided, add 5 points (up to a maximum of 100)
    const baseScore = response.isCompleted ? 50 : 25;
    const answerScore = Math.min(50, response.responses.length * 5);
    
    return baseScore + answerScore;
  };

  
  
  // Function to build hierarchical tag structure
  const buildTagHierarchy = (layers: Layer[]) => {
    const tagMap = new Map();
    const rootTags: any[] = [];
    
    // First pass: create tag objects and store in map
    layers.forEach(tag => {
      if (tag && tag._id) {
        tagMap.set(tag._id, { ...tag, children: [] });
      }
    });
    
    // Second pass: build parent-child relationships
    layers.forEach(tag => {
      if (tag.parentId && tagMap.has(tag.parentId)) {
        const parent = tagMap.get(tag.parentId);
        if (parent && parent.children) {
          parent.children.push(tagMap.get(tag._id));
        }
      } else {
        if (tag._id && tagMap.has(tag._id)) {
          rootTags.push(tagMap.get(tag._id));
        }
      }
    });
    
    // Sort tags alphabetically at each level
    const sortTags = (tags: any[]) => {
      tags.sort((a, b) => a.name.localeCompare(b.name));
      tags.forEach(tag => {
        if (tag.children && tag.children.length > 0) {
          sortTags(tag.children);
        }
      });
      return tags;
    };
    
    return sortTags(rootTags);
  };
  
  // Function to flatten hierarchical tags into a list with depth information
  const buildFlatTagList = (layers: Layer[]): any[] => {
    const sortedRootTags = buildTagHierarchy(layers);
    const flatList: any[] = [];
    
    // Function to flatten the hierarchical structure with depth information
    const flattenWithDepth = (tags: any[], depth = 0) => {
      tags.forEach(tag => {
        flatList.push({
          _id: tag._id,
          name: tag.name,
          depth: depth
        });

        if (tag.children && tag.children.length > 0) {
          flattenWithDepth(tag.children, depth + 1);
        }
      });
    };
    
    // Flatten the hierarchical tags
    flattenWithDepth(sortedRootTags);
    
    return flatList;
  };
  
  // Function to render nested tag options with proper indentation
  const renderNestedTagOptions = (layers: Layer[], selectedTagIds: string[] = []): React.ReactElement[] => {
    const sortedRootTags = buildTagHierarchy(layers);
    
    // Function to render options recursively with proper indentation
    const renderOptions = (tags: any[], depth = 0): React.ReactElement[] => {
      return tags.flatMap(tag => {
        // Create indentation based on depth
        const indent = '\u00A0\u00A0'.repeat(depth); // Non-breaking spaces for indentation
        const prefix = depth > 0 ? '└── ' : ''; // Box drawing characters with extra space for better visibility
        
        // Create the option for this tag
        const option = (
          <option 
            key={tag._id} 
            value={tag._id}
            className={`depth-${depth}`}
          >
            {indent}{prefix}{tag.name}
          </option>
        );
        
        // Recursively render children options
        if (tag.children && tag.children.length > 0) {
          return [option, ...renderOptions(tag.children, depth + 1)];
        }
        
        return option;
      });
    };
    
    // Start rendering from root tags
    return renderOptions(sortedRootTags);
  };
  
  // This function is no longer needed as we've moved the initialization to the useEffect
  const initializeTomSelect = () => {
    // Implementation moved to useEffect
  };
  
  // Toggle response details expansion
  const toggleResponseDetails = (responseId: string) => {
    setExpandedResponseIds(prev => 
      prev.includes(responseId) 
        ? prev.filter(id => id !== responseId)
        : [...prev, responseId]
    );
    
    // Fetch survey data for question lookup if not already loaded
    if (!surveyData && surveyId) {
      Meteor.call('getSurveyById', surveyId, (err: Meteor.Error, survey: any) => {
        if (err) {
          console.error('Error fetching survey data:', err);
          return;
        }
        setSurveyData(survey);
      });
    }
  };
  
  // Load survey responses and survey data when the responses tab is selected
  useEffect(() => {
    if (activeStep === 'responses' && surveyId) {
      setIsLoadingResponses(true);
      
      // Fetch survey responses
      Meteor.call('getSurveyResponses', surveyId, (error: Meteor.Error, result: any[]) => {
        setIsLoadingResponses(false);
        if (error) {
          console.error('Error fetching survey responses:', error);
          return;
        }
        setSurveyResponses(result || []);
        
        // Fetch survey data for question lookup
        Meteor.call('getSurveyById', surveyId, (err: Meteor.Error, survey: any) => {
          if (err) {
            console.error('Error fetching survey data:', err);
            return;
          }
          setSurveyData(survey);
        });
      });
    }
  }, [activeStep, surveyId]);

  // Load survey data when surveyId changes
  useEffect(() => {
    if (surveyId) {
      Meteor.call('surveys.getSurvey', surveyId, (error: any, result: any) => {
        if (error) {
          console.error('Error loading survey:', error);
        } else {
          setSurvey(result);
          // Use surveySections instead of sections to match the server-side property name
          setSections((result.surveySections as SurveySectionItem[]) || []);
          
          // Set surveyOrder state from the loaded survey data
          console.log('Loading surveyOrder from survey data:', result.surveyOrder);
          if (result.surveyOrder && Array.isArray(result.surveyOrder)) {
            setSurveyOrder(result.surveyOrder);
          } else {
            console.warn('No surveyOrder found in loaded survey data, initializing empty array');
            setSurveyOrder([]);
          }
        
          // Replace the missing Meteor method call with a subscription to the questions.bySurvey publication
          const questionsSub = Meteor.subscribe('questions.bySurvey', surveyId);
          if ((questionsSub as any).ready?.()) {
            const questionsFromDB = Questions.find({}, { sort: { createdAt: -1 } }).fetch();
            const mappedQuestions = questionsFromDB.map(question => {
              // Find the latest version of the question
              const latestVersion = question.versions.find(v => v.version === question.currentVersion) || question.versions[0];

              // Determine status - explicitly use 'published' or 'draft' to match the union type
              const status: 'published' | 'draft' = latestVersion?.isActive !== false ? 'published' : 'draft';
              
              return {
                id: question._id || '',
                _id: question._id,
                text: latestVersion?.questionText || '',
                type: latestVersion?.responseType || '',
                status,
                versions: question.versions,
                currentVersion: question.currentVersion,
                questionText: latestVersion?.questionText
              };
            });
            
            setSurveyQuestions(mappedQuestions);
          }
        }
      });
    }
  }, [surveyId]);



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
  
  // We're not using TomSelect for tags anymore, using standard HTML select with proper hierarchical display
  
  // State for modals
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<SurveySectionItem | undefined>(undefined);
  
  // State for public URL and published status
  const [publicUrl, setPublicUrl] = useState('');
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  // Removed showPublicUrl state as we no longer need the popup
  
  // Load survey responses when the responses tab is active
  useEffect(() => {
    if (activeStep === 'responses' && surveyId) {
      setIsLoadingResponses(true);
      
      // Create a combined subscription for both completed and incomplete responses
      const completedSubscription = Meteor.subscribe('surveyResponses.bySurvey', surveyId);
      const incompleteSubscription = Meteor.subscribe('incompleteSurveyResponses.all');
      
      // Check subscription status periodically
      const checkSubscription = setInterval(() => {
        // Only proceed when both subscriptions are ready
        if (completedSubscription.ready() && incompleteSubscription.ready()) {
          clearInterval(checkSubscription);
          
          try {
            // Fetch completed survey responses
            const completedResponses = SurveyResponses.find({ surveyId }).fetch();
            
            // Fetch incomplete responses for this survey
            const incompleteResponses = IncompleteSurveyResponses.find({ 
              surveyId,
              isCompleted: false
            }).fetch();
            
            // Format the responses for display
            const formattedResponses = [
              // Format completed responses
              ...completedResponses.map(response => ({
                _id: response._id,
                respondentName: response.demographics?.name || 
                               (response.userId ? 'User ' + response.userId.substring(0, 5) : 'Anonymous'),
                email: response.demographics?.email || 'No email provided',
                submittedAt: response.endTime || response.updatedAt,
                isComplete: true,
                progress: 100,
                responses: response.responses || [],
                timeToComplete: response.completionTime || 0,
                engagementScore: response.engagementScore || calculateEngagementScore({...response, isCompleted: true, responses: response.responses || []})
              })),
              
              // Format incomplete responses
              // ...incompleteResponses.map(response => ({
              //   _id: response._id,
              //   respondentName: 'Anonymous',
              //   email: 'No email provided',
              //   submittedAt: response.lastUpdatedAt,
              //   isComplete: false,
              //   progress: response.responses ? 
              //     Math.round((response.responses.length / (surveyQuestions.length || 1)) * 100) : 0,
              //   responses: response.responses || [],
              //   timeToComplete: 0,
              //   engagementScore: response.engagementScore || calculateEngagementScore({...response, isCompleted: false, responses: response.responses || []})
              // }))
            ];
            
            // Sort by date (newest first)
            formattedResponses.sort((a, b) => {
              const dateA = new Date(a.submittedAt).getTime();
              const dateB = new Date(b.submittedAt).getTime();
              return dateB - dateA;
            });
            
            // Calculate response stats
            const totalResponses = formattedResponses.length;
            
            // Use the selectedTags from the Tags tab for the Total Tags count
            const totalTags = selectedTags.length;
            
            // Calculate completion rate based on actual answered questions across all responses
            let totalQuestionsAcrossAllResponses = 0;
            let totalAnsweredQuestions = 0;
            
            // Get the total number of questions in the survey
            // Use a more robust method to count questions
            let totalQuestionsInSurvey = 0;
            
            // Count questions in sections
            if (survey.sections && Array.isArray(survey.sections)) {
              survey.sections.forEach((section: any) => {
                if (section.questions && Array.isArray(section.questions)) {
                  totalQuestionsInSurvey += section.questions.length;
                }
              });
            }
            
            // Count questions in surveySections
            if (survey.surveySections && Array.isArray(survey.surveySections)) {
              survey.surveySections.forEach((section: any) => {
                if (section.questions && Array.isArray(section.questions)) {
                  totalQuestionsInSurvey += section.questions.length;
                }
              });
            }
            
            // Count direct questions
            if (survey.questions && Array.isArray(survey.questions)) {
              totalQuestionsInSurvey += survey.questions.length;
            }
            
            // Count section questions
            if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
              // Group by sectionId to avoid double counting
              const uniqueQuestionIds = new Set();
              survey.sectionQuestions.forEach((q: any) => {
                uniqueQuestionIds.add(q.id || q._id);
              });
              totalQuestionsInSurvey = Math.max(totalQuestionsInSurvey, uniqueQuestionIds.size);
            }
            
            // Fallback to getTotalQuestionCount if we couldn't find any questions
            if (totalQuestionsInSurvey === 0) {
              totalQuestionsInSurvey = getTotalQuestionCount(survey);
            }
            
            // For each response, count how many questions were actually answered
            formattedResponses.forEach(response => {
              // Each response should have answered all questions in the survey
              totalQuestionsAcrossAllResponses += totalQuestionsInSurvey;
              
              // Count actually answered questions in this response
              if (response.responses && Array.isArray(response.responses)) {
                const answeredCount = response.responses.filter((r: any) => {
                  if (!r) return false;
                  
                  // Check for single answer field
                  if (r.answer !== undefined && r.answer !== null) {
                    // If it's a string, make sure it's not empty
                    if (typeof r.answer === 'string') {
                      return r.answer.trim() !== '';
                    }
                    return true; // Non-string answers are considered valid
                  }
                  
                  // Check for multiple answers field
                  if (Array.isArray(r.answers)) {
                    // Make sure the array is not empty and contains valid values
                    return r.answers.length > 0 && 
                           r.answers.some((ans: any) => ans !== null && ans !== undefined && ans !== '');
                  }
                  
                  return false; // No valid answer found
                }).length;
                
                totalAnsweredQuestions += answeredCount;
              }
            });
            
            
            
            // Calculate the actual completion rate based on answered questions
            const completionRate = totalQuestionsAcrossAllResponses > 0 ? 
              Math.round((totalAnsweredQuestions / totalQuestionsAcrossAllResponses) * 100) : 0;
              
            
            // Calculate average engagement
            const totalEngagement = formattedResponses.reduce((sum, r) => sum + (r.engagementScore || 0), 0);
            const avgEngagement = totalResponses > 0 ? Math.round(totalEngagement / totalResponses) : 0;
            
            // Calculate average time to complete (in seconds)
            const completedResponsesForStats = formattedResponses.filter(r => r.isComplete && r.timeToComplete > 0);
            const totalTime = completedResponsesForStats.reduce((sum, r) => sum + (r.timeToComplete || 0), 0);
            const avgTimeToComplete = completedResponsesForStats.length > 0 ? Math.round(totalTime / completedResponsesForStats.length) : 0;
            
            // Calculate response rate based on completed vs total responses
            // This aligns with the enhanced response rate calculation logic
            const totalInvited = survey.invitedCount || totalResponses;
            const responseRate = totalInvited > 0 ? Math.round((totalResponses / totalInvited) * 100) : 0;
            
            // Update response stats
            setResponseStats({
              totalResponses,
              totalTags,
              completionRate,
              avgEngagement,
              timeToComplete: avgTimeToComplete,
              responseRate
            });
            
            setSurveyResponses(formattedResponses);
            
            setIsLoadingResponses(false);
          } catch (error) {
            console.error('Error loading survey responses:', error);
            setIsLoadingResponses(false);
          }
        }
      }, 300);
      
      // Clean up the interval when component unmounts or step changes
      return () => {
        clearInterval(checkSubscription);
      };
    }
  }, [activeStep, surveyId]);

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
    
    const isLoading = !surveysSub.ready() || !themesSub.ready() || !categoriesSub.ready() || !(questionsSub as any).ready?.();
    
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
        currentSurvey.defaultSettings = { allowRetake: true, allowAnonymous: true };
      }
      setSurvey(currentSurvey);
      
      // Initialize sections if they exist in the survey
      if (currentSurvey.surveySections && Array.isArray(currentSurvey.surveySections)) {
        setSections(currentSurvey.surveySections as SurveySectionItem[]);
      } else if (currentSurvey.sections && Array.isArray(currentSurvey.sections)) {
        setSections(currentSurvey.sections as SurveySectionItem[]);
      }
      
      // Check if the survey is published by either published flag or having a shareToken
      if (currentSurvey.published || currentSurvey.shareToken) {
        setIsPublished(true);
        const loadPublicUrl = async () => {
          try {
            // Try to generate an encrypted token for the survey
            const encryptedToken = await Meteor.callAsync('surveys.generateEncryptedToken', currentSurvey._id);
            const baseUrl = window.location.origin;
            const publicSurveyUrl = `${baseUrl}/public/${encryptedToken}`;
            setPublicUrl(publicSurveyUrl);
          } catch (error) {
            console.error('Error generating encrypted token:', error);
            // Fallback to shareToken if available
            if (currentSurvey.shareToken) {
              const baseUrl = window.location.origin;
              const publicSurveyUrl = `${baseUrl}/public/${currentSurvey.shareToken}`;
              setPublicUrl(publicSurveyUrl);
            }
          }
        };
        
        loadPublicUrl();
      }
      
      // Initialize questions if they exist in the survey
      
      
      if (currentSurvey.sectionQuestions && Array.isArray(currentSurvey.sectionQuestions)) {
        // Make sure all required fields are present
        const validatedQuestions = currentSurvey.sectionQuestions.map((q: any) => {
          // Use questionId if available, fallback to id
          const questionId = q.questionId || q.id;
          // Find the full question document to get the proper text
          const fullQuestion = Questions.findOne(questionId);
          
          // Create a properly typed QuestionItem with all required fields
          const questionItem: QuestionItem = {
            id: questionId || '',
            text: fullQuestion ? getQuestionText(fullQuestion) : (q.text || 'Untitled Question'),
            type: q.type || 'text',
            status: q.status === 'draft' ? 'draft' : 'published',
            sectionId: q.sectionId,
            order: q.order
          };
          
          return questionItem;
        });
        setSurveyQuestions(validatedQuestions);
      }
      
      // Initialize thank you screen fields if they exist in the survey
      if (currentSurvey.thankYouMessage) {
        setThankYouMessage(currentSurvey.thankYouMessage);
      }
      
      if (currentSurvey.thankYouTitle) {
        setThankYouTitle(currentSurvey.thankYouTitle);
      }
      
      if (currentSurvey.thankYouDetails) {
        setThankYouDetails(currentSurvey.thankYouDetails);
      }
      
      if (currentSurvey.thankYouIcon) {
        setThankYouIcon(currentSurvey.thankYouIcon);
      }
      
      // Initialize consent screen fields if they exist in the survey
      if (currentSurvey.consentScreen) {
        if (currentSurvey.consentScreen.consentText) {
          setConsentText(currentSurvey.consentScreen.consentText);
        }
        
        if (currentSurvey.consentScreen.privacyNoticeUrl) {
          setPrivacyNoticeUrl(currentSurvey.consentScreen.privacyNoticeUrl);
        }
        
        if (currentSurvey.consentScreen.checkboxText) {
          setCheckboxText(currentSurvey.consentScreen.checkboxText);
        }
        if (currentSurvey.consentScreen.anonymityNoticeText) {
          setAnonymityNoticeText(currentSurvey.consentScreen.anonymityNoticeText);
        }
        
        if (currentSurvey.consentScreen.showAnonymityNotice !== undefined) {
          setShowAnonymityNotice(currentSurvey.consentScreen.showAnonymityNotice);
        }
        
        // Set showConsentScreen state if it exists in the survey
        if (currentSurvey.consentScreen.showConsentScreen !== undefined) {
          setShowConsentScreen(currentSurvey.consentScreen.showConsentScreen);
        }
      } else {
        // Ensure we have default boxes if none exist in the survey
        const defaultBoxes: { title: string; subtitle: string; icon: string; selected: boolean; }[] = [
          {
            title: 'Total Responses',
            subtitle: 'Total number of questions answered',
            icon: 'clipboard-check',
            selected: true
          }, {
            title: 'Unanswered Questions',
            subtitle: 'Number of skipped or empty answers',
            icon: 'question-circle',
            selected: true
          }, {
            title: 'Completion',
            subtitle: 'Text showing that the survey was completed',
            icon: 'check-circle',
            selected: true
          }, {
            title: 'Time Taken',
            subtitle: 'How long the user took to complete the survey',
            icon: 'clock',
            selected: true
          }
        ];
        setThankYouBoxes(defaultBoxes);
        
        // Update the survey state with default boxes
        setSurvey((prevSurvey: any) => {
          if (!prevSurvey) return prevSurvey;
          return {
            ...prevSurvey,
            thankYouBoxes: defaultBoxes
          };
        });
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
        setSelectedTags(currentSurvey.selectedTags);
      }
      
      // Initialize thankYouMessage if it exists in the survey
      if (currentSurvey.thankYouMessage) {
        setThankYouMessage(currentSurvey.thankYouMessage);
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
  
  // React Select option type
  interface SelectOption {
    value: string;
    label: string;
    depth?: number;
    isDisabled?: boolean;
  }
  
  // Function to prepare hierarchical options for React Select
  const prepareSelectOptions = (tags: Layer[]): SelectOption[] => {
    return buildFlatTagList(tags.filter(tag => tag.active)).map(tag => ({
      value: tag._id,
      label: tag.name,
      depth: tag.depth || 0,
      isDisabled: false
    }));
  };
  
  // Custom Option component to display hierarchical structure
  const CustomOption = (props: any) => {
    const { data } = props;
    const depth = data.depth || 0;
    const indent = '\u00A0\u00A0'.repeat(depth); // Non-breaking spaces for indentation
    const prefix = depth > 0 ? '└── ' : ''; // Box drawing characters for hierarchy
    
    // Special styling for the create option
    if (data.__isNew__) {
      return (
        <components.Option {...props}>
          <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', color: '#552a47', fontWeight: 'bold' }}>
            Create this tag: "{data.label}"
          </div>
        </components.Option>
      );
    }
    
    return (
      <components.Option {...props}>
        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
          {indent}{prefix}{data.label}
        </div>
      </components.Option>
    );
  };
  
  // Memoized select options - filter out already selected tags
  const selectOptions = React.useMemo(() => {
    // Filter out already selected tags from the available options
    const options = prepareSelectOptions(availableTags);
    // Return all options, filtering will be handled by hideSelectedOptions prop in CreatableSelect
    return options;
  }, [availableTags]);
  
 

  // No initialization needed for React Select as it's handled declaratively in the JSX
  
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
      
      // Update the survey status to active
      await Meteor.callAsync('surveys.updateStatus', survey._id, 'active');
      
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

  // removed inline ThemePreview (moved to component)

  // Auto-save disabled via flag
  const AUTO_SAVE_ENABLED = false;
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastUserActivity, setLastUserActivity] = useState<number>(Date.now());
  // Throttle frequent activity updates to prevent re-render storms on hover/mousemove
  const lastActivityUpdateRef = useRef<number>(Date.now());
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Handle auto-save functionality
  useEffect(() => {
    // Clear any existing timer when component unmounts
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);
  
  // Effect to handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActionDropdown(false);
      }
    }
    
    // Add event listener when dropdown is open
    if (showActionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionDropdown]);
  
  // Set up beforeunload event to warn when leaving and track user activity
  useEffect(() => {
    // Function to handle beforeunload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    // Function to track user activity
    const handleUserActivity = () => {
      updateUserActivity();
    };
    
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Track user activity with these events
    const activityEvents = ['mousedown', 'keydown', 'mousemove', 'wheel'];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Set up periodic auto-save (every 2 minutes) - disabled via flag
    const periodicSaveInterval = setInterval(() => {
      if (AUTO_SAVE_ENABLED) {
        // Only save if there are unsaved changes and user has been inactive for at least 5 seconds
        const inactiveTime = Date.now() - lastUserActivity;
        if (hasUnsavedChanges && inactiveTime > 5000) {
          silentSave(true); // Pass true to indicate this is an auto-save
        }
      }
    }, 120000); // 2 minutes
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearInterval(periodicSaveInterval);
    };
  }, [hasUnsavedChanges, lastUserActivity]);
  
  // Function to update last user activity timestamp
  // Only tracks activity without marking changes
  const updateUserActivity = () => {
    const now = Date.now();
    // Only update state at most once per 1000ms to avoid excessive re-renders on hover
    if (now - lastActivityUpdateRef.current >= 1000) {
      lastActivityUpdateRef.current = now;
      setLastUserActivity(now);
    }
  };
  
  // Function to track user activity that actually changes content
  const trackContentChange = () => {
    updateUserActivity();
    triggerAutoSave(true); // There are actual changes
  };

  const initialLoadCompleteRef = useRef(false);

  // In the triggerAutoSave function, only show saving immediately if past initial load
  const triggerAutoSave = (hasChanges = true) => {
    // Update user activity timestamp
    updateUserActivity();
    
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Only set unsaved changes flag if there are actual changes
    if (hasChanges) {
      setHasUnsavedChanges(true);
      
      // Only show saving immediately if we're past the initial load
      if (initialLoadCompleteRef.current) {
        setSaving(true); // Show saving indicator immediately when changes are made
      }
      
      if (AUTO_SAVE_ENABLED) {
        // Set a new timer for 5 seconds of inactivity before saving
        autoSaveTimerRef.current = setTimeout(() => {
          silentSave(true); // Pass true to indicate this is an auto-save
        }, 5000); // 5 seconds of inactivity
      } else {
        // Auto-save disabled - just clear saving indicator
        setSaving(false);
      }
    }
  };
  
  // Silent save function that doesn't update UI or show notifications
  const silentSave = async (isAutoSave = false) => {
    if (!AUTO_SAVE_ENABLED && isAutoSave) {
      return true; // Skip auto-save when disabled
    }
    
    try {
      // Only show saving indicator if there are actual changes to save
      if (hasUnsavedChanges) {
        setSaving(true); // Show saving indicator
        
        // Call handleSaveSurvey to actually save the data
        const saveResult = await handleSaveSurvey(isAutoSave);
        
        // After successful save:
        if (saveResult) {
          const now = Date.now();
          setLastSaved(now);
          setHasUnsavedChanges(false);
        }
        
        // Always reset the saving indicator
        setSaving(false);
        
        return saveResult;
      } else {
        // If no changes, just reset states without showing UI indicators
        setSaving(false);
        return true; // No changes needed to be saved, so technically it's a success
      }
    } catch (error) {
      console.error('Error in silentSave:', error);
      setSaving(false);
      return false;
    }
  };
  
  // Update triggerAutoSave only when title or description changes
  // This prevents auto-save for other survey elements like themes, questions, etc.
  const surveyTitleRef = useRef(survey?.title);
  const surveyDescriptionRef = useRef(survey?.description);
  const tagsRef = useRef(survey?.selectedTags);
  const hasCreatedSurveyRef = useRef(false);
  
  // Effect to handle auto-save when title or description changes
  useEffect(() => {
    // Check if we have content to save and we're not currently in a saving operation
    const hasTitleOrDescription = survey?.title || survey?.description;
    const hasContentChanged = survey?.title !== surveyTitleRef.current || 
      survey?.description !== surveyDescriptionRef.current || 
      (survey?.selectedTags?.length || 0) !== (tagsRef.current?.length || 0) ||
      survey?.selectedTags?.some((tag: string, i: number) => tag !== tagsRef.current?.[i]);
    
    if (!saving && hasContentChanged) {
      
      // For new surveys (no surveyId), immediately save when title or description is entered
      // This ensures the survey is created in the backend right away
      if (!surveyId && hasTitleOrDescription) {
        // COMMENTED OUT: Immediate save for new surveys
        // Call silentSave directly for immediate save instead of using trackContentChange
        // silentSave(false).then(success => { // Use false for manual save to ensure it happens immediately
        //   if (success) {
        //     hasCreatedSurveyRef.current = true;
        //   }
        // });
        
        // Just mark that we have unsaved changes instead
        setHasUnsavedChanges(true);
      } else {
        // For existing surveys, use normal auto-save flow
        trackContentChange();
      }
    }
    
    // Always update refs with current values to prevent false change detection
    surveyTitleRef.current = survey?.title;
    surveyDescriptionRef.current = survey?.description;
    tagsRef.current = survey?.selectedTags;

    // Mark initial load as complete after the first run of this effect
    initialLoadCompleteRef.current = true;
  }, [survey?.title, survey?.description, selectedTags, saving, surveyId]);
  
  // Additional effect to ensure survey is created when component mounts if we have content
  useEffect(() => {
    // If we have title/description but no surveyId, create the survey immediately
    if (!surveyId && !hasCreatedSurveyRef.current && (survey?.title || survey?.description)) {
      // COMMENTED OUT: Immediate save on component mount
      // silentSave(false).then(success => {
      //   if (success) {
      //     hasCreatedSurveyRef.current = true;
      //   }
      // });
      
      // Just mark that we have unsaved changes instead
      setHasUnsavedChanges(true);
    }
  }, []);
  
  // Handle saving the survey
  const handleSaveSurvey = async (isAutoSave = false): Promise<boolean> => {
    try {
      // Only show saving indicator for manual saves
      if (!isAutoSave) {
        setSaving(true);
      }
      
      // Prepare survey data for saving
      
      // Debug log to track surveyOrder before saving
      console.log('=== SAVE DEBUG ===');
      console.log('surveyOrder before saving:', survey.surveyOrder);
      console.log('sectionQuestions before saving:', surveyQuestions);
      console.log('sections before saving:', sections);
      
      // Find the complete theme object based on selectedTheme ID
      const selectedThemeObject = selectedTheme ? surveyThemes.find((theme: any) => theme._id === selectedTheme) : null;
      
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
          textColor: selectedThemeObject.textColor || '#333'
        } : null
      };
      
      // Create the survey data object
      const surveyData = {
        ...survey,
        title: survey?.title || 'Untitled Survey',
        description: survey?.description || '',
        logo: survey?.logo || '',
        image: survey?.image || '',
        featuredImage: survey?.featuredImage || '',
        color: survey?.color || '',
        layout: survey?.layout || 'multiStep', // Ensure layout always has a default value
        showLikertEmojis: showLikertEmojis, // Control whether to show emojis in Likert questions
        selectedQuestions: survey?.selectedQuestions || {},
        siteTextQuestions: survey?.siteTextQuestions || [],
        siteTextQForm: survey?.siteTextQForm || {},
        selectedDemographics: survey?.selectedDemographics || [],
        // Include survey sections and section questions
        surveySections: sections.map(section => ({
          id: section.id,
          name: section.name,
          description: section.description,
          isActive: section.isActive !== undefined ? section.isActive : true,
          priority: section.priority,
          color: section.color,
          instructions: section.instructions,
          isRequired: section.isRequired !== undefined ? section.isRequired : false,
          // Include image and document fields
          image: section.image,
          document: section.document,
          documentName: section.documentName,
          documentType: section.documentType
        })),
        sectionQuestions: surveyQuestions.map(q => ({
          id: q.id,
          sectionId: q.sectionId,
          type: q.type,
          order: q.order,
          status: q.status,
          text: q.text
        })),
        // Include default settings
        defaultSettings,
        // Include themes, categories, and tags
        selectedTheme,
        selectedCategories,
        selectedTags,
        // Include expectations data
        expectations: survey?.expectations || [],
        expectationsTitle: survey?.expectationsTitle || '',
        startButtonLabel: survey?.startButtonLabel || '',
        // Include consent screen configuration
        consentScreen: {
          title: consentTitle,
          consentText: consentText,
          privacyNoticeUrl: privacyNoticeUrl,
          privacyLinkText: privacyLinkText,
          privacyInfoText: privacyInfoText,
          continueButtonText: continueButtonText,
          checkboxText: checkboxText,
          showAnonymityNotice: showAnonymityNotice,
          anonymityNoticeText: anonymityNoticeText,
          showConsentScreen: showConsentScreen
        },
        // Include survey order
        surveyOrder: survey.surveyOrder || [],
        updatedAt: new Date(),
      };
      
      let savedSurveyId;
      
      if (surveyId) {
        // Update existing survey
        await Meteor.callAsync('surveys.update', surveyId, surveyData);
        savedSurveyId = surveyId;
      } else {
        // Add creation date for new surveys
        const newSurveyData = {
          ...surveyData,
          createdAt: new Date(),
          createdBy: Meteor.userId() || 'anonymous',
          status: 'draft',
          showLikertEmojis: true, // Default to showing emojis for new surveys
        };
        
        const result = await Meteor.callAsync('surveys.saveDraft', newSurveyData);
        savedSurveyId = result._id;
        
        if (savedSurveyId) {
          console.log(`Survey created with ID: ${savedSurveyId}`);
          // Navigate to the edit page for the new survey
          navigate(`/admin/surveys/builder/${savedSurveyId}`);
        } else {
          throw new Error('Failed to create survey - no ID returned');
        }
      }
      
      // Set the lastSaved timestamp to update the save status indicator
      const now = Date.now();
      
      // Debug log to track surveyOrder after saving
      console.log('=== SAVE COMPLETE ===');
      console.log('Survey saved successfully with ID:', savedSurveyId);
      console.log('surveyOrder sent to server:', surveyData.surveyOrder);
      console.log('sectionQuestions sent to server:', surveyData.sectionQuestions);
      
      // Use a slight delay to ensure state updates are processed in the correct order
      // This helps React batch the updates properly
      setTimeout(() => {
        setLastSaved(now);
        // Only reset saving indicator for manual saves
        if (!isAutoSave) {
          setSaving(false);
        }
        setHasUnsavedChanges(false);
        
        // Only show success message for manual saves, not auto-saves
        if (!isAutoSave) {
          showSuccessAlert('Survey saved successfully!');
        }
      }, 50);
      
      return true; // Return success
    } catch (error) {
      console.error('Error saving survey:', error);
      
      // Only show error for manual saves, not auto-saves
      if (!isAutoSave) {
        showErrorAlert(`Error saving survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Only reset saving indicator for manual saves
        setSaving(false);
      }
      
      // Keep unsaved changes flag true since save failed
      setHasUnsavedChanges(true);
      
      return false; // Return failure
    }
  };
  // Simple navigation warning for unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    // We'll use the beforeunload event handler below instead of a complex navigation blocker
    // This simplifies the code and avoids issues with navigationContext
    
    return () => {};
  }, [hasUnsavedChanges]);
  
  // Add beforeunload event handler to save survey before page refresh
  useEffect(() => {
    // Handler for page refresh or close
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard way to show a confirmation dialog before leaving
        event.preventDefault();
        
        // Try to save the survey before unloading
        try {
          // Attempt to save the survey
          await handleSaveSurvey(true);
        } catch (error) {
          console.error('Error saving survey before unload:', error);
        }
        
        // Standard message (browsers may show their own message instead)
        event.returnValue = 'Changes you made may not be saved.';
        return event.returnValue;
      }
    };
    
    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, handleSaveSurvey]);
  
  // Use our custom hook to detect URL changes
  useUrlChangeEffect((previousPath, currentPath) => {
    // Only save if there are unsaved changes
    if (hasUnsavedChanges) {
      // Check if we're navigating away from the survey builder
      const isSurveyBuilderPath = (path: string) => path.includes('/admin/surveys/builder');
      const leavingSurveyBuilder = isSurveyBuilderPath(previousPath) && !isSurveyBuilderPath(currentPath);
      
      // If we're leaving the survey builder or changing to a different survey
      if (leavingSurveyBuilder || (isSurveyBuilderPath(previousPath) && isSurveyBuilderPath(currentPath) && previousPath !== currentPath)) {
        console.log('URL changed, saving survey...', {
          from: previousPath,
          to: currentPath,
          leavingSurveyBuilder
        });
        
        // Save the survey silently
        handleSaveSurvey(true);
      }
    }
  }, [hasUnsavedChanges, handleSaveSurvey]);
  
  // Handle editing a section
  const handleEditSection = (section: SurveySectionItem) => {
    setCurrentSection(section);
    setShowSectionEditor(true);
  };
  
  // Track section saving state with a ref to avoid race conditions
  const isSavingSectionRef = useRef(false);

  // Handle saving a section
  const handleSaveSection = async (sectionData: SurveySectionItem) => {
    // Prevent multiple simultaneous save operations
    if (isSavingSectionRef.current) {
      console.log('Already saving a section, ignoring duplicate request');
      return;
    }
    
    console.log('Starting section save:', sectionData.id);
    isSavingSectionRef.current = true;
    
    try {
      // Show saving indicator immediately
      setSaving(true);
      
      // Store the section data in a local variable to ensure it's not lost
      const sectionToSave = { ...sectionData };
      console.log('Section to save:', sectionToSave);
      
      // Update sections state first - use functional update to ensure we have the latest state
      if (currentSection) {
        // Update existing section
        setSections(prevSections => {
          console.log('Updating existing section:', sectionToSave.id);
          return prevSections.map(s => s.id === sectionToSave.id ? sectionToSave : s);
        });
      } else {
        // Add new section
        setSections(prevSections => {
          console.log('Adding new section:', sectionToSave.id);
          return [...prevSections, sectionToSave];
        });
      }
      
      // Prepare survey data for saving with the updated sections
      const updatedSurveyData = {
        ...survey,
        // Use surveySections instead of sections to match the server-side property name
        surveySections: [...sections, ...(currentSection ? [] : [sectionToSave])].map(section => ({
          id: section.id,
          name: section.name,
          description: section.description,
          isActive: section.isActive !== undefined ? section.isActive : true,
          priority: section.priority,
          color: section.color,
          instructions: section.instructions,
          isRequired: section.isRequired !== undefined ? section.isRequired : false,
          // Include image and document fields
          image: section.image,
          document: section.document,
          documentName: section.documentName,
          documentType: section.documentType
        })),
        // Include consent screen configuration
        consentScreen: {
          title: consentTitle,
          consentText: consentText,
          privacyNoticeUrl: privacyNoticeUrl,
          privacyLinkText: privacyLinkText,
          privacyInfoText: privacyInfoText,
          continueButtonText: continueButtonText,
          checkboxText: checkboxText,
          showAnonymityNotice: showAnonymityNotice,
          anonymityNoticeText: anonymityNoticeText,
          showConsentScreen: showConsentScreen
        }
      };
      
      // Call Meteor method directly to ensure the save happens
      Meteor.call('surveys.update', survey._id, updatedSurveyData, (error: any, result: any) => {
        if (error) {
          console.error('Error saving section:', error);
          showErrorAlert(`Failed to save section: ${error.message || 'Unknown error'}`);
          setSaving(false);
        } else {
          console.log('Section saved successfully:', sectionToSave.id);
          
          // Update the survey object with the latest data
          const updatedSurvey = Surveys.findOne(survey._id);
          if (updatedSurvey) {
            setSurvey(updatedSurvey);
            
            // Make sure sections state is updated with the server data
            if (updatedSurvey.surveySections && Array.isArray(updatedSurvey.surveySections)) {
              setSections(updatedSurvey.surveySections as SurveySectionItem[]);
            }
          }
          
          // Show success message
          setShowSavedMessage(true);
          setTimeout(() => setShowSavedMessage(false), 2000);
          
          // Reset saving state
          setSaving(false);
          setHasUnsavedChanges(false);
          
          // Close the section editor and reset current section AFTER save completes
          setShowSectionEditor(false);
          setCurrentSection(undefined);
        }
        
        // Allow saving sections again
        isSavingSectionRef.current = false;
      });
    } catch (error) {
      console.error('Error in section save process:', error);
      showErrorAlert(`Failed to save section: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSaving(false);
      isSavingSectionRef.current = false;
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
  
  // Helper function to safely get the latest version of a question
  const getLatestQuestionVersion = (question: any): any => {
    if (!question) return undefined;
    
    const currentVersion = question.currentVersion;
    
    // Check if versions array exists and is valid
    if (!question.versions || !Array.isArray(question.versions) || question.versions.length === 0) {
      return undefined;
    }
    
    // Try to find the current version
    const versionMatch = question.versions.find((v: any) => v.version === currentVersion);
    if (versionMatch) return versionMatch;
    
    // Fall back to the last version in the array
    return question.versions[question.versions.length - 1];
  };
  
  // Handle adding questions to a section from question bank or to no section
  const handleAddQuestion = (sectionId: string | null) => {
    setCurrentSectionId(sectionId);
    
    // Open selector; it will manage its own paginated subscription
    setShowQuestionSelector(true);

  };
  
  // Get context methods for question builder panel
  const { openPanel, closePanel } = useQuestionBuilderPanel();
  
  // Handle creating a new question for a section or for the survey as a whole
  const handleCreateQuestion = (sectionId: string | null) => {
    setCurrentSectionId(sectionId || '');
    // Use context's openPanel method instead of local state
    // Pass the onQuestionCreated callback as the third parameter
    const onQuestionCreatedCallback = (questionId: string) => {
      console.log('Question created with ID:', questionId, 'Adding to section:', sectionId);
      // When a question is created, add it to the current section if sectionId is provided
      if (survey && survey._id) {
        try {
          // Fetch the created question document
          const questionDoc = Questions.findOne(questionId);
          if (!questionDoc) {
            console.error('Question not found with ID:', questionId);
            return;
          }
          
          // Get the latest version to extract the response type and text
          const latestVersion = getLatestQuestionVersion(questionDoc);
          
          let newQuestion: QuestionItem;
          
          // Handle differently based on whether we have a section ID
          if (sectionId) {
            // Get the current count of questions in this section
            const currentSectionQuestions = surveyQuestions.filter(q => q.sectionId === sectionId);
            const newOrder = currentSectionQuestions.length;
            
            console.log('Adding question to section with order:', newOrder);
            
            // Create a properly typed QuestionItem for a section question
            newQuestion = {
              id: questionId,
              sectionId: sectionId,
              text: extractQuestionText(questionDoc),
              type: latestVersion?.responseType || 'text',
              status: 'published',
              order: newOrder // Place at the end of the section
            };
          } else {
            // This is a question without a section (global survey question)
            // Get the current count of questions without a section
            const currentGlobalQuestions = surveyQuestions.filter(q => !q.sectionId);
            const newOrder = currentGlobalQuestions.length;
            
            console.log('Adding global question with order:', newOrder);
            
            // Create a properly typed QuestionItem for a global question
            newQuestion = {
              id: questionId,
              sectionId: undefined, // No section - use undefined instead of null to match type
              text: extractQuestionText(questionDoc),
              type: latestVersion?.responseType || 'text',
              status: 'published',
              order: newOrder // Place at the end of global questions
            };
          }
          
          // Update survey questions - EXACTLY like handleSelectQuestions
          console.log('Adding new question to surveyQuestions:', newQuestion);
          setSurveyQuestions(prev => {
            const updated = [...prev, newQuestion];
            console.log('Updated surveyQuestions:', updated);
            return updated;
          });
          
          // Only create a section question object if we have a section ID
          if (sectionId) {
            // Create section question object for the database
            const sectionQuestion = {
              questionId: questionId,
              sectionId: sectionId,
              type: latestVersion?.responseType || 'text',
              order: newQuestion.order // Use the order from newQuestion
            };
            console.log('Created sectionQuestion:', sectionQuestion);
            
            // Update the survey state to ensure changes are saved - EXACTLY like handleSelectQuestions
            setSurvey((prevSurvey: any) => {
              if (!prevSurvey) return prevSurvey;
              
              // Add to existing section questions
              const updatedSectionQuestions = [
                ...(prevSurvey.sectionQuestions || []),
                sectionQuestion
              ];
              
              console.log('Updated sectionQuestions:', updatedSectionQuestions);
              
              // CRITICAL FIX: Update surveyOrder to include the new question
              const updatedSurveyOrder = [...(prevSurvey.surveyOrder || [])];
              
              // Add the new question to surveyOrder
              updatedSurveyOrder.push({
                type: 'question',
                id: questionId,
                order: newQuestion.order
              });
              
              console.log('Updated surveyOrder with new question:', updatedSurveyOrder);
              
              // Create updated survey with the new section question and updated surveyOrder
              return {
                ...prevSurvey,
                sectionQuestions: updatedSectionQuestions,
                surveyOrder: updatedSurveyOrder
              };
            });
          } else {
            // For questions without a section, we still need to update surveyOrder
            setSurvey((prevSurvey: any) => {
              if (!prevSurvey) return prevSurvey;
              
              // CRITICAL FIX: Update surveyOrder to include the new global question
              const updatedSurveyOrder = [...(prevSurvey.surveyOrder || [])];
              
              // Add the new question to surveyOrder
              updatedSurveyOrder.push({
                type: 'question',
                id: questionId,
                order: newQuestion.order
              });
              
              console.log('Updated surveyOrder with new global question:', updatedSurveyOrder);
              
              // Create updated survey with updated surveyOrder
              return {
                ...prevSurvey,
                surveyOrder: updatedSurveyOrder
              };
            });
            
            console.log('Question created without a section - updated surveyOrder only');
          }
          

          // Update surveyOrder array - this is the single source of truth for ordering
          if (survey?.surveyOrder) {
            const currentOrder = [...survey.surveyOrder];
            
            // Create new order item for the created question
            const newOrderItem = {
              id: questionId,
              type: 'question' as const,
              order: currentOrder.length // Append to end of current order
            };
            
            // Update the surveyOrder array
            const updatedOrder = [...currentOrder, newOrderItem];
            
            // Call the API to update the survey order
            Meteor.call('surveys.updateSurveyOrder', surveyId, updatedOrder, (error: any) => {
              if (error) {
                console.error('Error updating survey order for new question:', error);
                showErrorAlert('Failed to update question order.');
              } else {
                console.log('Survey order updated successfully for new question');
                // Refresh survey data to reflect the changes
                refreshSurveyData();
              }
            });
          }
          
          // Trigger auto-save by setting hasUnsavedChanges
          console.log('Setting hasUnsavedChanges to true');
          setHasUnsavedChanges(true);
          

          // Show success notification
          setAlert({
            type: 'success',
            message: 'Question created and added to section successfully!'
          });
          
          // Clear the alert after 3 seconds
          setTimeout(() => setAlert(null), 3000);
        } catch (error) {
          console.error('Error in onQuestionCreated callback:', error);
          // Show error notification
          setAlert({
            type: 'error',
            message: `Error adding question to section: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
          
          // Clear the alert after 4 seconds
          setTimeout(() => setAlert(null), 4000);
        }
      }
    };
    
    openPanel(undefined, surveyId, onQuestionCreatedCallback);
  };
  
  // Refresh survey data after changes
  const refreshSurveyData = () => {
    // Subscribe to questions.all with surveyId to get both global and survey-specific questions
    // This subscription is handled by Meteor automatically
    Meteor.subscribe('questions.all', surveyId);
    
    // Get all questions from the database using the updated publication
    // This will include both global questions and survey-specific questions for this survey
    const allQuestions = Questions.find({}, { sort: { createdAt: -1 } }).fetch();
    
    // Use all questions directly since the publication now handles the filtering
    
    // Map to QuestionItem format
    const refreshedQuestions = allQuestions.map(q => {
      // Get the latest version to extract the response type and text
      const currentVersion = q.currentVersion;
      const latestVersion = getLatestQuestionVersion(q);
      
      // Create a properly typed QuestionItem
      const questionItem: QuestionItem = {
        id: q._id || '',
        text: extractQuestionText(q),
        type: latestVersion?.responseType || 'text',
        status: 'published'
      };
      
      return questionItem;
    });
    
    // Update the question selector items
    setQuestionSelectorItems(refreshedQuestions);
    
    // Refresh the survey questions
    if (survey && survey._id) {
      const updatedSurvey = Surveys.findOne(survey._id);
      if (updatedSurvey) {
        // Update the current survey
        setSurvey(updatedSurvey);
        
        // Update the survey questions by extracting from the updated survey
        // This replaces the need for mapSurveyQuestions function
        if (updatedSurvey.sectionQuestions && Array.isArray(updatedSurvey.sectionQuestions)) {
          const updatedQuestions: QuestionItem[] = updatedSurvey.sectionQuestions.map((q: any) => ({
            id: q.questionId,
            sectionId: q.sectionId,
            text: extractQuestionText(Questions.findOne(q.questionId) || {}),
            type: q.type || 'text',
            status: 'published' as const
          }));
          setSurveyQuestions(updatedQuestions);
        }
      }
    }
  };
  
  // Handle selecting questions in the question selector
  const handleSelectQuestions = async (questionIds: string[], sectionId: string) => {
    
    // Get currently selected questions for this section
    const currentSectionQuestions = surveyQuestions.filter(q => q.sectionId === sectionId);
    const currentSectionQuestionIds = currentSectionQuestions.map(q => q.id);
    
    // Find questions that need to be added (not already in the section)
    const newQuestionIds = questionIds.filter(id => !currentSectionQuestionIds.includes(id));
    
    // Use questionSelectorItems if available, otherwise fall back to allQuestions
    const questionsSource = questionSelectorItems.length > 0 ? questionSelectorItems : allQuestions;
    
    // Get only the NEW questions that need to be added
    const newQuestions = questionsSource.filter(q => newQuestionIds.includes(q.id));
    
    // Create question items for the new questions only
    const newSectionQuestionItems = newQuestions.map((q, index) => {
      // Calculate the order based on existing questions in the section
      const maxOrder = Math.max(-1, ...currentSectionQuestions.map(sq => sq.order || 0));
      
      // Create a properly typed QuestionItem
      const questionItem: QuestionItem = {
        id: q.id,
        text: q.text,
        type: q.type,
        sectionId: sectionId,
        order: maxOrder + index + 1, // Append after existing questions
        status: q.status || 'published'
      };
      
      return questionItem;
    });
    
    // Update survey questions - add the new questions to existing ones
    setSurveyQuestions(prev => {
      // Simply append the new questions to the existing array
      const updatedQuestions = [...prev, ...newSectionQuestionItems];
      return updatedQuestions;
    });
    
    // Update the survey state to ensure changes are saved
    setSurvey((prevSurvey: any) => {
      if (!prevSurvey) return prevSurvey;
      
      // Get existing section questions
      const existingSectionQuestions = prevSurvey.sectionQuestions || [];
      
      // Create updated survey with the new section questions appended
      const updatedSurvey = {
        ...prevSurvey,
        sectionQuestions: [...existingSectionQuestions, ...newSectionQuestionItems]
      };
      
      return updatedSurvey;
    });
    
    // Update surveyOrder array - this is the single source of truth for ordering
    if (survey?.surveyOrder && newQuestionIds.length > 0) {
      const currentOrder = [...survey.surveyOrder];
      
      // Create new order items for the selected questions
      const newOrderItems = newQuestionIds.map((questionId, index) => ({
        id: questionId,
        type: 'question' as const,
        order: currentOrder.length + index // Append to end of current order
      }));
      
      // Update the surveyOrder array
      const updatedOrder = [...currentOrder, ...newOrderItems];
      
      // Call the API to update the survey order
      Meteor.call('surveys.updateSurveyOrder', surveyId, updatedOrder, (error: any) => {
        if (error) {
          console.error('Error updating survey order:', error);
          showErrorAlert('Failed to update question order.');
        } else {
          console.log('Survey order updated successfully');
          // Refresh survey data to reflect the changes
          refreshSurveyData();
        }
      });
    }
    
    // Set hasUnsavedChanges to true to ensure silentSave will actually save
    setHasUnsavedChanges(true);
    
    // Show saving indicator
    setSaving(true);
    
    try {
      // Auto-save the survey silently after selecting questions
      // This prevents loss of question selections if the user doesn't manually save
      // Wait for save to complete before closing the question selector
      await silentSave(true);
      
      // Show success message
      setShowSavedMessage(true);
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving questions:', error);
      // Show error alert
      showErrorAlert('Failed to save questions. Please try again.');
    } finally {
      // Hide saving indicator
      setSaving(false);
      
      // Close the question selector modal
      setShowQuestionSelector(false);
    }
  };
  
  // Handle editing a question
  const handleEditQuestion = (questionId: string, sectionId: string | null) => {
    // Set hasUnsavedChanges to true to ensure silentSave will actually save
    setHasUnsavedChanges(true);
    
    // Auto-save the survey silently before opening the question edit panel
    // This prevents loss of question selections when editing without saving first
    silentSave(true).then(() => {
      // Use context's openPanel method instead of local state
      openPanel(questionId, surveyId);
    });
  };

  // Handle question creation/edit completion
  const handleQuestionCreated = (questionId: string) => {
    refreshSurveyData();
    // Use trackContentChange instead of directly setting hasUnsavedChanges
    trackContentChange();
  };

  // Handle closing the question builder
  const handleCloseQuestionBuilder = () => {
    // Use context's closePanel method instead of local state
    closePanel();
    // No need to reset state variables as they're now managed by context
  };

  // Handle removing a question from a section or from no-section area
  const handleRemoveQuestion = (questionId: string, sectionId: string | null) => {
    // Completely remove the question from surveyQuestions
    setSurveyQuestions(prev => prev.filter(q => {
      if (sectionId === null) {
        // For questions without a section, only check the ID and that it has no sectionId
        return !(q.id === questionId && !q.sectionId);
      } else {
        // For questions in sections, check both ID and sectionId match
        return !(q.id === questionId && q.sectionId === sectionId);
      }
    }));
    
    // Also update the survey state to ensure changes are saved
    setSurvey((prevSurvey: any) => {
      if (!prevSurvey) return prevSurvey;
      
      return {
        ...prevSurvey,
        sectionQuestions: prevSurvey.sectionQuestions?.filter((q: any) => {
          if (sectionId === null) {
            // For questions without a section, only check the ID and that it has no sectionId
            return !(q.id === questionId && !q.sectionId);
          } else {
            // For questions in sections, check both ID and sectionId match
            return !(q.id === questionId && q.sectionId === sectionId);
          }
        }) || []
      };
    });
    
    // Use trackContentChange instead of directly setting hasUnsavedChanges
    trackContentChange();
  };
  
  // Handle reordering questions within a section
  const handleReorderQuestion = (sectionId: string, oldIndex: number, newIndex: number) => {
    if (!survey?.surveyOrder) {
      console.error('Survey order not found');
      return;
    }
    
    // Get current survey order
    const currentOrder = [...survey.surveyOrder];
    
    // Find questions in this section
    const sectionQuestionIds = currentOrder
      .filter(item => item.type === 'question')
      .map((item: any) => item.id)
      .filter(id => {
        const question = surveyQuestions.find(q => q.id === id);
        return question?.sectionId === sectionId;
      });
    
    // Reorder the question IDs
    const [movedQuestionId] = sectionQuestionIds.splice(oldIndex, 1);
    sectionQuestionIds.splice(newIndex, 0, movedQuestionId);
    
    // Rebuild survey order with new question positions
    const updatedOrder = currentOrder.map((item: any) => {
      if (item.type === 'question' && sectionQuestionIds.includes(item.id)) {
        const newIndex = sectionQuestionIds.indexOf(item.id);
        return { ...item, order: newIndex };
      }
      return item;
    });
    
    // Update survey order in database
    Meteor.call('surveys.updateSurveyOrder', surveyId, updatedOrder, (error: any) => {
      if (error) {
        console.error('Error reordering questions:', error);
        showErrorAlert('Failed to reorder questions.');
      } else {
        refreshSurveyData();
        trackContentChange();
      }
    });
  };

  // Handle reordering questions in the no-section area
  const handleReorderNoSectionQuestion = (oldIndex: number, newIndex: number) => {
    if (!survey?.surveyOrder) {
      console.error('Survey order not found');
      return;
    }
    
    // Get current survey order
    const currentOrder = [...survey.surveyOrder];
    
    // Find questions with no section
    const noSectionQuestionIds = currentOrder
      .filter(item => item.type === 'question')
      .map((item: any) => item.id)
      .filter(id => {
        const question = surveyQuestions.find(q => q.id === id);
        return !question?.sectionId;
      });
    
    // Reorder the question IDs
    const [movedQuestionId] = noSectionQuestionIds.splice(oldIndex, 1);
    noSectionQuestionIds.splice(newIndex, 0, movedQuestionId);
    
    // Rebuild survey order with new question positions
    const updatedOrder = currentOrder.map((item: any) => {
      if (item.type === 'question' && noSectionQuestionIds.includes(item.id)) {
        const newIndex = noSectionQuestionIds.indexOf(item.id);
        return { ...item, order: newIndex };
      }
      return item;
    });
    
    // Update survey order in database
    Meteor.call('surveys.updateSurveyOrder', surveyId, updatedOrder, (error: any) => {
      if (error) {
        console.error('Error reordering no-section questions:', error);
        showErrorAlert('Failed to reorder questions.');
      } else {
        refreshSurveyData();
        trackContentChange();
      }
    });
  };

  // Handle moving a question from a section to the no-section area
  const handleMoveQuestionToNoSection = (questionId: string, sectionId: string, targetIndex: number = -1) => {
    // Get the question to move
    const questionToMove = surveyQuestions.find(q => q.id === questionId && q.sectionId === sectionId);
    if (!questionToMove) {
      console.error('Question not found:', questionId);
      return;
    }

    // Get no-section questions to determine order
    const noSectionQuestions = surveyQuestions.filter(q => !q.sectionId);
    
    // Create updated question with no sectionId
    const updatedQuestion = {
      ...questionToMove,
      sectionId: undefined,
      order: targetIndex >= 0 ? targetIndex : noSectionQuestions.length
    };

    // Get all questions except the one being moved
    const otherQuestions = surveyQuestions.filter(q => !(q.id === questionId && q.sectionId === sectionId));
    
    // Insert the updated question at the target index or at the end
    let updatedQuestions;
    if (targetIndex >= 0) {
      // Insert at specific position and update orders
      const beforeQuestions = noSectionQuestions.slice(0, targetIndex);
      const afterQuestions = noSectionQuestions.slice(targetIndex);
      
      // Combine and update orders
      const reorderedNoSectionQuestions = [
        ...beforeQuestions, 
        updatedQuestion, 
        ...afterQuestions.map(q => ({ ...q, order: (q.order || 0) + 1 }))
      ];
      
      // Combine with questions from sections
      const sectionQuestions = otherQuestions.filter(q => q.sectionId);
      updatedQuestions = [...sectionQuestions, ...reorderedNoSectionQuestions];
    } else {
      // Just add to the end
      updatedQuestions = [...otherQuestions, updatedQuestion];
    }

    // Update survey order in database
    if (survey?.surveyOrder) {
      const updatedOrder = survey.surveyOrder.map((item: any) => {
        if (item.type === 'question' && item.id === questionId) {
          return { ...item, order: targetIndex >= 0 ? targetIndex : survey.surveyOrder.length };
        }
        return item;
      });
      
      Meteor.call('surveys.updateSurveyOrder', surveyId, updatedOrder, (error: any) => {
        if (error) {
          console.error('Error moving question to no-section area:', error);
          showErrorAlert('Failed to move question.');
        } else {
          refreshSurveyData();
          trackContentChange();
        }
      });
    }
  };

  // Handle moving a question from the no-section area to a section
  const handleMoveQuestionToSection = (questionId: string, targetSectionId: string, targetIndex: number = -1) => {
    // Get the question to move
    const questionToMove = surveyQuestions.find(q => q.id === questionId && !q.sectionId);
    if (!questionToMove) {
      console.error('Question not found:', questionId);
      return;
    }

    // Get section questions to determine order
    const sectionQuestions = surveyQuestions.filter(q => q.sectionId === targetSectionId);
    
    // Create updated question with new sectionId
    const updatedQuestion = {
      ...questionToMove,
      sectionId: targetSectionId,
      order: targetIndex >= 0 ? targetIndex : sectionQuestions.length
    };

    // Get all questions except the one being moved
    const otherQuestions = surveyQuestions.filter(q => !(q.id === questionId && !q.sectionId));
    
    // Insert the updated question at the target index or at the end
    let updatedQuestions;
    if (targetIndex >= 0) {
      // Insert at specific position and update orders
      const beforeQuestions = sectionQuestions.slice(0, targetIndex);
      const afterQuestions = sectionQuestions.slice(targetIndex);
      
      // Combine and update orders
      const reorderedSectionQuestions = [
        ...beforeQuestions, 
        updatedQuestion, 
        ...afterQuestions.map(q => ({ ...q, order: (q.order || 0) + 1 }))
      ];
      
      // Combine with questions from other sections and no-section
      const otherSectionsQuestions = otherQuestions.filter(q => q.sectionId !== targetSectionId);
      updatedQuestions = [...otherSectionsQuestions, ...reorderedSectionQuestions];
    } else {
      // Just add to the end
      updatedQuestions = [...otherQuestions, updatedQuestion];
    }

    // Update survey order in database
    if (survey?.surveyOrder) {
      const updatedOrder = survey.surveyOrder.map((item: any) => {
        if (item.type === 'question' && item.id === questionId) {
          return { ...item, order: targetIndex >= 0 ? targetIndex : survey.surveyOrder.length };
        }
        return item;
      });
      
      Meteor.call('surveys.updateSurveyOrder', surveyId, updatedOrder, (error: any) => {
        if (error) {
          console.error('Error moving question to section:', error);
          showErrorAlert('Failed to move question.');
        } else {
          refreshSurveyData();
          trackContentChange();
        }
      });
    }
  };
  
  // Handle moving a question between sections
  const handleMoveQuestionBetweenSections = (questionId: string, sourceSectionId: string, targetSectionId: string, targetIndex: number = -1) => {
    // Get the question to move
    const questionToMove = surveyQuestions.find(q => q.id === questionId && q.sectionId === sourceSectionId);
    if (!questionToMove) {
      console.error('Question not found:', questionId);
      return;
    }

    // Get target section questions to determine order
    const targetSectionQuestions = surveyQuestions.filter(q => q.sectionId === targetSectionId);
    
    // Create updated question with new sectionId
    const updatedQuestion = {
      ...questionToMove,
      sectionId: targetSectionId,
      order: targetIndex >= 0 ? targetIndex : targetSectionQuestions.length
    };

    // Get all questions except the one being moved
    const otherQuestions = surveyQuestions.filter(q => !(q.id === questionId && q.sectionId === sourceSectionId));
    
    // Insert the updated question at the target index or at the end
    let updatedQuestions;
    if (targetIndex >= 0) {
      // Insert at specific position and update orders
      const beforeQuestions = targetSectionQuestions.slice(0, targetIndex);
      const afterQuestions = targetSectionQuestions.slice(targetIndex);
      
      // Combine and update orders
      const reorderedSectionQuestions = [
        ...beforeQuestions, 
        updatedQuestion, 
        ...afterQuestions.map(q => ({ ...q, order: (q.order || 0) + 1 }))
      ];
      
      // Combine with questions from other sections
      const otherSectionsQuestions = otherQuestions.filter(q => q.sectionId !== targetSectionId);
      updatedQuestions = [...otherSectionsQuestions, ...reorderedSectionQuestions];
    } else {
      // Just add to the end
      updatedQuestions = [...otherQuestions, updatedQuestion];
    }

    // Update survey order in database
    if (survey?.surveyOrder) {
      const updatedOrder = survey.surveyOrder.map((item: any) => {
        if (item.type === 'question' && item.id === questionId) {
          return { ...item, order: targetIndex >= 0 ? targetIndex : survey.surveyOrder.length };
        }
        return item;
      });
      
      Meteor.call('surveys.updateSurveyOrder', surveyId, updatedOrder, (error: any) => {
        if (error) {
          console.error('Error moving question between sections:', error);
          showErrorAlert('Failed to move question.');
        } else {
          refreshSurveyData();
          trackContentChange();
        }
      });
    }
  };

  // Handle reordering sections
  const handleReorderSection = async (oldIndex: number, newIndex: number) => {
    // Reorder the sections
    const reorderedSections = [...sections];
    const [movedSection] = reorderedSections.splice(oldIndex, 1);
    reorderedSections.splice(newIndex, 0, movedSection);
    
    // Update the priority and displayOrder properties for each section
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      priority: index,
      displayOrder: index, // Update the displayOrder to match the new position
    }));
    
    // Update the sections state
    setSections(updatedSections);
    
    // Mark that we have unsaved changes using our new approach
    trackContentChange();
    
    // Save changes immediately instead of waiting for auto-save
    try {
      // Ensure we have valid data before proceeding
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
    } catch (error) {
    }
  };
  
  // Get questions that belong to a specific section
  const getQuestionsForSection = (sectionId: string) => {
    return surveyQuestions
      .filter(q => q.sectionId === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };
  
  // Get questions that are currently selected for a section
  const getSelectedQuestionIds = (sectionId: string) => {
    return surveyQuestions
      .filter(q => q.sectionId === sectionId)
      .map(q => q.id);
  };
  
  // Get questions that don't belong to any section
  const noSectionQuestions = surveyQuestions.filter(q => !q.sectionId);
  
  // Render loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <DashboardBg>
          <Spinner />
        </DashboardBg>

        
        {/* Theme Creation Modal (extracted) */}
        <ThemeCreationModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          newThemeName={newThemeName}
          setNewThemeName={setNewThemeName}
          newThemeColor={newThemeColor}
          setNewThemeColor={setNewThemeColor}
          newThemeSecondaryColor={newThemeSecondaryColor}
          setNewThemeSecondaryColor={setNewThemeSecondaryColor}
          newThemeAccentColor={newThemeAccentColor}
          setNewThemeAccentColor={setNewThemeAccentColor}
          newThemeDescription={newThemeDescription}
          setNewThemeDescription={setNewThemeDescription}
          newThemeIsActive={newThemeIsActive}
          setNewThemeIsActive={setNewThemeIsActive}
          newThemeTemplateType={newThemeTemplateType}
          setNewThemeTemplateType={setNewThemeTemplateType}
          newThemeHeadingFont={newThemeHeadingFont}
          setNewThemeHeadingFont={setNewThemeHeadingFont}
          newThemeBodyFont={newThemeBodyFont}
          setNewThemeBodyFont={setNewThemeBodyFont}
          newThemeButtonStyle={newThemeButtonStyle}
          setNewThemeButtonStyle={setNewThemeButtonStyle}
          newThemeQuestionStyle={newThemeQuestionStyle}
          setNewThemeQuestionStyle={setNewThemeQuestionStyle}
          newThemeHeaderStyle={newThemeHeaderStyle}
          setNewThemeHeaderStyle={setNewThemeHeaderStyle}
          setAlert={setAlert}
          setHasUnsavedChanges={setHasUnsavedChanges}
          triggerAutoSave={() => triggerAutoSave()}
        />        
        {/* Theme preview modal */}
        {showPreview && previewTheme && (
          <ThemePreview theme={previewTheme} open={showPreview} onClose={closePreview} />
        )}
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
          <SurveyHeaderSection
            survey={survey}
            publicUrl={publicUrl}
            saving={saving}
            showSavedMessage={showSavedMessage}
            isPublished={isPublished}
            sections={sections}
            surveyQuestions={surveyQuestions}
            selectedTheme={selectedTheme}
            selectedTags={selectedTags}
            selectedCategories={selectedCategories}
            setCopied={setCopied}
            showSuccessAlert={showSuccessAlert}
            showErrorAlert={showErrorAlert}
            handleSaveSurvey={handleSaveSurvey}
            handleGeneratePublicUrl={handleGeneratePublicUrl}
          />
          
          {/* Main content */}
          <div className="survey-builder-main">
            {/* Sidebar */}
            <div className="survey-builder-sidebar">
              <div className="survey-builder-step-list">
                {steps.map(step => (
                  <div 
                    key={step.id}
                    className={`survey-builder-step ${activeStep === step.id ? 'active' : ''}`}
                    onClick={() => {
                      // If there are unsaved changes, save silently before changing tabs
                      if (hasUnsavedChanges) {
                        // Save without UI indicators by using handleSaveSurvey directly with isAutoSave=true
                        // This bypasses the AUTO_SAVE_ENABLED check in silentSave
                        handleSaveSurvey(true).then(() => {
                          // Change the tab after the save is complete
                          setActiveStep(step.id);
                        }).catch(() => {
                          // If save fails, still change the tab
                          setActiveStep(step.id);
                        });
                      } else {
                        // No unsaved changes, just change the tab
                        setActiveStep(step.id);
                      }
                    }}
                  >
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
                <SectionsTab
                  sections={sections}
                  surveyQuestions={surveyQuestions}
                  noSectionQuestions={noSectionQuestions}
                  draggingSectionIndex={draggingSectionIndex}
                  dragOverSectionIndex={dragOverSectionIndex}
                  draggingQuestionId={draggingQuestionId}
                  draggingQuestionSectionId={draggingQuestionSectionId}
                  dragOverQuestionId={dragOverQuestionId}
                  dragOverSectionId={dragOverSectionId}
                  dragOverNoSection={dragOverNoSection}
                  setDraggingSectionIndex={setDraggingSectionIndex}
                  setDragOverSectionIndex={setDragOverSectionIndex}
                  setDraggingQuestionId={setDraggingQuestionId}
                  setDraggingQuestionSectionId={setDraggingQuestionSectionId}
                  setDragOverQuestionId={setDragOverQuestionId}
                  setDragOverSectionId={setDragOverSectionId}
                  setDragOverNoSection={setDragOverNoSection}
                  handleAddSection={handleAddSection}
                  handleAddQuestion={handleAddQuestion}
                  handleCreateQuestion={handleCreateQuestion}
                  handleEditQuestion={handleEditQuestion}
                  handleRemoveQuestion={handleRemoveQuestion}
                  handleEditSection={(sectionId: string) => {
                    const section = sections.find(s => s.id === sectionId);
                    if (section) handleEditSection(section);
                  }}
                  handleDeleteSection={handleDeleteSection}
                  handleReorderSection={handleReorderSection}
                  handleReorderQuestion={handleReorderQuestion}
                  handleMoveQuestionToSection={handleMoveQuestionToSection}
                  handleMoveQuestionBetweenSections={handleMoveQuestionBetweenSections}
                  handleMoveQuestionToNoSection={handleMoveQuestionToNoSection}
                  handleReorderNoSectionQuestion={handleReorderNoSectionQuestion}
                />
              )}
              
              {/* Branching Logic tab */}
              {activeStep === 'branching' && (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-content">
                    <h3>Branching Logic</h3>
                    <p>Configure branching logic for your survey questions here.</p>
                  </div>
                </div>
              )}
              
              {/* Welcome Screen */}
              {activeStep === 'welcome' && (
                <div className="survey-builder-panel">
                  <BasicSurveyWelcomeSection
                    survey={survey}
                    setSurvey={setSurvey}
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    surveyId={surveyId}
                    hasUnsavedChanges={hasUnsavedChanges}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    setActiveStep={setActiveStep}
                    triggerAutoSave={triggerAutoSave}
                    setAlert={setAlert}
                    silentSave={silentSave}
                  />
                </div>
              )}
              {/* Survey Questions Tab */}
              {activeStep === 'questions' && (
                  <SurveyQuestionsTab
                    surveyId={surveyId}
                    survey={survey}
                    onSurveyUpdate={(updatedSurvey) => {
                    // Debug log to track incoming surveyOrder from child component
                    console.log('Received surveyOrder in onSurveyUpdate:', updatedSurvey.surveyOrder);
                    
                    // Preserve the surveyOrder from the updated survey
                    const surveyWithOrder = {
                      ...updatedSurvey,
                      // Ensure surveyOrder is preserved and included in the survey object
                      surveyOrder: updatedSurvey.surveyOrder || []
                    };
                    
                    // Update the survey state with the complete data including surveyOrder
                    setSurvey(surveyWithOrder);
                    
                    // Sync sections state with the updated survey
                    if (updatedSurvey.surveySections && Array.isArray(updatedSurvey.surveySections)) {
                      setSections(updatedSurvey.surveySections);
                    }
                    
                    // Sync sectionQuestions state with the updated survey
                    // Convert sectionQuestions back to QuestionItem format for the builder
                    if (updatedSurvey.sectionQuestions && Array.isArray(updatedSurvey.sectionQuestions)) {
                      const reconstructedQuestions: QuestionItem[] = updatedSurvey.sectionQuestions.map((sq: any) => {
                        // Find the question document to get the text
                        const questionDoc = Questions.findOne(sq.id || sq.questionId);
                        return {
                          id: sq.id || sq.questionId,
                          text: questionDoc ? extractQuestionText(questionDoc) : 'Loading...',
                          type: sq.type || 'text',
                          status: 'published' as const,
                          sectionId: sq.sectionId,
                          order: sq.order
                        };
                      });
                      setSurveyQuestions(reconstructedQuestions);
                    }
                    
                    // Sync surveyOrder state with the updated survey
                    if (updatedSurvey.surveyOrder && Array.isArray(updatedSurvey.surveyOrder)) {
                      setSurveyOrder(updatedSurvey.surveyOrder);
                    }
                    
                    // Mark that we have unsaved changes
                    setHasUnsavedChanges(true);
                    
                    // Log the updated survey data for debugging
                    console.log('Updated survey with order:', surveyWithOrder);
                  }}
                  onHasUnsavedChanges={setHasUnsavedChanges}
                />
              )}
              
              {/* Other steps would be implemented here */}
              {activeStep === 'tags' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">Survey Tags</h2>
                    <p className="survey-builder-panel-subtitle">
                      Add tags to categorize and organize your survey
                    </p>
                  </div>
                  
                  
                </div>
              ) : activeStep === 'responses' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">Survey Responses</h2>
                  </div>
                  
                  <ResponsesTab 
                    surveyResponses={surveyResponses} 
                    isLoadingResponses={isLoadingResponses} 
                    responseStats={responseStats} 
                    surveyData={survey}
                  />
                </div>
              ) : activeStep === 'analytics' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">Analytics Dashboard</h2>
                  </div>
                  {survey?._id ? (
                    <SurveyAnalyticsTab surveyId={survey._id} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      <p>Please save the survey to view analytics.</p>
                    </div>
                  )}
                </div>
              ) : activeStep === 'appearance' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">
                      {/* {steps.find(step => step.id === activeStep)?.label} */}
                    </h2>
                  </div>
                  
                  <AppearanceTab
                    survey={survey}
                    setSurvey={setSurvey}
                    surveyThemes={surveyThemes}
                    showLikertEmojis={showLikertEmojis}
                    setShowLikertEmojis={setShowLikertEmojis}
                    themeSearchQuery={themeSearchQuery}
                    setThemeSearchQuery={setThemeSearchQuery}
                    currentThemePage={currentThemePage}
                    setCurrentThemePage={setCurrentThemePage}
                    selectedTheme={selectedTheme}
                    setSelectedTheme={setSelectedTheme}
                    thankYouTitle={thankYouTitle}
                    setThankYouTitle={setThankYouTitle}
                    thankYouDetails={thankYouDetails}
                    setThankYouDetails={setThankYouDetails}
                    thankYouIcon={thankYouIcon || null}
                    setThankYouIcon={(icon: string | null) => setThankYouIcon(icon || '')}
                    thankYouBoxes={thankYouBoxes.map(b => ({ title: b.title, subtitle: b.subtitle, selected: b.selected }))}
                    setThankYouBoxes={(boxes) => setThankYouBoxes(boxes.map(b => ({ ...b, icon: '' })))}
                    showThankYouPreview={showThankYouPreview}
                    setShowThankYouPreview={setShowThankYouPreview}
                    showThemeModal={showThemeModal}
                    setShowThemeModal={setShowThemeModal}
                    surveyId={surveyId}
                    hasUnsavedChanges={hasUnsavedChanges}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    triggerAutoSave={triggerAutoSave}
                    handlePreview={handlePreview}
                    consentTitle={consentTitle}
                    setConsentTitle={setConsentTitle}
                    consentText={consentText}
                    setConsentText={setConsentText}
                    privacyNoticeUrl={privacyNoticeUrl}
                    setPrivacyNoticeUrl={setPrivacyNoticeUrl}
                    privacyLinkText={privacyLinkText}
                    setPrivacyLinkText={setPrivacyLinkText}
                    privacyInfoText={privacyInfoText}
                    setPrivacyInfoText={setPrivacyInfoText}
                    continueButtonText={continueButtonText}
                    setContinueButtonText={setContinueButtonText}
                    checkboxText={checkboxText}
                    setCheckboxText={setCheckboxText}
                    showAnonymityNotice={showAnonymityNotice}
                    setShowAnonymityNotice={setShowAnonymityNotice}
                    anonymityNoticeText={anonymityNoticeText}
                    setAnonymityNoticeText={setAnonymityNoticeText}
                    showConsentScreen={showConsentScreen}
                    setShowConsentScreen={setShowConsentScreen}
                  />
                 
                </div>
              ) : activeStep === 'collaboration' ? (
                  <CollaborationTab
                    surveyId={surveyId || ''}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    triggerAutoSave={triggerAutoSave}
                    showErrorAlert={showErrorAlert}
                    showSuccessAlert={showSuccessAlert}
                  />
              ) : activeStep === 'settings' ? (
                <SettingsTab
                  survey={survey}
                  setSurvey={setSurvey}
                  setHasUnsavedChanges={setHasUnsavedChanges}
                  triggerAutoSave={triggerAutoSave}
                />
              ) : activeStep !== 'sections' && activeStep !== 'appearance' && activeStep !== 'settings' && activeStep !== 'questions' && activeStep !== 'survey_questions' && activeStep !== 'welcome' && (
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
          questions={questionSelectorItems}
          selectedQuestionIds={surveyQuestions
            .filter(q => q.sectionId === currentSectionId)
            .map(q => q.id)}
          sectionId={currentSectionId || ''}
          onSelectQuestions={handleSelectQuestions}
          onQuestionsRefresh={() => {
            // Refresh question data when a new question is created
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
              
              return questionItem;
            });
            
            // Update the question selector items
            setQuestionSelectorItems(refreshedQuestions);
          }}
        />
        
        {/* Question Builder Side Panel */}
        <QuestionBuilderSidePanel
          isOpen={showQuestionBuilder}
          onClose={() => setShowQuestionBuilder(false)}
          context="surveyBuilder"
          surveyId={survey?._id}
          onQuestionCreated={(questionId: string) => {
            console.log('Checking if this questions shows up', questionId);
            // When a question is created, add it to the current section
            if (currentSectionId && survey && survey._id) {
              try {
                console.log('Question created with ID:', questionId, 'Adding to section:', currentSectionId);
                console.log('Current survey questions:', surveyQuestions);
                
                // Fetch the newly created question to get its details
                const questionDoc = Questions.findOne(questionId);
                if (!questionDoc) {
                  console.error('Could not find created question with ID:', questionId);
                  return;
                }
                
                // Get the latest version to extract the response type and text
                const latestVersion = getLatestQuestionVersion(questionDoc);
                
                // Get the current count of questions in this section
                const currentSectionQuestions = surveyQuestions.filter(q => q.sectionId === currentSectionId);
                const newOrder = currentSectionQuestions.length;
                
                console.log('Adding question to section with order:', newOrder);
                
                // Create a properly typed QuestionItem
                const newQuestion: QuestionItem = {
                  id: questionId,
                  sectionId: currentSectionId,
                  text: extractQuestionText(questionDoc),
                  type: latestVersion?.responseType || 'text',
                  status: 'published',
                  order: newOrder // Place at the end of the section
                };
                
                // Update survey questions - EXACTLY like handleSelectQuestions
                console.log('Adding new question to surveyQuestions:', newQuestion);
                setSurveyQuestions(prev => {
                  const updated = [...prev, newQuestion];
                  console.log('Updated surveyQuestions:', updated);
                  return updated;
                });
                
                // Create section question object for the database
                const sectionQuestion = {
                  questionId: questionId,
                  sectionId: currentSectionId,
                  type: latestVersion?.responseType || 'text',
                  order: newOrder
                };
                console.log('Created sectionQuestion:', sectionQuestion);
                
                // Update the survey state to ensure changes are saved - EXACTLY like handleSelectQuestions
                setSurvey((prevSurvey: any) => {
                  if (!prevSurvey) return prevSurvey;
                  
                  // Add to existing section questions
                  const updatedSectionQuestions = [
                    ...(prevSurvey.sectionQuestions || []),
                    sectionQuestion
                  ];
                  
                  console.log('Updated sectionQuestions:', updatedSectionQuestions);
                  
                  // Create updated survey with the new section question
                  return {
                    ...prevSurvey,
                    sectionQuestions: updatedSectionQuestions
                  };
                });
                
                // Trigger auto-save by setting hasChanges
                console.log('Setting hasChanges to true');
                // setHasChanges(true);
                
                // Close the question builder
                setShowQuestionBuilder(false);
                
                // Show success notification
                setAlert({
                  type: 'success',
                  message: 'Question created and added to section successfully!'
                });
                
                // Clear the alert after 3 seconds
                setTimeout(() => setAlert(null), 3000);
              } catch (error) {
                console.error('Error adding question to section:', error);
                
                // Show error notification
                setAlert({
                  type: 'error',
                  message: `Error adding question to section: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
                
                // Clear the alert after 4 seconds
                setTimeout(() => setAlert(null), 4000);
              }
            } else {
              console.error('Cannot add question to section: Missing section ID or survey ID', {
                currentSectionId,
                surveyId: survey?._id
              });
              
              // Show error notification
              setAlert({
                type: 'error',
                message: 'Cannot add question to section: Missing section ID or survey ID'
              });
              
              // Clear the alert after 4 seconds
              setTimeout(() => setAlert(null), 4000);
            }
          }}
        />
        
        {/* Section Editor Modal */}
        <SectionEditor
          isOpen={showSectionEditor}
          onClose={() => setShowSectionEditor(false)}
          section={currentSection}
          onSave={handleSaveSection}
        />
        
        {/* Theme creation modal (extracted component) */}
        <ThemeCreationModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          newThemeName={newThemeName}
          setNewThemeName={setNewThemeName}
          newThemeColor={newThemeColor}
          setNewThemeColor={setNewThemeColor}
          newThemeSecondaryColor={newThemeSecondaryColor}
          setNewThemeSecondaryColor={setNewThemeSecondaryColor}
          newThemeAccentColor={newThemeAccentColor}
          setNewThemeAccentColor={setNewThemeAccentColor}
          newThemeDescription={newThemeDescription}
          setNewThemeDescription={setNewThemeDescription}
          newThemeIsActive={newThemeIsActive}
          setNewThemeIsActive={setNewThemeIsActive}
          newThemeTemplateType={newThemeTemplateType}
          setNewThemeTemplateType={setNewThemeTemplateType}
          newThemeHeadingFont={newThemeHeadingFont}
          setNewThemeHeadingFont={setNewThemeHeadingFont}
          newThemeBodyFont={newThemeBodyFont}
          setNewThemeBodyFont={setNewThemeBodyFont}
          newThemeButtonStyle={newThemeButtonStyle}
          setNewThemeButtonStyle={setNewThemeButtonStyle}
          newThemeQuestionStyle={newThemeQuestionStyle}
          setNewThemeQuestionStyle={setNewThemeQuestionStyle}
          newThemeHeaderStyle={newThemeHeaderStyle}
          setNewThemeHeaderStyle={setNewThemeHeaderStyle}
          setAlert={setAlert}
          setHasUnsavedChanges={setHasUnsavedChanges}
          triggerAutoSave={() => triggerAutoSave()}
        />
        
        <Toast alert={alert} onClose={() => setAlert(null)} variant="emerald" zIndex={9001} />
        
        {/* Theme preview modal */}
        {showPreview && previewTheme && (
          <ThemePreview theme={previewTheme} open={showPreview} onClose={closePreview} />
        )}
        
        {/* Remove Logo Confirmation Modal */}
        {showRemoveLogoConfirm && (
          <div style={{
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
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
                Remove Logo
              </h3>
              <p style={{ margin: '0 0 24px 0', color: '#666', lineHeight: 1.5 }}>
                Are you sure you want to remove the survey logo? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowRemoveLogoConfirm(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSurvey({...survey, logo: null});
                    setHasUnsavedChanges(true);
                    triggerAutoSave();
                    setShowRemoveLogoConfirm(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remove Featured Image Confirmation Modal */}
        {showRemoveFeaturedImageConfirm && (
          <div style={{
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
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
                Remove Featured Image
              </h3>
              <p style={{ margin: '0 0 24px 0', color: '#666', lineHeight: 1.5 }}>
                Are you sure you want to remove the featured image? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowRemoveFeaturedImageConfirm(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSurvey({...survey, featuredImage: null});
                    setHasUnsavedChanges(true);
                    triggerAutoSave();
                    setShowRemoveFeaturedImageConfirm(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
        
      
      </DashboardBg>
    </AdminLayout>
  );
}

export default EnhancedSurveyBuilder;