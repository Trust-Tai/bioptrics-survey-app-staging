import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { FaEye } from 'react-icons/fa';
import { useNavigate, useParams, useLocation, UNSAFE_NavigationContext } from 'react-router-dom';
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
import QuestionBuilderSidePanel from '../../../features/questions/components/admin/QuestionBuilderSidePanel';
import { useQuestionBuilderPanel } from '../../../features/questions/contexts/QuestionBuilderPanelContext';
import SectionEditor from './sections/SectionEditor';
import ResponsesTab from './ResponsesTab';
import { SurveyAnalytics } from '/imports/features/analytics/components/admin';

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

// Define the steps for the survey builder
const steps = [
  { id: 'welcome', label: 'Survey Basics', icon: 'FiHome' },
  { id: 'sections', label: 'Questions', icon: 'FiLayers' },
  // { id: 'tags', label: 'Tags', icon: 'FiTag' },
  // { id: 'demographics', label: 'Demographics', icon: 'FiUsers' },
  { id: 'appearance', label: 'Appearance', icon: 'FiTag' },
  { id: 'responses', label: 'Responses', icon: 'FiMessageSquare' },
  { id: 'analyzeResults', label: 'Analyze Results', icon: 'FiBarChart2' },
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
             response.answers.some(ans => ans !== null && ans !== undefined && ans !== '');
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
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

interface EnhancedSurveyBuilderProps {
  surveyId?: string;
}

const EnhancedSurveyBuilder: React.FC<EnhancedSurveyBuilderProps> = ({ surveyId: propSurveyId }) => {
  const navigate = useNavigate();
  const { surveyId: paramSurveyId } = useParams<{ surveyId: string }>();
  
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
  const [activeStep, setActiveStep] = useState('welcome');
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
  const [sections, setSections] = useState<SurveySectionItem[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  
  // State for collaboration functionality
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState<boolean>(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState<string>('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<string>('editor');
  const [isAddingCollaborator, setIsAddingCollaborator] = useState<boolean>(false);
  
  // Always default to the welcome tab (Survey Basics) for new surveys
  useEffect(() => {
    if (!surveyId) {
      setActiveStep('welcome');
    }
  }, [surveyId]);
  const [saving, setSaving] = useState(false);
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
  const getTotalQuestionCount = (survey: any) => {
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

  // JSX namespace declaration for TypeScript
  declare namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  
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
  const renderNestedTagOptions = (layers: Layer[], selectedTagIds: string[] = []): JSX.Element[] => {
    const sortedRootTags = buildTagHierarchy(layers);
    
    // Function to render options recursively with proper indentation
    const renderOptions = (tags: any[], depth = 0): JSX.Element[] => {
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
          setSections(result.surveySections || []);
          
        // Replace the missing Meteor method call with a subscription to the questions.bySurvey publication
        const questionsSub = Meteor.subscribe('questions.bySurvey', surveyId);
        if (questionsSub.ready()) {
          // Fetch questions from the collection directly
          const questionsFromDB = Questions.find({}).fetch();
          
          // Map QuestionDoc objects to QuestionItem objects
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


  // Load collaborators when the Collaboration tab is selected
  useEffect(() => {
    if (activeStep === 'collaboration' && surveyId) {
      loadCollaborators();
    }
  }, [activeStep, surveyId]);

  // Function to load collaborators
  const loadCollaborators = () => {
    if (!surveyId) return;
    
    setIsLoadingCollaborators(true);
    Meteor.call('surveys.getCollaborators', surveyId, (error: any, result: any) => {
      setIsLoadingCollaborators(false);
      if (error) {
        console.error('Error loading collaborators:', error);
        showErrorAlert('Failed to load collaborators. Please try again.');
      } else {
        setCollaborators(result || []);
      }
    });
  };
  
  // Function to add a new collaborator
  const handleAddCollaborator = () => {
    if (!surveyId || !newCollaboratorEmail || !newCollaboratorRole) {
      showErrorAlert('Please enter an email address and select a role.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCollaboratorEmail)) {
      showErrorAlert('Please enter a valid email address.');
      return;
    }
    
    setIsAddingCollaborator(true);
    
    Meteor.call(
      'surveys.addCollaborator', 
      surveyId, 
      newCollaboratorEmail, 
      newCollaboratorRole,
      true, // Send email notification
      (error: any) => {
        setIsAddingCollaborator(false);
        
        if (error) {
          console.error('Error adding collaborator:', error);
          showErrorAlert(error.reason || 'Failed to add collaborator. Please try again.');
        } else {
          // Show success message
          showSuccessAlert(`Successfully added ${newCollaboratorEmail} as a collaborator.`);
          
          // Reset form fields
          setNewCollaboratorEmail('');
          setNewCollaboratorRole('editor');
          
          // Reload collaborators list
          loadCollaborators();
        }
      }
    );
  };
  
  // Function to remove a collaborator
  const handleRemoveCollaborator = (collaboratorId: string, email: string) => {
    if (!surveyId || !collaboratorId) return;
    
    if (window.confirm(`Are you sure you want to remove ${email} as a collaborator?`)) {
      Meteor.call('surveys.removeCollaborator', surveyId, collaboratorId, (error: any) => {
        if (error) {
          console.error('Error removing collaborator:', error);
          showErrorAlert(error.reason || 'Failed to remove collaborator. Please try again.');
        } else {
          showSuccessAlert(`Successfully removed ${email} as a collaborator.`);
          loadCollaborators();
        }
      });
    }
  };

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
      
      
      if (currentSurvey.surveySections && Array.isArray(currentSurvey.surveySections)) {
        setSections(currentSurvey.surveySections);
      } else if (currentSurvey.sections && Array.isArray(currentSurvey.sections)) {
        setSections(currentSurvey.sections);
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
      
      if (currentSurvey.thankYouBoxes && Array.isArray(currentSurvey.thankYouBoxes) && currentSurvey.thankYouBoxes.length > 0) {
        setThankYouBoxes(currentSurvey.thankYouBoxes);
      } else {
        // Ensure we have default boxes if none exist in the survey
        const defaultBoxes = [
          {
            title: 'Total Responses',
            subtitle: 'Total number of questions answered',
            icon: 'clipboard-check'
          }, {
            title: 'Unanswered Questions',
            subtitle: 'Number of skipped or empty answers',
            icon: 'question-circle'
          }, {
            title: 'Completion',
            subtitle: 'Text showing that the survey was completed',
            icon: 'check-circle'
          }, {
            title: 'Time Taken',
            subtitle: 'How long the user took to complete the survey',
            icon: 'clock'
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
  
  // Effect to handle changes in availableTags (when tags are activated/deactivated)
  // We're removing this effect entirely as it was causing the selected tags to be reset
  // The tag filtering should happen when displaying tags, not by modifying the selectedTags state
  // This ensures that tag selection persists regardless of which step we're on

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

  // Reference for the theme preview modal content
  const themePreviewContentRef = useRef<HTMLDivElement>(null);

  // Effect to handle click outside theme preview
  useEffect(() => {
    function handleClickOutsideThemePreview(event: MouseEvent) {
      if (
        showPreview && 
        themePreviewContentRef.current && 
        !themePreviewContentRef.current.contains(event.target as Node)
      ) {
        closePreview();
      }
    }
    
    // Add event listener when preview is open
    if (showPreview) {
      document.addEventListener('mousedown', handleClickOutsideThemePreview);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideThemePreview);
    };
  }, [showPreview]);

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
      }}
      onClick={(e) => {
        // Close when clicking on the overlay background
        if (e.target === e.currentTarget) {
          closePreview();
        }
      }}>
        <div ref={themePreviewContentRef} style={{
          backgroundColor: theme.backgroundColor || '#ffffff',
          borderRadius: 12,
          padding: 20,
          width: '80%',
          maxWidth: 800,
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          {/* <button 
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
          </button> */}
          
          <div style={{
            backgroundColor: theme.primaryColor || theme.color || '#552a47',
            padding: '20px',
            borderRadius: '8px 8px 0 0',
            marginBottom: '20px'
          }}>
            <h2  onClick={closePreview} style={{
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
            <p>This is how text will appear in your survey. The body font is {theme.bodyFont || 'Inter, sans-serif'} and the heading font is {theme.headingFont || 'Inter, sans-serif'}.</p>
            
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Sample Question</h4>
              <div style={{
                backgroundColor: theme.questionStyle === 'card' ? '#f9f9f9' : 'transparent',
                border: theme.questionStyle === 'bordered' ? `1px solid ${theme.accentColor || '#ddd'}` : 'none',
                padding: 15,
                borderRadius: 8,
                marginBottom: 15
              }}>
                <p>How would you rate your experience?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button key={num} style={{
                      backgroundColor: num === 3 ? theme.accentColor || theme.secondaryColor || '#f0e6ff' : 'transparent',
                      color: num === 3 ? '#fff' : theme.textColor || '#333',
                      border: `1px solid ${theme.accentColor || theme.secondaryColor || '#ddd'}`,
                      borderRadius: theme.buttonStyle === 'pill' ? '50px' : theme.buttonStyle === 'rounded' ? '8px' : '0',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
              <button style={{
                backgroundColor: 'transparent',
                color: theme.primaryColor || theme.color || '#552a47',
                border: `1px solid ${theme.primaryColor || theme.color || '#552a47'}`,
                borderRadius: theme.buttonStyle === 'pill' ? '50px' : theme.buttonStyle === 'rounded' ? '8px' : '0',
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
                borderRadius: theme.buttonStyle === 'pill' ? '50px' : theme.buttonStyle === 'rounded' ? '8px' : '0',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: theme.bodyFont || 'Inter, sans-serif'
              }}>
                Next
              </button>
            </div> */}
            
            <div style={{ marginTop: 30, borderTop: `1px solid ${theme.accentColor || theme.secondaryColor || '#ddd'}`, paddingTop: 20 }}>
              <h4 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Theme Properties</h4>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10
              }}>
                <li>
                  <strong>Primary Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.primaryColor || theme.color || '#552a47', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li>
                  <strong>Secondary Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.secondaryColor || '#8e44ad', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li>
                  <strong>Accent Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.accentColor || '#9b59b6', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li>
                  <strong>Background Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.backgroundColor || '#ffffff', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li>
                  <strong>Text Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.textColor || '#2c3e50', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li><strong>Heading Font:</strong> {theme.headingFont || 'Inter'}</li>
                <li><strong>Body Font:</strong> {theme.bodyFont || 'Inter'}</li>
                <li><strong>Layout:</strong> {theme.layout || 'default'}</li>
                <li><strong>Button Style:</strong> {theme.buttonStyle || 'Rounded'}</li>
                <li><strong>Question Style:</strong> {theme.questionStyle || 'Card'}</li>
                <li><strong>Header Style:</strong> {theme.headerStyle || 'Solid'}</li>
                <li><strong>Template Type:</strong> {theme.templateType || 'Custom'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Auto-save timer reference
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastUserActivity, setLastUserActivity] = useState<number>(Date.now());
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);
  
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
    
    // Set up periodic auto-save (every 2 minutes)
    const periodicSaveInterval = setInterval(() => {
      // Only save if there are unsaved changes and user has been inactive for at least 5 seconds
      const inactiveTime = Date.now() - lastUserActivity;
      if (hasUnsavedChanges && inactiveTime > 5000) {
        silentSave(true); // Pass true to indicate this is an auto-save
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
  
  // Get React Router location and navigation context
  const location = useLocation();
  const navigationContext = React.useContext(UNSAFE_NavigationContext);
  
  // Function to update last user activity timestamp
  // Only tracks activity without marking changes
  const updateUserActivity = () => {
    setLastUserActivity(Date.now());
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
      
      // Set a new timer for 5 seconds of inactivity before saving
      autoSaveTimerRef.current = setTimeout(() => {
        silentSave(true); // Pass true to indicate this is an auto-save
      }, 5000); // 5 seconds of inactivity
    }
  };
  
  // Silent save function that doesn't update UI or show notifications
  const silentSave = async (isAutoSave = false) => {
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
        // Call silentSave directly for immediate save instead of using trackContentChange
        silentSave(false).then(success => { // Use false for manual save to ensure it happens immediately
          if (success) {
            hasCreatedSurveyRef.current = true;
          }
        });
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
      silentSave(false).then(success => {
        if (success) {
          hasCreatedSurveyRef.current = true;
        }
      });
    }
  }, []);
  
  // Handle saving the survey
  const handleSaveSurvey = async (isAutoSave = false): Promise<boolean> => {
    try {
      setSaving(true);
      
      // Prepare survey data for saving
      
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
          textColor: selectedThemeObject.textColor || '#333',
          headingFont: selectedThemeObject.headingFont || 'Inter, sans-serif',
          bodyFont: selectedThemeObject.bodyFont || 'Inter, sans-serif'
        } : null,
        // Also store themeId directly for easier access
        themeId: selectedTheme || ''
        // Empty string for themeId will make the app use the default theme
      };
      
      const surveyData = {
        ...survey,
        title: survey?.title || 'Untitled Survey',
        description: survey?.description || '',
        logo: survey?.logo || '',
        image: survey?.image || '',
        primaryColor: selectedThemeObject?.primaryColor || selectedThemeObject?.color || survey?.primaryColor || '#552a47',
        welcomeTitle: survey?.welcomeTitle || '',
        welcomeMessage: survey?.welcomeMessage || '',
        completionMessage: survey?.completionMessage || '',
        // Include the updated defaultSettings
        defaultSettings,
        // Use surveySections instead of sections to match the server-side property name
        // Make sure to map section properties to match the expected server format
        surveySections: sections.map(section => ({
          id: section.id,
          name: section.name,
          description: section.description,
          isActive: section.isActive,
          priority: section.priority,
          color: section.color,
          instructions: section.instructions,
          isRequired: section.isRequired
        })),
        sectionQuestions: surveyQuestions,
        // Include demographics, themes, categories, and tags
        selectedTheme,
        selectedCategories,
        selectedTags,
        updatedAt: new Date(),
      };
      
      let savedSurveyId;
      
      if (surveyId) {
        await Meteor.callAsync('surveys.update', surveyId, surveyData);
        savedSurveyId = surveyId;
      } else {
        // Add creation date for new surveys
        const newSurveyData = {
          ...surveyData,
          createdAt: new Date(),
          createdBy: Meteor.userId() || 'anonymous',
          status: 'draft',
        };
        
        savedSurveyId = await Meteor.callAsync('surveys.saveDraft', newSurveyData);
        
        // Navigate to the edit page for the new survey
        navigate(`/admin/surveys/builder/${savedSurveyId}`);
      }
      
      // Set the lastSaved timestamp to update the save status indicator
      const now = Date.now();
      
      // Use a slight delay to ensure state updates are processed in the correct order
      // This helps React batch the updates properly
      setTimeout(() => {
        setLastSaved(now);
        setSaving(false);
        setHasUnsavedChanges(false);
        
        // Only show success message for manual saves, not auto-saves
        // if (!isAutoSave) {
        //   showSuccessAlert('Survey saved successfully!');
        // }
      }, 50);
      
      return true; // Return success
    } catch (error) {
      console.error('Error saving survey:', error);
      
      // Only show error for manual saves, not auto-saves
      if (!isAutoSave) {
        showErrorAlert(`Error saving survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setSaving(false);
      // Keep unsaved changes flag true since save failed
      setHasUnsavedChanges(true);
      
      return false; // Return failure
    }
  };
  
  // Set up navigation blocker for React Router
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    // Get the navigator object from context
    const navigator = navigationContext.navigator as any;
    
    // Save the original push method
    const originalPush = navigator.push;
    
    // Override the push method
    navigator.push = (to: any, state: any) => {
      const currentPath = location.pathname;
      const targetPath = typeof to === 'string' ? to : to.pathname;
      
      // Check if we're navigating away from the survey builder completely
      // This checks if we're leaving the /admin/surveys/builder route
      const isSurveyBuilderPath = currentPath.includes('/admin/surveys/builder');
      const isTargetSurveyBuilderPath = targetPath.includes('/admin/surveys/builder');
      
      // Only prompt if navigating away from survey builder to a different section
      if (isSurveyBuilderPath && !isTargetSurveyBuilderPath) {
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
        if (confirmed) {
          // Auto-save before navigating
          handleSaveSurvey(true).then(() => {
            // Restore original push and navigate
            navigator.push = originalPush;
            originalPush.call(navigator, to, state);
          });
        }
        return;
      }
      
      // If staying on survey builder or confirmed, proceed with navigation
      originalPush.call(navigator, to, state);
    };
    
    // Cleanup function to restore original push method
    return () => {
      navigator.push = originalPush;
    };
  }, [hasUnsavedChanges, location.pathname, navigationContext, navigate, handleSaveSurvey]);
  
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
      
      // Ensure React has processed the state update
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
          isRequired: section.isRequired !== undefined ? section.isRequired : false
        }))
      };
      
      // Save the survey directly with the updated sections
      console.log('Saving survey with updated sections...', updatedSurveyData.surveySections);
      
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
              setSections(updatedSurvey.surveySections);
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
    
    // First, ensure we're subscribed to the questions.all publication with the current surveyId
    // This ensures we get both global questions and survey-specific questions for this survey
    Meteor.subscribe('questions.all', surveyId, {
      onReady: () => {
        
        // Now that we're subscribed, fetch the questions
        const refreshedQuestions = Questions.find({}, { sort: { createdAt: -1 } }).fetch().map(q => {
          // Get the latest version to extract the response type and text
          const latestVersion = getLatestQuestionVersion(q);
          
          // Create a properly typed QuestionItem
          const questionItem: QuestionItem = {
            id: q._id || '',
            text: extractQuestionText(q), // Use our helper function to get clean question text
            type: latestVersion?.responseType || 'text',
            status: 'published'
          };
          
          // Log question details for debugging
          const isSurveySpecific = latestVersion?.saveToQuestionBank === false;
          return questionItem;
        });
        
        // Update the question selector items
        setQuestionSelectorItems(refreshedQuestions);
        setShowQuestionSelector(true);
      },
      onError: (error) => {
        console.error('Error subscribing to questions.all:', error);
        // Still show the selector with whatever questions we have
        setShowQuestionSelector(true);
      }
    });
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
              
              // Create updated survey with the new section question
              return {
                ...prevSurvey,
                sectionQuestions: updatedSectionQuestions
              };
            });
          } else {
            // For questions without a section, we don't need to update sectionQuestions
            // Just add the question to the survey's questions array if needed
            console.log('Question created without a section - no sectionQuestion needed');
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
    // Use questionSelectorItems if available, otherwise fall back to allQuestions
    const questionsSource = questionSelectorItems.length > 0 ? questionSelectorItems : allQuestions;
    
    // Get all selected questions from the source
    const selectedQuestions = questionsSource.filter(q => questionIds.includes(q.id));
    
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
      
      return questionItem;
    });
    
    // Update survey questions - remove existing questions for this section and add the new set
    setSurveyQuestions(prev => {
      // Keep questions from other sections
      const otherSectionQuestions = prev.filter(q => q.sectionId !== sectionId);
      
      // Combine with the new section questions
      const updatedQuestions = [...otherSectionQuestions, ...sectionQuestionItems];
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
      
      return updatedSurvey;
    });
    
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
    // Get questions for the section
    const sectionQuestions = surveyQuestions.filter(q => q.sectionId === sectionId);
    
    // Reorder the questions
    const reorderedQuestions = [...sectionQuestions];
    const [movedQuestion] = reorderedQuestions.splice(oldIndex, 1);
    reorderedQuestions.splice(newIndex, 0, movedQuestion);
    
    // Update the order property for each question
    const updatedQuestions = reorderedQuestions.map((q, index) => ({
      ...q,
      order: index
    }));
    
    // Update the questions in the database
    Meteor.call('surveys.updateQuestions', surveyId, updatedQuestions, (error: any) => {
      if (error) {
        console.error('Error reordering questions:', error);
        showErrorAlert('Failed to reorder questions.');
      } else {
        refreshSurveyData();
        // Mark as having changes that need to be saved
        trackContentChange();
      }
    });
  };

  // Handle reordering questions in the no-section area
  const handleReorderNoSectionQuestion = (oldIndex: number, newIndex: number) => {
    // Get questions for the no-section area
    const noSectionQuestions = surveyQuestions.filter(q => !q.sectionId);
    
    // Reorder the questions
    const reorderedQuestions = [...noSectionQuestions];
    const [movedQuestion] = reorderedQuestions.splice(oldIndex, 1);
    reorderedQuestions.splice(newIndex, 0, movedQuestion);
    
    // Update the order property for each question
    const updatedQuestions = reorderedQuestions.map((q, index) => ({
      ...q,
      order: index
    }));
    
    // Update the questions in the database
    Meteor.call('surveys.updateQuestions', surveyId, updatedQuestions, (error: any) => {
      if (error) {
        console.error('Error reordering no-section questions:', error);
        showErrorAlert('Failed to reorder questions.');
      } else {
        refreshSurveyData();
        // Mark as having changes that need to be saved
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

    // Update the questions in the database
    Meteor.call('surveys.updateQuestions', surveyId, updatedQuestions, (error: any) => {
      if (error) {
        console.error('Error moving question to no-section area:', error);
        showErrorAlert('Failed to move question.');
      } else {
        refreshSurveyData();
        // Mark as having changes that need to be saved
        trackContentChange();
      }
    });
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

    // Update the questions in the database
    Meteor.call('surveys.updateQuestions', surveyId, updatedQuestions, (error: any) => {
      if (error) {
        console.error('Error moving question to section:', error);
        showErrorAlert('Failed to move question.');
      } else {
        refreshSurveyData();
        // Mark as having changes that need to be saved
        trackContentChange();
      }
    });
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

    // Update the questions in the database
    Meteor.call('surveys.updateQuestions', surveyId, updatedQuestions, (error: any) => {
      if (error) {
        console.error('Error moving question between sections:', error);
        showErrorAlert('Failed to move question.');
      } else {
        refreshSurveyData();
        // Mark as having changes that need to be saved
        trackContentChange();
      }
    });
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
      if (!survey || !survey._id) {
        return;
      }
      
      // Prepare survey data with updated sections
      const surveyData = {
        title: String(survey.title || ''),
        description: String(survey.description || ''),
        status: String(survey.status || 'draft'),
        surveySections: updatedSections.map(section => ({
          id: String(section.id),
          name: String(section.name || ''),
          description: String(section.description || ''),
          priority: Number(section.priority || 0),
          displayOrder: Number(section.displayOrder || 0),
          isActive: Boolean(section.isActive !== undefined ? section.isActive : true),
          color: String(section.color || ''),
          instructions: String(section.instructions || ''),
          isRequired: Boolean(section.isRequired !== undefined ? section.isRequired : false)
        })),
        sectionQuestions: surveyQuestions.map(q => ({
          id: String(q.id),
          text: String(q.text || ''),
          type: String(q.type || ''),
          status: String(q.status || 'draft'),
          sectionId: String(q.sectionId || ''),
          order: Number(q.order || 0)
        })),
        selectedTheme: survey.selectedTheme || '',
        selectedCategories: Array.isArray(survey.categories) ? survey.categories : [],
        selectedTags: Array.isArray(selectedTags) ? selectedTags : []
      };
      
      // Call the server method to update the survey
      await Meteor.callAsync('surveys.update', survey._id, surveyData);
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
    } catch (error) {
    }
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
  
  // Get questions that don't belong to any section
  const noSectionQuestions = surveyQuestions.filter(q => !q.sectionId);
  
  // Render loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <DashboardBg>
          <Spinner />
        </DashboardBg>

        
        {/* Alert message for success/error */}
        {alert && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '12px 20px',
            borderRadius: 8,
            backgroundColor: alert.type === 'success' ? '#48bb78' : '#e53e3e',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'slideUp 0.3s ease-out'
          }}>
            {alert.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {alert.message}
          </div>
        )}
        
        {/* Theme Creation Modal */}
        {showThemeModal && (
          <div style={{ 
            position: 'fixed', 
            left: 0, 
            top: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(40,33,30,0.35)', 
            backdropFilter: 'blur(8px)',
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newThemeName.trim() || !newThemeWpsCategoryId) {
                  setAlert({ type: 'error', message: 'Please fill in all required fields.' });
                  setTimeout(() => setAlert(null), 4000);
                  return;
                }
                
                // Call the Meteor method to add a new theme
                Meteor.call('surveyThemes.insert', { 
                  name: newThemeName, 
                  color: newThemeColor, 
                  description: newThemeDescription, 
                  wpsCategoryId: newThemeWpsCategoryId,
                  assignableTo: newThemeAssignableTo,
                  keywords: newThemeKeywords,
                  priority: newThemePriority,
                  isActive: newThemeIsActive
                }, (err: any) => {
                  if (!err) {
                    // Reset form fields
                    setNewThemeName('');
                    setNewThemeColor('#552a47');
                    setNewThemeDescription('');
                    setNewThemeWpsCategoryId('');
                    setNewThemeAssignableTo(['questions', 'surveys']);
                    setNewThemeKeywords([]);
                    setNewThemePriority(0);
                    setNewThemeIsActive(true);
                    
                    // Show success message and close modal
                    setAlert({ type: 'success', message: 'Theme added successfully!' });
                    setTimeout(() => setAlert(null), 3000);
                    setShowThemeModal(false);
                  } else {
                    setAlert({ type: 'error', message: `Error adding theme: ${err.message}` });
                    setTimeout(() => setAlert(null), 4000);
                  }
                });
              }} 
              style={{ 
                background: '#ffffff',
                borderRadius: 24,
                padding: '32px',
                width: 520,
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(85,42,71,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                position: 'relative',
                border: '1px solid rgba(85,42,71,0.08)',
                animation: 'slideUp 0.3s ease-out'
              }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 8
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: newThemeColor || '#552a47',
                    boxShadow: `0 4px 12px ${newThemeColor || '#552a47'}40`,
                    transition: 'all 0.3s ease'
                  }} />
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontWeight: 700, 
                      color: '#28211e', 
                      fontSize: 24,
                      letterSpacing: '-0.02em'
                    }}>Add Theme</h3>
                    <p style={{ 
                      margin: '4px 0 0 0',
                      color: '#666',
                      fontSize: 14
                    }}>Create a new theme for surveys and questions</p>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                backgroundColor: '#fff'
              }}>
                {/* Theme Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>Theme Name</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={newThemeName}
                        onChange={e => setNewThemeName(e.target.value)}
                        placeholder="Enter theme name"
                        style={{ 
                          width: '100%',
                          height: 48,
                          padding: '0 16px',
                          fontSize: 15,
                          border: '1.5px solid #e5d6c7',
                          borderRadius: 10,
                          backgroundColor: '#fff',
                          color: '#28211e',
                          fontWeight: 500,
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </label>
                </div>
                
                {/* Theme Color */}
                <div>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>Theme Color</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="color"
                        value={newThemeColor}
                        onChange={e => setNewThemeColor(e.target.value)}
                        style={{ 
                          width: 48,
                          height: 48,
                          padding: 0,
                          border: '1.5px solid #e5d6c7',
                          borderRadius: 10,
                          backgroundColor: '#fff',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        value={newThemeColor}
                        onChange={e => setNewThemeColor(e.target.value)}
                        placeholder="#552a47"
                        style={{ 
                          width: '100%',
                          height: 48,
                          padding: '0 16px',
                          fontSize: 15,
                          border: '1.5px solid #e5d6c7',
                          borderRadius: 10,
                          backgroundColor: '#fff',
                          color: '#28211e',
                          fontWeight: 500,
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </label>
                </div>
                
                {/* Theme Description */}
                <div>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>Description</span>
                    <textarea
                      value={newThemeDescription}
                      onChange={e => setNewThemeDescription(e.target.value)}
                      placeholder="Enter theme description"
                      style={{ 
                        width: '100%',
                        height: 100,
                        padding: '12px 16px',
                        fontSize: 15,
                        border: '1.5px solid #e5d6c7',
                        borderRadius: 10,
                        backgroundColor: '#fff',
                        color: '#28211e',
                        fontWeight: 500,
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </label>
                </div>
                
                {/* WPS Category */}
                <div>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>WPS Category</span>
                    <select
                      value={newThemeWpsCategoryId}
                      onChange={e => {
                        setNewThemeWpsCategoryId(e.target.value);
                        setHasUnsavedChanges(true);
                        triggerAutoSave();
                      }}
                      style={{ 
                        width: '100%',
                        height: 48,
                        padding: '0 16px',
                        fontSize: 15,
                        border: '1.5px solid #e5d6c7',
                        borderRadius: 10,
                        backgroundColor: '#fff',
                        color: '#28211e',
                        fontWeight: 500,
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23552a47' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="">Select a WPS Category</option>
                      {wpsCategories.map((category: any) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              
              {/* Form Actions */}
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 16
              }}>
                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
                  style={{ 
                    height: 48,
                    padding: '0 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    border: '1.5px solid #e5d6c7',
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    color: '#28211e',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ 
                    height: 48,
                    padding: '0 32px',
                    fontSize: 15,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 10,
                    backgroundColor: '#552a47',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(85,42,71,0.2)'
                  }}
                >
                  Create Theme
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Alert message for success/error */}
        {alert && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '12px 20px',
            borderRadius: 8,
            backgroundColor: alert.type === 'success' ? '#48bb78' : '#e53e3e',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'slideUp 0.3s ease-out'
          }}>
            {alert.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {alert.message}
          </div>
        )}
        
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
              justifyContent: 'flex-end',
              position: 'relative',
              alignItems: 'center'
            }}>
              {/* Save indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: saving ? '#f39c12' : '#2ecc71',
                marginRight: '8px'
              }}>
                {saving ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                      </path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : showSavedMessage ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Saved</span>
                  </>
                ) : null}
              </div>
              
              {/* Save button removed - using only the main save button */}
              {/* Save Survey Button */}
              <button 
                onClick={() => handleSaveSurvey(false)}
                disabled={saving}
                className="action-button save-button"
                style={{
                  padding: '10px 15px',
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
                <FiSave style={{ fontSize: '16px' }} /> {saving ? 'Saving...' : 'Save'}
              </button>
              
              {/* Action Dropdown Button */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <div 
                  onClick={() => setShowActionDropdown(!showActionDropdown)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(85,42,71,0.1)';
                  }}
                >
                  &#8230;
                </div>
                
                {/* Dropdown Menu */}
                {showActionDropdown && (
                  <div 
                    className="action-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '200px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Preview Button */}
                    <div 
                      onClick={() => {
                        setShowActionDropdown(false);
                        if (!survey?._id) {
                          showErrorAlert('Please save the survey first before previewing.');
                          return;
                        }
                        
                        // Save current draft to localStorage
                        try {
                          // Get the token (either encrypted or share token)
                          const getToken = async () => {
                            try {
                              // Try to generate an encrypted token for the survey
                              const encryptedToken = await Meteor.callAsync('surveys.generateEncryptedToken', survey._id);
                              return encryptedToken;
                            } catch (error) {
                              console.error('Error generating encrypted token for preview:', error);
                              // Fallback to shareToken if available
                              if (survey.shareToken) {
                                return survey.shareToken;
                              }
                              throw new Error('Could not generate token for preview');
                            }
                          };
                          
                          getToken().then(token => {
                            // Prepare survey data for preview
                            const previewData = {
                              ...survey,
                              sections: sections,
                              sectionQuestions: surveyQuestions,
                              selectedTheme: selectedTheme,
                              selectedTags: selectedTags,
                              selectedCategories: selectedCategories
                            };
                            
                            // Save to localStorage
                            localStorage.setItem(`survey-preview-${token}`, JSON.stringify(previewData));
                            
                            // Open preview in new tab
                            const baseUrl = window.location.origin;
                            const previewUrl = `${baseUrl}/public/${token}?status=preview`;
                            window.open(previewUrl, '_blank');
                          }).catch(error => {
                            showErrorAlert(`Error preparing preview: ${error.message}`);
                          });
                        } catch (error) {
                          showErrorAlert(`Error preparing preview: ${error.message}`);
                        }
                      }}
                      className="dropdown-item"
                      style={{
                        padding: '12px 16px',
                        cursor: !survey?._id ? 'not-allowed' : 'pointer',
                        opacity: !survey?._id ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s ease',
                        color: '#000000'
                      }}
                      onMouseOver={(e) => {
                        if (survey?._id) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }}
                    >
                      Preview
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </div>
                    
                    {/* Publish Button */}
                    <div 
                      onClick={() => {
                        setShowActionDropdown(false);
                        handleGeneratePublicUrl();
                      }}
                      className="dropdown-item"
                      style={{
                        padding: '12px 16px',
                        cursor: !survey?._id ? 'not-allowed' : 'pointer',
                        opacity: !survey?._id ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s ease',
                        color: '#000000'
                      }}
                      onMouseOver={(e) => {
                        if (survey?._id) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }}
                    >
                      {isPublished ? 'Publish Again' : 'Publish'}
                    </div>
                    
                    {/* Copy URL Button - Only shows when publicUrl is available */}
                    {publicUrl && (
                      <div 
                        onClick={() => {
                          setShowActionDropdown(false);
                          navigator.clipboard.writeText(publicUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                          showSuccessAlert('URL copied to clipboard!');
                        }}
                        className="dropdown-item"
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background-color 0.2s ease',
                          color: '#000000'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff';
                        }}
                      >
                        Copy Link
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                    onClick={() => {
                      // Always trigger auto-save before changing tabs
                      // This ensures any changes are saved, even if hasUnsavedChanges is not set
                      silentSave(true).then(() => {
                        // Only change the tab after the save is complete
                        setActiveStep(step.id);
                      });
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
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <div>
                     
                    </div>
                  </div>
                  
                  <div 
                    className="survey-sections-container"
                  >
                    <style dangerouslySetInnerHTML={{ __html: `
                      .survey-section-wrapper {
                        margin-bottom: 16px;
                        transition: all 0.2s ease;
                      }
                      .survey-section-wrapper.dragging {
                        opacity: 0.5;
                      }
                      .survey-section-wrapper.drag-over {
                        position: relative;
                      }
                      .survey-section-wrapper.drag-over::before {
                        content: '';
                        position: absolute;
                        top: -8px;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background-color: #552a47;
                        border-radius: 2px;
                        z-index: 10;
                      }
                      .survey-section-add-question {
                        padding: 12px 16px;
                        background-color: #f9fafb;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border: 1px dashed #cbd5e1;
                      }
                      .survey-section-add-question:hover {
                        background-color: rgba(85, 42, 71, 0.05);
                        color: #552a47;
                      }
                      .question-item {
                        padding: 12px 16px;
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        margin-bottom: 12px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        transition: all 0.2s ease;
                      }
                      .question-item.dragging {
                        opacity: 0.5;
                      }
                      .question-item.drag-over {
                        position: relative;
                        box-shadow: 0 0 0 2px #552a47;
                      }
                      .survey-section-question {
                        transition: all 0.2s ease;
                      }
                      .survey-section-question.dragging {
                        opacity: 0.5;
                      }
                      .survey-section-question.drag-over {
                        position: relative;
                        box-shadow: 0 0 0 2px #552a47;
                      }
                      .no-section-questions {
                        transition: all 0.2s ease;
                      }
                      .no-section-questions.drag-over {
                        background-color: rgba(85, 42, 71, 0.05);
                        border-radius: 8px;
                        padding: 8px;
                      }
                      .survey-section.drag-over-section {
                        background-color: rgba(85, 42, 71, 0.05);
                        border-radius: 8px;
                        box-shadow: 0 0 0 2px #552a47;
                      }
                    `}} />
                    
                    {/* Display questions that don't belong to any section */}
                    <div 
                      className={`no-section-questions ${dragOverNoSection ? 'drag-over' : ''}`} 
                      style={{ marginBottom: '30px', padding: '8px' }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!draggingSectionIndex && draggingQuestionSectionId !== null) {
                          setDragOverNoSection(true);
                        }
                      }}
                      onDragLeave={() => {
                        setDragOverNoSection(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        // Handle drop of question from section to no-section area
                        if (draggingQuestionId && draggingQuestionSectionId) {
                          handleMoveQuestionToNoSection(draggingQuestionId, draggingQuestionSectionId);
                        }
                        setDragOverNoSection(false);
                        setDraggingQuestionId(null);
                        setDraggingQuestionSectionId(null);
                      }}
                    >
                      
                      {noSectionQuestions.length > 0 ? (
                        noSectionQuestions.map((question, index) => (
                          <div
                            key={question.id}
                            className={`question-item ${draggingQuestionId === question.id ? 'dragging' : ''} ${dragOverQuestionId === question.id ? 'drag-over' : ''}`}
                            draggable
                            onClick={() => handleEditQuestion(question.id, null)}
                            style={{ cursor: 'pointer' }}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', JSON.stringify({
                                questionId: question.id,
                                sectionId: null,
                                index
                              }));
                              setDraggingQuestionId(question.id);
                              setDraggingQuestionSectionId(null);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (draggingQuestionId !== question.id) {
                                setDragOverQuestionId(question.id);
                                setDragOverNoSection(false);
                              }
                            }}
                            onDragLeave={() => {
                              setDragOverQuestionId(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                              
                              // If dropping from no-section to no-section
                              if (data.sectionId === null && draggingQuestionId !== question.id) {
                                handleReorderNoSectionQuestion(data.index, index);
                              }
                              // If dropping from section to no-section
                              else if (data.sectionId !== null) {
                                handleMoveQuestionToNoSection(data.questionId, index);
                              }
                              
                              setDragOverQuestionId(null);
                              setDraggingQuestionId(null);
                              setDraggingQuestionSectionId(null);
                              setDragOverNoSection(false);
                            }}
                            onDragEnd={() => {
                              setDraggingQuestionId(null);
                              setDraggingQuestionSectionId(null);
                              setDragOverQuestionId(null);
                              setDragOverNoSection(false);
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div 
                                style={{ paddingRight: '8px', cursor: 'grab' }}
                                onClick={(e) => e.stopPropagation()} // Prevent triggering edit when clicking drag handle
                              >
                                <FiMove size={16} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 500 }}>{question.text}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                  {question.type}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the container's onClick
                                  handleEditQuestion(question.id, null);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#666',
                                  padding: '4px'
                                }}
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the container's onClick
                                  handleRemoveQuestion(question.id, null);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#666',
                                  padding: '4px'
                                }}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center', 
                          color: '#666',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          marginBottom: '20px'
                        }}>
                          <p>No questions added yet. Use the buttons below to add questions.</p>
                        </div>
                      )}
                                          {/* Display sections */}
                    {sections.length > 0 ? (
                      <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Sections</h3>
                        {sections.map((section, index) => (
                          <div 
                            key={section.id}
                            className={`survey-section-wrapper ${draggingSectionIndex === index ? 'dragging' : ''} ${dragOverSectionIndex === index ? 'drag-over' : ''}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', index.toString());
                              setDraggingSectionIndex(index);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (draggingSectionIndex !== index) {
                                setDragOverSectionIndex(index);
                              }
                            }}
                            onDragLeave={() => {
                              setDragOverSectionIndex(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
                              if (sourceIndex !== index) {
                                handleReorderSection(sourceIndex, index);
                              }
                              setDraggingSectionIndex(null);
                              setDragOverSectionIndex(null);
                            }}
                            onDragEnd={() => {
                              setDraggingSectionIndex(null);
                              setDragOverSectionIndex(null);
                            }}
                          >
                            <EnhancedSurveySection
                              section={section}
                              questions={surveyQuestions.filter(q => q.sectionId === section.id)}
                              onEditSection={handleEditSection}
                              onDeleteSection={handleDeleteSection}
                              onAddQuestion={handleAddQuestion}
                              onCreateQuestion={handleCreateQuestion}
                              onRemoveQuestion={handleRemoveQuestion}
                              onEditQuestion={handleEditQuestion}
                              onReorderQuestion={handleReorderQuestion}
                              onMoveQuestionToSection={handleMoveQuestionToSection}
                              onMoveQuestionBetweenSections={handleMoveQuestionBetweenSections}
                              draggingQuestionId={draggingQuestionId}
                              draggingQuestionSectionId={draggingQuestionSectionId}
                              setDraggingQuestionId={setDraggingQuestionId}
                              setDraggingQuestionSectionId={setDraggingQuestionSectionId}
                              dragOverSectionId={dragOverSectionId}
                              setDragOverSectionId={setDragOverSectionId}
                              dragOverQuestionId={dragOverQuestionId}
                              setDragOverQuestionId={setDragOverQuestionId}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 20, textAlign: 'center', color: '#666', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'none'}}>
                        <p>No sections added yet. Use the 'Add Section' button to create sections.</p>
                      </div>
                    )}
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '16px' }}>
                       <div 
                          className="survey-section-add-question"
                          onClick={handleAddSection}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiPlus size={16} /> Add Section
                        </div>
                        <div 
                          className="survey-section-add-question"
                          onClick={() => handleAddQuestion(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiPlus size={16} /> Choose from Question Bank
                        </div>
                        <div 
                          className="survey-section-add-question"
                          onClick={() => handleCreateQuestion(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiPlus size={16} /> Create Question
                        </div>
                      </div>
                    </div>
                    

                  </div>
                </div>
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
                  <div className="survey-builder-panel-content">
                    <div className="form-group">
                      <label htmlFor="surveyTitle">Title</label>
                      <input
                        type="text"
                        id="surveyTitle"
                        className="form-control"
                        value={survey?.title || ''}
                        onChange={(e) => {
                          setSurvey({...survey, title: e.target.value});
                          setHasUnsavedChanges(true);
                          triggerAutoSave();
                        }}
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
                            setHasUnsavedChanges(true);
                            triggerAutoSave();
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
                    <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 15, color: '#555', margin: '0 0 16px 0' }}>
                      Select tags to associate with this survey. Tags help with filtering and organizing surveys.
                    </p>
                    
                    <div className="form-group">
                      <label htmlFor="surveyTags">Select Tags</label>
                      <div style={{ position: 'relative', zIndex: 1000 }}>
                        <CreatableSelect
                          id="surveyTags"
                          name="surveyTags"
                          isMulti
                          closeMenuOnSelect={false}
                          hideSelectedOptions={true}
                          options={selectOptions}
                          value={selectOptions.filter(option => selectedTags.includes(option.value))}
                          onChange={(selected) => {
                            if (Array.isArray(selected)) {
                              setSelectedTags(selected.map(option => option.value));
                              triggerAutoSave(); // Trigger auto-save when tags change
                            }
                          }}
                          onCreateOption={(inputValue) => {
                            // Call Meteor method to create a new tag
                            Meteor.call('layers.create', {
                              name: inputValue,
                              color: 'rgb(85, 42, 71)',
                              active: true,
                              location: 'Surveys',
                              fields: [], // Required empty array for fields
                              id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate a unique ID
                            }, (error: Meteor.Error, newTagId: string) => {
                              if (error) {
                                setAlert({ type: 'error', message: `Error creating tag: ${error.message}` });
                                setTimeout(() => setAlert(null), 5000);
                                return;
                              }
                              
                              // Add the new tag to selected tags
                              setSelectedTags([...selectedTags, newTagId]);
                              triggerAutoSave(); // Trigger auto-save when new tag is created
                              setAlert({ type: 'success', message: `Tag "${inputValue}" created successfully!` });
                              setTimeout(() => setAlert(null), 3000);
                            });
                          }}
                          components={{
                            Option: CustomOption
                          }}
                          styles={{
                            option: (base, state) => ({
                              ...base,
                              fontFamily: 'monospace',
                              whiteSpace: 'pre',
                              backgroundColor: state.isFocused ? '#f0f0f0' : '#ffffff' // White background for options
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 9999,
                              width: '100%',  // Make dropdown full width
                              backgroundColor: '#ffffff' // White background for menu
                            }),
                            menuList: (base) => ({
                              ...base,
                              width: '100%',  // Ensure menu list is also full width
                              backgroundColor: '#ffffff' // White background for menu list
                            })
                          }}
                          formatCreateLabel={(inputValue) => `Create this tag: "${inputValue}"`}
                          classNamePrefix="react-select"
                        />
                      </div>
                      <style dangerouslySetInnerHTML={{ __html: `
                        .survey-builder-panel, .survey-builder-panel-header, .survey-builder-container {
                          overflow: visible !important;
                        }
                        .tag-select option {
                          white-space: pre !important;
                          font-family: monospace !important;
                        }
                        .ts-dropdown { 
                          z-index: 1050 !important; 
                          max-height: 400px !important;
                          overflow-y: auto !important;
                        }
                        .ts-wrapper { 
                          z-index: 1001 !important; 
                          width: 100% !important;
                        }
                        .ts-dropdown .option { 
                          font-family: monospace !important;
                          white-space: pre !important;
                        }
                        .ts-wrapper.multi .ts-control > div {
                          margin: 0 3px 3px 0;
                          padding: 2px 6px;
                        }
                        .ts-wrapper.plugin-remove_button .item .remove {
                          border-left: 1px solid #d0d0d0;
                          padding: 0 6px;
                        }
                        .ts-wrapper.multi .ts-control {
                          padding: 8px 8px 3px 8px;
                        }
                      `}} />
                    </div>
                    
                    <div style={{ marginTop: 20 }}>
                      <p style={{ fontSize: 14, color: '#666' }}>
                        <strong>Selected Tags:</strong> {selectedTags.length > 0 
                          ? selectedTags.map(tagId => {
                              const tag = availableTags.find(t => t._id === tagId);
                              return tag ? tag.name : '';
                            }).join(', ')
                          : 'No tags selected'}
                      </p>
                    </div>
                  </div>
                    

                    
                    <div className="form-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={async () => {
                          handleSaveSurvey(false);
                          silentSave(true).then(() => {
                            // Only change the tab after the save is complete
                            setActiveStep('sections');
                          });
                          // Always save the survey data before navigating, regardless of hasUnsavedChanges flag
                          // This ensures the survey is always saved when clicking Save and Continue
                          try {
                            // Show saving indicator
                            setSaving(true);
                            
                            // Wait for the save operation to complete
                            const saveResult = await silentSave(false); // Use false to indicate this is not an auto-save
                            
                            if (saveResult) {
                              // Explicitly update UI to show changes are saved
                              // This ensures the save status is correctly reflected
                              setHasUnsavedChanges(false);
                              setLastSaved(Date.now());
                              
                              // Add a small delay before navigation to ensure UI updates are visible
                              // This gives React time to render the "Changes saved" state
                              setTimeout(() => {
                                // Navigate to the next tab
                                setActiveStep('sections');
                              }, 300);
                            } else {
                              // If save failed, don't navigate
                              setSaving(false);
                            }
                          } catch (error) {
                            console.error('Error saving survey:', error);
                            // Show error alert
                            showErrorAlert(`Error saving survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            // Reset saving state on error
                            setSaving(false);
                          }
                        }}
                      >
                        Save and Continue
                      </button>
                    </div>
                  </div>
                </div>
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
              ) : activeStep === 'analyzeResults' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">Analyze Results</h2>
                  </div>
                  
                  {survey?._id ? (
                    <div style={{ margin: '-1.5rem', width: '100%', marginLeft: '0' }}>
                      <SurveyAnalytics surveyId={survey._id} embedded={true} />
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      <p>Please save the survey first to view analytics.</p>
                    </div>
                  )}
                </div>
              ) : activeStep === 'appearance' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">
                      {steps.find(step => step.id === activeStep)?.label}
                    </h2>
                    <button 
                        onClick={() => setShowThemeModal(true)}
                        style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8, 
                          background: '#552a47', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 8, 
                          fontWeight: 700, 
                          padding: '0 22px', 
                          fontSize: 14, 
                          height: 38, 
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: 18, marginRight: 2 }}>+</span>
                        Add Theme
                      </button>
                  </div>
                  
                  <div>
                  {/* Survey Appearance Settings Section */}
                  <div style={{ 
                    marginBottom: '24px', 
                    padding: '16px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      marginBottom: '16px', 
                      color: '#343a40',
                      borderBottom: '1px solid #dee2e6',
                      paddingBottom: '8px'
                    }}>
                      Survey Branding
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      {/* Logo Upload */}
                      <div className="appearance-item">
                        <label htmlFor="surveyLogo" style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#495057'
                        }}>
                          Logo
                        </label>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '10px'
                        }}>
                          <div className="file-upload-container" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px'
                          }}>
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
                                    setHasUnsavedChanges(true);
                                    triggerAutoSave();
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              accept="image/*"
                            />
                            <label htmlFor="surveyLogo" className="file-upload-button" style={{ 
                              backgroundColor: '#552a47', 
                              color: '#ffffff',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'inline-block',
                              margin: 0
                            }}>
                              Choose Logo
                            </label>
                            <span style={{ 
                              fontSize: '13px', 
                              color: '#6c757d',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {survey?.logo ? 'Logo selected' : 'No file selected'}
                            </span>
                          </div>
                          {survey?.logo && (
                            <div className="image-preview" style={{ 
                              padding: '8px', 
                              border: '1px solid #dee2e6', 
                              borderRadius: '4px',
                              backgroundColor: '#ffffff',
                              display: 'inline-block'
                            }}>
                              <img 
                                src={survey.logo} 
                                alt="Logo Preview" 
                                style={{ maxWidth: '180px', maxHeight: '80px' }} 
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Featured Image Upload */}
                      <div className="appearance-item">
                        <label htmlFor="surveyFeaturedImage" style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#495057'
                        }}>
                          Featured Image
                        </label>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '10px'
                        }}>
                          <div className="file-upload-container" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px'
                          }}>
                            <input
                              type="file"
                              id="surveyFeaturedImage"
                              className="file-input"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const result = event.target?.result as string;
                                    setSurvey((prevSurvey) => {
                                      setHasUnsavedChanges(true);
                                      triggerAutoSave();
                                      return {
                                        ...prevSurvey,
                                        image: result
                                      };
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              accept="image/*"
                            />
                            <label htmlFor="surveyFeaturedImage" className="file-upload-button" style={{ 
                              backgroundColor: '#552a47', 
                              color: '#ffffff',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'inline-block',
                              margin: 0
                            }}>
                              Choose Image
                            </label>
                            <span style={{ 
                              fontSize: '13px', 
                              color: '#6c757d',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {survey?.image ? 'Image selected' : 'No file selected'}
                            </span>
                          </div>
                          {survey?.image && (
                            <div className="image-preview" style={{ 
                              padding: '8px', 
                              border: '1px solid #dee2e6', 
                              borderRadius: '4px',
                              backgroundColor: '#ffffff',
                              display: 'inline-block'
                            }}>
                              <img 
                                src={survey.image} 
                                alt="Featured Image Preview" 
                                style={{ maxWidth: '180px', maxHeight: '120px' }} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Survey Layout Settings Section */}
                  <div style={{ 
                    marginBottom: '24px', 
                    padding: '16px 16px 32px 16px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      marginBottom: '16px', 
                      color: '#343a40',
                      borderBottom: '1px solid #dee2e6',
                      paddingBottom: '8px'
                    }}>
                      Survey Layout
                    </h3>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#495057', marginBottom: '12px' }}>
                        Select how questions will be displayed to respondents.
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <label style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          padding: '16px', 
                          border: `2px solid ${survey?.layout === 'multiStep' || !survey?.layout ? '#552a47' : '#dee2e6'}`,
                          borderRadius: '8px',
                          backgroundColor: survey?.layout === 'multiStep' || !survey?.layout ? 'rgba(85, 42, 71, 0.05)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          height: '100%',
                          boxShadow: survey?.layout === 'multiStep' || !survey?.layout ? '0 2px 8px rgba(85, 42, 71, 0.1)' : 'none'
                        }}>
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ fontWeight: 600, fontSize: '16px' }}>Multi Step</div>
                            <input 
                              type="radio" 
                              name="surveyLayout" 
                              value="multiStep" 
                              checked={survey?.layout === 'multiStep' || !survey?.layout}
                              onChange={() => {
                                setSurvey({...survey, layout: 'multiStep'});
                                // Save the survey to ensure layout is persisted
                                if (surveyId) {
                                  Meteor.call('surveys.update', surveyId, { layout: 'multiStep' }, (error: any) => {
                                    if (error) {
                                      console.error('Error saving survey layout:', error);
                                    }
                                  });
                                }
                              }}
                              style={{
                                accentColor: '#552a47',
                                cursor: 'pointer',
                                width: '18px',
                                height: '18px'
                              }}
                            />
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '80px', 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: '6px', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            marginBottom: '12px',
                            border: '1px solid #e9ecef'
                          }}>
                            <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="10" y="10" width="100" height="10" rx="2" fill="#552a47" fillOpacity="0.7" />
                              <rect x="10" y="25" width="100" height="5" rx="1" fill="#dee2e6" />
                              <rect x="10" y="35" width="60" height="5" rx="1" fill="#dee2e6" />
                              <rect x="10" y="45" width="30" height="5" rx="1" fill="#dee2e6" />
                            </svg>
                          </div>
                          <div style={{ fontSize: '13px', color: '#6c757d', textAlign: 'center' }}>
                            Questions are shown step-by-step, one section at a time.
                          </div>
                        </label>
                        
                        <label style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          padding: '16px', 
                          border: `2px solid ${survey?.layout === 'allOnOnePage' ? '#552a47' : '#dee2e6'}`,
                          borderRadius: '8px',
                          backgroundColor: survey?.layout === 'allOnOnePage' ? 'rgba(85, 42, 71, 0.05)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          height: '100%',
                          boxShadow: survey?.layout === 'allOnOnePage' ? '0 2px 8px rgba(85, 42, 71, 0.1)' : 'none'
                        }}>
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ fontWeight: 600, fontSize: '16px' }}>All on One Page</div>
                            <input 
                              type="radio" 
                              name="surveyLayout" 
                              value="allOnOnePage" 
                              checked={survey?.layout === 'allOnOnePage'}
                              onChange={() => {
                                setSurvey({...survey, layout: 'allOnOnePage'});
                                // Save the survey to ensure layout is persisted
                                if (surveyId) {
                                  Meteor.call('surveys.update', surveyId, { layout: 'allOnOnePage' }, (error: any) => {
                                    if (error) {
                                      console.error('Error saving survey layout:', error);
                                    }
                                  });
                                }
                              }}
                              style={{
                                accentColor: '#552a47',
                                cursor: 'pointer',
                                width: '18px',
                                height: '18px'
                              }}
                            />
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '80px', 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: '6px', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            marginBottom: '12px',
                            border: '1px solid #e9ecef'
                          }}>
                            <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="10" y="5" width="100" height="8" rx="2" fill="#552a47" fillOpacity="0.7" />
                              <rect x="10" y="18" width="100" height="4" rx="1" fill="#dee2e6" />
                              <rect x="10" y="27" width="100" height="4" rx="1" fill="#dee2e6" />
                              <rect x="10" y="36" width="60" height="4" rx="1" fill="#dee2e6" />
                              <rect x="10" y="45" width="80" height="4" rx="1" fill="#dee2e6" />
                              <rect x="10" y="54" width="40" height="4" rx="1" fill="#dee2e6" />
                            </svg>
                          </div>
                          <div style={{ fontSize: '13px', color: '#6c757d', textAlign: 'center' }}>
                            Displays all questions on a single page, like a traditional form.
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <p style={{ fontSize: 15, margin: 0 }}>
                        Select a theme for your survey. The theme will affect the appearance and feel of your survey.
                      </p>
                    </div>
                    
                    {/* Display currently selected theme or default indicator */}
                    {(
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 16,
                        padding: '8px 12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, marginRight: '8px' }}>Currently Selected:</span>
                          <span style={{
                            backgroundColor: selectedTheme ? '#edf2f7' : '#f0fff4',
                            color: selectedTheme ? '#4a5568' : '#276749',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            border: selectedTheme ? 'none' : '1px dashed #68d391'
                          }}>
                            {selectedTheme 
                              ? (surveyThemes.find((theme: any) => theme._id === selectedTheme)?.name || 'Unknown Theme')
                              : 'Default Theme (System)'
                            }
                          </span>
                        </div>
                        {selectedTheme ? (
                          <button 
                            onClick={() => {
                              setSelectedTheme('');
                              setSurvey({...survey, selectedTheme: ''});
                              setHasUnsavedChanges(true);
                              triggerAutoSave();
                            }}
                            style={{
                              backgroundColor: '#fff',
                              border: '1px solid #e53e3e',
                              color: '#e53e3e',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Unselect theme and revert to default"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Unselect Theme
                          </button>
                        ) : (
                          <span style={{
                            fontSize: '12px',
                            color: '#718096',
                            fontStyle: 'italic'
                          }}>
                            Using system default colors and fonts
                          </span>
                        )}
                      </div>
                    )}
                    
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
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                      {getFilteredAndPaginatedThemes().paginatedThemes.map((theme: any) => {
                        const isSelected = selectedTheme === theme._id;
                        
                        return (
                          <div 
                            key={theme._id} 
                            onClick={() => {
                              setSelectedTheme(theme._id);
                              setSurvey({...survey, selectedTheme: theme._id});
                              setHasUnsavedChanges(true);
                              triggerAutoSave();
                            }}
                            style={{ 
                              cursor: 'pointer',
                              borderRadius: 12,
                              border: `1px solid ${isSelected ? theme.color || '#552a47' : '#e2e8f0'}`,
                              background: '#fff',
                              overflow: 'hidden',
                              transition: 'all 0.2s',
                              boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 6px rgba(0, 0, 0, 0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%'
                            }}
                          >
                            {/* Theme color header */}
                            <div style={{
                              height: 120,
                              background: theme.primaryColor || theme.color
                                ? (theme.headerStyle === 'gradient' && theme.secondaryColor)
                                  ? `linear-gradient(135deg, ${theme.primaryColor || theme.color}, ${theme.secondaryColor})`
                                  : theme.primaryColor || theme.color
                                : '#552a47',
                              position: 'relative'
                            }}>
                              {isSelected && (
                                <div style={{
                                  position: 'absolute',
                                  top: 10,
                                  right: 10,
                                  background: 'rgba(85, 42, 71, 0.9)',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  fontSize: 12,
                                  fontWeight: 500
                                }}>
                                  Selected
                                </div>
                              )}
                            </div>
                            
                            {/* Theme content */}
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1 }}>
                              {/* Theme name and description */}
                              <div>
                                <h3 style={{ 
                                  margin: 0,
                                  fontWeight: 600, 
                                  fontSize: 18,
                                  color: '#1a202c',
                                  marginBottom: 4
                                }}>
                                  {theme.name}
                                </h3>
                                <p style={{ 
                                  margin: 0,
                                  fontSize: 14, 
                                  color: '#718096',
                                  lineHeight: 1.5
                                }}>
                                  {theme.description || 'No description'}
                                </p>
                              </div>
                              
                              {/* Theme color dots */}
                              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                {theme.primaryColor && (
                                  <div style={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: '50%', 
                                    backgroundColor: theme.primaryColor,
                                    border: '1px solid #e5e7eb'
                                  }} title="Primary Color" />
                                )}
                                {!theme.primaryColor && theme.color && (
                                  <div style={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: '50%', 
                                    backgroundColor: theme.color,
                                    border: '1px solid #e5e7eb'
                                  }} title="Primary Color" />
                                )}
                                {theme.secondaryColor && (
                                  <div style={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: '50%', 
                                    backgroundColor: theme.secondaryColor,
                                    border: '1px solid #e5e7eb'
                                  }} title="Secondary Color" />
                                )}
                                {theme.accentColor && (
                                  <div style={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: '50%', 
                                    backgroundColor: theme.accentColor,
                                    border: '1px solid #e5e7eb'
                                  }} title="Accent Color" />
                                )}
                              </div>
                              
                              {/* Theme tags */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                {theme.templateType && (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 12,
                                    background: '#f7fafc',
                                    border: '1px solid #e2e8f0',
                                    fontSize: 12,
                                    color: '#4a5568'
                                  }}>
                                    {theme.templateType}
                                  </span>
                                )}
                                {theme.buttonStyle && (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 12,
                                    background: '#f7fafc',
                                    border: '1px solid #e2e8f0',
                                    fontSize: 12,
                                    color: '#4a5568'
                                  }}>
                                    {theme.buttonStyle}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Theme actions */}
                            <div style={{ 
                              padding: '12px 16px',
                              borderTop: '1px solid #e2e8f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
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
                                  gap: 6,
                                  padding: '6px 12px',
                                  fontSize: 14,
                                  color: '#4a5568',
                                  background: 'transparent',
                                  border: '1px solid #cbd5e0',
                                  borderRadius: 6,
                                  cursor: 'pointer'
                                }}
                              >
                                <FaEye size={14} /> Preview
                              </button>
                              
                              {isSelected ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTheme('');
                                    setSurvey({...survey, selectedTheme: ''});
                                    setHasUnsavedChanges(true);
                                    triggerAutoSave();
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    padding: '6px 12px',
                                    fontSize: 14,
                                    color: '#fff',
                                    background: theme.color || '#552a47',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Unselect
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTheme(theme._id);
                                    setSurvey({...survey, selectedTheme: theme._id});
                                    setHasUnsavedChanges(true);
                                    triggerAutoSave();
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    padding: '6px 12px',
                                    fontSize: 14,
                                    color: '#fff',
                                    background: theme.color || '#552a47',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Use Theme
                                </button>
                              )}
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
                  {/* Thank you screen manage dyanamic */}
                  <div className="survey-section" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#2d3748' }}>Thank You Screen</h3>
                      <p style={{ marginBottom: '16px', color: '#4a5568', fontSize: '14px' }}>
                        Customize the message that appears when users complete your survey.
                      </p>
                      
                      {/* Thank You Icon Upload */}
                      <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="thankYouIcon" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }}>
                          Thank You Icon
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            border: '1px dashed #cbd5e0', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f7fafc',
                            overflow: 'hidden'
                          }}>
                            {thankYouIcon ? (
                              <img 
                                src={thankYouIcon} 
                                alt="Thank You Icon" 
                                style={{ maxWidth: '100%', maxHeight: '100%' }} 
                              />
                            ) : (
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div>
                            <input
                              type="file"
                              id="thankYouIconUpload"
                              style={{ display: 'none' }}
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const result = event.target?.result as string;
                                    setThankYouIcon(result);
                                    // Update the survey state to ensure changes are saved
                                    setSurvey((prevSurvey: any) => {
                                      if (!prevSurvey) return prevSurvey;
                                      return {
                                        ...prevSurvey,
                                        thankYouIcon: result
                                      };
                                    });
                                    setHasUnsavedChanges(true);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <button 
                                type="button" 
                                onClick={() => document.getElementById('thankYouIconUpload')?.click()}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#552a47',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  marginBottom: '8px'
                                }}
                              >
                                Upload Icon
                              </button>
                              {/* Only show remove icon when an icon exists */}
                              {thankYouIcon && (
                                <div 
                                  onClick={() => {
                                    // Set thankYouIcon to null to indicate it should be removed
                                    setThankYouIcon(null);
                                    // Update the survey state
                                    setSurvey((prevSurvey: any) => {
                                      if (!prevSurvey) return prevSurvey;
                                      return {
                                        ...prevSurvey,
                                        thankYouIcon: null
                                      };
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fee2e2',
                                    color: '#e53e3e',
                                    cursor: 'pointer',
                                    marginBottom: '8px'
                                  }}
                                  title="Remove Icon"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p style={{ fontSize: '13px', color: '#718096', margin: 0 }}>
                              Recommended size: 128x128px
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Thank You Title */}
                      <div className="form-group">
                        <label htmlFor="thankYouTitle" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }}>
                          Thank You Title
                        </label>
                        <div style={{ padding: '0 20px 0 0' }}>
                          <input
                            type="text"
                            id="thankYouTitle"
                            value={thankYouTitle}
                            onChange={(e) => {
                              setThankYouTitle(e.target.value);
                              // Update the survey state to ensure changes are saved
                              setSurvey((prevSurvey: any) => {
                                if (!prevSurvey) return prevSurvey;
                                return {
                                  ...prevSurvey,
                                  thankYouTitle: e.target.value
                                };
                              });
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: '16px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                      

                      
                      {/* Thank You Details - This is the only Thank You Message box we keep */}
                      <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="thankYouDetails" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }}>
                          Thank You Details
                        </label>
                        <div style={{ padding: '0 20px 0 0' }}>
                          <textarea
                            id="thankYouDetails"
                            value={thankYouDetails}
                            onChange={(e) => {
                              setThankYouDetails(e.target.value);
                              // Update the survey state to ensure changes are saved
                              setSurvey((prevSurvey: any) => {
                                if (!prevSurvey) return prevSurvey;
                                return {
                                  ...prevSurvey,
                                  thankYouDetails: e.target.value
                                };
                              });
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              minHeight: '80px',
                              fontSize: '14px',
                              resize: 'vertical',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Thank You Boxes Configuration */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontWeight: 600, color: '#2d3748' }}>
                            Survey Summary Stats (Optional)
                          </label>
                          <div 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: '20px', 
                              height: '20px', 
                              borderRadius: '50%', 
                              backgroundColor: '#552a47', 
                              cursor: 'pointer',
                              position: 'relative',
                              boxShadow: '0 2px 4px rgba(85, 42, 71, 0.2)',
                              transition: 'all 0.2s ease',
                              marginTop: '1px'
                            }}
                            onMouseEnter={(e) => {
                              const tooltip = e.currentTarget.querySelector('.tooltip-content');
                              if (tooltip) {
                                tooltip.style.visibility = 'visible';
                                tooltip.style.opacity = '1';
                                tooltip.style.transform = 'translateX(-50%) translateY(0)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              const tooltip = e.currentTarget.querySelector('.tooltip-content');
                              if (tooltip) {
                                tooltip.style.visibility = 'hidden';
                                tooltip.style.opacity = '0';
                                tooltip.style.transform = 'translateX(-50%) translateY(5px)';
                              }
                            }}
                          >
                            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>?</span>
                            <div 
                              className="tooltip-content"
                              style={{ 
                                position: 'absolute', 
                                bottom: 'calc(100% + 10px)', 
                                left: '50%', 
                                transform: 'translateX(-50%) translateY(5px)', 
                                backgroundColor: '#552a47', 
                                color: 'white', 
                                padding: '10px 14px', 
                                borderRadius: '6px', 
                                width: '280px', 
                                fontSize: '13px', 
                                lineHeight: '1.4',
                                visibility: 'hidden', 
                                opacity: 0, 
                                transition: 'opacity 0.3s, visibility 0.3s, transform 0.3s', 
                                zIndex: 999,
                                pointerEvents: 'none',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                fontWeight: 400,
                                letterSpacing: '0.2px',
                                textAlign: 'left'
                              }}
                            >
                              These are optional summary stats that participants will see on the final thank you screen after submitting a survey.
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: '50%', 
                                transform: 'translateX(-50%)', 
                                borderLeft: '8px solid transparent', 
                                borderRight: '8px solid transparent', 
                                borderTop: '8px solid #552a47',
                                filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))'
                              }}></div>
                            </div>
                          </div>
                        </div>
                        <p style={{ marginBottom: '16px', color: '#4a5568', fontSize: '14px' }}>
                          Configure the statistics boxes that appear on the thank you screen.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                          {thankYouBoxes.map((box, index) => (
                            <div key={index} style={{ 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '8px',
                              padding: '16px',
                              backgroundColor: '#fff',
                              overflow: 'hidden' // Prevent content from going outside the box
                            }}>
                              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Box {index + 1}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#4a5568' }}>
                                    <input
                                      type="checkbox"
                                      checked={box.selected}
                                      onChange={(e) => {
                                        const newBoxes = [...thankYouBoxes];
                                        newBoxes[index].selected = e.target.checked;
                                        setThankYouBoxes(newBoxes);
                                        // Update the survey state
                                        setSurvey((prevSurvey: any) => {
                                          if (!prevSurvey) return prevSurvey;
                                          return {
                                            ...prevSurvey,
                                            thankYouBoxes: newBoxes
                                          };
                                        });
                                        setHasUnsavedChanges(true);
                                      }}
                                      style={{ 
                                        marginRight: '6px',
                                        accentColor: '#552a47', // Theme color for checkbox
                                        width: '16px',
                                        height: '16px'
                                      }}
                                    />
                                    <span style={{ color: '#552a47', fontWeight: 500 }}>Display to participant?</span>
                                  </label>
                                </div>
                              </div>
                              
                              {/* Box Title */}
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#4a5568' }}>
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={box.title}
                                  onChange={(e) => {
                                    const newBoxes = [...thankYouBoxes];
                                    newBoxes[index].title = e.target.value;
                                    setThankYouBoxes(newBoxes);
                                    // Update the survey state
                                    setSurvey((prevSurvey: any) => {
                                      if (!prevSurvey) return prevSurvey;
                                      return {
                                        ...prevSurvey,
                                        thankYouBoxes: newBoxes
                                      };
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box', // Ensure padding is included in width calculation
                                    overflow: 'hidden', // Prevent text from overflowing
                                    textOverflow: 'ellipsis' // Show ellipsis for overflowing text
                                  }}
                                />
                              </div>
                              
                              {/* Box Subtitle */}
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#4a5568' }}>
                                  Subtitle
                                </label>
                                <input
                                  type="text"
                                  value={box.subtitle}
                                  onChange={(e) => {
                                    const newBoxes = [...thankYouBoxes];
                                    newBoxes[index].subtitle = e.target.value;
                                    setThankYouBoxes(newBoxes);
                                    // Update the survey state
                                    setSurvey((prevSurvey: any) => {
                                      if (!prevSurvey) return prevSurvey;
                                      return {
                                        ...prevSurvey,
                                        thankYouBoxes: newBoxes
                                      };
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box', // Ensure padding is included in width calculation
                                    overflow: 'hidden', // Prevent text from overflowing
                                    textOverflow: 'ellipsis' // Show ellipsis for overflowing text
                                  }}
                                />
                              </div>
                              
                              {/* Icon selection removed as requested */}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Preview Button */}
                      <div style={{ marginTop: '30px', marginBottom: '20px' }}>
                        <button 
                          onClick={() => setShowThankYouPreview(!showThankYouPreview)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#552a47',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'none',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.03711 12.3224C2.03711 12.3224 5.03711 5.32239 12.0371 5.32239C19.0371 5.32239 22.0371 12.3224 22.0371 12.3224C22.0371 12.3224 19.0371 19.3224 12.0371 19.3224C5.03711 19.3224 2.03711 12.3224 2.03711 12.3224Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12.0371 15.3224C13.6939 15.3224 15.0371 13.9793 15.0371 12.3224C15.0371 10.6656 13.6939 9.32239 12.0371 9.32239C10.3802 9.32239 9.03711 10.6656 9.03711 12.3224C9.03711 13.9793 10.3802 15.3224 12.0371 15.3224Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {showThankYouPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                      </div>
                      
                      {/* Preview Section */}
                      {showThankYouPreview && (
                        <div style={{ marginTop: '10px' }}>
                          <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600, color: '#2d3748' }}>Preview</h4>
                          <div style={{ 
                            padding: '20px',
                            backgroundColor: '#fff',
                            textAlign: 'center',
                            maxWidth: '800px',
                            margin: '0 auto'
                          }}>
                            <div style={{ marginBottom: '30px' }}>
                              {thankYouIcon ? (
                                <img 
                                  src={thankYouIcon} 
                                  alt="Thank You Icon" 
                                  style={{ width: '80px', height: '80px', marginBottom: '20px' }} 
                                />
                              ) : (
                                <div style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  borderRadius: '50%',
                                  backgroundColor: '#f8f0f4',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 20px'
                                }}>
                                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#552a47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                              <div style={{ padding: '0 20px', maxWidth: '700px', margin: '0 auto', boxSizing: 'border-box' }}>
                                <h3 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '16px', color: '#552a47' }}>
                                  {thankYouTitle || 'Thank You!'}
                                </h3>
                                <div style={{ marginBottom: '30px', color: '#4a5568', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
                                  {thankYouDetails || 'Your responses have been successfully submitted. We appreciate your time and feedback.'}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
                              {thankYouBoxes.map((box, index) => (
                                <div key={index} style={{ 
                                  padding: '20px', 
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                  display: 'flex',
                                  alignItems: 'flex-start'
                                }}>
                                  <div style={{ textAlign: 'left', flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 600, color: '#552a47' }}>
                                      {index === 0 ? '1' : index === 1 ? '3' : index === 2 ? '0%' : '3 min 42 sec'}
                                    </h4>
                                    <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: 500 }}>
                                      {box.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#718096' }}>
                                      {box.subtitle}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                        
                    <div style={{ marginTop: '16px', fontSize: '13px', color: '#718096' }}>
                      <p>This preview shows how your thank you screen will appear to users after they complete the survey.</p>
                    </div>
                </div>
              ) : activeStep === 'collaboration' ? (
                <div className="panel">
                  <div className="panel-header">
                    <h2>Collaboration</h2>
                    <p className="text-muted">Manage collaborators for this survey</p>
                  </div>
                  <div className="panel-body">
                    <p style={{ fontSize: 15, color: '#555', margin: '0 0 16px 0' }}>
                      Add collaborators to allow other users to work on this survey. Collaborators can edit, preview, and manage the survey based on their assigned role.
                    </p>
                    
                    {/* Collaborator Search and Add Section */}
                    <div style={{ 
                      marginBottom: 24,
                      padding: 20,
                      backgroundColor: '#f5edf3',
                      borderRadius: 12,
                      border: '1px solid #e5d6e2'
                    }}>
                      <h3 style={{ 
                        fontSize: 16, 
                        fontWeight: 600, 
                        color: '#552a47',
                        marginTop: 0,
                        marginBottom: 16
                      }}>
                        Add New Collaborator
                      </h3>
                      
                      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 3 }}>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                            Email Address
                          </label>
                          <input 
                            type="email" 
                            value={newCollaboratorEmail}
                            onChange={(e) => {
                              setNewCollaboratorEmail(e.target.value);
                              setHasUnsavedChanges(true);
                              triggerAutoSave();
                            }}
                            placeholder="Enter email address"
                            style={{
                              width: '93%',
                              padding: '8px 12px',
                              border: '1px solid #e0e0e0',
                              borderRadius: 6,
                              fontSize: 14
                            }}
                          />
                        </div>
                        <div style={{ flex: 2 }}>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                            Role
                          </label>
                          <select
                            value={newCollaboratorRole}
                            onChange={(e) => {
                              setNewCollaboratorRole(e.target.value);
                              setHasUnsavedChanges(true);
                              triggerAutoSave();
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e0e0e0',
                              borderRadius: 6,
                              fontSize: 14,
                              backgroundColor: '#fff'
                            }}
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <button
                            onClick={handleAddCollaborator}
                            disabled={isAddingCollaborator || !newCollaboratorEmail}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 16px',
                              backgroundColor: '#552a47',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 14,
                              fontWeight: 500,
                              cursor: isAddingCollaborator || !newCollaboratorEmail ? 'not-allowed' : 'pointer',
                              opacity: isAddingCollaborator || !newCollaboratorEmail ? 0.7 : 1
                            }}
                          >
                            {isAddingCollaborator ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Adding...</span>
                              </>
                            ) : (
                              <>
                                <FiUserPlus size={16} />
                                <span>Add Collaborator</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Current Collaborators List */}
                    <div>
                      <h3 style={{ 
                        fontSize: 16, 
                        fontWeight: 600, 
                        color: '#552a47',
                        marginTop: 0,
                        marginBottom: 16
                      }}>
                        Current Collaborators
                      </h3>
                      
                      {/* Table Header */}
                      <div style={{
                        display: 'flex',
                        padding: '12px 16px',
                        backgroundColor: '#f9f9f9',
                        borderBottom: '2px solid #e0e0e0',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#333'
                      }}>
                        <div style={{ flex: 2 }}>Email</div>
                        <div style={{ flex: 1 }}>Name</div>
                        <div style={{ flex: 1 }}>Role</div>
                        <div style={{ flex: 1 }}>Added On</div>
                        <div style={{ width: 100, textAlign: 'center' }}>Actions</div>
                      </div>
                      
                      {/* Loading State */}
                      {isLoadingCollaborators && (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: '#666' }}>
                          <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                          <div style={{ marginTop: 12 }}>Loading collaborators...</div>
                        </div>
                      )}
                      
                      {/* Empty State */}
                      {!isLoadingCollaborators && collaborators.length === 0 && (
                        <div style={{ 
                          padding: '32px 0', 
                          textAlign: 'center', 
                          color: '#666',
                          backgroundColor: '#f9f9f9',
                          borderRadius: 8,
                          margin: '16px 0'
                        }}>
                          <FiUsers size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                          <div>No collaborators yet</div>
                          <div style={{ fontSize: 14, marginTop: 8 }}>Add collaborators using the form above</div>
                        </div>
                      )}
                      
                      {/* Collaborator Rows */}
                      {!isLoadingCollaborators && collaborators.map((collaborator) => (
                        <div 
                          key={collaborator.userId} 
                          style={{
                            display: 'flex',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e0e0e0',
                            fontSize: 14,
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ flex: 2 }}>{collaborator.email}</div>
                          <div style={{ flex: 1 }}>{collaborator.name || '-'}</div>
                          <div style={{ flex: 1 }}>
                            <span style={{ 
                              padding: '4px 8px',
                              backgroundColor: collaborator.role === 'editor' ? '#f5edf3' : '#e3f2fd',
                              color: collaborator.role === 'editor' ? '#552a47' : '#1565c0',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 500
                            }}>
                              {collaborator.role === 'editor' ? 'Editor' : 'Viewer'}
                            </span>
                          </div>
                          <div style={{ flex: 1 }}>
                            {collaborator.addedAt ? new Date(collaborator.addedAt).toLocaleDateString() : '-'}
                          </div>
                          <div style={{ width: 100, textAlign: 'center' }}>
                            <button
                              onClick={() => handleRemoveCollaborator(collaborator.userId)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                padding: '4px 8px',
                                backgroundColor: '#fff',
                                color: '#d32f2f',
                                border: '1px solid #d32f2f',
                                borderRadius: 4,
                                fontSize: 12,
                                cursor: 'pointer'
                              }}
                            >
                              <FiTrash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
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
                                  allowRetake: !currentValue,
                                  // Keep retakeMode if it exists, otherwise default to 'replace'
                                  retakeMode: defaultSettings.retakeMode || 'replace'
                                }
                              };
                              setSurvey(updatedSurvey);
                              setHasUnsavedChanges(true);
                              triggerAutoSave();
                            }}
                            style={{ 
                              width: 18, 
                              height: 18,
                              accentColor: '#552a47'
                            }}
                          />
                          Allow Survey Retake
                        </label>
                        <div style={{ marginLeft: 24, fontSize: 14, color: '#666', marginTop: 4 }}>
                          When enabled, users can restart the survey after completion
                        </div>
                        
                        {/* Retake mode options - only show when Allow Survey Retake is enabled */}
                        {survey?.defaultSettings?.allowRetake !== false && (
                          <div style={{ marginLeft: 24, marginTop: 12, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#4a5568' }}>
                              How should retakes be handled?
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="retakeMode"
                                  checked={survey?.defaultSettings?.retakeMode !== 'new'}
                                  onChange={() => {
                                    const defaultSettings = survey.defaultSettings || {};
                                    setSurvey({
                                      ...survey,
                                      defaultSettings: {
                                        ...defaultSettings,
                                        retakeMode: 'replace'
                                      }
                                    });
                                    setHasUnsavedChanges(true);
                                    triggerAutoSave();
                                  }}
                                  style={{ accentColor: '#552a47' }}
                                />
                                <span>Replace original response</span>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="retakeMode"
                                  checked={survey?.defaultSettings?.retakeMode === 'new'}
                                  onChange={() => {
                                    const defaultSettings = survey.defaultSettings || {};
                                    setSurvey({
                                      ...survey,
                                      defaultSettings: {
                                        ...defaultSettings,
                                        retakeMode: 'new'
                                      }
                                    });
                                    setHasUnsavedChanges(true);
                                    triggerAutoSave();
                                  }}
                                  style={{ accentColor: '#552a47' }}
                                />
                                <span>Add as new response</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeStep !== 'sections' && activeStep !== 'appearance' && activeStep !== 'settings' && activeStep !== 'questions' && activeStep !== 'welcome' && (
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
        
        {/* Theme creation modal */}
        {showThemeModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.35)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newThemeName) {
                  setAlert({ type: 'error', message: 'Theme name is required' });
                  return;
                }
                
                Meteor.call('surveyThemes.insert', {
                  name: newThemeName,
                  color: newThemeColor,
                  secondaryColor: newThemeSecondaryColor,
                  accentColor: newThemeAccentColor,
                  description: newThemeDescription,
                  isActive: newThemeIsActive,
                  templateType: newThemeTemplateType,
                  headingFont: newThemeHeadingFont,
                  bodyFont: newThemeBodyFont,
                  buttonStyle: newThemeButtonStyle,
                  questionStyle: newThemeQuestionStyle,
                  headerStyle: newThemeHeaderStyle
                }, (error: Error | null, result: string) => {
                  if (error) {
                    setAlert({ type: 'error', message: error.message });
                  } else {
                    setAlert({ type: 'success', message: 'Theme created successfully' });
                    // Reset form fields
                    setNewThemeName('');
                    setNewThemeColor('#552a47');
                    setNewThemeSecondaryColor('#8e44ad');
                    setNewThemeAccentColor('#9b59b6');
                    setNewThemeDescription('');
                    setNewThemeWpsCategoryId('');
                    setNewThemeAssignableTo(['questions', 'surveys']);
                    setNewThemeKeywords([]);
                    setNewThemePriority(0);
                    setNewThemeIsActive(true);
                    setNewThemeTemplateType('Custom');
                    setNewThemeHeadingFont('Inter');
                    setNewThemeBodyFont('Inter');
                    setNewThemeButtonStyle('Rounded');
                    setNewThemeQuestionStyle('Card');
                    setNewThemeHeaderStyle('Solid');
                    // Close modal
                    setShowThemeModal(false);
                  }
                });
              }}
              style={{ background: '#fff', borderRadius: 24, padding: 32, width: 800, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(85,42,71,0.2)', display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', border: '1px solid rgba(85,42,71,0.08)', animation: 'slideUp 0.3s ease-out' }}
            >
              <button 
                type="button" 
                onClick={() => setShowThemeModal(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#28211e', opacity: 0.5, padding: 8 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="#28211e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#28211e', margin: 0, marginBottom: 8 }}>Create New Theme</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 20 }}>
                <div>
                  <label htmlFor="themeName" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Theme Name*</label>
                  <input
                    id="themeName"
                    type="text"
                    value={newThemeName}
                    onChange={(e) => {
                      setNewThemeName(e.target.value);
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                    placeholder="Enter theme name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="themeColor" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Primary Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      id="themeColor"
                      type="color"
                      value={newThemeColor}
                      onChange={(e) => {
                        setNewThemeColor(e.target.value);
                        setHasUnsavedChanges(true);
                        triggerAutoSave();
                      }}
                      style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newThemeColor}
                      onChange={(e) => {
                        setNewThemeColor(e.target.value);
                        setHasUnsavedChanges(true);
                        triggerAutoSave();
                      }}
                      placeholder="#552a47"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="themeSecondaryColor" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Secondary Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      id="themeSecondaryColor"
                      type="color"
                      value={newThemeSecondaryColor}
                      onChange={(e) => {
                        setNewThemeSecondaryColor(e.target.value);
                        setHasUnsavedChanges(true);
                        triggerAutoSave();
                      }}
                      style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newThemeSecondaryColor}
                      onChange={(e) => {
                        setNewThemeSecondaryColor(e.target.value);
                        setHasUnsavedChanges(true);
                        triggerAutoSave();
                      }}
                      placeholder="#8e44ad"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="themeAccentColor" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      id="themeAccentColor"
                      type="color"
                      value={newThemeAccentColor}
                      onChange={(e) => {
                        setNewThemeAccentColor(e.target.value);
                        setHasUnsavedChanges(true);
                        triggerAutoSave();
                      }}
                      style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newThemeAccentColor}
                      onChange={(e) => {
                        setNewThemeAccentColor(e.target.value);
                        setHasUnsavedChanges(true);
                        triggerAutoSave();
                      }}
                      placeholder="#9b59b6"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="themeDescription" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Description</label>
                  <textarea
                    id="themeDescription"
                    value={newThemeDescription}
                    onChange={(e) => {
                      setNewThemeDescription(e.target.value);
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                    placeholder="Enter theme description"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, minHeight: 80, resize: 'vertical' }}
                  />
                </div>
                
                <div>
                  <label htmlFor="themeTemplateType" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Template Type</label>
                  <select
                    id="themeTemplateType"
                    value={newThemeTemplateType}
                    onChange={(e) => {
                      setNewThemeTemplateType(e.target.value);
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
                  >
                    <option value="Custom">Custom</option>
                    <option value="Standard">Standard</option>
                    <option value="Modern">Modern</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="themeHeadingFont" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Heading Font</label>
                  <select
                    id="themeHeadingFont"
                    value={newThemeHeadingFont}
                    onChange={(e) => {
                      setNewThemeHeadingFont(e.target.value);
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="themeBodyFont" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Body Font</label>
                  <select
                    id="themeBodyFont"
                    value={newThemeBodyFont}
                    onChange={(e) => {
                      setNewThemeBodyFont(e.target.value);
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="themeButtonStyle" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Button Style</label>
                  <select
                    id="themeButtonStyle"
                    value={newThemeButtonStyle}
                    onChange={(e) => {
                      setNewThemeButtonStyle(e.target.value);
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
                  >
                    <option value="Rounded">Rounded</option>
                    <option value="Square">Square</option>
                    <option value="Pill">Pill</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="themeQuestionStyle" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Question Style</label>
                  <select
                    id="themeQuestionStyle"
                    value={newThemeQuestionStyle}
                    onChange={(e) => {
                      setNewThemeQuestionStyle(e.target.value);
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
                  >
                    <option value="Card">Card</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Outlined">Outlined</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="themeHeaderStyle" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Header Style</label>
                  <select
                    id="themeHeaderStyle"
                    value={newThemeHeaderStyle}
                    onChange={(e) => {
                      setNewThemeHeaderStyle(e.target.value);
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
                  >
                    <option value="Solid">Solid</option>
                    <option value="Gradient">Gradient</option>
                    <option value="Transparent">Transparent</option>
                  </select>
                </div>
                
                {/* Active checkbox removed as requested */}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
                  style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#552a47', color: '#fff', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}
                >
                  Create Theme
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Alert message */}
        {alert && (
          <div 
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              padding: '12px 20px',
              borderRadius: 8,
              backgroundColor: alert.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1001,
              animation: 'fadeIn 0.3s ease-out',
              alignItems: 'center',
              gap: 10
            }}
          >
            {alert.type === 'success' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span>{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                marginLeft: 10,
                cursor: 'pointer',
                fontSize: 18,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        )}
        
        {/* Theme preview modal */}
        {showPreview && previewTheme && <ThemePreview theme={previewTheme} />}
        
        {/* Question Builder Side Panel is now managed by QuestionBuilderPanelContext provider */}
      </DashboardBg>
    </AdminLayout>
  );
}

// Styled components for stats bar
// const StatsContainer = styled.div`
//   display: grid;
//   grid-template-columns: repeat(6, 1fr);
//   gap: 16px;
//   margin-bottom: 24px;
//   background-color: #f8fafc;
//   border-radius: 8px;
//   padding: 16px;
//   border: 1px solid #e2e8f0;
// `;

// const QuestionItem = styled.div`
//   margin-bottom: 16px;
//   background-color: #f8fafc;
//   border-radius: 8px;
//   overflow: hidden;
//   border: 1px solid #e2e8f0;
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   transition: all 0.2s ease;
//   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
//   &:hover {
//     box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
//     border-color: #cbd5e1;
//   }
// `;

export default EnhancedSurveyBuilder;