import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { FaEye } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FiUser, FiCalendar, FiMessageSquare, FiDownload, FiBarChart2, FiSettings, FiPlus, FiX, FiCheck, FiTrash2, FiEdit, FiChevronRight, FiChevronDown, FiChevronUp, FiSave } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import '../../../ui/styles/quill-styles';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import DashboardBg from '../../../ui/admin/DashboardBg';
import { Layers, Layer } from '../../../api/layers';
import { FaUsers, FaTags, FaChartPie, FaHeart, FaClock, FaPercentage } from 'react-icons/fa';

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
  // For incomplete responses, we count the number of answered questions
  const answeredQuestions = responses.filter(response => 
    response && (response.answer !== undefined || response.answers !== undefined)
  ).length;
  
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
`;

const QuestionItem = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e2e8f0;
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionName = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
`;

const QuestionTitle = styled.div`
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const AnswerText = styled.div`
  font-size: 14px;
  color: #334155;
  background-color: #ffffff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
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

const EnhancedSurveyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  
  // State for the survey builder
  const [expandedResponseIds, setExpandedResponseIds] = useState<string[]>([]);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [activeStep, setActiveStep] = useState('welcome');
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
  const [sections, setSections] = useState<SurveySectionItem[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  
  // Create a default Welcome section for new surveys
  useEffect(() => {
    // Only create default section if this is a new survey (no surveyId) and no sections exist yet
    if (!surveyId && sections.length === 0) {
      const defaultSection: SurveySectionItem = {
        id: `section-${Date.now()}`,
        name: 'Welcome',
        description: 'Default section for your survey questions',
        priority: 0,  // Changed from order to priority to match the interface
        isActive: true  // Required property in the SurveySectionItem interface
      };
      setSections([defaultSection]);
      
      // Automatically navigate to the sections tab for new surveys
      setActiveStep('sections');
    }
  }, [surveyId, sections.length]);
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
  
  // Styled components for response stats
  const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    margin-bottom: 24px;
    width: 100%;
  `;

  // Styled components for response details
  const ResponseDetailsContainer = styled.div`
    padding: 16px 24px;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-top: 1px solid #e2e8f0;
    margin-bottom: 8px;
    width: 100%;
    grid-column: 1 / -1; /* Make it span all columns */
  `;

  const QuestionItem = styled.div`
    padding: 12px 16px;
    border-radius: 6px;
    background-color: white;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #edf2f7;
  `;

  const SectionName = styled.div`
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;

  const QuestionTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
  `;

  const AnswerText = styled.div`
    font-size: 14px;
    color: #475569;
    line-height: 1.5;
  `;

  const ExpandButton = styled.button`
    display: flex;
    align-items: center;
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f1f5f9;
      color: #334155;
    }
  `;
  
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
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<SurveySectionItem | undefined>(undefined);
  
  // State for public URL and published status
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  // Removed showPublicUrl state as we no longer need the popup
  
  // Load survey responses when the responses tab is active
  useEffect(() => {
    if (activeStep === 'responses' && surveyId) {
      setIsLoadingResponses(true);
      console.log('Loading responses for survey:', surveyId);
      
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
            console.log(`Found ${completedResponses.length} completed responses for survey ${surveyId}`);
            
            // Fetch incomplete responses for this survey
            const incompleteResponses = IncompleteSurveyResponses.find({ 
              surveyId,
              isCompleted: false
            }).fetch();
            console.log(`Found ${incompleteResponses.length} incomplete responses for survey ${surveyId}`);
            
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
              ...incompleteResponses.map(response => ({
                _id: response._id,
                respondentName: 'Anonymous',
                email: 'No email provided',
                submittedAt: response.lastUpdatedAt,
                isComplete: false,
                progress: response.responses ? 
                  Math.round((response.responses.length / (surveyQuestions.length || 1)) * 100) : 0,
                responses: response.responses || [],
                timeToComplete: 0,
                engagementScore: response.engagementScore || calculateEngagementScore({...response, isCompleted: false, responses: response.responses || []})
              }))
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
            
            // Calculate completion rate
            const completedCount = formattedResponses.filter(r => r.isComplete).length;
            const completionRate = totalResponses > 0 ? Math.round((completedCount / totalResponses) * 100) : 0;
            
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
            console.log('Set formatted responses:', formattedResponses.length);
            
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
        
        // No need to manually update React Select as it's controlled by state
        console.log('Tags will be displayed in React Select via state');
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
            ✨ Create this tag: "{data.label}"
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
  
  // Memoized select options
  const selectOptions = React.useMemo(() => {
    return prepareSelectOptions(availableTags);
  }, [availableTags]);
  
  // Effect to handle changes in availableTags (when tags are activated/deactivated)
  useEffect(() => {
    if (activeStep === 'tags') {
      // Get currently active tag IDs
      const activeTagIds = availableTags.filter(tag => tag.active).map(tag => tag._id);
      
      // Update the selected tags to remove any that are now inactive
      const updatedSelectedTags = selectedTags.filter(tagId => activeTagIds.includes(tagId));
      
      // Update state if needed
      if (updatedSelectedTags.length !== selectedTags.length) {
        setSelectedTags(updatedSelectedTags);
      }
    }
  }, [availableTags, activeStep, selectedTags]);

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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
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
            </div>
            
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

  // Handle saving the survey
  const handleSaveSurvey = async () => {
    try {
      setSaving(true);
      
      // Prepare survey data for saving
      // Log the current state of survey questions before saving
      console.log('Saving survey with questions:', surveyQuestions);
      
      // Find the complete theme object based on selectedTheme ID
      const selectedThemeObject = selectedTheme ? surveyThemes.find((theme: any) => theme._id === selectedTheme) : null;
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
                      onChange={e => setNewThemeWpsCategoryId(e.target.value)}
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
                        Loading sections...
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
                    <h2 className="survey-builder-panel-title">Survey Basics</h2>
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
                          hideSelectedOptions={false}
                          options={selectOptions}
                          value={selectOptions.filter(option => selectedTags.includes(option.value))}
                          onChange={(selected) => {
                            if (Array.isArray(selected)) {
                              setSelectedTags(selected.map(option => option.value));
                            } else {
                              setSelectedTags([]);
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
                              whiteSpace: 'pre'
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 9999
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
                        onClick={() => setActiveStep('sections')}
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
              ) : activeStep === 'demographics' ? (
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
              ) : activeStep === 'responses' ? (
                <div className="survey-builder-panel">
                  <div className="survey-builder-panel-header">
                    <h2 className="survey-builder-panel-title">Survey Responses</h2>
                    <p className="survey-builder-panel-subtitle">
                      View all responses received for this survey
                    </p>
                  </div>
                  
                  <div className="survey-responses-container" style={{ padding: '20px' }}>
                    {isLoadingResponses ? (
                      <Spinner />
                    ) : surveyResponses.length > 0 ? (
                      <div>
                        {/* Stats Summary Bar */}
                        <StatsContainer>
                          <StatCard>
                            <IconContainer color="#4285F4">
                              <FaUsers />
                            </IconContainer>
                            <StatContent>
                              <StatValue>{responseStats.totalResponses}</StatValue>
                              <StatLabel>Total Responses</StatLabel>
                            </StatContent>
                          </StatCard>
                          
                          <StatCard>
                            <IconContainer color="#0F9D58">
                              <FaTags />
                            </IconContainer>
                            <StatContent>
                              <StatValue>{responseStats.totalTags}</StatValue>
                              <StatLabel>Total Tags</StatLabel>
                            </StatContent>
                          </StatCard>
                          
                          <StatCard>
                            <IconContainer color="#AA47BC">
                              <FaChartPie />
                            </IconContainer>
                            <StatContent>
                              <StatValue>{responseStats.completionRate}%</StatValue>
                              <StatLabel>Completion Rate</StatLabel>
                            </StatContent>
                          </StatCard>
                          
                          <StatCard>
                            <IconContainer color="#F4B400">
                              <FaHeart />
                            </IconContainer>
                            <StatContent>
                              <StatValue>{responseStats.avgEngagement}%</StatValue>
                              <StatLabel>Avg. Engagement</StatLabel>
                            </StatContent>
                          </StatCard>
                          
                          <StatCard>
                            <IconContainer color="#DB4437">
                              <FaClock />
                            </IconContainer>
                            <StatContent>
                              <StatValue>
                                {responseStats.timeToComplete > 60 
                                  ? `${Math.floor(responseStats.timeToComplete / 60)}m ${responseStats.timeToComplete % 60}s` 
                                  : `${responseStats.timeToComplete}s`}
                              </StatValue>
                              <StatLabel>Time to Complete</StatLabel>
                            </StatContent>
                          </StatCard>
                          
                          <StatCard>
                            <IconContainer color="#34A853">
                              <FaPercentage />
                            </IconContainer>
                            <StatContent>
                              <StatValue>{responseStats.responseRate}%</StatValue>
                              <StatLabel>Response Rate</StatLabel>
                            </StatContent>
                          </StatCard>
                        </StatsContainer>
                        
                        <div className="survey-responses-header" style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 150px 120px',
                          gap: '16px',
                          padding: '12px 16px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px 8px 0 0',
                          fontWeight: 600,
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          <div>Respondent</div>
                          <div>Email</div>
                          <div>Date Submitted</div>
                          <div>Status</div>
                        </div>
                        
                        <div className="survey-responses-list">
                          {surveyResponses.map((response, index) => (
                            <div key={response._id || index}>
                              <div 
                                className="survey-response-item"
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr 150px 120px',
                                  gap: '16px',
                                  padding: '16px',
                                  borderBottom: expandedResponseIds.includes(response._id) ? 'none' : '1px solid #e2e8f0',
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: '#e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FiUser style={{ color: '#64748b' }} />
                                </div>
                                <div>
                                  {response.respondentName || 'Anonymous'}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {response.email || 'No email provided'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiCalendar size={14} style={{ color: '#64748b' }} />
                                {response.submittedAt ? new Date(response.submittedAt).toLocaleDateString() + ' ' + 
                                  new Date(response.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  backgroundColor: response.isComplete ? '#e6f4ea' : '#fef3c7',
                                  color: response.isComplete ? '#137333' : '#92400e'
                                }}>
                                  {response.isComplete ? 'Complete' : `${response.progress || 0}% Complete`}
                                </span>
                                <ExpandButton 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleResponseDetails(response._id);
                                  }}
                                >
                                  {expandedResponseIds.includes(response._id) ? (
                                    <>
                                      <span style={{ marginRight: '4px' }}>Hide Details</span>
                                      <FiChevronUp size={16} />
                                    </>
                                  ) : (
                                    <>
                                      <span style={{ marginRight: '4px' }}>Show Details</span>
                                      <FiChevronDown size={16} />
                                    </>
                                  )}
                                </ExpandButton>
                              </div>
                              
                              {/* Expandable Response Details */}
                              {expandedResponseIds.includes(response._id) && (
                                <ResponseDetailsContainer>
                                  {response.responses && Array.isArray(response.responses) && response.responses.length > 0 ? (
                                    <>
                                      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                                        Showing {response.responses.length} answered questions
                                      </div>
                                      {response.responses.map((item: any, idx: number) => {
                                        const { questionText, sectionName } = getQuestionDetails(
                                          item.questionId,
                                          item.sectionId,
                                          surveyData
                                        );
                                        
                                        return (
                                          <QuestionItem key={`${item.questionId}-${idx}`}>
                                            {sectionName && <SectionName>{sectionName}</SectionName>}
                                            <QuestionTitle>{questionText}</QuestionTitle>
                                            <AnswerText>
                                              {item.answer !== undefined ? (
                                                item.answer
                                              ) : item.answers ? (
                                                Array.isArray(item.answers) ? (
                                                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                                    {item.answers.map((ans: string, i: number) => (
                                                      <li key={i}>{ans}</li>
                                                    ))}
                                                  </ul>
                                                ) : (
                                                  JSON.stringify(item.answers)
                                                )
                                              ) : (
                                                'No answer provided'
                                              )}
                                            </AnswerText>
                                          </QuestionItem>
                                        );
                                      })}
                                    </>
                                  ) : (
                                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                                      No detailed response data available
                                    </div>
                                  )}
                                </ResponseDetailsContainer>
                              )}
                            </div>
                          </div>
                         ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        padding: '40px 20px', 
                        textAlign: 'center', 
                        color: '#64748b',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1'
                      }}>
                        <FiMessageSquare size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                        <h3 style={{ marginBottom: '8px', color: '#475569' }}>No Responses Yet</h3>
                        <p>Once people start responding to your survey, their responses will appear here.</p>
                      </div>
                    )}
                  </div>
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
                  
                  <div style={{ padding: 20 }}>
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
                                    console.log('Featured image loaded:', result ? 'Image data available' : 'No image data');
                                    setSurvey((prevSurvey) => ({
                                      ...prevSurvey,
                                      image: result
                                    }));
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

                      {/* Primary Color Picker */}
                      <div className="appearance-item">
                        <label htmlFor="surveyPrimaryColor" style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#495057'
                        }}>
                          Primary Color
                        </label>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          backgroundColor: '#ffffff',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: '1px solid #dee2e6'
                        }}>
                          <input
                            type="color"
                            id="surveyPrimaryColor"
                            className="form-control color-picker"
                            value={survey?.color || '#552a47'}
                            onChange={(e) => setSurvey({...survey, color: e.target.value})}
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              padding: '0',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={survey?.color || '#552a47'}
                            onChange={(e) => setSurvey({...survey, color: e.target.value})}
                            placeholder="#552a47"
                            style={{ 
                              width: '100px',
                              height: '38px',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              padding: '0 8px',
                              fontSize: '14px'
                            }}
                          />
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#6c757d',
                            marginLeft: '8px'
                          }}>
                            This color will be used for buttons, headers, and accents
                          </div>
                        </div>
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
                            onClick={() => setSelectedTheme('')}
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
                            onClick={() => setSelectedTheme(theme._id)}
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
                    onChange={(e) => setNewThemeName(e.target.value)}
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
                      onChange={(e) => setNewThemeColor(e.target.value)}
                      style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newThemeColor}
                      onChange={(e) => setNewThemeColor(e.target.value)}
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
                      onChange={(e) => setNewThemeSecondaryColor(e.target.value)}
                      style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newThemeSecondaryColor}
                      onChange={(e) => setNewThemeSecondaryColor(e.target.value)}
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
                      onChange={(e) => setNewThemeAccentColor(e.target.value)}
                      style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newThemeAccentColor}
                      onChange={(e) => setNewThemeAccentColor(e.target.value)}
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
                    onChange={(e) => setNewThemeDescription(e.target.value)}
                    placeholder="Enter theme description"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, minHeight: 80, resize: 'vertical' }}
                  />
                </div>
                
                <div>
                  <label htmlFor="themeTemplateType" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Template Type</label>
                  <select
                    id="themeTemplateType"
                    value={newThemeTemplateType}
                    onChange={(e) => setNewThemeTemplateType(e.target.value)}
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
                    onChange={(e) => setNewThemeHeadingFont(e.target.value)}
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
                    onChange={(e) => setNewThemeBodyFont(e.target.value)}
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
                    onChange={(e) => setNewThemeButtonStyle(e.target.value)}
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
                    onChange={(e) => setNewThemeQuestionStyle(e.target.value)}
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
                    onChange={(e) => setNewThemeHeaderStyle(e.target.value)}
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
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            {alert.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            {alert.message}
            <button 
              onClick={() => setAlert(null)} 
              style={{ background: 'none', border: 'none', color: 'white', marginLeft: 10, cursor: 'pointer', fontSize: 18, padding: 0 }}
            >
              ×
            </button>
          </div>
        )}
        
        {/* Theme preview modal */}
        {showPreview && previewTheme && <ThemePreview theme={previewTheme} />}
      </DashboardBg>
    </AdminLayout>
  );
}

// Styled components for stats bar
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
`;

const IconContainer = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${props => props.color}15;
  color: ${props => props.color};
  font-size: 18px;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
`;

export default EnhancedSurveyBuilder;
